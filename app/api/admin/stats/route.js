import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { getAdminStats } from "@/lib/admin-service";

export async function GET() {
  try {
    await requireAdminUser();
    const stats = await getAdminStats();

    return NextResponse.json({ stats });
  } catch (error) {
    return handleApiError(error);
  }
}
