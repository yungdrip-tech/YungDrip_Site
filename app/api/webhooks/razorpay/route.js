import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { HttpError } from "@/lib/http-error";
import { processRazorpayWebhook } from "@/lib/order-service";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(request) {
  try {
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      throw new HttpError(400, "Missing Razorpay signature");
    }

    const rawBody = await request.text();
    const isValidSignature = verifyRazorpayWebhookSignature(rawBody, signature);

    if (!isValidSignature) {
      throw new HttpError(400, "Invalid Razorpay webhook signature");
    }

    const payload = JSON.parse(rawBody);
    const result = await processRazorpayWebhook({
      event: payload.event,
      payload: payload.payload
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
