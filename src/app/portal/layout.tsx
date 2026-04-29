import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/layout/PortalShell";
import { TenantCookieSetter } from "@/components/portal/layout/TenantCookieSetter";
import { DevConfigProvider } from "@/lib/dev-config";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { getTenantBrandById, BrandConfig } from "@/lib/brand";

/**
 * 从 Host 头提取租户子域名
 * portal.dupoin.localhost:3002 → dupoin
 */
function getTenantSubdomainFromHost(host: string): string | null {
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // 三级子域名: portal.tenant.localhost
  if (parts.length >= 3 && parts[parts.length - 1] === "localhost") {
    // 格式: xxx.tenant.localhost，tenant 是倒数第二个
    return parts[parts.length - 2];
  }

  return null;
}

// 动态生成 metadata（使用品牌名称）
export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // 优先从子域名获取租户，其次从 cookie
  let tenantId = cookieStore.get("portal_tenant")?.value;
  const subdomain = getTenantSubdomainFromHost(host);

  if (subdomain && !tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (tenant) tenantId = tenant.id;
  }

  let brandName = "TradePass";
  if (tenantId) {
    const brand = await getTenantBrandById(tenantId);
    brandName = brand.brandName;
  }

  return {
    title: {
      template: `%s | ${brandName} Portal`,
      default: `${brandName} Portal`,
    },
    description: `${brandName} Client Portal - Manage your trading accounts, wallet, and more.`,
  };
}

async function validateTenant(tenantId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.status !== "active") return null;

    const membership = await prisma.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId, userId: user.id } },
    });
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant || (!membership && tenant.ownerId !== user.id)) return null;

    const license = await prisma.license.findFirst({
      where: {
        tenantId,
        status: "active",
        productCode: "trade_pass_business",
      },
    });
    if (!license) return null;

    return { tenant, user, role: membership?.role || "owner" };
  } catch {
    return null;
  }
}

export default async function PortalLayout({
  children,
  searchParams,
}: {
  children: React.ReactNode;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") || "";

  let tenantId = cookieStore.get("portal_tenant")?.value;

  // Phase 3: 从子域名获取租户
  const subdomain = getTenantSubdomainFromHost(host);
  if (subdomain && !tenantId) {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (tenant) tenantId = tenant.id;
  }

  // Fallback: read tenant from URL query param
  if (!tenantId && searchParams) {
    const params = await searchParams;
    const t = params.tenant;
    if (typeof t === "string") {
      tenantId = t;
    }
  }

  if (!tenantId) {
    redirect("/console");
  }

  const access = await validateTenant(tenantId);
  if (!access) {
    redirect("/console");
  }

  // 服务端获取品牌配置
  const brand = await getTenantBrandById(tenantId);

  return (
    <>
      <TenantCookieSetter />
      <DevConfigProvider>
        <PortalShell tenant={access.tenant} brand={brand}>{children}</PortalShell>
      </DevConfigProvider>
    </>
  );
}
