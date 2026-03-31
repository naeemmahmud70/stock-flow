import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { signToken, setAuthCookie } from "@/lib/auth";
import User from "@/models/User";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager"]).optional().default("manager"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 },
      );
    }

    await connectDB();
    const existing = await User.findOne({ email: parsed.data.email });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 409 },
      );
    }

    const user = await User.create(parsed.data);
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const res = NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      { status: 201 },
    );

    setAuthCookie(res, token);
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
