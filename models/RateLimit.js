import mongoose, { Schema } from "mongoose";

const rateLimitSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    identifier: {
      type: String,
      required: true,
      index: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    },
    windowStart: {
      type: Date,
      required: true
    },
    blockedUntil: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

rateLimitSchema.index({ action: 1, identifier: 1 }, { unique: true });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);

export default RateLimit;
