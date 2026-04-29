import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// Phase 1: Domain Recognition System
// ============================================

interface AppContext {
  app: "website" | "console" | "backoffice" | "portal" | "crm" | "tenant-website" | "unknown";
  tenantSubdomain?: string;
  isPlatform: boolean;
}

/**
 * 根据 Host 头识别当前访问的端和租户
 * 支持格式:
 * - localhost:3002 → TradePass Website (平台官网)
 * - console.localhost:3002 → Console (租户控制台)
 * - backoffice.localhost:3002 → Backoffice (平台运营后台)
 * - dupoin.localhost:3002 → Tenant Website (租户官网, 原 Broker)
 * - portal.dupoin.localhost:3002 → Tenant Portal
 * - crm.dupoin.localhost:3002 → Tenant CRM
 */
function detectAppFromHost(host: string): AppContext {
  // 移除端口号
  const hostname = host.split(":")[0];

  // 平台端识别
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return { app: "website", isPlatform: true };
  }
  if (hostname === "console.localhost") {
    return { app: "console", isPlatform: true };
  }
  if (hostname === "backoffice.localhost") {
    return { app: "backoffice", isPlatform: true };
  }

  // 三级子域名识别: xxx.yyy.localhost
  const parts = hostname.split(".");

  if (parts.length >= 3 && parts[parts.length - 1] === "localhost") {
    const [sub, tenantDomain, ...rest] = parts;

    // portal.tenant.localhost → Portal
    if (sub === "portal") {
      return { app: "portal", tenantSubdomain: tenantDomain, isPlatform: false };
    }

    // crm.tenant.localhost → CRM
    if (sub === "crm") {
      return { app: "crm", tenantSubdomain: tenantDomain, isPlatform: false };
    }

    // console.tenant.localhost → Console (备用)
    if (sub === "console") {
      return { app: "console", isPlatform: true };
    }

    // backoffice.tenant.localhost → Backoffice (备用)
    if (sub === "backoffice") {
      return { app: "backoffice", isPlatform: true };
    }
  }

  // 二级子域名识别: tenant.localhost
  if (parts.length === 2 && parts[1] === "localhost") {
    return { app: "tenant-website", tenantSubdomain: parts[0], isPlatform: false };
  }

  // 生产环境域名处理
  if (hostname.includes("tradepass.io")) {
    if (hostname === "tradepass.io" || hostname === "www.tradepass.io") {
      return { app: "website", isPlatform: true };
    }
    if (hostname === "console.tradepass.io") {
      return { app: "console", isPlatform: true };
    }
    if (hostname === "backoffice.tradepass.io") {
      return { app: "backoffice", isPlatform: true };
    }

    const parts = hostname.split(".");
    if (parts.length >= 3) {
      const [sub, ...rest] = parts;
      const domain = rest.join(".");
      if (domain === "tradepass.io") {
        if (sub === "portal") {
          return { app: "portal", tenantSubdomain: "default", isPlatform: false };
        }
        if (sub === "crm") {
          return { app: "crm", tenantSubdomain: "default", isPlatform: false };
        }
      }
    }
  }

  return { app: "unknown", isPlatform: false };
}

// ============================================
// Security Headers
// ============================================

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-email",
  "/console/onboarding",
  "/console/billing",
];

function hasMockHeaders(request: NextRequest): boolean {
  const headers = request.headers;
  for (const key of headers.keys()) {
    if (key.toLowerCase().startsWith("x-mock-")) {
      return true;
    }
  }
  return false;
}

// ============================================
// Main Middleware
// ============================================

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

  // Phase 1: Detect app context from host
  const appContext = detectAppFromHost(hostname);
  const response = NextResponse.next();

  // Set app context cookies/headers
  response.cookies.set("x-app-context", appContext.app, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  if (appContext.tenantSubdomain) {
    response.cookies.set("x-tenant-subdomain", appContext.tenantSubdomain, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    response.headers.set("x-tenant-subdomain", appContext.tenantSubdomain);
  }

  // Phase 2-5: Route-specific logic based on app context

  // ============================================
  // Tenant Website (dupoin.localhost:3002)
  // Routes: / → serves broker content
  // ============================================
  if (appContext.app === "tenant-website") {
    // Tenant website public paths
    const tenantPublicPaths = ["/", "/auth/login", "/auth/register", "/auth/verify-email"];
    const isTenantPublic = tenantPublicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

    if (!isTenantPublic && !token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Redirect authenticated users away from auth pages to portal
    if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
      const portalUrl = `http://portal.${appContext.tenantSubdomain}.localhost:3002`;
      return NextResponse.redirect(new URL(portalUrl));
    }

    return response;
  }

  // ============================================
  // Portal (portal.dupoin.localhost:3002)
  // Routes: / → serves portal content
  // ============================================
  if (appContext.app === "portal") {
    if (!token) {
      // Redirect to tenant website login
      const loginUrl = `http://${appContext.tenantSubdomain}.localhost:3002/auth/login`;
      return NextResponse.redirect(new URL(loginUrl));
    }
    return response;
  }

  // ============================================
  // CRM (crm.dupoin.localhost:3002)
  // Routes: /crm → serves crm content
  // ============================================
  if (appContext.app === "crm") {
    if (!token) {
      const loginUrl = `http://${appContext.tenantSubdomain}.localhost:3002/auth/login`;
      return NextResponse.redirect(new URL(loginUrl));
    }
    return response;
  }

  // ============================================
  // Console (console.localhost:3002)
  // Routes: /console/*
  // ============================================
  if (appContext.app === "console") {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isPublic && !token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Onboarding guard
    const onboardingCompleted = request.cookies.get("onboarding_completed")?.value === "true";
    if (token && pathname.startsWith("/console")) {
      if (!onboardingCompleted && pathname !== "/console/onboarding") {
        return NextResponse.redirect(new URL("/console/onboarding", request.url));
      }
      if (onboardingCompleted && pathname === "/console/onboarding") {
        return NextResponse.redirect(new URL("/console", request.url));
      }
    }

    return response;
  }

  // ============================================
  // Backoffice (backoffice.localhost:3002)
  // Routes: /backoffice/*
  // ============================================
  if (appContext.app === "backoffice") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  // ============================================
  // Platform Website (localhost:3002)
  // Routes: /*
  // ============================================
  if (appContext.app === "website") {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

    if (!isPublic && !token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Legacy: Redirect old routes to new subdomains
    if (pathname.startsWith("/broker")) {
      // Phase 2 TODO: Redirect to tenant subdomain
      // For now, continue serving
    }

    return response;
  }

  // ============================================
  // Legacy Route Handling (Phase 6)
  // ============================================

  // Persist tenant param from URL into cookie for portal/crm internal nav
  const tenantId = searchParams.get("tenant");
  if (tenantId && (pathname.startsWith("/portal") || pathname.startsWith("/crm"))) {
    response.cookies.set("portal_tenant", tenantId, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    return response;
  }

  // Subdomain resolution for production (legacy support)
  const isMainDomain =
    hostname === "tradepass.io" ||
    hostname === "www.tradepass.io" ||
    hostname === "localhost:3001" ||
    hostname === "localhost:3000";

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

  // Default: Check public paths and token
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if ((pathname === "/auth/login" || pathname === "/auth/register") && token) {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  return response;
}

// ============================================
// Matcher Configuration
// ============================================

export const config = {
  matcher: [
    // Platform routes
    "/console/:path*",
    "/backoffice/:path*",
    "/crm/:path*",
    "/portal/:path*",
    "/broker/:path*",
    "/auth/:path*",
    "/",
  ],
};
