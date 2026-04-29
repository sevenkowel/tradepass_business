"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ConsoleLayout } from "@/components/console/layout";
import { useTenantStore } from "@/store/tenantStore";

interface BrandData {
  brandName: string;
  subdomain: string | null;
}

function buildPortalUrl(brand: BrandData | null): string | undefined {
  if (!brand) return undefined;
  if (brand.subdomain) {
    const { protocol, host } = window.location;
    const mainDomain = host.replace(/^[^.]+\./, "");
    return `${protocol}//${brand.subdomain}.${mainDomain}`;
  }
  return undefined;
}

export default function ConsoleRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentTenant, setCurrentTenant, setTenants } = useTenantStore();
  const [portalUrl, setPortalUrl] = useState<string | undefined>();

  useEffect(() => {
    // 获取租户列表并设置当前租户（如果未设置）
    async function initTenant() {
      try {
        const res = await fetch("/api/console/tenants");
        const data = await res.json();
        if (data.tenants?.length > 0) {
          setTenants(data.tenants);
          if (!currentTenant) {
            setCurrentTenant(data.tenants[0]);
          }
        }
      } catch {
        // ignore
      }
    }
    initTenant();
  }, []);

  useEffect(() => {
    // 获取租户品牌信息以构建 portal URL
    const tenantId = currentTenant?.id;
    if (!tenantId) return;

    fetch(`/api/tenant/brand?tenantId=${tenantId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.data) {
          setPortalUrl(buildPortalUrl(res.data));
        }
      })
      .catch(() => {});
  }, [currentTenant?.id]);

  useEffect(() => {
    // Skip onboarding check on onboarding page itself
    if (pathname === "/console/onboarding") return;

    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.onboarding && data.onboarding.status !== "completed") {
          router.replace("/console/onboarding");
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  return (
    <ConsoleLayout portalUrl={portalUrl}>
      {children}
    </ConsoleLayout>
  );
}
