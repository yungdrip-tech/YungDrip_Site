import { NextResponse } from "next/server";
import { createSession, registerUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "unknown";
    await enforceRateLimit({
      action: "auth:register:ip",
      identifier: getClientIp(request),
      windowMs: 30 * 60 * 1000,
      max: 6,
      blockMs: 60 * 60 * 1000
    });
    await enforceRateLimit({
      action: "auth:register:email",
      identifier: email,
      windowMs: 24 * 60 * 60 * 1000,
      max: 3,
      blockMs: 24 * 60 * 60 * 1000
    });
    const user = await registerUser(body);
    await createSession(user._id);

    return NextResponse.json({
      user
    }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
