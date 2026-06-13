import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { assertCartPayload, mergeCartForUser } from "@/lib/cart-service";
import { assertTrustedOrigin } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const user = await requireCurrentUser();
    const body = await request.json();
    const items = assertCartPayload(body);
    const cart = await mergeCartForUser(user._id, items);

    return NextResponse.json(cart);
  } catch (error) {
    return handleApiError(error);
  }
}
