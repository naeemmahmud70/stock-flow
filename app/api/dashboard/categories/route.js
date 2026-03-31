import connectMongo from "@/database/connect-mongo";
import Category from "@/models/Category";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongo();
    const { name } = await req.json();
    console.log("name", name);
    const newCategory = await Category.create({
      name,
    });
    console.log("newCategory", newCategory);
    return Response.json(
      {
        message: "Category added!",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error in category creating:", error);

    return Response.json(
      {
        message: "Failed to create Category!",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    await connectMongo();

    const categories = await Category.find();

    return NextResponse.json({ status: 200, success: true, data: categories });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      success: false,
      message: error.message,
    });
  }
}
