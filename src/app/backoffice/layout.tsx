"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/backoffice/layout";
import { useAuthStore } from "@/store/backoffice";
import { cn } from "@/lib/utils";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

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
      
      {/* Main Content */}
      <main
        className={cn(
          "min-h-[calc(100vh-64px)] transition-all duration-300 lg:ml-[260px]"
        )}
      >
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
