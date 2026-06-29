import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

const tempDir = await mkdtemp(path.join(os.tmpdir(), "lantso-tests-"));
process.env.LANTSO_STORAGE_DRIVER = "file";
process.env.LANTSO_LOCAL_STATE_FILE = path.join(tempDir, "inventory-state.json");
process.env.LANTSO_RATE_LIMIT_DRIVER = "memory";
process.env.LANTSO_FORM_MIN_ELAPSED_MS = "1000";
delete process.env.STRIPE_ADAPTIVE_PRICING;

const { buildCheckout, rateLimit, stripeSessionParams } = await import("../lib/checkout.mjs");
const { normalizeClubProfile, normalizeContactMessage } = await import("../lib/forms.mjs");
const {
  getInventorySnapshot,
  releaseInventoryReservation,
  reserveCheckoutInventory
} = await import(`../lib/inventory.mjs?test=${Date.now()}`);
const { verifyStripeSignature } = await import("../lib/stripe-webhook.mjs");

test.after(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

test("checkout charges configured EUR amounts for non-EUR shipping countries", () => {
  const checkout = buildCheckout({
    items: [{ productId: "roots-01-khaki", size: "M", quantity: 1 }],
    shippingCountry: "GB"
  });

  assert.equal(checkout.ok, true);
  assert.equal(checkout.currency, "eur");
  assert.equal(checkout.items[0].unitAmount, 5999);
  assert.equal(checkout.shipping.amount, 1999);

  const params = stripeSessionParams(checkout, { language: "en" }, "https://lantso.com");
  assert.equal(params.get("line_items[0][price_data][currency]"), "eur");
  assert.equal(params.get("shipping_options[0][shipping_rate_data][fixed_amount][currency]"), "eur");
  assert.equal(params.get("adaptive_pricing[enabled]"), null);
});

test("JSON form normalization rejects missing, filled, and too-fast bot guards", () => {
  const validTimes = {
    formStartedAt: String(Date.now() - 2000),
    formSubmittedAt: String(Date.now())
  };

  assert.equal(
    normalizeContactMessage({ name: "Youssef", email: "youssef@example.com", message: "Hello" }).ok,
    false
  );
  assert.equal(
    normalizeContactMessage({
      ...validTimes,
      "bot-field": "filled",
      name: "Youssef",
      email: "youssef@example.com",
      message: "Hello"
    }).ok,
    false
  );
  assert.equal(
    normalizeClubProfile({
      formStartedAt: String(Date.now()),
      formSubmittedAt: String(Date.now()),
      name: "Youssef",
      email: "youssef@example.com"
    }).ok,
    false
  );
  assert.equal(
    normalizeContactMessage({
      ...validTimes,
      name: "Youssef",
      email: "youssef@example.com",
      message: "Hello"
    }).ok,
    true
  );
});

test("memory rate limiter enforces the configured window", async () => {
  globalThis.__lantsoRateLimit = new Map();
  const key = `test:${Date.now()}:${Math.random()}`;

  assert.equal((await rateLimit(key, { limit: 2, windowMs: 60_000 })).ok, true);
  assert.equal((await rateLimit(key, { limit: 2, windowMs: 60_000 })).ok, true);
  assert.equal((await rateLimit(key, { limit: 2, windowMs: 60_000 })).ok, false);
});

test("Stripe webhook signatures require the correct digest and timestamp", () => {
  const secret = "whsec_test";
  const payload = Buffer.from(JSON.stringify({ id: "evt_test", type: "checkout.session.completed" }));
  const timestamp = Math.floor(Date.now() / 1000);
  const digest = crypto.createHmac("sha256", secret).update(`${timestamp}.${payload.toString("utf8")}`).digest("hex");

  assert.equal(verifyStripeSignature(`t=${timestamp},v1=${digest}`, payload, secret), true);
  assert.equal(verifyStripeSignature(`t=${timestamp},v1=bad`, payload, secret), false);
  assert.equal(verifyStripeSignature(`t=${timestamp - 1000},v1=${digest}`, payload, secret), false);
});

test("inventory reservations reduce availability and release cleanly", async () => {
  const checkout = buildCheckout({
    items: [{ productId: "roots-01-khaki", size: "M", quantity: 13 }],
    shippingCountry: "FR"
  });
  assert.equal(checkout.ok, true);

  const reservedAtMs = Date.now();
  const reservation = await reserveCheckoutInventory(checkout, { language: "en" });
  assert.equal(reservation.ok, true);
  const checkoutExpiresAtMs = Date.parse(reservation.checkoutExpiresAt);
  assert.ok(checkoutExpiresAtMs - reservedAtMs <= 10 * 60 * 1000 + 1000);
  assert.ok(checkoutExpiresAtMs - reservedAtMs >= 10 * 60 * 1000 - 1000);

  let snapshot = await getInventorySnapshot();
  assert.equal(snapshot.products["roots-01-khaki"].sizes.M.available, 0);

  const conflictingCheckout = buildCheckout({
    items: [{ productId: "roots-01-khaki", size: "M", quantity: 1 }],
    shippingCountry: "FR"
  });
  assert.equal(conflictingCheckout.ok, true);
  const conflict = await reserveCheckoutInventory(conflictingCheckout, { language: "en" });
  assert.equal(conflict.ok, false);
  assert.equal(conflict.status, 409);

  await releaseInventoryReservation(checkout.orderRef, "test_release");
  snapshot = await getInventorySnapshot();
  assert.equal(snapshot.products["roots-01-khaki"].sizes.M.available, 13);
});
