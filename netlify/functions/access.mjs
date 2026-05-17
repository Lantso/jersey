import { verifyAccessPassword } from "../../lib/access.mjs";
import { corsHeaders, isAllowedOrigin, rateLimit, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  const origin = header(event, "origin");
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://www.lantso.com";
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(origin, siteUrl)) return json(403, { message: "Forbidden origin" }, origin, siteUrl);
    return json(204, {}, origin, siteUrl);
  }
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" }, origin, siteUrl);
  }
  if (!isAllowedOrigin(origin, siteUrl)) {
    return json(403, { message: "Forbidden origin" }, origin, siteUrl);
  }
  const limited = rateLimit(`${clientIp(event)}:access`, { limit: 20, windowMs: 60_000 });
  if (!limited.ok) return json(429, { message: "Too many requests" }, origin, siteUrl);
  const body = parseJson(event.body);
  if (!verifyAccessPassword(body.password)) {
    return json(401, { message: "Invalid password" }, origin, siteUrl);
  }
  return json(200, { ok: true }, origin, siteUrl);
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function clientIp(event) {
  return header(event, "x-nf-client-connection-ip") || header(event, "client-ip") || "unknown";
}

function json(statusCode, payload, origin, siteUrl) {
  return {
    statusCode,
    headers: { ...securityHeaders(), ...corsHeaders(origin, siteUrl) },
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
