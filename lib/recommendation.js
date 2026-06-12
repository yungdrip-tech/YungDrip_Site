function includesPreference(values = [], selectedValue) {
  return Array.isArray(values) && values.includes(selectedValue);
}

function scoreProduct(product, preferences, currentProductId) {
  if (!product || product._id === currentProductId) {
    return -1;
  }

  let score = 0;
  const tags = product.tags || {};

  if (includesPreference(tags.bodyType, preferences.bodyType)) {
    score += 4;
  }

  if (includesPreference(tags.skinTone, preferences.skinTone)) {
    score += 4;
  }

  if (Array.isArray(tags.style) && tags.style.length > 0) {
    score += 1;
  }

  if (product.featured) {
    score += 1;
  }

  return score;
}

export function getRecommendations(products = [], preferences, currentProductId) {
  if (!preferences?.bodyType || !preferences?.skinTone) {
    return {
      items: [],
      isFallback: false
    };
  }

  const scoredProducts = products
    .map((product) => ({
      product,
      score: scoreProduct(product, preferences, currentProductId)
    }))
    .filter((entry) => entry.score >= 0);

  const exactMatches = scoredProducts
    .filter((entry) => entry.score >= 8)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.product)
    .slice(0, 5);

  if (exactMatches.length > 0) {
    return {
      items: exactMatches,
      isFallback: false
    };
  }

  const similarMatches = scoredProducts
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.product)
    .slice(0, 5);

  return {
    items: similarMatches,
    isFallback: true
  };
}
