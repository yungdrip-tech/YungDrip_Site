import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { getAllUsersForAdmin } from "@/lib/user-service";

export async function GET() {
  try {
    await requireAdminUser();
    const users = await getAllUsersForAdmin();

    return NextResponse.json({ users });
  } catch (error) {
    return handleApiError(error);
  }
}
