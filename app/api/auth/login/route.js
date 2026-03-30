import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import connectMongo from "@/database/connect-mongo";
import User from "@/models/User";

export async function POST(req) {
  try {
    await connectMongo();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    // ✅ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    // ✅ Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password!" },
        { status: 401 },
      );
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // ✅ Create response
    const res = NextResponse.json({
      status: 200,
      message: "Login successful!",
      user: { id: user._id, name: user.name, email: user.email },
    });

    // ✅ Set httpOnly cookie
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // 🔑 must be root so middleware sees it
      maxAge: 24 * 60 * 60, // 1 day
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: error.message || "Login failed" },
      { status: 500 },
    );
  }
}
