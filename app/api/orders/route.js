import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/order-service";

export async function GET() {
  try {
    const user = await requireCurrentUser();
    const orders = await getOrdersForUser(user._id);

    return NextResponse.json({
      orders
    });
  } catch (error) {
    return handleApiError(error);
  }
}
