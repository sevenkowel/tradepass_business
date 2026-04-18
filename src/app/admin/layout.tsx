"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  CreditCard,
  ClipboardList,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "仪表盘", icon: LayoutDashboard },
  { href: "/admin/users", label: "用户管理", icon: Users },
  { href: "/admin/licenses", label: "License 管理", icon: KeyRound },
  { href: "/admin/billing", label: "计费管理", icon: CreditCard },
  { href: "/admin/audit-logs", label: "审计日志", icon: ClipboardList },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout
      navItems={navItems}
      title="Admin"
      sidebarBg="bg-slate-950"
      redirectTo="/auth/login"
    >
      {children}
    </DashboardLayout>
  );
}
