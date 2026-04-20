"use client";

import { useEffect } from "react";

export function TenantCookieSetter() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tenantId = params.get("tenant");
    if (tenantId) {
      document.cookie = `portal_tenant=${tenantId};path=/;max-age=${60 * 60 * 24 * 7};SameSite=Lax`;
    }
  }, []);
  return null;
}
