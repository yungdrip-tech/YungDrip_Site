import crypto from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import Session from "@/models/Session";
import User from "@/models/User";

const scryptAsync = promisify(crypto.scrypt);
const SESSION_COOKIE = "yungdrip_session";
const SESSION_DURATION_DAYS = 14;

function getConfiguredAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminUserRecord(raw) {
  return raw?.role === "admin" || getConfiguredAdminEmails().includes(String(raw?.email || "").toLowerCase());
}

function normalizeUser(document) {
  if (!document) {
    return null;
  }

  const raw = typeof document.toObject === "function" ? document.toObject() : document;

  return {
    _id: raw._id.toString(),
    name: raw.name,
    email: raw.email,
    phone: raw.phone || "",
    role: isAdminUserRecord(raw) ? "admin" : "user",
    isAdmin: isAdminUserRecord(raw),
    createdAt: raw.createdAt
  };
}

function digestToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function sanitizeEmail(email) {
  if (typeof email !== "string") {
    throw new HttpError(400, "Email is required");
  }

  const normalized = email.trim().toLowerCase();

  if (!normalized || !normalized.includes("@")) {
    throw new HttpError(400, "Enter a valid email address");
  }

  return normalized;
}

function sanitizeName(name) {
  if (typeof name !== "string") {
    throw new HttpError(400, "Name is required");
  }

  const normalized = name.trim();

  if (normalized.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters");
  }

  return normalized;
}

function sanitizePhone(phone) {
  if (phone === undefined || phone === null || phone === "") {
    return "";
  }

  if (typeof phone !== "string") {
    throw new HttpError(400, "Phone number must be a string");
  }

  const normalized = phone.trim();

  if (normalized.length < 8) {
    throw new HttpError(400, "Phone number must be at least 8 characters");
  }

  return normalized;
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters");
  }

  return password;
}

export async function hashPassword(password) {
  const validatedPassword = validatePassword(password);
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = await scryptAsync(validatedPassword, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, storedHash) {
  validatePassword(password);

  if (typeof storedHash !== "string" || !storedHash.startsWith("scrypt$")) {
    return false;
  }

  const [, salt, key] = storedHash.split("$");
  const derivedKey = await scryptAsync(password, salt, 64);
  const storedBuffer = Buffer.from(key, "hex");
  const computedBuffer = Buffer.from(derivedKey);

  if (storedBuffer.length !== computedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(storedBuffer, computedBuffer);
}

function setSessionCookie(token, expiresAt) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}

export async function registerUser({ name, email, password, phone }) {
  await connectToDatabase();

  const normalizedEmail = sanitizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail }).lean();

  if (existingUser) {
    throw new HttpError(409, "An account already exists with this email");
  }

  const createdUser = await User.create({
    name: sanitizeName(name),
    email: normalizedEmail,
    phone: sanitizePhone(phone),
    role: "user",
    passwordHash: await hashPassword(password)
  });

  return normalizeUser(createdUser);
}

export async function authenticateUser({ email, password }) {
  await connectToDatabase();

  const normalizedEmail = sanitizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);

  if (!isValidPassword) {
    throw new HttpError(401, "Invalid email or password");
  }

  return normalizeUser(user);
}

export async function createSession(userId) {
  await connectToDatabase();

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  await Session.create({
    user: userId,
    tokenHash: digestToken(token),
    expiresAt
  });

  setSessionCookie(token, expiresAt);
}

export async function destroySession() {
  await connectToDatabase();

  const token = cookies().get(SESSION_COOKIE)?.value;

  if (token) {
    await Session.deleteOne({ tokenHash: digestToken(token) });
  }

  clearSessionCookie();
}

export async function getCurrentUser() {
  await connectToDatabase();

  const token = cookies().get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await Session.findOne({
    tokenHash: digestToken(token),
    expiresAt: { $gt: new Date() }
  })
    .populate("user")
    .lean();

  if (!session?.user) {
    clearSessionCookie();
    return null;
  }

  return normalizeUser(session.user);
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new HttpError(401, "Please sign in to continue");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (!user.isAdmin) {
    throw new HttpError(403, "Admin access required");
  }

  return user;
}
