export function getCategories(products = []) {
  return ["All", ...new Set(products.map((product) => product.category).filter(Boolean))];
}

export function getFeaturedProducts(products = [], limit = 3) {
  return products.filter((product) => product.featured).slice(0, limit);
}
