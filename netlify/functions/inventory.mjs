import { corsHeaders, isAllowedOrigin, securityHeaders } from "../../lib/checkout.mjs";
import { getInventorySnapshot } from "../../lib/inventory.mjs";

export async function handler(event) {
  const origin = header(event, "origin");
  const siteUrl = process.env.PUBLIC_SITE_URL || "https://lantso.com";
  if (event.httpMethod === "OPTIONS") {
    if (!isAllowedOrigin(origin, siteUrl)) return json(403, { message: "Forbidden origin" }, origin, siteUrl);
    return json(204, {}, origin, siteUrl);
  }
  if (event.httpMethod !== "GET") {
    return json(405, { message: "Method not allowed" }, origin, siteUrl);
  }
  if (!isAllowedOrigin(origin, siteUrl)) return json(403, { message: "Forbidden origin" }, origin, siteUrl);
  return json(200, await getInventorySnapshot(), origin, siteUrl);
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function json(statusCode, payload, origin, siteUrl) {
  return {
    statusCode,
    headers: {
      ...securityHeaders(),
      ...corsHeaders(origin, siteUrl),
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
