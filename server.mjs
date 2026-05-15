import crypto from "node:crypto";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, stat, appendFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CHECKOUT_ALLOWED_COUNTRIES,
  CURRENCY,
  PRODUCTS,
  calculateShipping,
  findProduct
} from "./catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadDotEnv();

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || `http://${HOST}:${PORT}`;
const DATA_DIR = path.join(__dirname, "data");
const STRIPE_API_VERSION = process.env.STRIPE_API_VERSION || "";

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
    if (url.pathname === "/api/health") {
      return json(response, 200, { ok: true });
    }
    if (url.pathname === "/api/create-checkout-session" && request.method === "POST") {
      return createCheckoutSession(request, response);
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
  const checkout = buildCheckout(body);
  if (!checkout.ok) {
    return json(response, 400, { message: checkout.message });
  }

  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("replace_me")) {
    return json(response, 503, {
      message: "Stripe is not configured. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in .env before accepting payments."
    });
  }

  const params = stripeSessionParams(checkout, body);
  const headers = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };
  if (STRIPE_API_VERSION) headers["Stripe-Version"] = STRIPE_API_VERSION;

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers,
    body: params
  });
  const data = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return json(response, 502, { message: data.error?.message || "Stripe checkout failed" });
  }
  await appendJsonl("checkout-sessions.jsonl", {
    createdAt: new Date().toISOString(),
    sessionId: data.id,
    orderRef: checkout.orderRef,
    items: checkout.items,
    subtotal: checkout.subtotal,
    shipping: checkout.shipping.amount,
    total: checkout.total,
    country: checkout.shippingCountry
  });
  return json(response, 200, { url: data.url, id: data.id });
}

function buildCheckout(body) {
  const requested = Array.isArray(body.items) ? body.items : [];
  const items = [];
  for (const item of requested) {
    const product = findProduct(item.productId);
    const size = String(item.size || "");
    const quantity = Math.max(1, Math.min(10, Number(item.quantity || 1)));
    if (!product || !product.sizes.includes(size)) {
      return { ok: false, message: "Invalid cart item" };
    }
    items.push({
      productId: product.id,
      sku: product.sku,
      name: product.name.en,
      size,
      quantity,
      unitAmount: product.price,
      amount: product.price * quantity
    });
  }
  if (!items.length) return { ok: false, message: "Cart is empty" };
  const shippingCountry = String(body.shippingCountry || "FR").toUpperCase();
  if (!CHECKOUT_ALLOWED_COUNTRIES.includes(shippingCountry)) {
    return { ok: false, message: "Shipping country is not enabled" };
  }
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const shipping = calculateShipping(shippingCountry, subtotal);
  return {
    ok: true,
    items,
    subtotal,
    shipping,
    shippingCountry,
    total: subtotal + shipping.amount,
    orderRef: `LTS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
  };
}

function stripeSessionParams(checkout, body) {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${PUBLIC_SITE_URL}/cancel`);
  params.set("client_reference_id", checkout.orderRef);
  params.set("billing_address_collection", "required");
  params.set("customer_creation", "always");
  params.set("phone_number_collection[enabled]", "true");
  params.set("shipping_address_collection[allowed_countries][]", checkout.shippingCountry);
  params.set("metadata[order_ref]", checkout.orderRef);
  params.set("metadata[shipping_country]", checkout.shippingCountry);
  params.set("metadata[items]", checkout.items.map((item) => `${item.sku}/${item.size}x${item.quantity}`).join(","));
  params.set("automatic_tax[enabled]", process.env.STRIPE_AUTOMATIC_TAX === "true" ? "true" : "false");

  const methodTypes = selectedPaymentMethods(body.preferredMethod);
  methodTypes.forEach((type) => params.append("payment_method_types[]", type));

  checkout.items.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, CURRENCY);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.name} / ${item.size}`);
    params.set(`line_items[${index}][price_data][product_data][metadata][sku]`, item.sku);
    params.set(`line_items[${index}][price_data][product_data][metadata][size]`, item.size);
  });

  params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.set("shipping_options[0][shipping_rate_data][display_name]", checkout.shipping.zone.label.en);
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(checkout.shipping.amount));
  params.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", CURRENCY);
  params.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]", "business_day");
  params.set("shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]", "2");
  params.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]", "business_day");
  params.set("shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]", "14");

  return params;
}

function selectedPaymentMethods(preferredMethod) {
  const configured = (process.env.STRIPE_PAYMENT_METHOD_TYPES || "")
    .split(",")
    .map((method) => method.trim())
    .filter(Boolean);
  if (preferredMethod === "paypal" && configured.includes("paypal")) return ["paypal"];
  return configured;
}

async function saveClubProfile(request, response) {
  const body = await readJson(request);
  if (!body.email || !body.password || !body.name) {
    return json(response, 400, { message: "Missing profile fields" });
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(body.password, salt);
  await appendJsonl("club-profiles.jsonl", {
    createdAt: new Date().toISOString(),
    name: clean(body.name),
    email: clean(body.email).toLowerCase(),
    newsletter: Boolean(body.newsletter),
    password: `${salt}:${hash}`
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
    return true;
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
    "Content-Type": mimeTypes.get(ext) || "application/octet-stream",
    "Cache-Control": "no-store"
  });
  if (headOnly) return response.end();
  createReadStream(filePath).pipe(response);
}

async function readJson(request) {
  const body = await readBody(request);
  if (!body.length) return {};
  return JSON.parse(body.toString("utf8"));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function appendJsonl(fileName, payload) {
  await mkdir(DATA_DIR, { recursive: true });
  await appendFile(path.join(DATA_DIR, fileName), `${JSON.stringify(payload)}\n`, "utf8");
}

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(String(password), salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey.toString("hex"));
    });
  });
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
