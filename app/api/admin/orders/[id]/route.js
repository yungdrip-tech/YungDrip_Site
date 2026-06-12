import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { getOrderForAdmin, updateOrderStatusAsAdmin } from "@/lib/order-service";
import { assertTrustedOrigin } from "@/lib/security";

export async function GET(_request, { params }) {
  try {
    await requireAdminUser();
    const order = await getOrderForAdmin(params.id);

    return NextResponse.json({
      order
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();

    const body = await request.json();
    const order = await updateOrderStatusAsAdmin(params.id, body.status);

    return NextResponse.json({
      order
    });
  } catch (error) {
    return handleApiError(error);
  }
}
