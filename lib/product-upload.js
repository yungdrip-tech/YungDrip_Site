import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import ProductImage from "@/models/ProductImage";

export const PRODUCT_UPLOAD_PREFIX = "uploads/products";

const CONTENT_TYPE_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

export function sanitizeProductUploadFilename(filename) {
  if (!filename || typeof filename !== "string") {
    throw new HttpError(400, "Invalid image filename");
  }

  const normalized = path.basename(filename.trim());

  if (!normalized || normalized.includes("..") || !/^[a-zA-Z0-9._-]+$/.test(normalized)) {
    throw new HttpError(400, "Invalid image filename");
  }

  return normalized;
}

export function getProductUploadPath(filename) {
  return `/${PRODUCT_UPLOAD_PREFIX}/${sanitizeProductUploadFilename(filename)}`;
}

export function getContentTypeFromFilename(filename) {
  const extension = path.extname(filename).toLowerCase();
  return CONTENT_TYPE_BY_EXTENSION[extension] || "application/octet-stream";
}

async function saveProductImageLocally(buffer, filename) {
  const uploadDir = path.join(process.cwd(), "public", PRODUCT_UPLOAD_PREFIX);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);
}

async function readProductImageLocally(filename) {
  try {
    const localPath = path.join(process.cwd(), "public", PRODUCT_UPLOAD_PREFIX, filename);
    const buffer = await readFile(localPath);

    return {
      body: buffer,
      contentType: getContentTypeFromFilename(filename)
    };
  } catch {
    return null;
  }
}

export async function saveProductImage(buffer, filename, contentType) {
  const safeFilename = sanitizeProductUploadFilename(filename);

  await connectToDatabase();
  await ProductImage.findOneAndUpdate(
    { filename: safeFilename },
    {
      filename: safeFilename,
      contentType,
      data: buffer
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (process.env.NODE_ENV !== "production") {
    await saveProductImageLocally(buffer, safeFilename);
  }

  return getProductUploadPath(safeFilename);
}

export async function readProductImage(filename) {
  const safeFilename = sanitizeProductUploadFilename(filename);

  await connectToDatabase();
  const record = await ProductImage.findOne({ filename: safeFilename }).select("data contentType").lean();

  if (record?.data) {
    return {
      body: Buffer.from(record.data),
      contentType: record.contentType || getContentTypeFromFilename(safeFilename)
    };
  }

  return readProductImageLocally(safeFilename);
}
