import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, getAuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  const payload = getAuthUser(req);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }
  await connectDB();
  const user = await User.findById(payload.userId).select("-password");
  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: user });
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookie(res);
  return res;
}
