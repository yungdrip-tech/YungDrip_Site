import {
  transformSummerProduct,
  transformUpdatedWinterProduct,
  transformWinterProduct
} from "./transform.js";

function flattenSizeCharts(section = {}) {
  return Object.entries(section).reduce((accumulator, [key, rows]) => {
    accumulator[key] = rows;
    return accumulator;
  }, {});
}

export function getSizeChartsFromWinter(winterCollection) {
  return {
    uppers: flattenSizeCharts(winterCollection["Size Chart - Uppers"] || {}),
    bottoms: flattenSizeCharts(winterCollection["Size Chart - Bottoms"] || {})
  };
}

export function buildCatalogFromSources(winterCollection, summerCollection, updatedWinterInventory = []) {
  const winterProducts = winterCollection["Product Descriptions"] || [];
  const sizeCharts = {
    ...getSizeChartsFromWinter(winterCollection).uppers,
    ...getSizeChartsFromWinter(winterCollection).bottoms
  };

  const winterBasics = winterProducts.map((record, index) =>
    transformWinterProduct(record, index, sizeCharts)
  );

  const winterDesigns = updatedWinterInventory.map((record, index) =>
    transformUpdatedWinterProduct(record, index, sizeCharts, winterBasics.length)
  );

  const summer = summerCollection.map((record, index) =>
    transformSummerProduct(record, index, sizeCharts)
  );

  return [...winterBasics, ...winterDesigns, ...summer];
}

export function getSizeChartByKeyFromWinter(winterCollection, key) {
  if (!key) {
    return null;
  }

  const charts = getSizeChartsFromWinter(winterCollection);
  return charts.uppers[key] || charts.bottoms[key] || null;
}
