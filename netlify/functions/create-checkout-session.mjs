import { connectLambda } from "@netlify/blobs";
import { corsHeaders, createStripeCheckoutSession, isAllowedOrigin, rateLimit, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  connectBlobs(event);
  const origin = header(event, "origin");
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://lantso.com";
  const allowedOrigins = [siteUrl, requestSiteUrl(event), process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL];
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);
    return json(204, {}, origin, allowedOrigins);
  }
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" }, origin, allowedOrigins);
  }
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);
  }
  const limited = rateLimit(`${clientIp(event)}:checkout`, { limit: 30, windowMs: 60_000 });
  if (!limited.ok) return json(429, { message: "Too many requests" }, origin, allowedOrigins);
  const body = parseJson(event.body);
  const result = await createStripeCheckoutSession(body, {
    siteUrl
  });
  return json(result.status, result.data, origin, allowedOrigins);
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
    headers: { ...securityHeaders(), ...corsHeaders(origin, allowedOrigins) },
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
