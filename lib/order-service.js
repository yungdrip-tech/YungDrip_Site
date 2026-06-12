import crypto from "node:crypto";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import { createRazorpayOrder, getStoreCurrency, verifyRazorpaySignature } from "@/lib/razorpay";
import Order from "@/models/Order";
import Product from "@/models/Product";

function roundCurrency(value) {
  return Math.round(value * 100) / 100;
}

const TRACKABLE_STATUSES = ["payment_pending", "processing", "packed", "shipped", "delivered", "cancelled"];

function normalizeOrder(document) {
  if (!document) {
    return null;
  }

  const raw = typeof document.toObject === "function" ? document.toObject() : document;

  return {
    ...raw,
    _id: raw._id.toString(),
    user: raw.user?.toString?.() || raw.user
  };
}

function sanitizeString(value, field, { min = 1, max = 160 } = {}) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${field} is required`);
  }

  const normalized = value.trim();

  if (normalized.length < min) {
    throw new HttpError(400, `${field} must be at least ${min} characters`);
  }

  if (normalized.length > max) {
    throw new HttpError(400, `${field} must be at most ${max} characters`);
  }

  return normalized;
}

function sanitizeShippingAddress(address, user) {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    throw new HttpError(400, "Shipping address is required");
  }

  return {
    fullName: sanitizeString(address.fullName || user.name, "Full name", { min: 2, max: 120 }),
    email: sanitizeString(address.email || user.email, "Email", { min: 5, max: 120 }).toLowerCase(),
    phone: sanitizeString(address.phone || user.phone, "Phone number", { min: 8, max: 30 }),
    line1: sanitizeString(address.line1, "Address line 1", { min: 4, max: 180 }),
    line2: typeof address.line2 === "string" ? address.line2.trim() : "",
    city: sanitizeString(address.city, "City", { min: 2, max: 80 }),
    state: sanitizeString(address.state, "State", { min: 2, max: 80 }),
    postalCode: sanitizeString(address.postalCode, "Postal code", { min: 3, max: 20 }),
    country: sanitizeString(address.country, "Country", { min: 2, max: 80 })
  };
}

function sanitizeCartItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, "Your cart is empty");
  }

  return items.map((item) => {
    if (!item || typeof item !== "object") {
      throw new HttpError(400, "Invalid cart item");
    }

    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new HttpError(400, "Invalid item quantity");
    }

    return {
      productId: sanitizeString(item.productId, "Product ID", { min: 6, max: 48 }),
      size: sanitizeString(item.size, "Size", { min: 1, max: 40 }),
      color: sanitizeString(item.color, "Color", { min: 1, max: 60 }),
      quantity
    };
  });
}

function buildPricing(items) {
  const subtotal = roundCurrency(items.reduce((total, item) => total + item.price * item.quantity, 0));
  const shipping = subtotal >= 200 ? 0 : 12;
  const tax = roundCurrency(subtotal * 0.12);
  const total = roundCurrency(subtotal + shipping + tax);

  return {
    subtotal,
    shipping,
    tax,
    total,
    currency: getStoreCurrency()
  };
}

function buildOrderNumber() {
  return `YD-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
}

function appendStatusHistory(order, status, label) {
  const latestStatus = order.statusHistory?.[order.statusHistory.length - 1]?.status;

  if (latestStatus === status) {
    return;
  }

  order.statusHistory.push({
    status,
    label
  });
}

async function buildOrderItems(cartItems) {
  const productIds = [...new Set(cartItems.map((item) => item.productId))];

  if (!productIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    throw new HttpError(400, "One or more products are invalid");
  }

  const products = await Product.find({
    _id: { $in: productIds }
  }).lean();

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  return cartItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new HttpError(404, "A product in your cart no longer exists");
    }

    if (!Array.isArray(product.sizes) || !product.sizes.includes(item.size)) {
      throw new HttpError(400, `Selected size is unavailable for ${product.name}`);
    }

    if (!Array.isArray(product.colors) || !product.colors.includes(item.color)) {
      throw new HttpError(400, `Selected color is unavailable for ${product.name}`);
    }

    return {
      productId: product._id.toString(),
      name: product.name,
      image: product.images?.[0] || "",
      category: product.category,
      price: product.price,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    };
  });
}

export async function createCheckoutOrder({ user, cartItems, shippingAddress }) {
  await connectToDatabase();

  const sanitizedItems = sanitizeCartItems(cartItems);
  const validatedItems = await buildOrderItems(sanitizedItems);
  const pricing = buildPricing(validatedItems);
  const normalizedAddress = sanitizeShippingAddress(shippingAddress, user);
  const receipt = `receipt_${Date.now()}`;
  const razorpayOrder = await createRazorpayOrder({
    amount: Math.round(pricing.total * 100),
    receipt,
    notes: {
      customerEmail: user.email,
      orderNumber: receipt
    }
  });

  const order = await Order.create({
    user: user._id,
    orderNumber: buildOrderNumber(),
    items: validatedItems,
    shippingAddress: normalizedAddress,
    pricing,
    payment: {
      provider: "razorpay",
      status: "created",
      razorpayOrderId: razorpayOrder.id
    },
    status: "payment_pending",
    statusHistory: [
      {
        status: "payment_pending",
        label: "Awaiting payment confirmation"
      }
    ]
  });

  return {
    order: normalizeOrder(order),
    razorpay: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency
    }
  };
}

export async function finalizeCheckoutOrder({ userId, orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature }) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new HttpError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  if (order.payment.status === "paid") {
    return normalizeOrder(order);
  }

  if (order.payment.razorpayOrderId !== razorpayOrderId) {
    throw new HttpError(400, "Razorpay order mismatch");
  }

  const isValidSignature = verifyRazorpaySignature({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  });

  if (!isValidSignature) {
    order.payment.status = "failed";
    await order.save();
    throw new HttpError(400, "Payment signature verification failed");
  }

  order.payment.status = "paid";
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.razorpaySignature = razorpaySignature;
  order.payment.paidAt = new Date();
  order.status = "processing";
  appendStatusHistory(order, "processing", "Payment confirmed and order is processing");

  await order.save();

  return normalizeOrder(order);
}

export async function getOrdersForUser(userId) {
  await connectToDatabase();

  const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).lean();
  return orders.map(normalizeOrder);
}

export async function getOrderForUser(userId, orderId) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new HttpError(400, "Invalid order ID");
  }

  const order = await Order.findOne({
    _id: orderId,
    user: userId
  }).lean();

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return normalizeOrder(order);
}

export async function getAllOrdersForAdmin(options = {}) {
  await connectToDatabase();

  const { status, search } = options;
  const filter = {};

  if (status && TRACKABLE_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (search) {
    const pattern = { $regex: search, $options: "i" };
    filter.$or = [
      { orderNumber: pattern },
      { "shippingAddress.fullName": pattern },
      { "shippingAddress.email": pattern }
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  return orders.map(normalizeOrder);
}

export async function getOrderForAdmin(orderId) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new HttpError(400, "Invalid order ID");
  }

  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  return normalizeOrder(order);
}

export async function updateOrderStatusAsAdmin(orderId, nextStatus) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new HttpError(400, "Invalid order ID");
  }

  if (!TRACKABLE_STATUSES.includes(nextStatus)) {
    throw new HttpError(400, "Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new HttpError(404, "Order not found");
  }

  if (order.status === nextStatus) {
    return normalizeOrder(order);
  }

  if (order.payment.status !== "paid" && !["payment_pending", "cancelled"].includes(nextStatus)) {
    throw new HttpError(400, "Unpaid orders cannot move beyond pending or cancelled");
  }

  order.status = nextStatus;
  appendStatusHistory(order, nextStatus, `Order updated to ${nextStatus.replaceAll("_", " ")}`);
  await order.save();

  return normalizeOrder(order);
}

export async function processRazorpayWebhook({ event, payload }) {
  await connectToDatabase();

  const paymentEntity = payload?.payment?.entity;
  const orderEntity = payload?.order?.entity;
  const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;

  if (!razorpayOrderId) {
    return { ok: true, ignored: true, reason: "No Razorpay order ID in payload" };
  }

  const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });

  if (!order) {
    return { ok: true, ignored: true, reason: "No matching order found" };
  }

  if (event === "payment.captured" || event === "order.paid") {
    if (order.payment.status !== "paid") {
      order.payment.status = "paid";
      order.payment.razorpayPaymentId = paymentEntity?.id || order.payment.razorpayPaymentId;
      order.payment.paidAt = order.payment.paidAt || new Date();
      order.status = order.status === "payment_pending" ? "processing" : order.status;
      appendStatusHistory(order, order.status, "Payment confirmed by Razorpay webhook");
      await order.save();
    }

    return { ok: true, ignored: false };
  }

  if (event === "payment.failed") {
    order.payment.status = "failed";
    appendStatusHistory(order, order.status, "Payment failed on Razorpay");
    await order.save();
    return { ok: true, ignored: false };
  }

  return { ok: true, ignored: true, reason: `Unhandled event ${event}` };
}
