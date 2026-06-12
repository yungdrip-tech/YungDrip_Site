import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      user
    });
  } catch (error) {
    return handleApiError(error);
  }
}
