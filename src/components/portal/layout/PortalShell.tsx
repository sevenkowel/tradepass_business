"use client";

import { ReactNode } from "react";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { usePortalStore } from "@/store/portalStore";
import { cn } from "@/lib/utils";
import { FloatingDevToolbox } from "@/components/dev-tools";

interface PortalShellProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
  tenant?: { id: string; name: string; slug: string };
}

export function PortalShell({ children, breadcrumbs, tenant }: PortalShellProps) {
  const { sidebarCollapsed } = usePortalStore();

  return (
    <div className="min-h-screen bg-[var(--tp-bg)]">
      <PortalSidebar />
      <PortalTopbar breadcrumbs={breadcrumbs} tenantName={tenant?.name} />

      <main
        className={cn(
          "pt-[72px] transition-all duration-300 ease-out",
          sidebarCollapsed ? "ml-[72px]" : "ml-[240px]"
        )}
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
