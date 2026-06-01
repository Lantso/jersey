import { connectLambda } from "@netlify/blobs";
import { corsHeaders, isAllowedOrigin, rateLimit, securityHeaders } from "../../lib/checkout.mjs";
import { normalizeClubProfile, saveFormSubmission } from "../../lib/forms.mjs";

export async function handler(event) {
  connectBlobs(event);
  const origin = header(event, "origin");
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://lantso.com";
  const allowedOrigins = [siteUrl, requestSiteUrl(event), process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL];
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);
    return json(204, {}, origin, allowedOrigins);
  }
  if (event.httpMethod !== "POST") return json(405, { message: "Method not allowed" }, origin, allowedOrigins);
  if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);

  const limited = rateLimit(`${clientIp(event)}:club`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) return json(429, { message: "Too many requests" }, origin, allowedOrigins);

  const normalized = normalizeClubProfile(parseJson(event.body));
  if (!normalized.ok) return json(normalized.status, { message: normalized.message }, origin, allowedOrigins);

  try {
    await saveFormSubmission("club", normalized.record);
    return json(200, { ok: true }, origin, allowedOrigins);
  } catch {
    return json(503, { message: "Profile storage is temporarily unavailable. Contact contact@lantso.com." }, origin, allowedOrigins);
  }
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function clientIp(event) {
  return header(event, "x-nf-client-connection-ip") || header(event, "client-ip") || "unknown";
}

function requestSiteUrl(event) {
  const host = header(event, "x-forwarded-host") || header(event, "host");
  const proto = header(event, "x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

function json(statusCode, payload, origin, allowedOrigins) {
  return {
    statusCode,
    headers: { ...securityHeaders(), ...corsHeaders(origin, allowedOrigins), "Cache-Control": "no-store" },
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

function connectBlobs(event) {
  try {
    if (event.blobs) connectLambda(event);
  } catch {
    // Blobs will fall back locally when Netlify does not provide a context.
  }
}
