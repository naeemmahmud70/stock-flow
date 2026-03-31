import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRestockItem extends Document {
  product: mongoose.Types.ObjectId;
  currentStock: number;
  threshold: number;
  priority: "high" | "medium" | "low";
  addedAt: Date;
}

const RestockSchema = new Schema<IRestockItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true },
    currentStock: { type: Number, required: true, min: 0 },
    threshold: { type: Number, required: true, min: 0 },
    priority: { type: String, enum: ["high", "medium", "low"], default: "medium" },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

RestockSchema.index({ priority: 1, currentStock: 1 });

const RestockQueue: Model<IRestockItem> =
  mongoose.models.RestockQueue ||
  mongoose.model<IRestockItem>("RestockQueue", RestockSchema);

export default RestockQueue;
