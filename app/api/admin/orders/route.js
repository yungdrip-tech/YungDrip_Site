import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { getAllOrdersForAdmin } from "@/lib/order-service";

export async function GET(request) {
  try {
    await requireAdminUser();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const orders = await getAllOrdersForAdmin({ status, search });

    return NextResponse.json({
      orders
    });
  } catch (error) {
    return handleApiError(error);
  }
}
