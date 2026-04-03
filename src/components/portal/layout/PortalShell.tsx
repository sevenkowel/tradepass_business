"use client";

import { ReactNode } from "react";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { usePortalStore } from "@/store/portalStore";
import { cn } from "@/lib/utils";
import { FloatingDevToolbox } from "@/components/dev-tools";
import { isDevEnvironment } from "@/lib/dev-config";

interface PortalShellProps {
  children: ReactNode;
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function PortalShell({ children, breadcrumbs }: PortalShellProps) {
  const { sidebarCollapsed } = usePortalStore();

  return (
    <div className="min-h-screen bg-[var(--tp-bg)]">
      <PortalSidebar />
      <PortalTopbar />

      <main
        className={cn(
          "pt-[60px] transition-all duration-200",
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>

      {/* 开发工具箱 - 仅开发环境显示 */}
      {isDevEnvironment() && <FloatingDevToolbox />}
    </div>
  );
}
