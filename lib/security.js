import { HttpError } from "@/lib/http-error";

export function getClientIp(request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export function assertTrustedOrigin(request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  const allowedOrigins = new Set(
    [`${protocol}://${host}`, process.env.APP_URL, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean)
  );

  if (!allowedOrigins.has(origin)) {
    throw new HttpError(403, "Untrusted request origin");
  }
}
