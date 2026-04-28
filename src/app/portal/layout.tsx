import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal/layout/PortalShell";
import { TenantCookieSetter } from "@/components/portal/layout/TenantCookieSetter";
import { DevConfigProvider } from "@/lib/dev-config";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export const metadata: Metadata = {
  title: {
    template: "%s | TradePass Portal",
    default: "TradePass Portal",
  },
  description: "TradePass Client Portal - Manage your trading accounts, wallet, and more.",
};

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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  let tenantId = cookieStore.get("portal_tenant")?.value;

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

  return (
    <>
      <TenantCookieSetter />
      <DevConfigProvider>
        <PortalShell tenant={access.tenant}>{children}</PortalShell>
      </DevConfigProvider>
    </>
  );
}
