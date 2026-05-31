import { connectLambda } from "@netlify/blobs";
import { securityHeaders } from "../../lib/checkout.mjs";
import { handleStripeCommerceEvent } from "../../lib/inventory.mjs";
import { verifyStripeSignature } from "../../lib/stripe-webhook.mjs";

export async function handler(event) {
  connectBlobs(event);
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  const rawBody = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");
  if (!verifyStripeSignature(header(event, "stripe-signature"), rawBody)) {
    return json(400, { message: "Invalid webhook signature" });
  }
  const stripeEvent = parseJson(rawBody);
  const result = await handleStripeCommerceEvent(stripeEvent);
  return json(200, { received: true, action: result.status || "processed" });
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function parseJson(rawBody) {
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    return {};
  }
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: securityHeaders(),
    body: JSON.stringify(payload)
  };
}

function connectBlobs(event) {
  try {
    if (event.blobs) connectLambda(event);
  } catch {
    // Blobs will fall back locally when Netlify does not provide a context.
  }
}
