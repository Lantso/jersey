import { createStripeCheckoutSession, isAllowedOrigin, rateLimit, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  if (!isAllowedOrigin(header(event, "origin"), process.env.PUBLIC_SITE_URL || "https://www.lantso.com")) {
    return json(403, { message: "Forbidden origin" });
  }
  const limited = rateLimit(`${clientIp(event)}:checkout`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) return json(429, { message: "Too many requests" });
  const body = parseJson(event.body);
  const result = await createStripeCheckoutSession(body, {
    siteUrl: process.env.PUBLIC_SITE_URL || "https://www.lantso.com"
  });
  return json(result.status, result.data);
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function clientIp(event) {
  return header(event, "x-nf-client-connection-ip") || header(event, "client-ip") || "unknown";
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
