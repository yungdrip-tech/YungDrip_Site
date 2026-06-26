import { readProductImage, sanitizeProductUploadFilename } from "@/lib/product-upload";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const filename = sanitizeProductUploadFilename(params.filename);
    const image = await readProductImage(filename);

    if (!image) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(image.body, {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
