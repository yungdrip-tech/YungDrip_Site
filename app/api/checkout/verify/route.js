import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { finalizeCheckoutOrder } from "@/lib/order-service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    await enforceRateLimit({
      action: "checkout:verify:user",
      identifier: user._id,
      windowMs: 10 * 60 * 1000,
      max: 16,
      blockMs: 20 * 60 * 1000
    });
    await enforceRateLimit({
      action: "checkout:verify:ip",
      identifier: getClientIp(request),
      windowMs: 10 * 60 * 1000,
      max: 24,
      blockMs: 20 * 60 * 1000
    });
    const body = await request.json();
    const order = await finalizeCheckoutOrder({
      userId: user._id,
      orderId: body.orderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpayOrderId: body.razorpayOrderId,
      razorpaySignature: body.razorpaySignature
    });

    return NextResponse.json({
      order
    });
  } catch (error) {
    return handleApiError(error);
  }
}
