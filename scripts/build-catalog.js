import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCatalogFromSources } from "../lib/catalog/build.js";

const rootDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), "utf8"));
}

const winterCollection = readJson("data/winterCollection.json");
const summerCollection = readJson("data/summercollection.json");
const products = buildCatalogFromSources(winterCollection, summerCollection).map(({ _id, ...product }) => product);
const outputPath = path.join(rootDir, "data", "seed-products.json");

fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`);
console.log(`Built ${products.length} catalog products to ${outputPath}`);
