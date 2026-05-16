import { createStripeCheckoutSession, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  const body = parseJson(event.body);
  const result = await createStripeCheckoutSession(body, {
    siteUrl: process.env.PUBLIC_SITE_URL || "https://www.lantso.com"
  });
  return json(result.status, result.data);
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: securityHeaders(),
    body: JSON.stringify(payload)
  };
}

function parseJson(raw = "") {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
