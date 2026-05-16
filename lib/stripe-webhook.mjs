import crypto from "node:crypto";

const DEFAULT_TOLERANCE_SECONDS = 300;

export function verifyStripeSignature(signatureHeader, rawBody, secret = process.env.STRIPE_WEBHOOK_SECRET || "") {
  if (!secret || secret.includes("replace_me")) return false;
  if (!signatureHeader) return false;

  const signatures = parseSignatureHeader(signatureHeader);
  if (!signatures.t || !signatures.v1?.length) return false;

  const timestamp = Number(signatures.t);
  if (!Number.isFinite(timestamp)) return false;
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > DEFAULT_TOLERANCE_SECONDS) return false;

  const digest = crypto.createHmac("sha256", secret).update(`${signatures.t}.${rawBody.toString("utf8")}`).digest("hex");
  return signatures.v1.some((signature) => timingSafeEqual(digest, signature));
}

function parseSignatureHeader(signatureHeader) {
  const parsed = {};
  for (const part of String(signatureHeader).split(",")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator);
    const value = part.slice(separator + 1);
    if (key === "v1") {
      parsed.v1 ||= [];
      parsed.v1.push(value);
    } else {
      parsed[key] = value;
    }
  }
  return parsed;
}

function timingSafeEqual(left, right) {
  try {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
  } catch {
    return false;
  }
}
