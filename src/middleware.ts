import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/verify-email"];

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
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

  // Persist tenant param from URL into cookie for portal/backoffice internal nav
  const tenantId = searchParams.get("tenant");
  if (tenantId && (pathname.startsWith("/portal") || pathname.startsWith("/backoffice"))) {
    const response = NextResponse.next();
    response.cookies.set("portal_tenant", tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/console/:path*",
    "/admin/:path*",
    "/backoffice/:path*",
    "/portal/:path*",
    "/auth/login",
    "/auth/register",
  ],
};
