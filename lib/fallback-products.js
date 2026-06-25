import { getCatalogProducts } from "@/lib/catalog";

export function getFallbackProducts() {
  return getCatalogProducts();
}

export function enrichProductsWithFallback(products = []) {
  const fallbackMap = new Map(
    getFallbackProducts().map((product) => [product.sku || product._id, product])
  );

  return products.map((product) => {
    const fallbackProduct = fallbackMap.get(product.sku) || fallbackMap.get(product._id);

    if (!fallbackProduct) {
      return product;
    }

    return {
      ...fallbackProduct,
      ...product,
      tags: product.tags || fallbackProduct.tags,
      details: product.details || fallbackProduct.details
    };
  });
}
