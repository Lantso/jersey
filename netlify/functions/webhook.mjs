import crypto from "node:crypto";
import { securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  const rawBody = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");
  if (!verifyStripeSignature(event.headers["stripe-signature"], rawBody)) {
    return json(400, { message: "Invalid webhook signature" });
  }
  return json(200, { received: true });
}

function verifyStripeSignature(signatureHeader, rawBody) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  if (!secret || secret.includes("replace_me")) return false;
  if (!signatureHeader) return false;

  const fields = Object.fromEntries(signatureHeader.split(",").map((pair) => pair.split("=")));
  const timestamp = fields.t;
  const expected = fields.v1;
  if (!timestamp || !expected) return false;

  const digest = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
  } catch {
    return false;
  }
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: securityHeaders(),
    body: JSON.stringify(payload)
  };
}
