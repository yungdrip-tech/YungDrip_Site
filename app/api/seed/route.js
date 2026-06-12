import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { seedProducts } from "@/lib/product-service";
import { HttpError } from "@/lib/http-error";
import { assertTrustedOrigin } from "@/lib/security";

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();

    if (process.env.ENABLE_SEED_ROUTE !== "true") {
      throw new HttpError(403, "Seed route is disabled");
    }

    const result = await seedProducts();
    return NextResponse.json({
      message: `Seeded ${result.count} products`
    });
  } catch (error) {
    return handleApiError(error);
  }
}
