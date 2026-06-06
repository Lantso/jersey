import { connectLambda } from "@netlify/blobs";
import { corsHeaders, isAllowedOrigin, securityHeaders } from "../../lib/checkout.mjs";
import { getInventorySnapshot } from "../../lib/inventory.mjs";

export async function handler(event) {
  connectBlobs(event);
  const origin = header(event, "origin");
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://lantso.com";
  const allowedOrigins = [siteUrl, requestSiteUrl(event), process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL];
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);
    return json(204, {}, origin, allowedOrigins);
  }
  if (event.httpMethod !== "GET") {
    return json(405, { message: "Method not allowed" }, origin, allowedOrigins);
  }
  if (!isAllowedOrigin(origin, allowedOrigins)) return json(403, { message: "Forbidden origin" }, origin, allowedOrigins);
  return json(200, await getInventorySnapshot(), origin, allowedOrigins);
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function requestSiteUrl(event) {
  const host = header(event, "x-forwarded-host") || header(event, "host");
  const proto = header(event, "x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}

function json(statusCode, payload, origin, allowedOrigins) {
  return {
    statusCode,
    headers: {
      ...securityHeaders(),
      ...corsHeaders(origin, allowedOrigins),
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}

function connectBlobs(event) {
  try {
    if (event.blobs) connectLambda(event);
  } catch {
  }
}
