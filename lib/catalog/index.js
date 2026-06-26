import winterCollection from "../../data/winterCollection.json";
import updatedWinterCollection from "../../data/updatedwintercollection.json";
import summerCollection from "../../data/summercollection.json";
import {
  buildCatalogFromSources,
  getSizeChartByKeyFromWinter,
  getSizeChartsFromWinter
} from "./build.js";

export function getSizeCharts() {
  return getSizeChartsFromWinter(winterCollection);
}

export function getSizeChartByKey(key) {
  return getSizeChartByKeyFromWinter(winterCollection, key);
}

export function getCatalogProducts() {
  return buildCatalogFromSources(winterCollection, summerCollection, updatedWinterCollection);
}

export function getCatalogProductById(id) {
  return getCatalogProducts().find((product) => product._id === id || product.sku === id) || null;
}

export function getCatalogProductsBySeason(season) {
  if (!season || season === "All") {
    return getCatalogProducts();
  }

  return getCatalogProducts().filter((product) => product.season === season);
}
