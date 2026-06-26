export const PRODUCT_UPLOAD_PREFIX = "uploads/products";

export function isProductUploadUrl(src) {
  return typeof src === "string" && src.startsWith(`/${PRODUCT_UPLOAD_PREFIX}/`);
}
