import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/console/onboarding", "/console/billing"];

/**
 * Security: Strip any X-Mock-* headers at the edge before they reach API routes.
 * These headers are used for development testing and must never be honored in production.
 */
function hasMockHeaders(request: NextRequest): boolean {
  const headers = request.headers;
  for (const key of headers.keys()) {
    if (key.toLowerCase().startsWith("x-mock-")) {
      return true;
    }
  }
  return false;
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const hostname = request.headers.get("host") || "";

  // S3: Reject requests carrying X-Mock-* headers globally
  if (hasMockHeaders(request)) {
    return new NextResponse(
      JSON.stringify({ success: false, error: "Mock headers are not allowed" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const response = NextResponse.next();

  // Subdomain resolution: extract subdomain from xxx.tradepass.io
  const isMainDomain = hostname === "tradepass.io" || hostname === "www.tradepass.io" || hostname === "localhost:3001" || hostname === "localhost:3000";
  if (!isMainDomain && hostname.includes("tradepass.io")) {
    const subdomain = hostname.split(".")[0];
    if (subdomain && subdomain !== "www") {
      response.cookies.set("tenant_subdomain", subdomain, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        sameSite: "lax",
      });
      response.headers.set("x-tenant-subdomain", subdomain);
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Protected routes require authentication
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  // Onboarding routing guard
  const onboardingCompleted = request.cookies.get("onboarding_completed")?.value === "true";

  if (token && pathname.startsWith("/console")) {
    // Not completed onboarding -> force to onboarding
    if (!onboardingCompleted && pathname !== "/console/onboarding") {
      return NextResponse.redirect(new URL("/console/onboarding", request.url));
    }
    // Completed onboarding -> redirect away from onboarding page
    if (onboardingCompleted && pathname === "/console/onboarding") {
      return NextResponse.redirect(new URL("/console", request.url));
    }
  }

  // Persist tenant param from URL into cookie for portal/backoffice internal nav
  const tenantId = searchParams.get("tenant");
  if (tenantId && (pathname.startsWith("/portal") || pathname.startsWith("/backoffice"))) {
    response.cookies.set("portal_tenant", tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return response;
  }

  return response;
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
