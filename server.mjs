import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdir, stat, appendFile, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { accessCookieHeader, verifyAccessPassword } from "./lib/access.mjs";
import { corsHeaders, createStripeCheckoutSession, isAllowedOrigin, rateLimit, securityHeaders } from "./lib/checkout.mjs";
import { emailKey, normalizeClubProfile, normalizeContactMessage, sendContactNotification } from "./lib/forms.mjs";
import { getInventorySnapshot, handleStripeCommerceEvent } from "./lib/inventory.mjs";
import { verifyStripeSignature } from "./lib/stripe-webhook.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadDotEnv();

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || `http://${HOST}:${PORT}`;
const DATA_DIR = path.join(__dirname, "data");

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".glb", "model/gltf-binary"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, PUBLIC_SITE_URL);
    if (url.pathname.startsWith("/api/")) {
      if (!isAllowedOrigin(request.headers.origin, PUBLIC_SITE_URL)) {
        return json(response, 403, { message: "Forbidden origin" }, request);
      }
      if (request.method === "OPTIONS") {
        return json(response, 204, {}, request);
      }
      const key = `${request.socket.remoteAddress || "local"}:${url.pathname}`;
      const limited = rateLimit(key, { limit: url.pathname === "/api/access" ? 20 : 80, windowMs: 60_000 });
      if (!limited.ok) {
        return json(response, 429, { message: "Too many requests" }, request);
      }
    }
    if (url.pathname === "/api/health") {
      return json(response, 200, { ok: true }, request);
    }
    if (url.pathname === "/api/create-checkout-session" && request.method === "POST") {
      return createCheckoutSession(request, response);
    }
    if (url.pathname === "/api/inventory" && request.method === "GET") {
      return inventorySnapshot(response, request);
    }
    if (url.pathname === "/api/access" && request.method === "POST") {
      return verifyAccess(request, response);
    }
    if (url.pathname === "/api/club" && request.method === "POST") {
      return saveClubProfile(request, response);
    }
    if (url.pathname === "/api/contact" && request.method === "POST") {
      return saveContactMessage(request, response);
    }
    if (url.pathname === "/api/webhook" && request.method === "POST") {
      return handleStripeWebhook(request, response);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json(response, 405, { message: "Method not allowed" }, request);
    }
    return serveStatic(url.pathname, response, request.method === "HEAD");
  } catch (error) {
    console.error(error);
    return json(response, 500, { message: "Internal server error" }, request);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Lantso storefront running on ${PUBLIC_SITE_URL}`);
});

async function createCheckoutSession(request, response) {
  const body = await readJson(request);
  const result = await createStripeCheckoutSession(body, { siteUrl: PUBLIC_SITE_URL });
  if (!result.ok) return json(response, result.status, result.data, request);

  await appendJsonl("checkout-sessions.jsonl", {
    createdAt: new Date().toISOString(),
    sessionId: result.data.id,
    orderRef: result.checkout.orderRef,
    currency: result.checkout.currency,
    baseCurrency: result.checkout.baseCurrency,
    items: result.checkout.items,
    baseSubtotal: result.checkout.baseSubtotal,
    subtotal: result.checkout.subtotal,
    baseShipping: result.checkout.shipping.baseAmount,
    shipping: result.checkout.shipping.amount,
    baseTotal: result.checkout.baseTotal,
    total: result.checkout.total,
    country: result.checkout.shippingCountry
  });
  return json(response, 200, result.data, request);
}

async function inventorySnapshot(response, request) {
  return json(response, 200, await getInventorySnapshot(), request);
}

async function verifyAccess(request, response) {
  const body = await readJson(request);
  if (!verifyAccessPassword(body.password)) {
    return json(response, 401, { message: "Invalid password" }, request);
  }
  return json(response, 200, { ok: true }, request, {
    "Set-Cookie": accessCookieHeader({ secure: PUBLIC_SITE_URL.startsWith("https:") })
  });
}

async function saveClubProfile(request, response) {
  const normalized = normalizeClubProfile(await readJson(request));
  if (!normalized.ok) return json(response, normalized.status, { message: normalized.message }, request);
  await upsertJsonRecord("club-profiles.json", emailKey(normalized.record.email), normalized.record);
  return json(response, 200, { ok: true }, request);
}

async function saveContactMessage(request, response) {
  const normalized = normalizeContactMessage(await readJson(request));
  if (!normalized.ok) return json(response, normalized.status, { message: normalized.message }, request);
  await appendJsonl("contact-messages.jsonl", normalized.record);
  const notification = await sendContactNotification(normalized.record);
  if (!notification.ok && process.env.CONTACT_EMAIL_REQUIRED === "true") {
    return json(response, 503, { message: "Message saved, but support email could not be sent. Contact contact@lantso.com." }, request);
  }
  return json(response, 200, { ok: true, emailed: notification.ok, emailStatus: notification.reason || notification.status || "sent" }, request);
}

async function handleStripeWebhook(request, response) {
  const rawBody = await readBody(request);
  if (!verifyStripeSignature(request.headers["stripe-signature"], rawBody)) {
    return json(response, 400, { message: "Invalid webhook signature" }, request);
  }
  const event = JSON.parse(rawBody.toString("utf8"));
  const result = await handleStripeCommerceEvent(event);
  if (result.order) {
    await appendJsonl("paid-orders.jsonl", {
      receivedAt: new Date().toISOString(),
      type: event.type,
      order: result.order
    });
  }
  return json(response, 200, { received: true, action: result.status || "processed" }, request);
}

async function serveStatic(pathname, response, headOnly = false) {
  let safePath = "/";
  try {
    safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname).replaceAll("\0", "");
  } catch {
    return json(response, 400, { message: "Bad request" });
  }
  let filePath = path.normalize(path.join(__dirname, safePath));
  const relative = path.relative(__dirname, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return json(response, 403, { message: "Forbidden" });
  }
  try {
    const info = await stat(filePath);
    if (info.isDirectory()) filePath = path.join(filePath, "index.html");
  } catch {
    filePath = path.join(__dirname, "index.html");
  }
  const ext = path.extname(filePath);
  response.writeHead(200, {
    ...securityHeaders(mimeTypes.get(ext) || "application/octet-stream"),
    "Cache-Control": ext === ".html" ? "no-store" : "public, max-age=3600"
  });
  if (headOnly) return response.end();
  createReadStream(filePath).pipe(response);
}

async function readJson(request) {
  const body = await readBody(request, 64 * 1024);
  if (!body.length) return {};
  return JSON.parse(body.toString("utf8"));
}

function readBody(request, maxBytes = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function json(response, statusCode, payload, request = null, extraHeaders = {}) {
  const origin = request?.headers?.origin;
  response.writeHead(statusCode, { ...securityHeaders(), ...corsHeaders(origin, PUBLIC_SITE_URL), ...extraHeaders });
  response.end(JSON.stringify(payload));
}

async function appendJsonl(fileName, payload) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(path.join(DATA_DIR, fileName), `${JSON.stringify(payload)}\n`, "utf8");
}

async function upsertJsonRecord(fileName, key, record) {
  await mkdir(DATA_DIR, { recursive: true });
  const filePath = path.join(DATA_DIR, fileName);
  let current = {};
  try {
    current = JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    current = {};
  }
  const existing = current[key] || {};
  current[key] = {
    ...existing,
    ...record,
    createdAt: existing.createdAt || record.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    submissionCount: Math.max(1, Number(existing.submissionCount || 0) + 1)
  };
  await writeFile(filePath, `${JSON.stringify(current, null, 2)}\n`, "utf8");
}

function loadDotEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
