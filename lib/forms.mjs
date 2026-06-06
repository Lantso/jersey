import crypto from "node:crypto";

const FORMS_STORE_NAME = "lantso-forms";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_SUPPORT_EMAIL = "contact@lantso.com";

export function isValidEmail(value) {
  const email = clean(value, 320).toLowerCase();
  return email.length > 0 && email.length <= 320 && EMAIL_PATTERN.test(email);
}

export function normalizeClubProfile(body = {}) {
  const name = clean(body.name, 120);
  const email = clean(body.email, 320).toLowerCase();
  const newsletter = body.newsletter === undefined || body.newsletter === null || clean(body.newsletter, 20) === "" ? true : toBoolean(body.newsletter);
  if (!name || !isValidEmail(email)) {
    return { ok: false, status: 400, message: "Enter a valid email address." };
  }
  return {
    ok: true,
    record: {
      createdAt: new Date().toISOString(),
      name,
      email,
      newsletter,
      source: clean(body.source, 80) || "club"
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
      message,
      source: clean(body.source, 80) || "contact"
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

export async function sendContactNotification(record, options = {}) {
  const apiKey = clean(options.apiKey ?? process.env.RESEND_API_KEY, 500);
  const from = clean(options.from ?? process.env.CONTACT_FROM_EMAIL, 320);
  const to = clean(options.to ?? process.env.CONTACT_TO_EMAIL ?? process.env.STORE_EMAIL ?? DEFAULT_SUPPORT_EMAIL, 320);
  if (!apiKey) return { ok: false, skipped: true, reason: "missing_resend_api_key" };
  if (!from) return { ok: false, skipped: true, reason: "missing_contact_from_email" };
  if (typeof fetch !== "function") return { ok: false, skipped: true, reason: "fetch_unavailable" };

  const subjectName = clean(record.name, 80) || "Website visitor";
  const subject = `Lantso contact - ${subjectName}`;
  const text = [
    "New Lantso contact message",
    "",
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Source: ${record.source || "contact"}`,
    `Created: ${record.createdAt || new Date().toISOString()}`,
    "",
    clean(record.message, 2000)
  ].join("\n");
  const html = `
    <h2>New Lantso contact message</h2>
    <p><strong>Name:</strong> ${escapeHtml(record.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(record.email)}</p>
    <p><strong>Source:</strong> ${escapeHtml(record.source || "contact")}</p>
    <p><strong>Created:</strong> ${escapeHtml(record.createdAt || new Date().toISOString())}</p>
    <hr>
    <p>${escapeHtml(clean(record.message, 2000)).replaceAll("\n", "<br>")}</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: record.email,
        subject,
        text,
        html
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return { ok: false, status: response.status, data };
    return { ok: true, status: response.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { message: error.message } };
  }
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

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
