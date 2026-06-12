import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { assertTrustedOrigin } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    await destroySession();

    return NextResponse.json({
      ok: true
    });
  } catch (error) {
    return handleApiError(error);
  }
}
