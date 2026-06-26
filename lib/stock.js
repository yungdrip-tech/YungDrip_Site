export function normalizeStockBySize(value) {
  if (!value) {
    return {};
  }

  if (value instanceof Map) {
    return Object.fromEntries(value);
  }

  if (typeof value === "object" && !Array.isArray(value)) {
    return { ...value };
  }

  return {};
}

export function sumStockBySize(stockBySize) {
  return Object.values(normalizeStockBySize(stockBySize)).reduce((total, quantity) => {
    const parsed = Number(quantity);
    return total + (Number.isInteger(parsed) && parsed >= 0 ? parsed : 0);
  }, 0);
}

export function isProductOutOfStock(product) {
  return Boolean(product?.outOfStock);
}

export function getStockForSize(product, size) {
  if (isProductOutOfStock(product)) {
    return 0;
  }

  const stockBySize = normalizeStockBySize(product?.stockBySize);

  if (size && Number.isInteger(stockBySize[size])) {
    return stockBySize[size];
  }

  if (Number.isInteger(product?.stock)) {
    return product.stock;
  }

  return null;
}

export function getTotalStock(product) {
  if (isProductOutOfStock(product)) {
    return 0;
  }

  const stockBySize = normalizeStockBySize(product?.stockBySize);

  if (Object.keys(stockBySize).length > 0) {
    return sumStockBySize(stockBySize);
  }

  return Number.isInteger(product?.stock) ? product.stock : 0;
}

export function getFirstInStockSize(product) {
  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  return sizes.find((size) => (getStockForSize(product, size) ?? 0) > 0) || sizes[0] || "";
}

export function buildStockBySizeForSizes(sizes, stockBySize = {}, fallbackStock = 0) {
  const normalized = normalizeStockBySize(stockBySize);
  const result = {};

  for (const size of sizes) {
    const parsed = Number(normalized[size]);
    result[size] = Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
  }

  if (sumStockBySize(result) === 0 && fallbackStock > 0 && sizes[0]) {
    result[sizes[0]] = fallbackStock;
  }

  return result;
}

export function formatStockBySizeSummary(product) {
  if (isProductOutOfStock(product)) {
    return "Marked out of stock";
  }

  const sizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const stockBySize = buildStockBySizeForSizes(sizes, product?.stockBySize, product?.stock ?? 0);

  if (!sizes.length) {
    return String(getTotalStock(product));
  }

  return sizes.map((size) => `${size}:${stockBySize[size] ?? 0}`).join(" · ");
}
