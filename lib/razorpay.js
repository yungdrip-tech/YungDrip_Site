import crypto from "node:crypto";
import { HttpError } from "@/lib/http-error";

export function getStoreCurrency() {
  return process.env.NEXT_PUBLIC_STORE_CURRENCY || "INR";
}

export function getRazorpayPublicKey() {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
}

function getRazorpayCredentials() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new HttpError(503, "Razorpay is not configured yet. Add the Razorpay keys to your environment.");
  }

  return { keyId, keySecret };
}

export async function createRazorpayOrder({ amount, receipt, notes }) {
  const { keyId, keySecret } = getRazorpayCredentials();

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      amount,
      currency: getStoreCurrency(),
      receipt,
      notes
    }),
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new HttpError(502, payload?.error?.description || "Could not create a Razorpay order");
  }

  return payload;
}

export function verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const { keySecret } = getRazorpayCredentials();
  const expectedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  return expectedSignature === razorpaySignature;
}

export function verifyRazorpayWebhookSignature(body, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new HttpError(503, "Razorpay webhook secret is not configured");
  }

  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(body).digest("hex");
  return expectedSignature === signature;
}
