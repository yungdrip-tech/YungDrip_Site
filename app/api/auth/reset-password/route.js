import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);

    await enforceRateLimit({
      action: "auth:reset-password:ip",
      identifier: getClientIp(request),
      windowMs: 15 * 60 * 1000,
      max: 10,
      blockMs: 30 * 60 * 1000
    });

    const body = await request.json();
    const user = await resetPasswordWithToken({
      token: body.token,
      password: body.password
    });

    return NextResponse.json({
      ok: true,
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
