import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "lantso_access";
export const ACCESS_COOKIE_VALUE = "granted";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

export function verifyAccessPassword(password) {
  const expected = String(process.env.LANTSO_ACCESS_HASH || "").trim();
  if (!/^[a-f0-9]{64}$/i.test(expected)) return false;
  const digest = crypto.createHash("sha256").update(String(password || "")).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function accessCookieHeader({ secure = true } = {}) {
  const parts = [
    `${ACCESS_COOKIE_NAME}=${ACCESS_COOKIE_VALUE}`,
    "Path=/",
    `Max-Age=${ACCESS_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
    "HttpOnly"
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}
