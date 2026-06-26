import crypto from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { handleApiError } from "@/lib/api-response";
import { requireAdminUser } from "@/lib/auth";
import { HttpError } from "@/lib/http-error";
import { saveProductImage } from "@/lib/product-upload";
import { assertTrustedOrigin } from "@/lib/security";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXTENSION_BY_MIME = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

export async function POST(request) {
  try {
    assertTrustedOrigin(request);
    await requireAdminUser();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      throw new HttpError(400, "Choose an image file to upload");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new HttpError(400, "Only JPG, PNG, WebP, and GIF images are supported");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new HttpError(400, "Image must be 5 MB or smaller");
    }

    const extension = EXTENSION_BY_MIME[file.type] || path.extname(file.name || "").toLowerCase() || ".jpg";
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveProductImage(buffer, filename, file.type);

    return NextResponse.json({ url });
  } catch (error) {
    return handleApiError(error);
  }
}
