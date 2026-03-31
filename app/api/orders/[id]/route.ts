import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import { restoreStock } from "@/lib/stock";
import Order from "@/models/Order";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const order = await Order.findById(params.id).populate("items.product", "name price status");
  if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

  return NextResponse.json({ success: true, data: order });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const { status, notes } = body;

  const validTransitions: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  };

  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

  if (status && !validTransitions[order.status]?.includes(status)) {
    return NextResponse.json(
      { success: false, error: `Cannot transition from "${order.status}" to "${status}"` },
      { status: 400 }
    );
  }

  // If cancelling, restore stock
  if (status === "cancelled" && order.status !== "cancelled") {
    for (const item of order.items) {
      await restoreStock(item.product.toString(), item.quantity);
    }
  }

  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (notes !== undefined) updates.notes = notes;

  const updated = await Order.findByIdAndUpdate(params.id, updates, { new: true }).populate(
    "items.product",
    "name price"
  );

  await logActivity({
    action: `Order ${order.orderNumber} marked as ${status || "updated"}`,
    entity: "Order",
    entityId: order._id.toString(),
    userId: user.userId,
    userName: user.name,
    metadata: { previousStatus: order.status, newStatus: status },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const order = await Order.findById(params.id);
  if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

  if (!["delivered", "cancelled"].includes(order.status)) {
    return NextResponse.json(
      { success: false, error: "Only delivered or cancelled orders can be deleted" },
      { status: 400 }
    );
  }

  await Order.findByIdAndDelete(params.id);
  await logActivity({
    action: `Order ${order.orderNumber} deleted`,
    entity: "Order",
    entityId: params.id,
    userId: user.userId,
    userName: user.name,
  });

  return NextResponse.json({ success: true, message: "Order deleted" });
}
