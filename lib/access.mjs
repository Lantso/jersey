import crypto from "node:crypto";

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
