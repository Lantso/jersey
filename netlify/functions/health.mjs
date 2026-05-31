import { corsHeaders, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  const origin = header(event, "origin");
  const allowedOrigins = [process.env.PUBLIC_SITE_URL || "https://lantso.com", requestSiteUrl(event), process.env.URL, process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL];
  return {
    statusCode: 200,
    headers: { ...securityHeaders(), ...corsHeaders(origin, allowedOrigins) },
    body: JSON.stringify({ ok: true })
  };
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function requestSiteUrl(event) {
  const host = header(event, "x-forwarded-host") || header(event, "host");
  const proto = header(event, "x-forwarded-proto") || "https";
  return host ? `${proto}://${host}` : "";
}
