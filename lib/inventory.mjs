import { existsSync } from "node:fs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTS } from "../catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(__dirname);
const LOCAL_STATE_FILE = path.join(PROJECT_ROOT, "data", "inventory-state.json");

const STORE_NAME = "lantso-commerce";
const STATE_KEY = "inventory-v1";
const STATE_VERSION = 1;
const CHECKOUT_TTL_MS = Number(process.env.LANTSO_CHECKOUT_TTL_MS || 45 * 60 * 1000);
const WEBHOOK_GRACE_MS = Number(process.env.LANTSO_WEBHOOK_GRACE_MS || 2 * 60 * 60 * 1000);
const MAX_MUTATION_ATTEMPTS = 8;
const ACTIVE_RESERVATION_STATUSES = new Set(["reserved", "checkout_open", "payment_pending"]);

let localQueue = Promise.resolve();
let blobStorePromise;

export async function reserveCheckoutInventory(checkout, request = {}) {
  const nowMs = Date.now();
  const checkoutExpiresAtMs = nowMs + CHECKOUT_TTL_MS;
  const holdExpiresAtMs = checkoutExpiresAtMs + WEBHOOK_GRACE_MS;

  return mutateInventoryState((state) => {
    let changed = releaseExpiredReservations(state, nowMs);
    const conflicts = unavailableItems(state, checkout.items, nowMs);
    if (conflicts.length) {
      return {
        state,
        changed,
        result: {
          ok: false,
          status: 409,
          message: stockMessage(conflicts[0])
        }
      };
    }

    state.reservations[checkout.orderRef] = {
      orderRef: checkout.orderRef,
      status: "reserved",
      createdAt: new Date(nowMs).toISOString(),
      checkoutExpiresAt: new Date(checkoutExpiresAtMs).toISOString(),
      holdExpiresAt: new Date(holdExpiresAtMs).toISOString(),
      stripeSessionId: null,
      country: checkout.shippingCountry,
      language: clean(request.language || "en", 8),
      preferredMethod: clean(request.preferredMethod || "", 40),
      items: checkout.items.map(publicLineItem),
      subtotal: checkout.subtotal,
      shipping: checkout.shipping.amount,
      total: checkout.total
    };
    state.updatedAt = new Date(nowMs).toISOString();
    changed = true;

    return {
      state,
      changed,
      result: {
        ok: true,
        orderRef: checkout.orderRef,
        checkoutExpiresAt: state.reservations[checkout.orderRef].checkoutExpiresAt,
        holdExpiresAt: state.reservations[checkout.orderRef].holdExpiresAt,
        stripeExpiresAtEpoch: Math.floor(checkoutExpiresAtMs / 1000)
      }
    };
  });
}

export async function attachStripeSessionToReservation(orderRef, stripeSession = {}) {
  return mutateInventoryState((state) => {
    const reservation = state.reservations[orderRef];
    if (!reservation || reservation.status === "paid") {
      return { state, changed: false, result: { ok: false, status: 404 } };
    }
    reservation.status = "checkout_open";
    reservation.stripeSessionId = clean(stripeSession.id || "", 120);
    reservation.checkoutUrl = clean(stripeSession.url || "", 2048);
    reservation.updatedAt = new Date().toISOString();
    state.updatedAt = reservation.updatedAt;
    return { state, changed: true, result: { ok: true } };
  });
}

export async function releaseInventoryReservation(orderRef, reason = "released") {
  return mutateInventoryState((state) => {
    const reservation = state.reservations[orderRef];
    if (!reservation || reservation.status === "paid" || reservation.status === "released") {
      return { state, changed: false, result: { ok: true, released: false } };
    }
    reservation.status = "released";
    reservation.releaseReason = clean(reason, 80);
    reservation.releasedAt = new Date().toISOString();
    state.updatedAt = reservation.releasedAt;
    return { state, changed: true, result: { ok: true, released: true } };
  });
}

export async function releaseInventoryReservationBySession(session = {}, reason = "stripe_session_expired") {
  const orderRef = session.metadata?.order_ref || session.client_reference_id || "";
  if (orderRef) return releaseInventoryReservation(orderRef, reason);
  return mutateInventoryState((state) => {
    const reservation = Object.values(state.reservations).find((entry) => entry.stripeSessionId === session.id);
    if (!reservation) return { state, changed: false, result: { ok: true, released: false } };
    if (reservation.status === "paid" || reservation.status === "released") {
      return { state, changed: false, result: { ok: true, released: false } };
    }
    reservation.status = "released";
    reservation.releaseReason = clean(reason, 80);
    reservation.releasedAt = new Date().toISOString();
    state.updatedAt = reservation.releasedAt;
    return { state, changed: true, result: { ok: true, released: true } };
  });
}

export async function markCheckoutSessionPaymentPending(session = {}, event = {}) {
  const orderRef = session.metadata?.order_ref || session.client_reference_id || "";
  if (!orderRef) return { ok: true, status: "ignored" };

  return mutateInventoryState((state) => {
    const reservation = state.reservations[orderRef];
    if (!reservation || reservation.status === "paid") {
      return { state, changed: false, result: { ok: true, status: "ignored" } };
    }
    reservation.status = "payment_pending";
    reservation.stripeSessionId ||= clean(session.id || "", 120);
    reservation.pendingEventId = clean(event.id || "", 160);
    reservation.pendingAt = new Date().toISOString();
    state.updatedAt = reservation.pendingAt;
    return { state, changed: true, result: { ok: true, status: "payment_pending" } };
  });
}

export async function recordPaidCheckoutSession(session = {}, event = {}) {
  return mutateInventoryState((state) => {
    const now = new Date().toISOString();
    const sessionId = clean(session.id || "", 120);
    const orderRef = clean(session.metadata?.order_ref || session.client_reference_id || "", 160);
    if (!sessionId) return { state, changed: false, result: { ok: false, status: 400, message: "Missing session id" } };
    if (state.orders[sessionId]) {
      return { state, changed: false, result: { ok: true, status: "duplicate", order: state.orders[sessionId] } };
    }

    const reservation =
      state.reservations[orderRef] ||
      Object.values(state.reservations).find((entry) => entry.stripeSessionId === sessionId);
    const items = reservation?.items?.length ? reservation.items : parseMetadataItems(session.metadata?.items);
    const missingReservation = !reservation;

    if (!missingReservation && reservation.status !== "paid") {
      for (const item of items) {
        const sizeState = state.inventory[item.productId]?.[item.size];
        if (sizeState) sizeState.sold = Number(sizeState.sold || 0) + Number(item.quantity || 0);
      }
      reservation.status = "paid";
      reservation.paidAt = now;
      reservation.stripeSessionId = sessionId;
      reservation.eventId = clean(event.id || "", 160);
    }

    const order = {
      sessionId,
      orderRef: orderRef || reservation?.orderRef || "",
      eventId: clean(event.id || "", 160),
      eventType: clean(event.type || "", 120),
      paidAt: now,
      paymentStatus: clean(session.payment_status || "paid", 40),
      currency: clean(session.currency || "eur", 8),
      amountSubtotal: numberOrNull(session.amount_subtotal) ?? reservation?.subtotal ?? null,
      amountShipping: shippingAmount(session) ?? reservation?.shipping ?? null,
      amountTotal: numberOrNull(session.amount_total) ?? reservation?.total ?? null,
      customer: {
        name: clean(session.customer_details?.name || ""),
        email: clean(session.customer_details?.email || session.customer_email || "").toLowerCase(),
        phone: clean(session.customer_details?.phone || "")
      },
      shippingAddress: sanitizeAddress(session.shipping_details?.address || session.customer_details?.address || {}),
      country: clean(
        session.shipping_details?.address?.country ||
          session.customer_details?.address?.country ||
          session.metadata?.shipping_country ||
          reservation?.country ||
          "",
        8
      ),
      items,
      needsManualInventoryReview: missingReservation
    };

    state.orders[sessionId] = order;
    state.updatedAt = now;
    return { state, changed: true, result: { ok: true, status: "recorded", order } };
  });
}

export async function handleStripeCommerceEvent(event = {}) {
  const session = event.data?.object || {};
  if (event.type === "checkout.session.completed") {
    if (session.payment_status === "paid") return recordPaidCheckoutSession(session, event);
    return markCheckoutSessionPaymentPending(session, event);
  }
  if (event.type === "checkout.session.async_payment_succeeded") {
    return recordPaidCheckoutSession(session, event);
  }
  if (event.type === "checkout.session.expired") {
    return releaseInventoryReservationBySession(session, "stripe_session_expired");
  }
  if (event.type === "checkout.session.async_payment_failed") {
    return releaseInventoryReservationBySession(session, "async_payment_failed");
  }
  return { ok: true, status: "ignored" };
}

export async function getInventorySnapshot() {
  const read = await readInventoryState();
  const state = normalizeState(read.data);
  releaseExpiredReservations(state, Date.now());
  return {
    ok: true,
    updatedAt: state.updatedAt,
    storage: read.driver,
    products: Object.fromEntries(
      PRODUCTS.map((product) => [
        product.id,
        {
          id: product.id,
          sku: product.sku,
          sizes: Object.fromEntries(
            product.sizes.map((size) => {
              const total = product.inventory[size] || 0;
              const sold = Number(state.inventory[product.id]?.[size]?.sold || 0);
              const reserved = reservedQuantity(state, product.id, size, Date.now());
              return [
                size,
                {
                  total,
                  sold,
                  reserved,
                  available: Math.max(0, total - sold - reserved)
                }
              ];
            })
          )
        }
      ])
    )
  };
}

async function mutateInventoryState(mutator) {
  const store = await getBlobStore();
  if (!store) return mutateLocalInventoryState(mutator);

  for (let attempt = 0; attempt < MAX_MUTATION_ATTEMPTS; attempt += 1) {
    const current = await readBlobState(store);
    const output = mutator(normalizeState(current.data));
    if (!output.changed) return output.result;
    output.state.updatedAt ||= new Date().toISOString();
    const write = await writeBlobState(store, output.state, current);
    if (write.modified) return output.result;
    await backoff(attempt);
  }

  return {
    ok: false,
    status: 409,
    message: "Stock is being updated. Please try again."
  };
}

function mutateLocalInventoryState(mutator) {
  const task = localQueue.then(async () => {
    const current = await readLocalState();
    const output = mutator(normalizeState(current.data));
    if (output.changed) await writeLocalState(output.state);
    return output.result;
  });
  localQueue = task.catch(() => {});
  return task;
}

async function readInventoryState() {
  const store = await getBlobStore();
  if (!store) return readLocalState();
  return readBlobState(store);
}

async function getBlobStore() {
  if (process.env.LANTSO_STORAGE_DRIVER === "file") return null;
  if (process.env.LANTSO_STORAGE_DRIVER !== "netlify-blobs" && !isNetlifyRuntime()) return null;
  if (!blobStorePromise) {
    blobStorePromise = import("@netlify/blobs")
      .then(({ getStore }) => getStore(STORE_NAME))
      .catch(() => null);
  }
  return blobStorePromise;
}

function isNetlifyRuntime() {
  return Boolean(
    process.env.NETLIFY === "true" ||
      process.env.NETLIFY_LOCAL === "true" ||
      process.env.NETLIFY_BLOBS_CONTEXT ||
      process.env.NETLIFY_SITE_ID ||
      process.env.SITE_ID
  );
}

async function readBlobState(store) {
  const entry = await store.getWithMetadata(STATE_KEY, { type: "json", consistency: "strong" });
  return {
    data: entry?.data || null,
    etag: entry?.etag || entry?.metadata?.etag || null,
    driver: "netlify-blobs"
  };
}

async function writeBlobState(store, state, current) {
  const options = {
    metadata: {
      version: String(STATE_VERSION),
      updatedAt: state.updatedAt
    }
  };
  if (current.etag) options.onlyIfMatch = current.etag;
  else options.onlyIfNew = true;
  return store.setJSON(STATE_KEY, state, options);
}

async function readLocalState() {
  if (!existsSync(LOCAL_STATE_FILE)) return { data: null, etag: null, driver: "local-file" };
  try {
    return { data: JSON.parse(await readFile(LOCAL_STATE_FILE, "utf8")), etag: null, driver: "local-file" };
  } catch {
    return { data: null, etag: null, driver: "local-file" };
  }
}

async function writeLocalState(state) {
  await mkdir(path.dirname(LOCAL_STATE_FILE), { recursive: true });
  const tempPath = `${LOCAL_STATE_FILE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await rename(tempPath, LOCAL_STATE_FILE);
  return { modified: true };
}

function normalizeState(raw) {
  const state = raw && typeof raw === "object" ? structuredClone(raw) : {};
  state.version = STATE_VERSION;
  state.createdAt ||= new Date().toISOString();
  state.updatedAt ||= state.createdAt;
  state.inventory ||= {};
  state.reservations ||= {};
  state.orders ||= {};

  for (const product of PRODUCTS) {
    state.inventory[product.id] ||= {};
    for (const size of product.sizes) {
      state.inventory[product.id][size] ||= {};
      state.inventory[product.id][size].total = product.inventory[size] || 0;
      state.inventory[product.id][size].sold = Number(state.inventory[product.id][size].sold || 0);
    }
  }

  return state;
}

function releaseExpiredReservations(state, nowMs) {
  let changed = false;
  for (const reservation of Object.values(state.reservations)) {
    if (!ACTIVE_RESERVATION_STATUSES.has(reservation.status)) continue;
    if (reservation.status === "payment_pending") continue;
    const holdExpiresAt = Date.parse(reservation.holdExpiresAt || reservation.expiresAt || reservation.checkoutExpiresAt || "");
    if (Number.isFinite(holdExpiresAt) && holdExpiresAt <= nowMs) {
      reservation.status = "released";
      reservation.releaseReason = "reservation_expired";
      reservation.releasedAt = new Date(nowMs).toISOString();
      changed = true;
    }
  }
  if (changed) state.updatedAt = new Date(nowMs).toISOString();
  return changed;
}

function unavailableItems(state, items, nowMs) {
  return items
    .map((item) => {
      const sizeState = state.inventory[item.productId]?.[item.size];
      const total = Number(sizeState?.total || 0);
      const sold = Number(sizeState?.sold || 0);
      const reserved = reservedQuantity(state, item.productId, item.size, nowMs);
      const available = Math.max(0, total - sold - reserved);
      return { ...item, total, sold, reserved, available };
    })
    .filter((item) => item.quantity > item.available);
}

function reservedQuantity(state, productId, size, nowMs) {
  let quantity = 0;
  for (const reservation of Object.values(state.reservations)) {
    if (!ACTIVE_RESERVATION_STATUSES.has(reservation.status)) continue;
    if (reservation.status !== "payment_pending") {
      const holdExpiresAt = Date.parse(reservation.holdExpiresAt || reservation.expiresAt || reservation.checkoutExpiresAt || "");
      if (Number.isFinite(holdExpiresAt) && holdExpiresAt <= nowMs) continue;
    }
    for (const item of reservation.items || []) {
      if (item.productId === productId && item.size === size) quantity += Number(item.quantity || 0);
    }
  }
  return quantity;
}

function stockMessage(item) {
  if (item.available <= 0) return `${item.name} / ${item.size} is sold out or temporarily reserved.`;
  return `${item.name} / ${item.size} only has ${item.available} piece${item.available === 1 ? "" : "s"} available right now.`;
}

function publicLineItem(item) {
  return {
    productId: item.productId,
    sku: item.sku,
    name: item.name,
    size: item.size,
    quantity: Number(item.quantity || 0),
    unitAmount: Number(item.unitAmount || 0),
    amount: Number(item.amount || 0)
  };
}

function parseMetadataItems(value = "") {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((entry) => {
      const match = entry.trim().match(/^([^/]+)\/([^x]+)x(\d+)$/i);
      if (!match) return null;
      const [, sku, size, quantity] = match;
      const product = PRODUCTS.find((candidate) => candidate.sku === sku);
      if (!product || !product.sizes.includes(size)) return null;
      return publicLineItem({
        productId: product.id,
        sku: product.sku,
        name: product.name.en,
        size,
        quantity: Number(quantity),
        unitAmount: product.price,
        amount: product.price * Number(quantity)
      });
    })
    .filter(Boolean);
}

function shippingAmount(session) {
  return numberOrNull(session.total_details?.amount_shipping);
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function sanitizeAddress(address = {}) {
  return {
    line1: clean(address.line1 || ""),
    line2: clean(address.line2 || ""),
    postalCode: clean(address.postal_code || ""),
    city: clean(address.city || ""),
    state: clean(address.state || ""),
    country: clean(address.country || "", 8)
  };
}

function clean(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function backoff(attempt) {
  return new Promise((resolve) => {
    setTimeout(resolve, Math.min(250, 20 * 2 ** attempt));
  });
}
