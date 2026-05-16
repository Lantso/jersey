import crypto from "node:crypto";
import {
  CHECKOUT_ALLOWED_COUNTRIES,
  CURRENCY,
  calculateShipping,
  findProduct
} from "../catalog.mjs";
import {
  attachStripeSessionToReservation,
  releaseInventoryReservation,
  reserveCheckoutInventory
} from "./inventory.mjs";

const STRIPE_CHECKOUT_URL = "https://api.stripe.com/v1/checkout/sessions";
export const CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com; frame-src https://checkout.stripe.com; form-action 'self' https://checkout.stripe.com; base-uri 'self'; object-src 'none'";

export function buildCheckout(body = {}) {
  const requested = Array.isArray(body.items) ? body.items : [];
  const items = [];
  const inventoryClaims = new Map();

  for (const item of requested) {
    const product = findProduct(item.productId);
    const size = String(item.size || "");
    const quantity = Math.max(1, Math.min(25, Number(item.quantity || 1)));

    if (!product || !product.sizes.includes(size)) {
      return { ok: false, status: 400, message: "Invalid cart item" };
    }

    const inventoryKey = `${product.id}:${size}`;
    const claimed = (inventoryClaims.get(inventoryKey) || 0) + quantity;
    inventoryClaims.set(inventoryKey, claimed);
    if (claimed > product.inventory[size]) {
      return {
        ok: false,
        status: 409,
        message: `${product.name.en} / ${size} only has ${product.inventory[size]} pieces available.`
      };
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

  if (!items.length) return { ok: false, status: 400, message: "Cart is empty" };

  const shippingCountry = String(body.shippingCountry || "FR").toUpperCase();
  if (!CHECKOUT_ALLOWED_COUNTRIES.includes(shippingCountry)) {
    return { ok: false, status: 400, message: "Shipping country is not enabled" };
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = calculateShipping(shippingCountry, subtotal, quantity);

  return {
    ok: true,
    items,
    quantity,
    subtotal,
    shipping,
    shippingCountry,
    total: subtotal + shipping.amount,
    orderRef: `LTS-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`
  };
}

export async function createStripeCheckoutSession(body = {}, options = {}) {
  const checkout = buildCheckout(body);
  if (!checkout.ok) return { ok: false, status: checkout.status || 400, data: { message: checkout.message }, checkout };

  const reservation = await reserveCheckoutInventory(checkout, body);
  if (!reservation.ok) {
    return {
      ok: false,
      status: reservation.status || 409,
      data: { message: reservation.message || "This piece is no longer available." },
      checkout
    };
  }
  checkout.checkoutExpiresAt = reservation.checkoutExpiresAt;
  checkout.holdExpiresAt = reservation.holdExpiresAt;
  checkout.stripeExpiresAtEpoch = reservation.stripeExpiresAtEpoch;

  const secretKey = options.stripeSecretKey || process.env.STRIPE_SECRET_KEY || "";
  if (!secretKey || secretKey.includes("replace_me")) {
    await releaseInventoryReservation(checkout.orderRef, "stripe_not_configured");
    return {
      ok: false,
      status: 503,
      data: {
        message: "Stripe is not configured. Add STRIPE_SECRET_KEY before accepting payments."
      },
      checkout
    };
  }

  const headers = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded"
  };
  const apiVersion = options.stripeApiVersion || process.env.STRIPE_API_VERSION || "";
  if (apiVersion) headers["Stripe-Version"] = apiVersion;

  const stripeResponse = await fetch(STRIPE_CHECKOUT_URL, {
    method: "POST",
    headers,
    body: stripeSessionParams(checkout, body, options.siteUrl || process.env.PUBLIC_SITE_URL || "http://127.0.0.1:3000")
  });
  const data = await stripeResponse.json();

  if (!stripeResponse.ok) {
    await releaseInventoryReservation(checkout.orderRef, "stripe_checkout_failed");
    return {
      ok: false,
      status: 502,
      data: { message: data.error?.message || "Stripe checkout failed" },
      checkout
    };
  }

  await attachStripeSessionToReservation(checkout.orderRef, data);
  return { ok: true, status: 200, data: { url: data.url, id: data.id }, checkout, stripeSession: data };
}

export function stripeSessionParams(checkout, body = {}, siteUrl) {
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${siteUrl}/cancel`);
  if (checkout.stripeExpiresAtEpoch) {
    params.set("expires_at", String(checkout.stripeExpiresAtEpoch));
  }
  params.set("client_reference_id", checkout.orderRef);
  params.set("billing_address_collection", "required");
  params.set("customer_creation", "always");
  params.set("phone_number_collection[enabled]", "true");
  params.set("shipping_address_collection[allowed_countries][]", checkout.shippingCountry);
  params.set("metadata[order_ref]", checkout.orderRef);
  params.set("metadata[shipping_country]", checkout.shippingCountry);
  params.set("metadata[checkout_expires_at]", checkout.checkoutExpiresAt || "");
  params.set("metadata[stock_hold_expires_at]", checkout.holdExpiresAt || "");
  params.set("metadata[parcel_weight_g]", String(checkout.shipping.weight));
  params.set("metadata[parcel_dimensions_cm]", Object.values(checkout.shipping.dimensions).join("x"));
  params.set("metadata[items]", checkout.items.map((item) => `${item.sku}/${item.size}x${item.quantity}`).join(","));
  params.set("automatic_tax[enabled]", process.env.STRIPE_AUTOMATIC_TAX === "true" ? "true" : "false");

  selectedPaymentMethods(body.preferredMethod).forEach((type) => {
    params.append("payment_method_types[]", type);
  });

  checkout.items.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, CURRENCY);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(item.unitAmount));
    params.set(`line_items[${index}][price_data][product_data][name]`, `${item.name} / ${item.size}`);
    params.set(`line_items[${index}][price_data][product_data][metadata][sku]`, item.sku);
    params.set(`line_items[${index}][price_data][product_data][metadata][size]`, item.size);
  });

  params.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  params.set("shipping_options[0][shipping_rate_data][display_name]", `Tracked home delivery - ${checkout.shipping.zone.label.en}`);
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

export function securityHeaders(contentType = "application/json; charset=utf-8") {
  return {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": CONTENT_SECURITY_POLICY
  };
}

export function isAllowedOrigin(origin, siteUrl = process.env.PUBLIC_SITE_URL || "") {
  if (!origin) return true;
  const allowed = new Set(["http://127.0.0.1:3000", "http://localhost:3000"]);
  if (siteUrl) {
    try {
      allowed.add(new URL(siteUrl).origin);
    } catch {
      // Ignore malformed optional deployment URLs.
    }
  }
  return allowed.has(origin);
}

export function rateLimit(key, { limit = 60, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const store = (globalThis.__lantsoRateLimit ||= new Map());
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  current.count += 1;
  return { ok: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}
