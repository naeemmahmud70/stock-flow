import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { syncRestockOnCreate } from "@/lib/stock";
import Product from "@/models/Product";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(1).max(120),
  category: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  minStockThreshold: z.number().min(0).default(5),
  status: z.enum(["active", "out_of_stock"]).optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  await connectDB();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const query: Record<string, unknown> = {};
  if (search) query.$text = { $search: search };
  if (category) query.category = category;
  if (status) query.status = status;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);

  return NextResponse.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message },
      { status: 400 },
    );
  }

  await connectDB();

  const data = { ...parsed.data };
  if (data.stock === 0) data.status = "out_of_stock";

  const product = await Product.create(data);
  await product.populate("category", "name");

  // Add to restock queue if below threshold
  if (product.stock <= product.minStockThreshold) {
    const { syncRestockQueue } = await import("@/lib/stock");
    await syncRestockQueue(
      product._id.toString(),
      product.stock,
      product.minStockThreshold,
    );
  }

  await logActivity({
    action: `Product "${product.name}" added`,
    entity: "Product",
    entityId: product._id.toString(),
    userId: user.userId,
    userName: user.name,
    metadata: { stock: product.stock, price: product.price },
  });

  return NextResponse.json({ success: true, data: product }, { status: 201 });
}
