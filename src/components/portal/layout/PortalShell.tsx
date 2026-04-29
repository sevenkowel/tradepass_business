"use client";

import { ReactNode } from "react";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { usePortalStore } from "@/store/portalStore";
import { cn } from "@/lib/utils";
import { FloatingDevToolbox } from "@/components/dev-tools";
import { BrandConfig } from "@/lib/brand";

interface PortalShellProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
  tenant?: { id: string; name: string; slug: string };
  brand?: BrandConfig;
}

export function PortalShell({ children, breadcrumbs, tenant, brand }: PortalShellProps) {
  const { sidebarCollapsed } = usePortalStore();

  return (
    <div className="min-h-screen bg-[var(--tp-bg)]">
      <PortalSidebar tenantId={tenant?.id} brand={brand} />
      <PortalTopbar breadcrumbs={breadcrumbs} />

      <main
        className="pt-[72px] transition-all duration-300 ease-out"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '240px' }}
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

      {/* 开发工具箱 - 仅开发环境显示 */}
      {process.env.NODE_ENV !== "production" && <FloatingDevToolbox />}
    </div>
  );
}
