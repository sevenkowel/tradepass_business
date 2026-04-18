"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
  LogOut,
  Loader2,
} from "lucide-react";

const navItems = [
  { href: "/console", label: "仪表盘", icon: LayoutDashboard },
  { href: "/console/tenants", label: "租户管理", icon: Building2 },
  { href: "/console/products", label: "产品管理", icon: Package },
  { href: "/console/billing", label: "账单管理", icon: CreditCard },
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useUser();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-xl font-bold">
            TradePass
          </Link>
          <p className="text-xs text-slate-400 mt-1">Console</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors",
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="px-4 py-2 text-sm text-slate-300 truncate">
            {user?.email}
          </div>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/auth/login";
            }}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-900">
            {navItems.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.label || "Console"}
          </h1>
          <div className="text-sm text-slate-500">
            {user?.name || user?.email}
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
