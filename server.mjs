import crypto from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdir, stat, appendFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyAccessPassword } from "./lib/access.mjs";
import { createStripeCheckoutSession, isAllowedOrigin, rateLimit, securityHeaders } from "./lib/checkout.mjs";

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
  [".ico", "image/x-icon"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, PUBLIC_SITE_URL);
    if (url.pathname.startsWith("/api/")) {
      if (!isAllowedOrigin(request.headers.origin, PUBLIC_SITE_URL)) {
        return json(response, 403, { message: "Forbidden origin" });
      }
      const key = `${request.socket.remoteAddress || "local"}:${url.pathname}`;
      const limited = rateLimit(key, { limit: url.pathname === "/api/access" ? 20 : 80, windowMs: 60_000 });
      if (!limited.ok) {
        return json(response, 429, { message: "Too many requests" });
      }
    }
    if (url.pathname === "/api/health") {
      return json(response, 200, { ok: true });
    }
    if (url.pathname === "/api/create-checkout-session" && request.method === "POST") {
      return createCheckoutSession(request, response);
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
      return json(response, 405, { message: "Method not allowed" });
    }
    return serveStatic(url.pathname, response, request.method === "HEAD");
  } catch (error) {
    console.error(error);
    return json(response, 500, { message: "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Lantso storefront running on ${PUBLIC_SITE_URL}`);
});

async function createCheckoutSession(request, response) {
  const body = await readJson(request);
  const result = await createStripeCheckoutSession(body, { siteUrl: PUBLIC_SITE_URL });
  if (!result.ok) return json(response, result.status, result.data);

  await appendJsonl("checkout-sessions.jsonl", {
    createdAt: new Date().toISOString(),
    sessionId: result.data.id,
    orderRef: result.checkout.orderRef,
    items: result.checkout.items,
    subtotal: result.checkout.subtotal,
    shipping: result.checkout.shipping.amount,
    total: result.checkout.total,
    country: result.checkout.shippingCountry
  });
  return json(response, 200, result.data);
}

async function verifyAccess(request, response) {
  const body = await readJson(request);
  if (!verifyAccessPassword(body.password)) {
    return json(response, 401, { message: "Invalid password" });
  }
  return json(response, 200, { ok: true });
}

async function saveClubProfile(request, response) {
  const body = await readJson(request);
  if (!body.email || !body.name) {
    return json(response, 400, { message: "Missing profile fields" });
  }
  await appendJsonl("club-profiles.jsonl", {
    createdAt: new Date().toISOString(),
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    newsletter: Boolean(body.newsletter)
  });
  return json(response, 200, { ok: true });
}

async function saveContactMessage(request, response) {
  const body = await readJson(request);
  if (!body.email || !body.message || !body.name) {
    return json(response, 400, { message: "Missing contact fields" });
  }
  await appendJsonl("contact-messages.jsonl", {
    createdAt: new Date().toISOString(),
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    message: clean(body.message)
  });
  return json(response, 200, { ok: true });
}

async function handleStripeWebhook(request, response) {
  const rawBody = await readBody(request);
  if (!verifyStripeSignature(request.headers["stripe-signature"], rawBody)) {
    return json(response, 400, { message: "Invalid webhook signature" });
  }
  const event = JSON.parse(rawBody.toString("utf8"));
  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    await appendJsonl("paid-orders.jsonl", {
      receivedAt: new Date().toISOString(),
      type: event.type,
      session: event.data.object
    });
  }
  return json(response, 200, { received: true });
}

function verifyStripeSignature(signatureHeader, rawBody) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET.includes("replace_me")) {
    return false;
  }
  if (!signatureHeader) return false;
  const fields = Object.fromEntries(signatureHeader.split(",").map((pair) => pair.split("=")));
  const timestamp = fields.t;
  const expected = fields.v1;
  if (!timestamp || !expected) return false;
  const signedPayload = `${timestamp}.${rawBody.toString("utf8")}`;
  const digest = crypto
    .createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function serveStatic(pathname, response, headOnly = false) {
  const safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  let filePath = path.normalize(path.join(__dirname, safePath));
  if (!filePath.startsWith(__dirname)) {
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

function json(response, statusCode, payload) {
  response.writeHead(statusCode, securityHeaders());
  response.end(JSON.stringify(payload));
}

async function appendJsonl(fileName, payload) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(path.join(DATA_DIR, fileName), `${JSON.stringify(payload)}\n`, "utf8");
}

function clean(value) {
  return String(value || "").trim().slice(0, 2000);
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
