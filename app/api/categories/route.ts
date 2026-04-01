import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { logActivity } from "@/lib/logger";
import Category from "@/models/Category";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1).max(80),
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
  const categories = await Category.find().sort({ name: 1 });
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user)
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message },
      { status: 400 },
    );
  }

  await connectDB();
  const existing = await Category.findOne({
    name: new RegExp(`^${parsed.data.name}$`, "i"),
  });
  if (existing) {
    return NextResponse.json(
      { success: false, error: "Category already exists" },
      { status: 409 },
    );
  }

  const category = await Category.create(parsed.data);
  await logActivity({
    action: `Category "${category.name}" created`,
    entity: "Category",
    entityId: category._id.toString(),
    userId: user.userId,
    userName: user.name,
  });

  return NextResponse.json({ success: true, data: category }, { status: 201 });
}
