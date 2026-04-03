"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/backoffice/layout";
import { useAuthStore } from "@/store/backoffice";
import { useBackofficeSidebarStore } from "@/store/backofficeSidebarStore";
import { cn } from "@/lib/utils";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useBackofficeSidebarStore();

  // Check auth
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/backoffice/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Sidebar />
      
      {/* Main Content - 随侧边栏同步移动 */}
      <main
        className={cn(
          "min-h-[calc(100vh-64px)] transition-all duration-300",
          sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
        )}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
