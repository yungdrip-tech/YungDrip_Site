import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { HttpError } from "@/lib/http-error";
import User from "@/models/User";

function normalizeUser(document) {
  if (!document) return null;

  const raw = typeof document.toObject === "function" ? document.toObject() : document;

  return {
    _id: raw._id.toString(),
    name: raw.name,
    email: raw.email,
    phone: raw.phone || "",
    role: raw.role || "user",
    createdAt: raw.createdAt
  };
}

export async function getAllUsersForAdmin() {
  await connectToDatabase();
  const users = await User.find({}).sort({ createdAt: -1 }).lean();
  return users.map(normalizeUser);
}

export async function updateUserRoleAsAdmin(userId, role) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new HttpError(400, "Invalid user ID");
  }

  if (!["user", "admin"].includes(role)) {
    throw new HttpError(400, "Role must be 'user' or 'admin'");
  }

  const user = await User.findByIdAndUpdate(userId, { role }, { new: true, runValidators: true }).lean();

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  return normalizeUser(user);
}
