import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      index: true
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
