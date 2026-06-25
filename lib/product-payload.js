import { HttpError } from "@/lib/http-error";

function sanitizeString(value, field, { min = 1, max = 300 } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${field} must be a string`);
  }

  const trimmed = value.trim();

  if (trimmed.length < min) {
    throw new HttpError(400, `${field} must be at least ${min} characters`);
  }

  if (trimmed.length > max) {
    throw new HttpError(400, `${field} must be at most ${max} characters`);
  }

  return trimmed;
}

function sanitizeStringArray(value, field) {
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${field} must be an array`);
  }

  const sanitized = [...new Set(value.map((item) => sanitizeString(item, field, { min: 1, max: 120 })))];

  if (sanitized.length === 0) {
    throw new HttpError(400, `${field} must contain at least one item`);
  }

  return sanitized;
}

function sanitizeTags(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new HttpError(400, "tags must be an object");
  }

  return {
    bodyType: value.bodyType ? sanitizeStringArray(value.bodyType, "tags.bodyType") : [],
    skinTone: value.skinTone ? sanitizeStringArray(value.skinTone, "tags.skinTone") : [],
    style: value.style ? sanitizeStringArray(value.style, "tags.style") : []
  };
}

export function sanitizeProductPayload(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new HttpError(400, "Invalid product payload");
  }

  const sanitized = {};

  if (!partial || payload.name !== undefined) {
    sanitized.name = sanitizeString(payload.name, "name", { min: 2, max: 120 });
  }

  if (!partial || payload.price !== undefined) {
    const parsedPrice = Number(payload.price);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      throw new HttpError(400, "price must be a positive number");
    }

    sanitized.price = parsedPrice;
  }

  if (!partial || payload.description !== undefined) {
    sanitized.description = sanitizeString(payload.description, "description", {
      min: 10,
      max: 2000
    });
  }

  if (!partial || payload.category !== undefined) {
    sanitized.category = sanitizeString(payload.category, "category", { min: 2, max: 60 });
  }

  if (!partial || payload.images !== undefined) {
    sanitized.images = sanitizeStringArray(payload.images, "images");
  }

  if (!partial || payload.sizes !== undefined) {
    sanitized.sizes = sanitizeStringArray(payload.sizes, "sizes");
  }

  if (!partial || payload.colors !== undefined) {
    sanitized.colors = sanitizeStringArray(payload.colors, "colors");
  }

  if (!partial || payload.featured !== undefined) {
    sanitized.featured = Boolean(payload.featured);
  }

  if (!partial || payload.stock !== undefined) {
    const parsedStock = Number(payload.stock);

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      throw new HttpError(400, "stock must be a non-negative integer");
    }

    sanitized.stock = parsedStock;
  }

  if (!partial || payload.tags !== undefined) {
    sanitized.tags = payload.tags ? sanitizeTags(payload.tags) : { bodyType: [], skinTone: [], style: [] };
  }

  if (!partial || payload.sku !== undefined) {
    sanitized.sku = payload.sku ? sanitizeString(payload.sku, "sku", { min: 2, max: 32 }) : undefined;
  }

  if (!partial || payload.season !== undefined) {
    const allowedSeasons = ["Winter", "Summer"];

    if (payload.season && !allowedSeasons.includes(payload.season)) {
      throw new HttpError(400, "season must be Winter or Summer");
    }

    sanitized.season = payload.season || undefined;
  }

  if (!partial || payload.details !== undefined) {
    sanitized.details = sanitizeDetails(payload.details);
  }

  return sanitized;
}

function sanitizeOptionalString(value, field, { max = 500 } = {}) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return sanitizeString(value, field, { min: 1, max });
}

function sanitizeDetails(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const details = {
    fit: sanitizeOptionalString(value.fit, "details.fit", { max: 80 }),
    length: sanitizeOptionalString(value.length, "details.length", { max: 80 }),
    sleeveLength: sanitizeOptionalString(value.sleeveLength, "details.sleeveLength", { max: 80 }),
    neckline: sanitizeOptionalString(value.neckline, "details.neckline", { max: 80 }),
    material: sanitizeOptionalString(value.material, "details.material", { max: 500 }),
    materialComposition: sanitizeOptionalString(value.materialComposition, "details.materialComposition", {
      max: 120
    }),
    wash: sanitizeOptionalString(value.wash, "details.wash", { max: 120 }),
    concept: sanitizeOptionalString(value.concept, "details.concept", { max: 80 }),
    style: sanitizeOptionalString(value.style, "details.style", { max: 80 }),
    sizeChartKey: sanitizeOptionalString(value.sizeChartKey, "details.sizeChartKey", { max: 120 })
  };

  const hasValues = Object.values(details).some(Boolean);
  return hasValues ? details : undefined;
}
