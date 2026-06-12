const path = require("node:path");
const { loadEnvConfig } = require("@next/env");
const mongoose = require("mongoose");
const products = require("../data/seed-products.json");

loadEnvConfig(process.cwd());

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

async function seed() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured. Add it to .env.local before seeding.");
  }

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
      featured: Boolean
    },
    {
      timestamps: true
    }
  );

  const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

  await Product.deleteMany({});
  await Product.insertMany(products);

  console.log(`Seeded ${products.length} products into ${MONGODB_DB_NAME || path.basename(MONGODB_URI)}`);
}

seed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
