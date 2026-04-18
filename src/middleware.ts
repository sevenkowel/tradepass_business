import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/verify-email"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Protected routes require authentication
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/console/:path*",
    "/admin/:path*",
    "/backoffice/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
