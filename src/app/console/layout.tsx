"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
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
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Skip onboarding check on onboarding page itself
    if (pathname === "/console/onboarding") return;

    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        if (data.onboarding && data.onboarding.status !== "completed") {
          router.replace("/console/onboarding");
        }
      })
      .catch(() => {});
  }, [pathname, router]);

  return (
    <DashboardLayout navItems={navItems} title="Console" sidebarBg="bg-slate-900">
      {children}
    </DashboardLayout>
  );
}
