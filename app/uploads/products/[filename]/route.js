import { readProductImage, sanitizeProductUploadFilename } from "@/lib/product-upload";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  try {
    const filename = sanitizeProductUploadFilename(params.filename);
    const image = await readProductImage(filename);

    if (!image?.body?.length) {
      return new Response("Not found", { status: 404 });
    }

    const body = Buffer.isBuffer(image.body) ? image.body : Buffer.from(image.body);

    return new Response(body, {
      headers: {
        "Content-Type": image.contentType,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800"
      }
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
