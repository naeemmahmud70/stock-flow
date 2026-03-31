import Product from "@/models/Product";
import RestockQueue from "@/models/RestockQueue";
import { connectDB } from "./db";

export interface StockCheckResult {
  ok: boolean;
  message?: string;
  availableStock?: number;
}

export async function checkStock(
  productId: string,
  requestedQty: number
): Promise<StockCheckResult> {
  await connectDB();
  const product = await Product.findById(productId);
  if (!product) return { ok: false, message: "Product not found" };
  if (product.status === "out_of_stock" || product.stock === 0)
    return { ok: false, message: `"${product.name}" is out of stock`, availableStock: 0 };
  if (product.stock < requestedQty)
    return {
      ok: false,
      message: `Only ${product.stock} item(s) available for "${product.name}"`,
      availableStock: product.stock,
    };
  return { ok: true };
}

export async function deductStock(productId: string, qty: number): Promise<void> {
  await connectDB();
  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: -qty } },
    { new: true }
  );
  if (!product) return;
  const newStock = Math.max(0, product.stock);
  const updates: Record<string, unknown> = { stock: newStock };
  if (newStock === 0) updates.status = "out_of_stock";
  await Product.findByIdAndUpdate(productId, updates);
  await syncRestockQueue(product._id.toString(), newStock, product.minStockThreshold);
}

export async function restoreStock(productId: string, qty: number): Promise<void> {
  await connectDB();
  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: qty } },
    { new: true }
  );
  if (!product) return;
  if (product.stock > 0 && product.status === "out_of_stock") {
    await Product.findByIdAndUpdate(productId, { status: "active" });
  }
  await syncRestockQueue(product._id.toString(), product.stock, product.minStockThreshold);
}

export async function syncRestockQueue(
  productId: string,
  stock: number,
  threshold: number
): Promise<void> {
  if (stock <= threshold) {
    const priority: "high" | "medium" | "low" =
      stock === 0 ? "high" : stock <= Math.ceil(threshold / 2) ? "high" : "medium";
    await RestockQueue.findOneAndUpdate(
      { product: productId },
      { product: productId, currentStock: stock, threshold, priority },
      { upsert: true, new: true }
    );
  } else {
    await RestockQueue.deleteOne({ product: productId });
  }
}

export const syncRestockOnCreate = syncRestockQueue;
