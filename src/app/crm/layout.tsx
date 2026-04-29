// CRM 服务端 Layout - 获取品牌配置并传递给客户端

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantBrandById } from "@/lib/brand";
import { BrandProvider } from "@/lib/brand";
import ClientLayout from "./ClientLayout";

/**
 * 从 Host 头提取租户子域名
 * crm.dupoin.localhost:3002 → dupoin
 */
function getTenantSubdomainFromHost(host: string): string | null {
  const hostname = host.split(":")[0];
  const parts = hostname.split(".");

  // 三级子域名: crm.tenant.localhost
  if (parts.length >= 3 && parts[parts.length - 1] === "localhost") {
    return parts[parts.length - 2];
  }

  return null;
}

async function getTenantIdFromContext(): Promise<string | null> {
  const cookieStore = await cookies();
  const headersList = await headers();
  const host = headersList.get("host") || "";

  // 优先从 cookie 获取
  let tenantId = cookieStore.get("portal_tenant")?.value;
  if (tenantId) return tenantId;

  // Phase 4: 从子域名获取租户
  const subdomain = getTenantSubdomainFromHost(host);
  if (subdomain) {
    const tenant = await prisma.tenant.findUnique({ where: { subdomain } });
    if (tenant) return tenant.id;
  }

  return null;
}

export async function generateMetadata() {
  const tenantId = await getTenantIdFromContext();

  let brandName = "TradePass";
  if (tenantId) {
    const brand = await getTenantBrandById(tenantId);
    brandName = brand.brandName;
  }

  return {
    title: {
      template: `%s | ${brandName} CRM`,
      default: `${brandName} CRM`,
    },
    description: `${brandName} CRM - Manage your brokerage operations.`,
  };
}

export default async function CrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenantId = await getTenantIdFromContext();

  if (!tenantId) {
    redirect("/console");
  }

  // 服务端获取品牌配置
  const brand = await getTenantBrandById(tenantId);

  return (
    <BrandProvider brand={brand}>
      <ClientLayout>{children}</ClientLayout>
    </BrandProvider>
  );
}
