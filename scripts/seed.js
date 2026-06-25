const path = require("node:path");
const fs = require("node:fs");
const { loadEnvConfig } = require("@next/env");
const mongoose = require("mongoose");

loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

async function loadCatalogProducts() {
  const { buildCatalogFromSources } = await import("../lib/catalog/build.js");
  const winterCollection = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "winterCollection.json"), "utf8")
  );
  const summerCollection = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), "data", "summercollection.json"), "utf8")
  );

  return buildCatalogFromSources(winterCollection, summerCollection).map(({ _id, ...product }) => product);
}

function normalizeSeedProducts(items) {
  return items.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return item;
    }

    const normalized = { ...item };

    if (normalized._id && !mongoose.Types.ObjectId.isValid(normalized._id)) {
      delete normalized._id;
    }

    if (!Number.isInteger(normalized.stock)) {
      normalized.stock = 50;
    }

    return normalized;
  });
}

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured. Add it to .env.local before seeding.");
  }

  const products = normalizeSeedProducts(await loadCatalogProducts());

  await mongoose.connect(MONGODB_URI, {
    dbName: MONGODB_DB_NAME,
    maxPoolSize: 10
  });

  const productSchema = new mongoose.Schema(
    {
      name: String,
      price: Number,
      description: String,
      category: String,
      images: [String],
      sizes: [String],
      colors: [String],
      tags: {
        bodyType: [String],
        skinTone: [String],
        style: [String]
      },
      featured: Boolean,
      stock: Number,
      sku: String,
      season: String,
      details: {
        fit: String,
        length: String,
        sleeveLength: String,
        neckline: String,
        material: String,
        materialComposition: String,
        wash: String,
        concept: String,
        style: String,
        sizeChartKey: String
      },
      sizeChart: [mongoose.Schema.Types.Mixed]
    },
    {
      timestamps: true
    }
  );

  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  await Product.deleteMany({});
  await Product.insertMany(products);

  const outputPath = path.join(process.cwd(), "data", "seed-products.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(products, null, 2)}\n`);

  console.log(`Seeded ${products.length} products into ${MONGODB_DB_NAME || path.basename(MONGODB_URI)}`);
  console.log(`Wrote ${outputPath}`);
}

seed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
