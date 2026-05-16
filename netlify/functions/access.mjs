import { verifyAccessPassword } from "../../lib/access.mjs";
import { securityHeaders } from "../../lib/checkout.mjs";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  const body = parseJson(event.body);
  if (!verifyAccessPassword(body.password)) {
    return json(401, { message: "Invalid password" });
  }
  return json(200, { ok: true });
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
