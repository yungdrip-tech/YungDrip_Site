import { NextResponse } from "next/server";
import { buildPasswordResetUrl, createPasswordResetToken } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { sendPasswordResetEmail } from "@/lib/email";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "unknown";

    await enforceRateLimit({
      action: "auth:forgot-password:ip",
      identifier: getClientIp(request),
      windowMs: 15 * 60 * 1000,
      max: 8,
      blockMs: 30 * 60 * 1000
    });
    await enforceRateLimit({
      action: "auth:forgot-password:email",
      identifier: email,
      windowMs: 60 * 60 * 1000,
      max: 3,
      blockMs: 60 * 60 * 1000
    });

    const result = await createPasswordResetToken(body.email);

    if (result.token && result.user) {
      await sendPasswordResetEmail(result.user, buildPasswordResetUrl(result.token));
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent."
    });
  } catch (error) {
    return handleApiError(error);
  }
}
