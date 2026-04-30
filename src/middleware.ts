import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// Domain Recognition
// ============================================

type AppName = "website" | "console" | "backoffice" | "portal" | "crm" | "tenant-website" | "unknown";

interface AppContext {
  app: AppName;
  tenantSubdomain?: string;
  isPlatform: boolean;
}

function detectAppFromHost(host: string): AppContext {
  const hostname = host.split(":")[0];

  // Platform ends (plain hostname match)
  if (hostname === "localhost" || hostname === "127.0.0.1") return { app: "website", isPlatform: true };
  if (hostname === "console.localhost") return { app: "console", isPlatform: true };
  if (hostname === "backoffice.localhost") return { app: "backoffice", isPlatform: true };

  // Three-level subdomain: xxx.yyy.localhost
  const parts = hostname.split(".");
  if (parts.length >= 3 && parts[parts.length - 1] === "localhost") {
    const [sub, tenantDomain] = parts;
    if (sub === "portal") return { app: "portal", tenantSubdomain: tenantDomain, isPlatform: false };
    if (sub === "crm") return { app: "crm", tenantSubdomain: tenantDomain, isPlatform: false };
    if (sub === "console") return { app: "console", isPlatform: true };
    if (sub === "backoffice") return { app: "backoffice", isPlatform: true };
  }

  // Two-level subdomain: tenant.localhost
  if (parts.length === 2 && parts[1] === "localhost") {
    return { app: "tenant-website", tenantSubdomain: parts[0], isPlatform: false };
  }

  // Production domain (tradepass.io)
  if (hostname.includes("tradepass.io")) {
    if (hostname === "tradepass.io" || hostname === "www.tradepass.io") return { app: "website", isPlatform: true };
    if (hostname === "console.tradepass.io") return { app: "console", isPlatform: true };
    if (hostname === "backoffice.tradepass.io") return { app: "backoffice", isPlatform: true };
    // portal.*.tradepass.io or crm.*.tradepass.io
    const p = hostname.split(".");
    if (p.length >= 3 && p.slice(1).join(".") === "tradepass.io") {
      if (p[0] === "portal") return { app: "portal", tenantSubdomain: "default", isPlatform: false };
      if (p[0] === "crm") return { app: "crm", tenantSubdomain: "default", isPlatform: false };
    }
  }

  return { app: "unknown", isPlatform: false };
}

// ============================================
// Permission Matrix (data-driven)
// ============================================

/**
 * Each app defines:
 * - authRequired: whether a token is needed for non-public paths
 * - publicPaths: paths allowed without a token
 * - redirectUnauthenticated: where to send unauthenticated users
 * - extraGuard: optional additional guard function (receives request + context, returns redirect URL or null)
 */
interface AppRouteConfig {
  authRequired: boolean;
  publicPaths: string[];
  redirectUnauthenticated: (ctx: AppContext, pathname: string, searchParams: URLSearchParams) => string;
  extraGuard?: (request: NextRequest, ctx: AppContext, pathname: string) => string | null;
}

const APP_ROUTES: Record<AppName, AppRouteConfig> = {
  // ============================================
  // TradePass Platform Website (localhost:3002)
  // ============================================
  website: {
    authRequired: true,
    publicPaths: ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/console/onboarding", "/console/billing"],
    redirectUnauthenticated: () => "/auth/login",
  },

  // ============================================
  // Console (console.localhost:3002)
  // ============================================
  console: {
    authRequired: true,
    publicPaths: ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/console/onboarding", "/console/billing"],
    redirectUnauthenticated: () => "/auth/login",
    extraGuard: (req, _ctx, pathname) => {
      const token = req.cookies.get("token")?.value;
      if (!token) return null;
      const onboardingCompleted = req.cookies.get("onboarding_completed")?.value === "true";
      if (!onboardingCompleted && pathname.startsWith("/console") && pathname !== "/console/onboarding") {
        return "/console/onboarding";
      }
      if (onboardingCompleted && pathname === "/console/onboarding") {
        return "/console";
      }
      return null;
    },
  },

  // ============================================
  // Backoffice (backoffice.localhost:3002)
  // ============================================
  backoffice: {
    authRequired: true,
    publicPaths: [],
    redirectUnauthenticated: () => "/auth/login",
  },

  // ============================================
  // Tenant Website / Broker ({tenant}.localhost:3002)
  // ============================================
  "tenant-website": {
    authRequired: true,
    publicPaths: ["/", "/auth/login", "/auth/portal/login", "/auth/crm/login", "/auth/portal/register", "/auth/register", "/auth/verify-email"],
    redirectUnauthenticated: () => "/auth/login",
  },

  // ============================================
  // Tenant Portal (portal.{tenant}.localhost:3002)
  // 未登录 → 重定向到租户官网的 portal 登录页（带注册入口）
  // ============================================
  portal: {
    authRequired: true,
    publicPaths: [],
    redirectUnauthenticated: (ctx) =>
      `http://${ctx.tenantSubdomain}.localhost:3002/auth/portal/login`,
  },

  // ============================================
  // Tenant CRM (crm.{tenant}.localhost:3002)
  // 未登录 → 重定向到 CRM 专用登录页（无注册入口，仅管理员登录）
  // ============================================
  crm: {
    authRequired: true,
    publicPaths: [],
    redirectUnauthenticated: (ctx, pathname, searchParams) => {
      const originalUrl = `http://crm.${ctx.tenantSubdomain}.localhost:3002${pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;
      return `http://${ctx.tenantSubdomain}.localhost:3002/auth/crm/login?redirect=${encodeURIComponent(originalUrl)}`;
    },
  },

  // ============================================
  // Unknown — block
  // ============================================
  unknown: {
    authRequired: false,
    publicPaths: [],
    redirectUnauthenticated: () => "/",
  },
};

// ============================================
// Main Middleware
// ============================================

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const hostname = request.headers.get("host") || "";

  // Global: reject X-Mock-* headers
  for (const key of request.headers.keys()) {
    if (key.toLowerCase().startsWith("x-mock-")) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Mock headers are not allowed" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Recognize app from host
  const appContext = detectAppFromHost(hostname);
  const config = APP_ROUTES[appContext.app] || APP_ROUTES.unknown;
  const response = NextResponse.next();

  // Set context cookies
  response.cookies.set("x-app-context", appContext.app, {
    path: "/", maxAge: 86400, sameSite: "lax",
  });
  if (appContext.tenantSubdomain) {
    response.cookies.set("x-tenant-subdomain", appContext.tenantSubdomain, {
      path: "/", maxAge: 604800, sameSite: "lax",
    });
    response.headers.set("x-tenant-subdomain", appContext.tenantSubdomain);
  }

  // Check if path is public for this app
  const isPublic = config.publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // If unauthenticated and path is not public → redirect
  if (!token && config.authRequired && !isPublic) {
    const dest = config.redirectUnauthenticated(appContext, pathname, searchParams);
    return NextResponse.redirect(new URL(dest));
  }

  // Extra guard (e.g. onboarding check for console)
  if (token && config.extraGuard) {
    const redirectTo = config.extraGuard(request, appContext, pathname);
    if (redirectTo) {
      return NextResponse.redirect(new URL(redirectTo));
    }
  }

  return response;
}

// ============================================
// Matcher
// ============================================

export const config = {
  matcher: [
    "/console/:path*",
    "/backoffice/:path*",
    "/crm/:path*",
    "/portal/:path*",
    "/broker/:path*",
    "/auth/:path*",
    "/",
  ],
};
