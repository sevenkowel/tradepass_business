"use client";

import { ReactNode } from "react";
import { PortalSidebar } from "./PortalSidebar";
import { PortalTopbar } from "./PortalTopbar";
import { usePortalStore } from "@/store/portalStore";
import { cn } from "@/lib/utils";

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
    </div>
  );
}
