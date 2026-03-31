import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { syncRestockQueue } from "@/lib/stock";
import RestockQueue from "@/models/RestockQueue";
import Product from "@/models/Product";

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const items = await RestockQueue.find()
    .populate("product", "name stock minStockThreshold status category price")
    .sort({ priority: 1, currentStock: 1 });

  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { productId, addStock } = await req.json();

  if (!productId || typeof addStock !== "number" || addStock < 1) {
    return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: addStock } },
    { new: true }
  );

  if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

  if (product.stock > 0 && product.status === "out_of_stock") {
    await Product.findByIdAndUpdate(productId, { status: "active" });
  }

  await syncRestockQueue(product._id.toString(), product.stock, product.minStockThreshold);

  await logActivity({
    action: `Stock updated for "${product.name}" (+${addStock} units)`,
    entity: "Product",
    entityId: product._id.toString(),
    userId: user.userId,
    userName: user.name,
    metadata: { addedStock: addStock, newStock: product.stock },
  });

  return NextResponse.json({ success: true, data: product });
}
