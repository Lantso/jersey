import { connectLambda } from "@netlify/blobs";
import { securityHeaders } from "../../lib/checkout.mjs";
import { sendOrderNotification } from "../../lib/forms.mjs";
import { handleStripeCommerceEvent } from "../../lib/inventory.mjs";
import { verifyStripeSignature } from "../../lib/stripe-webhook.mjs";

export async function handler(event) {
  connectBlobs(event);
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }
  const rawBody = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");
  if (!verifyStripeSignature(header(event, "stripe-signature"), rawBody)) {
    console.warn("Stripe webhook rejected: invalid signature", { requestId: header(event, "x-nf-request-id") || "" });
    return json(400, { message: "Invalid webhook signature" });
  }
  const parsed = parseJson(rawBody);
  if (!parsed.ok || !parsed.data || typeof parsed.data !== "object") {
    console.warn("Stripe webhook rejected: invalid json", { requestId: header(event, "x-nf-request-id") || "" });
    return json(400, { message: "Invalid webhook payload" });
  }

  try {
    const result = await handleStripeCommerceEvent(parsed.data);
    if (!result?.ok) {
      console.error("Stripe webhook processing failed", {
        eventId: parsed.data?.id || "",
        eventType: parsed.data?.type || "",
        status: result?.status || "",
        message: result?.message || ""
      });
      return json(result?.status && result.status < 500 ? result.status : 500, {
        received: true,
        action: result?.status || "failed",
        message: result?.message || "Webhook processing failed"
      });
    }

    const notification = await notifyRecordedOrder(result);
    return json(200, {
      received: true,
      action: result.status || "processed",
      emailed: notification.ok,
      emailStatus: notification.reason || notification.status || "not_needed"
    });
  } catch (error) {
    console.error("Stripe webhook crashed", {
      eventId: parsed.data?.id || "",
      eventType: parsed.data?.type || "",
      message: error.message
    });
    return json(500, { received: true, action: "failed", message: "Webhook processing failed" });
  }
}

function header(event, name) {
  return event.headers?.[name] || event.headers?.[name.toLowerCase()] || event.headers?.[name.toUpperCase()];
}

function parseJson(rawBody) {
  try {
    return { ok: true, data: JSON.parse(rawBody.toString("utf8")) };
  } catch {
    return { ok: false, data: null };
  }
}

async function notifyRecordedOrder(result) {
  if (result.status !== "recorded" || !result.order) return { ok: false, skipped: true, reason: "not_recorded" };
  try {
    const notification = await sendOrderNotification(result.order);
    if (!notification.ok) {
      console.warn("Order notification skipped or failed", {
        orderRef: result.order.orderRef || "",
        reason: notification.reason || "",
        status: notification.status || ""
      });
    }
    return notification;
  } catch (error) {
    console.warn("Order notification crashed", {
      orderRef: result.order.orderRef || "",
      message: error.message
    });
    return { ok: false, status: 0 };
  }
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: securityHeaders(),
    body: JSON.stringify(payload)
  };
}

function connectBlobs(event) {
  try {
    if (event.blobs) connectLambda(event);
  } catch {
  }
}
