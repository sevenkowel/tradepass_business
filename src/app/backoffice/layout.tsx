"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/backoffice/layout";
import { useAuthStore } from "@/store/backoffice";
import { useBackofficeSidebarStore } from "@/store/backofficeSidebarStore";
import { ToastContextProvider } from "@/components/ui";
import { cn } from "@/lib/utils";
import { TenantValidator } from "./TenantValidator";

function BackofficeContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useBackofficeSidebarStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/backoffice/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <ToastContextProvider>
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <Sidebar />
        <main
          className={cn(
            "min-h-[calc(100vh-64px)] transition-all duration-300",
            sidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[260px]"
          )}
        >
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </ToastContextProvider>
  );
}

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
        </div>
      }
    >
      <TenantValidator>
        <BackofficeContent>{children}</BackofficeContent>
      </TenantValidator>
    </Suspense>
  );
}
