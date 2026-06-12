import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import RateLimit from "@/models/RateLimit";

export async function enforceRateLimit({
  action,
  identifier,
  windowMs,
  max,
  blockMs
}) {
  if (!action || !identifier) {
    return;
  }

  await connectToDatabase();

  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);
  const expiresAt = new Date(now.getTime() + Math.max(windowMs, blockMs) + 24 * 60 * 60 * 1000);
  let record = await RateLimit.findOne({ action, identifier });

  if (!record) {
    await RateLimit.create({
      action,
      identifier,
      count: 1,
      windowStart: now,
      blockedUntil: null,
      expiresAt
    });
    return;
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    throw new HttpError(429, "Too many attempts. Please try again later.", {
      retryAfterSeconds: Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000)
    });
  }

  if (record.windowStart < windowStart) {
    record.count = 1;
    record.windowStart = now;
    record.blockedUntil = null;
    record.expiresAt = expiresAt;
    await record.save();
    return;
  }

  record.count += 1;
  record.expiresAt = expiresAt;

  if (record.count > max) {
    record.blockedUntil = new Date(now.getTime() + blockMs);
    await record.save();

    throw new HttpError(429, "Too many attempts. Please try again later.", {
      retryAfterSeconds: Math.ceil(blockMs / 1000)
    });
  }

  await record.save();
}
