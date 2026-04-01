import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  category: mongoose.Types.ObjectId;
  price: number;
  stock: number;
  minStockThreshold: number;
  status: "active" | "out_of_stock";
  sku?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    minStockThreshold: { type: Number, required: true, min: 0, default: 5 },
    status: {
      type: String,
      enum: ["active", "out_of_stock"],
      default: "active",
    },
    sku: { type: String, trim: true, sparse: true },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

ProductSchema.index({ name: "text", sku: "text" });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
