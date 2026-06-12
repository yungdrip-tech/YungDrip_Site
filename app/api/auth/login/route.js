import { NextResponse } from "next/server";
import { authenticateUser, createSession } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";
import { enforceRateLimit } from "@/lib/rate-limit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "unknown";
    await enforceRateLimit({
      action: "auth:login:ip",
      identifier: getClientIp(request),
      windowMs: 15 * 60 * 1000,
      max: 12,
      blockMs: 30 * 60 * 1000
    });
    await enforceRateLimit({
      action: "auth:login:email",
      identifier: email,
      windowMs: 15 * 60 * 1000,
      max: 8,
      blockMs: 30 * 60 * 1000
    });
    const user = await authenticateUser(body);
    await createSession(user._id);

    return NextResponse.json({
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
