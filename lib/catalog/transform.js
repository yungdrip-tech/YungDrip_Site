import {
  CATEGORY_IMAGES,
  CATEGORY_PRICES,
  DEFAULT_SIZES,
  JOGGER_SIZES,
  SEASONS
} from "./constants.js";
import { buildStockBySizeForSizes, sumStockBySize } from "../stock.js";

function cleanText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/^\[merged\]\s*/i, "")
    .replace(/^"+|"+$/g, "")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function parseColor(description = "") {
  const cleaned = cleanText(description)
    .replace(/solid colour/gi, "")
    .replace(/,/g, " ")
    .trim();

  if (!cleaned) {
    return "Default";
  }

  return titleCase(cleaned);
}

function parseSizes(rawSizes, category) {
  if (typeof rawSizes === "string" && rawSizes.trim()) {
    return [...new Set(rawSizes.split(",").map((size) => size.trim()).filter(Boolean))];
  }

  return category === "Bottoms" ? [...JOGGER_SIZES] : [...DEFAULT_SIZES];
}

function mapSummerCategory(productName = "", explicitCategory = "") {
  if (typeof explicitCategory === "string" && explicitCategory.trim()) {
    return explicitCategory.trim();
  }

  const normalized = productName.toLowerCase();

  if (normalized.includes("jogger")) {
    return "Bottoms";
  }

  if (normalized.includes("hoodie")) {
    return "Hoodies";
  }

  if (normalized.includes("crop")) {
    return "Crop Tops";
  }

  if (normalized.includes("sleeveless")) {
    return "Sleeveless";
  }

  if (normalized.includes("t-shirt") || normalized.includes("t shirt")) {
    return "T-Shirts";
  }

  return "T-Shirts";
}

function mapWinterCategory(style = "", genericName = "", length = "", explicitCategory = "") {
  if (typeof explicitCategory === "string" && explicitCategory.trim()) {
    return explicitCategory.trim();
  }

  const normalizedStyle = style.toLowerCase();
  const normalizedGeneric = genericName.toLowerCase();
  const normalizedLength = length.toLowerCase();

  if (normalizedGeneric.includes("trouser") || normalizedStyle.includes("jogger")) {
    return "Bottoms";
  }

  if (normalizedStyle.includes("sweatshirt") || normalizedGeneric.includes("sweatshirt")) {
    return "Sweatshirts";
  }

  if (
    normalizedLength.includes("crop") &&
    (normalizedStyle.includes("hoodie") || normalizedGeneric.includes("hoodie"))
  ) {
    return "Crop Hoodies";
  }

  if (normalizedStyle.includes("hoodie") || normalizedGeneric.includes("hoodie")) {
    return "Hoodies";
  }

  return "Hoodies";
}

function getWinterDisplayName(record) {
  const style = cleanText(record.Style || record["Common Generic Name"] || "Hoodie");
  const length = cleanText(record.Length || "");
  const color = parseColor(record.Description);

  if (length.toLowerCase().includes("crop")) {
    return `Crop Hoodie — ${color}`;
  }

  if (style.toLowerCase().includes("zip")) {
    return `Zip Hoodie — ${color}`;
  }

  if (style.toLowerCase().includes("sweatshirt")) {
    return `Premium Sweatshirt — ${color}`;
  }

  if (style.toLowerCase().includes("trouser") || record["Common Generic Name"] === "Trousers") {
    return `Fleece Joggers — ${color}`;
  }

  return `Premium Hoodie — ${color}`;
}

function getWinterSizeChartKey(record) {
  const style = cleanText(record.Style || "").toLowerCase();
  const length = cleanText(record.Length || "").toLowerCase();
  const genericName = cleanText(record["Common Generic Name"] || "").toLowerCase();

  if (length.includes("crop")) {
    return "Crop Hoodie";
  }

  if (style.includes("zip")) {
    return "zip hoodie - unisex";
  }

  if (style.includes("sweatshirt") || genericName.includes("sweatshirt")) {
    return "SWEATSHIRT - CASUAL WEAR - UNISEX";
  }

  if (genericName.includes("trouser")) {
    return "Unisex Joggers";
  }

  return "HOODIES - CASUAL WEAR - UNISEX";
}

function getProductImages(category, index) {
  const images = CATEGORY_IMAGES[category] || CATEGORY_IMAGES.Hoodies;
  const primary = images[index % images.length];
  const secondary = images[(index + 1) % images.length];
  const tertiary = images[(index + 2) % images.length];

  return [primary, secondary, tertiary];
}

function parseProductImages(rawImages, category, index) {
  if (typeof rawImages === "string" && rawImages.trim()) {
    const urls = rawImages.split(",").map((url) => url.trim()).filter(Boolean);
    if (urls.length) {
      return urls;
    }
  }

  if (Array.isArray(rawImages) && rawImages.length) {
    return rawImages.filter(Boolean);
  }

  return getProductImages(category, index);
}

function buildTags(category, concept = "Basics") {
  const styleTags = {
    Hoodies: ["Streetwear", "Layering", "Relaxed"],
    "Crop Hoodies": ["Streetwear", "Layering", "Relaxed"],
    Sweatshirts: ["Streetwear", "Layering", "Minimal"],
    "T-Shirts": ["Streetwear", "Everyday", "Minimal"],
    Sleeveless: ["Streetwear", "Everyday", "Minimal"],
    "Crop Tops": ["Streetwear", "Everyday", "Minimal"],
    Bottoms: ["Streetwear", "Everyday", "Relaxed"]
  };

  return {
    bodyType: ["Slim", "Athletic", "Regular", "Heavy"],
    skinTone: ["Fair", "Light", "Medium", "Olive", "Dark"],
    style: concept === "Basics" || concept === "BASICS" ? styleTags[category] || ["Streetwear"] : ["Streetwear"]
  };
}

function buildWinterDescription(record) {
  const commonDescription = cleanText(record["Common Description"]);
  const material = cleanText(record.Material);
  const composition = cleanText(record["Material Composition"]);
  const wash = cleanText(record.Wash);
  const fit = cleanText(record.Fit);
  const length = cleanText(record.Length);

  const parts = [commonDescription];

  if (fit) {
    parts.push(`Fit: ${fit}.`);
  }

  if (length) {
    parts.push(`Length: ${length}.`);
  }

  if (material) {
    parts.push(material);
  }

  if (composition) {
    parts.push(`Composition: ${composition}.`);
  }

  if (wash) {
    parts.push(`Care: ${wash}.`);
  }

  return parts.filter(Boolean).join(" ");
}

function mapSubcategoryToGender(subcategory) {
  const value = cleanText(subcategory).toLowerCase();

  if (value === "men" || value === "male") {
    return "Male";
  }

  if (value === "women" || value === "female") {
    return "Female";
  }

  return "Unisex";
}

function parseSaveTag(value) {
  const parsed = Number(value);

  if (Number.isInteger(parsed) && parsed > 0 && parsed <= 100) {
    return parsed;
  }

  return undefined;
}

export function transformWinterProduct(record, index, sizeCharts = {}) {
  const sku = cleanText(record["Product ID"]);
  const category = mapWinterCategory(
    record.Style,
    record["Common Generic Name"],
    record.Length,
    record.Category
  );
  const color = parseColor(record.Description);
  const sizeChartKey = getWinterSizeChartKey(record);
  const chartRows = sizeCharts[sizeChartKey] || [];

  const sizes = chartRows.length
      ? chartRows.map((row) => cleanText(row.Size)).filter(Boolean)
      : category === "Bottoms"
        ? [...JOGGER_SIZES]
        : [...DEFAULT_SIZES];
  const stockBySize = buildStockBySizeForSizes(sizes, {}, 50);

  return {
    _id: `winter-${sku}`,
    sku,
    season: SEASONS.WINTER,
    name: getWinterDisplayName(record),
    price: CATEGORY_PRICES[category] || 1999,
    description: buildWinterDescription(record),
    category,
    images: getProductImages(category, index),
    sizes,
    colors: [color],
    tags: buildTags(category, record.Concept),
    featured: index < 3,
    gender: "Unisex",
    stock: sumStockBySize(stockBySize),
    stockBySize,
    sizeChart: chartRows.length ? chartRows : undefined,
    details: {
      fit: cleanText(record.Fit) || undefined,
      length: cleanText(record.Length) || undefined,
      sleeveLength: cleanText(record["Sleeve Length"]) || undefined,
      neckline: cleanText(record.Neckline) || undefined,
      material: cleanText(record.Material) || undefined,
      materialComposition: cleanText(record["Material Composition"]) || undefined,
      wash: cleanText(record.Wash) || undefined,
      concept: cleanText(record.Concept) || undefined,
      style: cleanText(record.Style || record["Common Generic Name"]) || undefined,
      sizeChartKey
    }
  };
}

function mapUpdatedWinterCategory(category = "") {
  const normalized = category.toLowerCase();

  if (normalized.includes("jogger")) {
    return "Bottoms";
  }

  if (normalized.includes("crop")) {
    return "Crop Hoodies";
  }

  if (normalized.includes("sweatshirt")) {
    return "Sweatshirts";
  }

  if (normalized.includes("hoodie") || normalized.includes("zip")) {
    return "Hoodies";
  }

  return "Hoodies";
}

function getUpdatedWinterSizeChartKey(record) {
  const category = (record.category || "").toLowerCase();
  const subcategory = (record.subcategory || "").toLowerCase();
  const quality = (record.quality || "").toLowerCase();

  if (category.includes("jogger")) {
    return "Unisex Joggers";
  }

  if (category.includes("crop")) {
    return "Crop Hoodie";
  }

  if (category.includes("zip")) {
    return "zip hoodie - unisex";
  }

  if (category.includes("sweatshirt")) {
    if (category.includes("casual") || quality === "casual") {
      return "SWEATSHIRT - CASUAL WEAR - UNISEX";
    }

    if (subcategory === "women") {
      return "SWEATSHIRT - PREMIUM - WOMEN";
    }

    return "SWEATSHIRT - PREMIUM - MEN";
  }

  if (category.includes("hoodie")) {
    if (category.includes("casual") || quality === "casual") {
      return "HOODIES - CASUAL WEAR - UNISEX";
    }

    if (subcategory === "women") {
      return "HOODIES - PREMIUM - WOMEN";
    }

    return "HOODIES - PREMIUM - MEN";
  }

  return "HOODIES - CASUAL WEAR - UNISEX";
}

function buildUpdatedWinterDescription(record) {
  const design = cleanText(record.design);
  const category = cleanText(record.category);
  const quality = cleanText(record.quality);
  const color = titleCase(cleanText(record.color) || "Default");
  const mrp = record.pricing?.mrp;
  const savePct = record.pricing?.save_tag_pct;

  const parts = [
    `${quality || "Premium"} ${category || "winter piece"} featuring ${design} in ${color}.`
  ];

  if (Number.isFinite(mrp) && savePct) {
    parts.push(`MRP ₹${mrp} (${savePct}% off).`);
  }

  return parts.join(" ");
}

export function transformUpdatedWinterProduct(record, index, sizeCharts = {}, skuOffset = 0) {
  const category = mapUpdatedWinterCategory(record.category);
  const color = titleCase(cleanText(record.color) || "Default");
  const design = cleanText(record.design) || "Design";
  const sku = `WW${String(skuOffset + index + 1).padStart(3, "0")}`;
  const sizeChartKey = getUpdatedWinterSizeChartKey(record);
  const chartRows = sizeCharts[sizeChartKey] || [];
  const price = Number(record.pricing?.price_with_gst);
  const mrp = Number(record.pricing?.mrp);
  const saveTag = parseSaveTag(record.pricing?.save_tag_pct);
  const gender = mapSubcategoryToGender(record.subcategory);
  const sizes = chartRows.length
      ? chartRows.map((row) => cleanText(row.Size)).filter(Boolean)
      : category === "Bottoms"
        ? [...JOGGER_SIZES]
        : [...DEFAULT_SIZES];
  const stockBySize = buildStockBySizeForSizes(
    sizes,
    record.stock ?? {},
    Number.isInteger(Number(record.stock?.total)) ? Number(record.stock.total) : 0
  );

  return {
    _id: `winter-${sku}`,
    sku,
    season: SEASONS.WINTER,
    name: `${design} — ${color}`,
    price: Number.isFinite(price) && price > 0 ? price : CATEGORY_PRICES[category] || 1999,
    mrp: Number.isFinite(mrp) && mrp > 0 ? mrp : undefined,
    saveTag,
    gender,
    description: buildUpdatedWinterDescription(record),
    category,
    images: getProductImages(category, index),
    sizes,
    colors: [color],
    tags: buildTags(category, record.quality),
    featured: index < 3,
    stock: sumStockBySize(stockBySize),
    stockBySize,
    sizeChart: chartRows.length ? chartRows : undefined,
    details: {
      concept: design,
      style: cleanText(record.category) || undefined,
      sizeChartKey
    }
  };
}

export function transformSummerProduct(record, index, sizeCharts = {}) {
  const sku = cleanText(record.ID);
  const productName = cleanText(record["Product Name"]);
  const category = mapSummerCategory(productName, record.Category);
  const color = parseColor(record.Colors || record.Description);
  const description = cleanText(record.Description);
  const sizeChartKey = category === "Bottoms" ? "Unisex Joggers" : null;
  const chartRows = sizeChartKey ? sizeCharts[sizeChartKey] || [] : [];
  const price = Number(record.Price);
  const stock = Number(record.Stock);
  const sizes = parseSizes(record.Sizes, category);
  const normalizedStock = Number.isInteger(stock) && stock >= 0 ? stock : 50;
  const stockBySize = buildStockBySizeForSizes(sizes, {}, normalizedStock);

  return {
    _id: `summer-${sku}`,
    sku,
    season: SEASONS.SUMMER,
    name: `${productName} — ${color}`,
    price: Number.isFinite(price) && price > 0 ? price : CATEGORY_PRICES[category] || 1299,
    description,
    category,
    images: parseProductImages(record["Product Images"], category, index),
    sizes,
    colors: [color],
    tags: buildTags(category),
    featured: index < 3,
    gender: "Unisex",
    stock: sumStockBySize(stockBySize),
    stockBySize,
    sizeChart: chartRows.length ? chartRows : undefined,
    details: {
      style: productName,
      sizeChartKey
    }
  };
}
