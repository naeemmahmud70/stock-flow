import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { syncRestockQueue } from "@/lib/stock";
import Product from "@/models/Product";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  await connectDB();
  const product = await Product.findById(params.id).populate(
    "category",
    "name",
  );
  if (!product)
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 },
    );

  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  await connectDB();
  const body = await req.json();

  if (body.stock !== undefined) {
    if (body.stock === 0) body.status = "out_of_stock";
    else if (body.status !== "out_of_stock") body.status = "active";
  }

  const product = await Product.findByIdAndUpdate(params.id, body, {
    new: true,
  }).populate("category", "name");
  if (!product)
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 },
    );

  await syncRestockQueue(
    product._id.toString(),
    product.stock,
    product.minStockThreshold,
  );

  await logActivity({
    action: `Product "${product.name}" updated`,
    entity: "Product",
    entityId: product._id.toString(),
    userId: user.userId,
    userName: user.name,
    metadata: { stock: product.stock },
  });

  return NextResponse.json({ success: true, data: product });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  await connectDB();
  const product = await Product.findByIdAndDelete(params.id);
  if (!product)
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 },
    );

  await logActivity({
    action: `Product "${product.name}" deleted`,
    entity: "Product",
    entityId: params.id,
    userId: user.userId,
    userName: user.name,
  });

  return NextResponse.json({ success: true, message: "Product deleted" });
}
