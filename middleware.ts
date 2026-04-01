import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

const PUBLIC_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/api/auth/login",
  "/api/auth/signup",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isDashboard = pathname.startsWith("/dashboard") || pathname === "/";
  const isApi = pathname.startsWith("/api/");

  // Token from cookie or Authorization header
  const token =
    req.cookies.get("sf_token")?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }
    if (isDashboard) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  const { payload } = await jwtVerify<{
    userId: string;
    name: string;
    role: string;
  }>(token, secret);

  if (!payload) {
    if (isApi) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 },
      );
    }
    const res = NextResponse.redirect(new URL("/auth/login", req.url));
    res.cookies.set("sf_token", "", { maxAge: 0, path: "/" });
    return res;
  }

  // Forward user info to route handlers via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", payload.userId);
  requestHeaders.set("x-user-name", payload.name);
  requestHeaders.set("x-user-role", payload.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
