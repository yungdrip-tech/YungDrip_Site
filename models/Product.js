import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one image is required"
      }
    },
    sizes: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one size is required"
      }
    },
    colors: {
      type: [String],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one color is required"
      }
    },
    tags: {
      bodyType: {
        type: [String],
        default: []
      },
      skinTone: {
        type: [String],
        default: []
      },
      style: {
        type: [String],
        default: []
      }
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ name: "text" });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
