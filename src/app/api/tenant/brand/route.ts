import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId");
    const subdomain = searchParams.get("subdomain");

    let tenant = null;

    if (tenantId) {
      tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });
    } else if (subdomain) {
      tenant = await prisma.tenant.findUnique({
        where: { subdomain },
      });
    }

    if (!tenant) {
      // Return default brand for unconfigured access
      return NextResponse.json({
        success: true,
        data: {
          brandName: "TradePass",
          slogan: "The Operating System for Modern Brokers",
          logoUrl: null,
          faviconUrl: null,
          primaryColor: "#1a73e8",
          subdomain: null,
        },
      });
    }

    // Try TenantConfig.brand first, fallback to Tenant fields
    const tenantConfig = await prisma.tenantConfig.findUnique({
      where: { tenantId: tenant.id },
    });

    let brand: Record<string, any> = {};
    if (tenantConfig?.brand) {
      try {
        brand = JSON.parse(tenantConfig.brand);
      } catch {
        brand = {};
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        brandName: brand.brandName || tenant.brandName || tenant.name || "TradePass",
        slogan: brand.slogan || tenant.slogan || "",
        logoUrl: brand.logoUrl || tenant.logoUrl || null,
        faviconUrl: brand.faviconUrl || tenant.faviconUrl || null,
        primaryColor: brand.primaryColor || tenant.primaryColor || "#1a73e8",
        subdomain: brand.subdomain || tenant.subdomain || null,
      },
    });
  } catch (err: any) {
    console.error("[tenant/brand] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
