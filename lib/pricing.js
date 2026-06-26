export function calculateSellingPrice(mrp, saveTag) {
  const parsedMrp = Number(mrp);
  const parsedSaveTag = Number(saveTag);

  if (!Number.isFinite(parsedMrp) || parsedMrp <= 0) {
    return null;
  }

  if (!Number.isFinite(parsedSaveTag) || parsedSaveTag <= 0) {
    return Math.round(parsedMrp);
  }

  if (parsedSaveTag >= 100) {
    return 0;
  }

  return Math.round(parsedMrp * (1 - parsedSaveTag / 100));
}

export function sellingPriceMatchesCalculation(price, mrp, saveTag) {
  const calculated = calculateSellingPrice(mrp, saveTag);
  const parsedPrice = Number(price);

  if (calculated === null || !Number.isFinite(parsedPrice)) {
    return false;
  }

  return Math.round(parsedPrice) === calculated;
}

export function getProductMrp(product) {
  const mrp = Number(product?.mrp);
  const price = Number(product?.price);

  if (!Number.isFinite(mrp) || !Number.isFinite(price) || mrp <= price) {
    return null;
  }

  return mrp;
}

export function getSaveTag(product) {
  const saveTag = Number(product?.saveTag);

  if (Number.isInteger(saveTag) && saveTag > 0 && saveTag <= 100) {
    return saveTag;
  }

  return null;
}

export function getDiscountPercent(product) {
  const mrp = getProductMrp(product);
  const price = Number(product?.price);

  if (!mrp || !Number.isFinite(price)) {
    return null;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

export function getDisplayDiscount(product) {
  return getSaveTag(product) ?? getDiscountPercent(product);
}
