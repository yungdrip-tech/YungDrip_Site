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
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: {
      type: String,
      trim: true,
      index: true,
      sparse: true
    },
    season: {
      type: String,
      enum: ["Winter", "Summer"],
      index: true
    },
    details: {
      fit: { type: String, trim: true },
      length: { type: String, trim: true },
      sleeveLength: { type: String, trim: true },
      neckline: { type: String, trim: true },
      material: { type: String, trim: true },
      materialComposition: { type: String, trim: true },
      wash: { type: String, trim: true },
      concept: { type: String, trim: true },
      style: { type: String, trim: true },
      sizeChartKey: { type: String, trim: true }
    },
    sizeChart: {
      type: [Schema.Types.Mixed],
      default: undefined
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
