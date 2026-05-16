import { securityHeaders } from "../../lib/checkout.mjs";
import { getInventorySnapshot } from "../../lib/inventory.mjs";

export async function handler(event) {
  if (event.httpMethod !== "GET") {
    return json(405, { message: "Method not allowed" });
  }
  return json(200, await getInventorySnapshot());
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      ...securityHeaders(),
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
}
