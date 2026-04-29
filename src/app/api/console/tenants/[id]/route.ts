import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/console/tenants/:id
 * 获取租户详情（包含订阅、成员统计）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;

    // 验证用户身份
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证用户是否有权访问该租户
    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // 检查权限：成员或所有者
    if (!membership && tenant.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 获取租户配置
    const tenantConfig = await prisma.tenantConfig.findUnique({
      where: { tenantId },
    });

    let brand = {
      brandName: tenant.brandName || tenant.name,
      logoUrl: tenant.logoUrl,
      primaryColor: tenant.primaryColor || "#1a73e8",
    };

    if (tenantConfig?.brand) {
      try {
        const brandConfig = JSON.parse(tenantConfig.brand);
        brand = {
          brandName: brandConfig.brandName || brand.brandName,
          logoUrl: brandConfig.logoUrl || brand.logoUrl,
          primaryColor: brandConfig.primaryColor || brand.primaryColor,
        };
      } catch {
        // use default
      }
    }

    // 获取订阅信息 (License)
    const licenses = await prisma.license.findMany({
      where: { tenantId },
      orderBy: { issuedAt: "desc" },
    });

    // 获取产品信息
    const productCodes = [...new Set(licenses.map((l) => l.productCode))];
    const products = await prisma.product.findMany({
      where: { code: { in: productCodes } },
      select: { code: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.code, p.name]));

    // 获取成员统计
    const memberCount = await prisma.tenantMember.count({
      where: { tenantId },
    });

    // 获取当前激活的 Business 订阅
    const businessLicense = licenses.find(
      (s) => s.productCode === "trade_pass_business" && s.status === "active"
    );

    return NextResponse.json({
      success: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subdomain: tenant.subdomain,
        status: tenant.status,
        plan: businessLicense ? "business" : null,
        createdAt: tenant.createdAt,
        brand,
        stats: {
          members: memberCount,
          subscriptions: licenses.length,
        },
        subscriptions: licenses.map((s) => ({
          id: s.id,
          productCode: s.productCode,
          productName: productMap.get(s.productCode) || s.productCode,
          plan: "default", // License 没有 plan 字段，使用默认值
          status: s.status,
          startsAt: s.issuedAt,
          endsAt: s.expiresAt,
          autoRenew: false, // License 没有 autoRenew 字段
        })),
      },
    });
  } catch (error: any) {
    console.error("[tenant detail] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch tenant" },
      { status: 500 }
    );
  }
}
