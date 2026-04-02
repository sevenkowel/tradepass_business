"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Briefcase,
  Wallet,
  TrendingUp,
  Network,
  Copy,
  Brain,
  AlertTriangle,
  Headphones,
  Megaphone,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  type LucideIcon,
} from "lucide-react";

// Menu Types
interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

// Menu Configuration
const menuGroups: MenuGroup[] = [
  {
    group: "Dashboard",
    items: [
      { label: "Overview", href: "/backoffice", icon: LayoutDashboard },
      { label: "Real-time Monitor", href: "/backoffice/monitor", icon: TrendingUp },
      { label: "Conversion Funnel", href: "/backoffice/funnel", icon: BarChart3 },
    ],
  },
  {
    group: "Users",
    items: [
      { label: "User List", href: "/backoffice/users", icon: Users },
      { label: "User Tags", href: "/backoffice/users/tags", icon: Users },
      { label: "User Levels", href: "/backoffice/users/levels", icon: Users },
    ],
  },
  {
    group: "Compliance",
    items: [
      { label: "KYC Review", href: "/backoffice/compliance/kyc-review", icon: ShieldCheck },
      { label: "Risk Control", href: "/backoffice/compliance/risk", icon: AlertTriangle },
      { label: "Blacklist", href: "/backoffice/compliance/blacklist", icon: ShieldCheck },
      { label: "Audit Logs", href: "/backoffice/compliance/audit", icon: ShieldCheck },
    ],
  },
  {
    group: "Accounts",
    items: [
      { label: "MT Accounts", href: "/backoffice/accounts", icon: Briefcase },
      { label: "Account Groups", href: "/backoffice/accounts/groups", icon: Briefcase },
      { label: "Leverage Settings", href: "/backoffice/accounts/leverage", icon: Briefcase },
    ],
  },
  {
    group: "Funds",
    items: [
      { label: "Deposit Orders", href: "/backoffice/funds/deposits", icon: Wallet },
      { label: "Withdrawal Requests", href: "/backoffice/funds/withdrawal-review", icon: Wallet },
      { label: "Transactions", href: "/backoffice/funds/transactions", icon: Wallet },
      { label: "Payment Channels", href: "/backoffice/funds/channels", icon: Wallet },
    ],
  },
  {
    group: "Trading",
    items: [
      { label: "Orders", href: "/backoffice/trading/orders", icon: TrendingUp },
      { label: "Positions", href: "/backoffice/trading/positions", icon: TrendingUp },
      { label: "Instruments", href: "/backoffice/trading/instruments", icon: TrendingUp },
      { label: "Trading Settings", href: "/backoffice/trading/settings", icon: TrendingUp },
    ],
  },
  {
    group: "IB / Referral",
    items: [
      { label: "IB List", href: "/backoffice/ib", icon: Network },
      { label: "Referral Tree", href: "/backoffice/ib/tree", icon: Network },
      { label: "Commission Records", href: "/backoffice/ib/commissions", icon: Network },
      { label: "Commission Settings", href: "/backoffice/ib/settings", icon: Network },
    ],
  },
  {
    group: "Copy Trading",
    items: [
      { label: "Traders", href: "/backoffice/copy-trading/traders", icon: Copy },
      { label: "Followers", href: "/backoffice/copy-trading/followers", icon: Copy },
      { label: "Copy Settings", href: "/backoffice/copy-trading/settings", icon: Copy },
      { label: "Profit Sharing", href: "/backoffice/copy-trading/profits", icon: Copy },
    ],
  },
  {
    group: "AI Signals",
    items: [
      { label: "Signal List", href: "/backoffice/ai-signals", icon: Brain },
      { label: "Usage Control", href: "/backoffice/ai-signals/usage", icon: Brain },
      { label: "Signal Pool", href: "/backoffice/ai-signals/pool", icon: Brain },
    ],
  },
  {
    group: "Risk",
    items: [
      { label: "Risk Dashboard", href: "/backoffice/risk", icon: AlertTriangle },
      { label: "Risk Rules", href: "/backoffice/risk/rules", icon: AlertTriangle },
      { label: "Margin Alerts", href: "/backoffice/risk/margin", icon: AlertTriangle },
      { label: "NBP Protection", href: "/backoffice/risk/nbp", icon: AlertTriangle },
    ],
  },
  {
    group: "CRM / Support",
    items: [
      { label: "Tickets", href: "/backoffice/crm/tickets", icon: Headphones },
      { label: "Interaction Logs", href: "/backoffice/crm/logs", icon: Headphones },
      { label: "Feedback", href: "/backoffice/crm/feedback", icon: Headphones },
    ],
  },
  {
    group: "Marketing",
    items: [
      { label: "Campaigns", href: "/backoffice/marketing/campaigns", icon: Megaphone },
      { label: "Messages", href: "/backoffice/marketing/messages", icon: Megaphone },
      { label: "Banner Management", href: "/backoffice/marketing/banners", icon: Megaphone },
      { label: "News / Insights", href: "/backoffice/marketing/news", icon: Megaphone },
    ],
  },
  {
    group: "Reports",
    items: [
      { label: "Financial Reports", href: "/backoffice/reports/financial", icon: BarChart3 },
      { label: "Trading Reports", href: "/backoffice/reports/trading", icon: BarChart3 },
      { label: "User Reports", href: "/backoffice/reports/users", icon: BarChart3 },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Roles & Permissions", href: "/backoffice/system/roles", icon: Settings },
      { label: "Config Center", href: "/backoffice/system/config", icon: Settings },
      { label: "API Management", href: "/backoffice/system/api", icon: Settings },
      { label: "Operation Logs", href: "/backoffice/system/logs", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Dashboard"])
  );
  
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-50 bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/backoffice" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-gray-900">TradePass</span>
            )}
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {menuGroups.map((group) => (
            <div key={group.group} className="mb-4">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.group)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-900 transition-colors",
                  sidebarCollapsed && "justify-center px-2"
                )}
              >
                {!sidebarCollapsed && <span>{group.group}</span>}
                {!sidebarCollapsed && (
                  expandedGroups.has(group.group) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                )}
                {sidebarCollapsed && (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Group Items */}
              {expandedGroups.has(group.group) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <div key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                            sidebarCollapsed && "justify-center px-2",
                            isActive(item.href)
                              ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </Link>
                      ) : (
                        <button
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all",
                            sidebarCollapsed && "justify-center px-2",
                            "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          )}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="hidden lg:block border-t border-gray-200 p-2">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ChevronLeft
              className={cn(
                "w-5 h-5 transition-transform",
                sidebarCollapsed && "rotate-180"
              )}
            />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
