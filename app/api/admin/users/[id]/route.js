import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { assertTrustedOrigin } from "@/lib/security";
import { updateUserRoleAsAdmin } from "@/lib/user-service";

export async function PUT(request, { params }) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();

    const body = await request.json();
    const user = await updateUserRoleAsAdmin(params.id, body.role);

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
