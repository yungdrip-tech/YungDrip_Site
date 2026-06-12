import seedProducts from "@/data/seed-products.json";

function slugKey(product) {
  return `${product.name}-${product.category}`.toLowerCase();
}

export function getFallbackProducts() {
  return seedProducts.map((product, index) => ({
    ...product,
    _id: product._id || `fallback-${index + 1}`
  }));
}

export function enrichProductsWithFallback(products = []) {
  const fallbackMap = new Map(getFallbackProducts().map((product) => [slugKey(product), product]));

  return products.map((product) => {
    const fallbackProduct = fallbackMap.get(slugKey(product));

    if (!fallbackProduct) {
      return product;
    }

    return {
      ...fallbackProduct,
      ...product,
      tags: product.tags || fallbackProduct.tags
    };
  });
}
