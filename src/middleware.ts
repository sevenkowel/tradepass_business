/**
 * Middleware - 纯路径路由模式（Mock Demo）
 * 
 * 特点：
 * - 无子域名，所有路由都在 localhost:3002 下
 * - 根据路径前缀判断需要什么权限
 * - Mock 模式下 token 存在即可访问
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ============================================
// Route Config - 按路径前缀匹配
// ============================================

interface RouteConfig {
  publicPaths: string[];
  /** 未认证时跳转到此路径 */
  redirectTo: string;
}

const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // 平台官网 - 公开
  public: {
    publicPaths: [
      "/", "/auth/login", "/auth/register", "/auth/verify-email",
      "/auth/portal/login", "/auth/portal/register", "/auth/crm/login",
      "/about", "/contact", "/pricing", "/broker",
    ],
    redirectTo: "/auth/login",
  },

  // Console - 需要 token
  console: {
    publicPaths: ["/auth/login", "/auth/register"],
    redirectTo: "/auth/login",
  },

  // Backoffice - 需要 token
  backoffice: {
    publicPaths: [],
    redirectTo: "/auth/login",
  },

  // Portal - 需要 token
  portal: {
    publicPaths: [],
    redirectTo: "/auth/portal/login",
  },

  // CRM - 需要 token
  crm: {
    publicPaths: [],
    redirectTo: "/auth/crm/login",
  },
};

// 根据路径前缀匹配配置
function matchRoute(pathname: string): { key: string; config: RouteConfig } | null {
  if (pathname.startsWith("/console")) return { key: "console", config: ROUTE_CONFIG.console };
  if (pathname.startsWith("/backoffice")) return { key: "backoffice", config: ROUTE_CONFIG.backoffice };
  if (pathname.startsWith("/portal")) return { key: "portal", config: ROUTE_CONFIG.portal };
  if (pathname.startsWith("/crm")) return { key: "crm", config: ROUTE_CONFIG.crm };
  // /broker 和 /auth/* 归为 public
  return { key: "public", config: ROUTE_CONFIG.public };
}

// ============================================
// Main Middleware
// ============================================

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // 设置 mock 模式 cookie
  const response = NextResponse.next();
  if (searchParams.get("mock") === "true") {
    response.cookies.set("mock_mode", "true", {
      path: "/",
      maxAge: 86400 * 30,
      sameSite: "lax",
    });
  }

  // 匹配路径前缀
  const matched = matchRoute(pathname);
  if (!matched) return response;

  const { config } = matched;

  // 检查是否为公开路径
  const isPublic = config.publicPaths.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
  );

  if (isPublic) return response;

  // 需要认证 - 检查 token
  if (!token) {
    const redirectUrl = new URL(config.redirectTo, request.url);
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
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
