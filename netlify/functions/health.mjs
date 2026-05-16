import { securityHeaders } from "../../lib/checkout.mjs";

export async function handler() {
  return {
    statusCode: 200,
    headers: securityHeaders(),
    body: JSON.stringify({ ok: true })
  };
}
