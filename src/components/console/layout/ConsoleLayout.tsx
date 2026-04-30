"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ConsoleSidebar } from "./ConsoleSidebar";
import { ConsoleTopBar } from "./ConsoleTopBar";
import { PlanStatusBar } from "@/components/billing/PlanStatusBar";
import { Loader2 } from "lucide-react";

interface ConsoleLayoutProps {
  children: React.ReactNode;
  portalUrl?: string;
}

export function ConsoleLayout({ children, portalUrl }: ConsoleLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<{ name?: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // 获取用户信息
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // 从 localStorage 读取侧边栏折叠状态
  useEffect(() => {
    const saved = localStorage.getItem("console_sidebar_collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  // 保存侧边栏折叠状态
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("console_sidebar_collapsed", String(newState));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <ConsoleSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TopBar */}
        <ConsoleTopBar
          sidebarCollapsed={sidebarCollapsed}
          user={user}
          portalUrl={portalUrl}
          onMenuToggle={() => setMobileMenuOpen(true)}
        />

        {/* Plan Status Bar */}
        <PlanStatusBar />

        {/* Main Content */}
        <main className="p-4 lg:p-6 flex-1">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
