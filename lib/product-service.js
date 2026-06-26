import mongoose from "mongoose";
import { getCatalogProducts } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { sanitizeProductPayload } from "@/lib/product-payload";
import { getTotalStock, normalizeStockBySize } from "@/lib/stock";
import Product from "@/models/Product";

function normalizeProduct(document) {
  if (!document) {
    return null;
  }

  const raw = typeof document.toObject === "function" ? document.toObject() : document;
  const stockBySize = normalizeStockBySize(raw.stockBySize);

  return {
    ...raw,
    _id: raw._id.toString(),
    stockBySize,
    stock: getTotalStock({ ...raw, stockBySize })
  };
}

function getSortValue(sort) {
  const sortMap = {
    "name-asc": { name: 1, createdAt: -1 },
    "name-desc": { name: -1, createdAt: -1 },
    "price-asc": { price: 1, createdAt: -1 },
    "price-desc": { price: -1, createdAt: -1 }
  };

  return sortMap[sort] || { createdAt: -1 };
}

export async function getAllProducts(options = {}) {
  const { category, search, sort, featured, limit, season } = options;
  await connectToDatabase();

  const filter = {};

  if (category && category !== "All") {
    filter.category = category;
  }

  if (search) {
    const pattern = { $regex: search, $options: "i" };
    filter.$or = [{ name: pattern }, { category: pattern }, { sku: pattern }];
  }

  if (featured === true) {
    filter.featured = true;
  }

  if (season && season !== "All") {
    filter.season = season;
  }

  let query = Product.find(filter).sort(getSortValue(sort));

  if (Number.isInteger(limit) && limit > 0) {
    query = query.limit(limit);
  }

  const result = await query.lean();
  return result.map(normalizeProduct);
}

export async function getFeaturedProducts(limit = 3) {
  return getAllProducts({ featured: true, limit });
}

export async function getProductById(id) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const product = await Product.findById(id).lean();
  return normalizeProduct(product);
}

export async function createProduct(payload) {
  const sanitizedPayload = sanitizeProductPayload(payload);
  await connectToDatabase();
  const createdProduct = await Product.create(sanitizedPayload);
  return normalizeProduct(createdProduct);
}

export async function updateProduct(id, payload) {
  const sanitizedPayload = sanitizeProductPayload(payload, { partial: true });

  if (Object.keys(sanitizedPayload).length === 0) {
    throw new HttpError(400, "Provide at least one field to update");
  }

  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, sanitizedPayload, {
    new: true,
    runValidators: true
  }).lean();

  if (!updatedProduct) {
    throw new HttpError(404, "Product not found");
  }

  return normalizeProduct(updatedProduct);
}

export async function deleteProduct(id) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const deletedProduct = await Product.findByIdAndDelete(id).lean();

  if (!deletedProduct) {
    throw new HttpError(404, "Product not found");
  }

  return normalizeProduct(deletedProduct);
}

function stripCatalogIds(products) {
  return products.map(({ _id, ...product }) => product);
}

export async function seedProducts() {
  await connectToDatabase();
  await Product.deleteMany({});
  const catalogProducts = stripCatalogIds(getCatalogProducts());
  const inserted = await Product.insertMany(catalogProducts);

  return {
    count: inserted.length
  };
}

export async function getProductCategories() {
  await connectToDatabase();
  const categories = await Product.distinct("category");
  return categories.sort((left, right) => left.localeCompare(right));
}
