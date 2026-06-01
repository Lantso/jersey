import crypto from "node:crypto";

const FORMS_STORE_NAME = "lantso-forms";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value) {
  const email = clean(value, 320).toLowerCase();
  return email.length > 0 && email.length <= 320 && EMAIL_PATTERN.test(email);
}

export function normalizeClubProfile(body = {}) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 320).toLowerCase();
  if (!name || !isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address." };
  }
  return {
    ok: true,
    record: {
      createdAt: new Date().toISOString(),
      name,
      email,
      newsletter: toBoolean(body.newsletter)
    }
  };
}

export function normalizeContactMessage(body = {}) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 320).toLowerCase();
  const message = clean(body.message, 2000);
  if (!name || !message || !isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address and message." };
  }
  return {
    ok: true,
    record: {
      createdAt: new Date().toISOString(),
      name,
      email,
      message
    }
  };
}

export async function saveFormSubmission(kind, record) {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore(FORMS_STORE_NAME);
  const key = `${kind}/${new Date().toISOString()}-${crypto.randomBytes(4).toString("hex")}.json`;
  await store.setJSON(key, record, {
    metadata: {
      kind,
      createdAt: record.createdAt || new Date().toISOString()
    }
  });
  return { ok: true, key };
}

export function clean(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

function toBoolean(value) {
  if (value === true) return true;
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}
