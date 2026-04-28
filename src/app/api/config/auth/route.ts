import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseAuthConfig, defaultAuthConfig, type AuthConfig } from "@/lib/auth-config";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/config/auth
 * 获取当前租户的认证表单配置
 * 公开接口：Portal 注册/登录页挂载时调用
 *
 * Query params:
 *   - tenantId: string (可选) 指定租户ID，未提供时返回默认配置
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    let config: AuthConfig = defaultAuthConfig;

    if (tenantId) {
      const tenantConfig = await prisma.tenantConfig.findUnique({
        where: { tenantId },
        select: { auth: true },
      });
      config = parseAuthConfig(tenantConfig?.auth);
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching auth config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch auth config" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/auth
 * 更新当前租户的认证配置（Backoffice 使用）
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<AuthConfig> & { tenantId: string };
    const { tenantId, ...configUpdate } = body;

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    // 验证用户是否为租户所有者或管理员
    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, ownerId: user.id },
    });
    if (!tenant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const existing = await prisma.tenantConfig.findUnique({
      where: { tenantId },
    });

    const currentConfig = parseAuthConfig(existing?.auth);
    const mergedConfig: AuthConfig = { ...currentConfig, ...configUpdate };

    await prisma.tenantConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        auth: JSON.stringify(mergedConfig),
      },
      update: {
        auth: JSON.stringify(mergedConfig),
      },
    });

    return NextResponse.json({
      success: true,
      data: mergedConfig,
    });
  } catch (error) {
    console.error("Error updating auth config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update auth config" },
      { status: 500 }
    );
  }
}
