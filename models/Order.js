import mongoose, { Schema } from "mongoose";

const orderItemSchema = new Schema(
  {
    productId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    line1: {
      type: String,
      required: true
    },
    line2: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one order item is required"
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0
      },
      tax: {
        type: Number,
        required: true,
        min: 0
      },
      shipping: {
        type: Number,
        required: true,
        min: 0
      },
      total: {
        type: Number,
        required: true,
        min: 0
      },
      currency: {
        type: String,
        required: true,
        default: "INR"
      }
    },
    status: {
      type: String,
      required: true,
      default: "payment_pending",
      enum: ["payment_pending", "processing", "packed", "shipped", "delivered", "cancelled"],
      index: true
    },
    payment: {
      provider: {
        type: String,
        required: true,
        default: "razorpay"
      },
      status: {
        type: String,
        required: true,
        default: "created",
        enum: ["created", "paid", "failed", "refunded"]
      },
      razorpayOrderId: {
        type: String,
        index: true
      },
      razorpayPaymentId: {
        type: String,
        default: ""
      },
      razorpaySignature: {
        type: String,
        default: ""
      },
      paidAt: {
        type: Date,
        default: null
      }
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
