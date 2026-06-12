import { fetchProducts } from "@/lib/api-client";
import { enrichProductsWithFallback, getFallbackProducts } from "@/lib/fallback-products";

export async function fetchProductsWithFallback(params = {}, options = {}) {
  try {
    const products = await fetchProducts(params, options);

    if (!Array.isArray(products) || products.length === 0) {
      return getFallbackProducts();
    }

    return enrichProductsWithFallback(products);
  } catch {
    return getFallbackProducts();
  }
}
