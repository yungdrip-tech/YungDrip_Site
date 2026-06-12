import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { getFallbackProducts } from "@/lib/fallback-products";
import { deleteProduct, getProductById, updateProduct } from "@/lib/product-service";
import { assertTrustedOrigin } from "@/lib/security";

export async function GET(_request, { params }) {
  const { id } = params;

  // Non-ObjectId IDs (e.g. demo/seed IDs) — serve from fallback data immediately
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const product = getFallbackProducts().find((p) => p._id === id);
    if (product) return NextResponse.json(product);
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  try {
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();
    const body = await request.json();
    const product = await updateProduct(params.id, body);
    return NextResponse.json(product);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    assertTrustedOrigin(_request);
    await requireAdminUser();
    const product = await deleteProduct(params.id);
    return NextResponse.json({
      message: "Product deleted successfully",
      product
    });
  } catch (error) {
    return handleApiError(error);
  }
}
