import mongoose, { Schema } from "mongoose";

const productImageSchema = new Schema(
  {
    filename: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    contentType: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: Buffer,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ProductImage =
  mongoose.models.ProductImage || mongoose.model("ProductImage", productImageSchema);

export default ProductImage;
