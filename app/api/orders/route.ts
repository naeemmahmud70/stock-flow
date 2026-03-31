import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { checkStock, deductStock } from "@/lib/stock";
import { detectDuplicateProducts } from "@/lib/conflict";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { z } from "zod";

const orderItemSchema = z.object({
  product: z.string().min(1),
  quantity: z.number().min(1),
});

const orderSchema = z.object({
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email().optional(),
  items: z.array(orderItemSchema).min(1),
  notes: z.string().optional(),
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
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (search) query.$text = { $search: search };
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom)
      (query.createdAt as Record<string, unknown>).$gte = new Date(dateFrom);
    if (dateTo)
      (query.createdAt as Record<string, unknown>).$lte = new Date(dateTo);
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("items.product", "name price status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  return NextResponse.json({
    success: true,
    data: orders,
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
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message },
      { status: 400 },
    );
  }

  // Conflict: duplicate products
  const dupCheck = detectDuplicateProducts(parsed.data.items);
  if (!dupCheck.ok) {
    return NextResponse.json(
      { success: false, error: dupCheck.message },
      { status: 400 },
    );
  }

  await connectDB();

  // Validate all products exist, are active, and have stock
  const orderItems = [];
  let totalPrice = 0;

  for (const item of parsed.data.items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product not found: ${item.product}` },
        { status: 404 },
      );
    }
    if (product.status !== "active") {
      return NextResponse.json(
        {
          success: false,
          error: `"${product.name}" is currently unavailable.`,
        },
        { status: 400 },
      );
    }

    const stockCheck = await checkStock(item.product, item.quantity);
    if (!stockCheck.ok) {
      return NextResponse.json(
        { success: false, error: stockCheck.message },
        { status: 400 },
      );
    }

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      price: product.price,
    });
    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    customerName: parsed.data.customerName,
    customerEmail: parsed.data.customerEmail,
    items: orderItems,
    totalPrice,
    notes: parsed.data.notes,
    status: "pending",
  });

  // Deduct stock for all items
  for (const item of parsed.data.items) {
    await deductStock(item.product, item.quantity);
  }

  await logActivity({
    action: `Order ${order.orderNumber} created`,
    entity: "Order",
    entityId: order._id.toString(),
    userId: user.userId,
    userName: user.name,
    metadata: {
      customerName: order.customerName,
      totalPrice,
      items: orderItems.length,
    },
  });

  return NextResponse.json({ success: true, data: order }, { status: 201 });
}
