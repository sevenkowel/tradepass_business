"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function TenantValidator({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const tenantId = searchParams.get("tenant");
    if (!tenantId) {
      router.replace("/console");
      return;
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
