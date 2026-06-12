const TOP_CATEGORIES = new Set(["T-Shirts", "Tops", "Hoodies", "Outerwear", "Tank Tops", "Shirts"]);
const BOTTOM_CATEGORIES = new Set(["Jeans", "Bottoms", "Shorts", "Pants", "Trousers"]);
const FOOTWEAR_CATEGORIES = new Set(["Shoes", "Sneakers", "Boots", "Footwear", "Sandals"]);

export function getProductType(category) {
  if (TOP_CATEGORIES.has(category)) return "top";
  if (BOTTOM_CATEGORIES.has(category)) return "bottom";
  if (FOOTWEAR_CATEGORIES.has(category)) return "footwear";
  return "other";
}

// Maps color preference keys to product color name fragments
const COLOR_MATCH_MAP = {
  dark: ["Graphite", "Midnight", "Charcoal", "Black", "Noir", "Ebony"],
  light: ["Bone", "Stone", "Sand", "Cream", "White", "Ivory", "Chalk"],
  earth: ["Olive", "Forest", "Brown", "Khaki", "Tan", "Camel", "Rust"],
  blue: ["Raw Indigo", "Navy", "Blue", "Indigo", "Cobalt", "Denim"],
  any: null,
};

// Maps product color names to approximate hex values for 3D render
export const PRODUCT_COLOR_HEX = {
  Bone: "#e8dfd4",
  Graphite: "#5a5a5a",
  Olive: "#6b7c3f",
  "Raw Indigo": "#2b4070",
  Charcoal: "#3d3d3d",
  Stone: "#9b8f83",
  Forest: "#2d5016",
  Midnight: "#1a1a2e",
  Cream: "#f5f0e8",
  Sand: "#c2a882",
  White: "#f0f0f0",
  Black: "#1a1a1a",
  Navy: "#1a2744",
  Brown: "#6b4423",
  Tan: "#c8a882",
  Khaki: "#b5a96e",
};

export function getProductColorHex(product) {
  if (!product?.colors?.length) return "#8b7355";
  const first = product.colors[0];
  for (const [name, hex] of Object.entries(PRODUCT_COLOR_HEX)) {
    if (first.toLowerCase().includes(name.toLowerCase())) return hex;
  }
  return "#8b7355";
}

function matchesColorPreference(product, colorPreference) {
  if (!colorPreference || colorPreference === "any") return true;
  const targets = COLOR_MATCH_MAP[colorPreference] || [];
  return product.colors?.some((c) =>
    targets.some((t) => c.toLowerCase().includes(t.toLowerCase()))
  );
}

// "Average" maps to both Regular and Heavy tags
function matchesBodyType(product, bodyType) {
  const tags = product.tags?.bodyType || [];
  if (bodyType === "Average") return tags.includes("Regular") || tags.includes("Heavy");
  return tags.includes(bodyType);
}

function scoreProduct(product, preferences) {
  let score = 0;
  if (matchesBodyType(product, preferences.bodyType)) score += 4;
  if (matchesColorPreference(product, preferences.colorPreference)) score += 3;
  if (product.featured) score += 1;
  return score;
}

function getBestOfType(products, type, excludeId, preferences) {
  return products
    .filter((p) => p._id !== excludeId && getProductType(p.category) === type)
    .map((p) => ({ product: p, score: scoreProduct(p, preferences) }))
    .sort((a, b) => b.score - a.score)[0]?.product ?? null;
}

/**
 * Returns { top, bottom, footwear } where the current product fills its slot
 * and the remaining slots are filled by scored recommendations.
 */
export function getOutfitRecommendations(allProducts, currentProduct, preferences) {
  const currentType = getProductType(currentProduct.category);
  const outfit = { top: null, bottom: null, footwear: null };

  // Place the hero product
  const slot = currentType === "other" ? "top" : currentType;
  outfit[slot] = currentProduct;

  // Fill remaining slots
  if (!outfit.top) {
    outfit.top = getBestOfType(allProducts, "top", currentProduct._id, preferences);
  }
  if (!outfit.bottom) {
    outfit.bottom = getBestOfType(allProducts, "bottom", currentProduct._id, preferences);
  }
  if (!outfit.footwear) {
    outfit.footwear = getBestOfType(allProducts, "footwear", currentProduct._id, preferences);
  }

  return outfit;
}
