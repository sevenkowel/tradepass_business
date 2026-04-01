"use client";

import { usePortalStore } from "@/store/portalStore";
import { PortalSidebar } from "@/components/portal/layout/PortalSidebar";
import { PortalTopbar } from "@/components/portal/layout/PortalTopbar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = usePortalStore();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <PortalSidebar />
      <PortalTopbar />
      <motion.main
        animate={{
          marginLeft: sidebarCollapsed ? 64 : 260,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "min-h-screen pt-14",
          "max-lg:!ml-0" // Mobile: no margin
        )}
      >
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  );
}
