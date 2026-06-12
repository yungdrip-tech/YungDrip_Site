import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/order-service";

export async function GET(_request, { params }) {
  try {
    const user = await requireCurrentUser();
    const order = await getOrderForUser(user._id, params.id);

    return NextResponse.json({
      order
    });
  } catch (error) {
    return handleApiError(error);
  }
}
