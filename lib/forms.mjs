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

export async function saveClubProfile(record) {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore(FORMS_STORE_NAME);
  const email = clean(record.email, 320).toLowerCase();
  const key = `club/by-email/${emailKey(email)}.json`;
  const existing = await store.get(key, { type: "json" }).catch(() => null);
  const now = new Date().toISOString();
  const next = {
    ...(existing || {}),
    ...record,
    email,
    createdAt: existing?.createdAt || record.createdAt || now,
    updatedAt: now,
    submissionCount: Math.max(1, Number(existing?.submissionCount || 0) + 1)
  };
  await store.setJSON(key, next, {
    metadata: {
      kind: "club",
      email,
      createdAt: next.createdAt,
      updatedAt: next.updatedAt
    }
  });
  return { ok: true, key, duplicate: Boolean(existing) };
}

export function clean(value, maxLength = 2000) {
  return String(value || "").trim().slice(0, maxLength);
}

export function emailKey(email) {
  return crypto.createHash("sha256").update(String(email || "").trim().toLowerCase()).digest("hex");
}

function toBoolean(value) {
  if (value === true) return true;
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}
