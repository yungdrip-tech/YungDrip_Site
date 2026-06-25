import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { createProduct, getAllProducts } from "@/lib/product-service";
import { assertTrustedOrigin } from "@/lib/security";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";
  const search = searchParams.get("search") || searchParams.get("query") || "";
  const featured = searchParams.get("featured") === "true";
  const season = searchParams.get("season") || "";

  try {
    const products = await getAllProducts({
      category,
      sort,
      search,
      featured: featured || undefined,
      season: season || undefined
    });

    return NextResponse.json(products);
  } catch (error) {
    // DB unavailable — return seed data so pages render without a running database
    try {
      const { getFallbackProducts } = await import("@/lib/fallback-products");
      let products = getFallbackProducts();
      if (category && category !== "All") products = products.filter((p) => p.category === category);
      if (season && season !== "All") products = products.filter((p) => p.season === season);
      if (search) {
        const query = search.toLowerCase();
        products = products.filter(
          (product) =>
            product.name?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query) ||
            product.sku?.toLowerCase().includes(query)
        );
      }
      if (featured) products = products.filter((p) => p.featured);

      if (sort === "name-asc") {
        products.sort((left, right) => left.name.localeCompare(right.name));
      } else if (sort === "name-desc") {
        products.sort((left, right) => right.name.localeCompare(left.name));
      } else if (sort === "price-asc") {
        products.sort((left, right) => left.price - right.price);
      } else if (sort === "price-desc") {
        products.sort((left, right) => right.price - left.price);
      }

      return NextResponse.json(products);
    } catch {
      return handleApiError(error);
    }
  }
}

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();
    const body = await request.json();
    const createdProduct = await createProduct(body);
    return NextResponse.json(createdProduct, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
