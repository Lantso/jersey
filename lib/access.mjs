import crypto from "node:crypto";

export const ACCESS_COOKIE_NAME = "lantso_access";
export const ACCESS_COOKIE_VALUE = "granted";
export const ACCESS_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

const DEFAULT_ACCESS_HASH = "c1111e162eb6d424f42b1b970b98780963ee494bac8ae1f3ad2ef42f426ab3cc";

export function verifyAccessPassword(password) {
  const expected = process.env.LANTSO_ACCESS_HASH || DEFAULT_ACCESS_HASH;
  const digest = crypto.createHash("sha256").update(String(password || "")).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(expected));
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
