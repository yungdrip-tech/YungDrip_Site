/**
 * Upload local product images into MongoDB using the same filenames
 * already stored on product documents.
 *
 * Usage:
 *   pnpm uploads:push
 */
const path = require("node:path");
const { readdir, readFile } = require("node:fs/promises");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const CONTENT_TYPE_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

function getContentTypeFromFilename(filename) {
  const extension = path.extname(filename).toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[extension] || "application/octet-stream";
}

async function main() {
  const mongoose = require("mongoose");
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is required");
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  const entries = await readdir(uploadDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name !== ".gitkeep");

  if (!files.length) {
    console.log("No local product images found in public/uploads/products");
    return;
  }

  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME, maxPoolSize: 5 });

  const productImageSchema = new mongoose.Schema(
    {
      filename: { type: String, required: true, unique: true },
      contentType: { type: String, required: true },
      data: { type: Buffer, required: true }
    },
    { timestamps: true }
  );

  const ProductImage =
    mongoose.models.ProductImage || mongoose.model("ProductImage", productImageSchema);

  for (const file of files) {
    const buffer = await readFile(path.join(uploadDir, file.name));

    await ProductImage.findOneAndUpdate(
      { filename: file.name },
      {
        filename: file.name,
        contentType: getContentTypeFromFilename(file.name),
        data: buffer
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`Stored ${file.name} -> /uploads/products/${file.name}`);
  }

  await mongoose.disconnect();
  console.log(`Done. Stored ${files.length} image(s) in MongoDB.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
