import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { createCheckoutOrder } from "@/lib/order-service";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getRazorpayPublicKey } from "@/lib/razorpay";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    await enforceRateLimit({
      action: "checkout:create-order:user",
      identifier: user._id,
      windowMs: 10 * 60 * 1000,
      max: 8,
      blockMs: 20 * 60 * 1000
    });
    await enforceRateLimit({
      action: "checkout:create-order:ip",
      identifier: getClientIp(request),
      windowMs: 10 * 60 * 1000,
      max: 12,
      blockMs: 20 * 60 * 1000
    });
    const body = await request.json();
    const payload = await createCheckoutOrder({
      user,
      cartItems: body.items,
      shippingAddress: body.shippingAddress
    });

    return NextResponse.json({
      ...payload,
      keyId: getRazorpayPublicKey()
    });
  } catch (error) {
    return handleApiError(error);
  }
}
