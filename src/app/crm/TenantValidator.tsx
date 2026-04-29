"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export function TenantValidator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let tenantId = searchParams.get("tenant");
    const fromQuery = !!tenantId;
    if (!tenantId) {
      tenantId = getCookie("portal_tenant");
    }
    if (!tenantId) {
      router.replace("/console");
      return;
    }

    // Persist tenant in cookie for cross-system access (Portal / Backoffice)
    if (fromQuery) {
      document.cookie = `portal_tenant=${tenantId};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
    }

    fetch(`/api/auth/validate-tenant-access?tenantId=${tenantId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid tenant access");
        setValid(true);
      })
      .catch(() => {
        router.replace("/console");
      });
  }, [searchParams, router]);

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return <>{children}</>;
}
