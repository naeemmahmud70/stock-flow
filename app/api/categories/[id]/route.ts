import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import Category from "@/models/Category";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
  if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await logActivity({
    action: `Category "${category.name}" updated`,
    entity: "Category",
    entityId: category._id.toString(),
    userId: user.userId,
    userName: user.name,
  });

  return NextResponse.json({ success: true, data: category });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const category = await Category.findByIdAndDelete(params.id);
  if (!category) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await logActivity({
    action: `Category "${category.name}" deleted`,
    entity: "Category",
    entityId: params.id,
    userId: user.userId,
    userName: user.name,
  });

  return NextResponse.json({ success: true, message: "Category deleted" });
}
