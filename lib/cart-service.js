import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import Cart from "@/models/Cart";

function isValidCartItem(item) {
  return Boolean(
    item &&
      typeof item.cartKey === "string" &&
      typeof item.productId === "string" &&
      typeof item.name === "string" &&
      Number.isFinite(item.price) &&
      typeof item.image === "string" &&
      typeof item.size === "string" &&
      typeof item.color === "string" &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0 &&
      item.quantity <= 10
  );
}

function sanitizeCartItems(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  const merged = new Map();

  for (const item of items) {
    if (!isValidCartItem(item)) {
      continue;
    }

    const existing = merged.get(item.cartKey);

    if (existing) {
      merged.set(item.cartKey, {
        ...existing,
        quantity: Math.min(10, existing.quantity + item.quantity)
      });
    } else {
      merged.set(item.cartKey, { ...item });
    }
  }

  return [...merged.values()];
}

function normalizeCart(document) {
  if (!document) {
    return { items: [] };
  }

  const raw = typeof document.toObject === "function" ? document.toObject() : document;

  return {
    items: sanitizeCartItems(raw.items || [])
  };
}

export async function getCartForUser(userId) {
  await connectToDatabase();

  const cart = await Cart.findOne({ user: userId }).lean();
  return normalizeCart(cart);
}

export async function saveCartForUser(userId, items) {
  await connectToDatabase();

  const sanitizedItems = sanitizeCartItems(items);
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { items: sanitizedItems },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return normalizeCart(cart);
}

export async function mergeCartForUser(userId, guestItems) {
  await connectToDatabase();

  const existingCart = await Cart.findOne({ user: userId }).lean();
  const mergedItems = sanitizeCartItems([...(existingCart?.items || []), ...guestItems]);
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { items: mergedItems },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return normalizeCart(cart);
}

export function assertCartPayload(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Invalid cart payload");
  }

  return sanitizeCartItems(body.items);
}
