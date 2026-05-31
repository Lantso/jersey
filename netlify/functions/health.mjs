import { corsHeaders, securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin;
  return {
    statusCode: 200,
    headers: { ...securityHeaders(), ...corsHeaders(origin, process.env.PUBLIC_SITE_URL || "https://lantso.com") },
    body: JSON.stringify({ ok: true })
  };
}
