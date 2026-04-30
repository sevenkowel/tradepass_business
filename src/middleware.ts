/**
 * Middleware - Mock Demo 模式
 * 
 * 特点：
 * - 保留子域名识别（portal.demo.localhost:3002）
 * - 简化的权限验证
 * - 支持 Mock 模式快速切换用户
 */

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
    const p = hostname.split(".");
    if (p.length >= 3 && p.slice(1).join(".") === "tradepass.io") {
      if (p[0] === "portal") return { app: "portal", tenantSubdomain: "default", isPlatform: false };
      if (p[0] === "crm") return { app: "crm", tenantSubdomain: "default", isPlatform: false };
    }
  }

  return { app: "unknown", isPlatform: false };
}

// ============================================
// Simplified Route Config
// ============================================

interface AppRouteConfig {
  publicPaths: string[];
  redirectUnauthenticated: string | ((ctx: AppContext) => string);
}

const APP_ROUTES: Record<AppName, AppRouteConfig> = {
  website: {
    publicPaths: ["/", "/auth/login", "/auth/register", "/auth/verify-email", "/about", "/contact", "/pricing"],
    redirectUnauthenticated: "/auth/login",
  },

  console: {
    publicPaths: ["/auth/login", "/auth/register", "/auth/verify-email"],
    redirectUnauthenticated: "/auth/login",
  },

  backoffice: {
    publicPaths: ["/auth/login"],
    redirectUnauthenticated: "/auth/login",
  },

  "tenant-website": {
    publicPaths: ["/", "/auth/login", "/auth/portal/login", "/auth/portal/register", "/auth/crm/login", "/about", "/products"],
    redirectUnauthenticated: (ctx) => ctx.tenantSubdomain 
      ? `http://${ctx.tenantSubdomain}.localhost:3002/auth/login`
      : "/auth/login",
  },

  portal: {
    publicPaths: ["/auth/login"],
    redirectUnauthenticated: (ctx) => ctx.tenantSubdomain
      ? `http://${ctx.tenantSubdomain}.localhost:3002/auth/portal/login`
      : "/auth/login",
  },

  crm: {
    publicPaths: ["/auth/login"],
    redirectUnauthenticated: (ctx) => ctx.tenantSubdomain
      ? `http://${ctx.tenantSubdomain}.localhost:3002/auth/crm/login`
      : "/auth/login",
  },

  unknown: {
    publicPaths: ["/"],
    redirectUnauthenticated: "/",
  },
};

// ============================================
// Mock Mode Helpers
// ============================================

// 检查是否开启 Mock 模式（通过 query param 或 cookie）
function isMockMode(request: NextRequest): boolean {
  const url = request.nextUrl;
  // 通过 query param 开启: ?mock=true
  if (url.searchParams.get('mock') === 'true') {
    return true;
  }
  // 通过 cookie 开启
  if (request.cookies.get('mock_mode')?.value === 'true') {
    return true;
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

  // Recognize app from host
  const appContext = detectAppFromHost(hostname);
  const config = APP_ROUTES[appContext.app] || APP_ROUTES.unknown;
  
  const response = NextResponse.next();

  // Set context cookies for client-side use
  response.cookies.set("x-app-context", appContext.app, {
    path: "/",
    maxAge: 86400,
    sameSite: "lax",
  });
  
  if (appContext.tenantSubdomain) {
    response.cookies.set("x-tenant-subdomain", appContext.tenantSubdomain, {
      path: "/",
      maxAge: 604800,
      sameSite: "lax",
    });
  }

  // Set mock mode cookie if requested
  if (searchParams.get('mock') === 'true') {
    response.cookies.set('mock_mode', 'true', {
      path: '/',
      maxAge: 86400 * 30,
      sameSite: 'lax',
    });
  }

  // Check if path is public
  const isPublic = config.publicPaths.some((p) => 
    pathname === p || pathname.startsWith(p + "/")
  );

  // Allow public paths
  if (isPublic) {
    return response;
  }

  // Check authentication (simplified)
  if (!token) {
    const redirectTarget = typeof config.redirectUnauthenticated === 'function'
      ? config.redirectUnauthenticated(appContext)
      : config.redirectUnauthenticated;
    
    // Add current URL as redirect param
    const currentUrl = request.nextUrl.toString();
    const separator = redirectTarget.includes('?') ? '&' : '?';
    return NextResponse.redirect(new URL(`${redirectTarget}${separator}redirect=${encodeURIComponent(currentUrl)}`));
  }

  // In Mock Mode: skip complex validation, just allow access
  // Real validation happens in API routes or client-side
  if (isMockMode(request)) {
    return response;
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
