"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Bot,
  Users,
  Share2,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ChevronDown,
} from "lucide-react";
import { usePortalStore } from "@/store/portalStore";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

interface NavItem {
  href: string;
  icon: any;
  label: string;
  children?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      {
        href: "/portal/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
      },
      {
        href: "/portal/wallet",
        icon: Wallet,
        label: "Wallet",
        children: [
          { href: "/portal/wallet/deposit", icon: Briefcase, label: "Deposit" },
          { href: "/portal/wallet/withdraw", icon: TrendingUp, label: "Withdraw" },
          { href: "/portal/wallet/transfer", icon: Briefcase, label: "Transfer" },
          { href: "/portal/wallet/transactions", icon: Briefcase, label: "Transactions" },
        ],
      },
    ],
  },
  {
    title: "TRADING",
    items: [
      {
        href: "/portal/trading",
        icon: BarChart3,
        label: "Trading",
        children: [
          { href: "/portal/trading/accounts", icon: Briefcase, label: "Accounts" },
          { href: "/portal/trading/open-account", icon: Briefcase, label: "Open Account" },
          { href: "/portal/trading/positions", icon: TrendingUp, label: "Positions" },
          { href: "/portal/trading/orders", icon: TrendingUp, label: "Orders" },
          { href: "/portal/trading/history", icon: TrendingUp, label: "History" },
          { href: "/portal/trading/mt5", icon: Briefcase, label: "MT5 Access" },
        ],
      },
      {
        href: "/portal/copy-trading",
        icon: Users,
        label: "Copy Trading",
        children: [
          { href: "/portal/copy-trading/discover", icon: Briefcase, label: "Discover" },
          { href: "/portal/copy-trading/my-copy", icon: Briefcase, label: "My Copy" },
          { href: "/portal/copy-trading/settings", icon: Briefcase, label: "Settings" },
          { href: "/portal/copy-trading/become-trader", icon: Briefcase, label: "Become Trader" },
        ],
      },
      {
        href: "/portal/ai-signals",
        icon: Bot,
        label: "AI Signals",
        children: [
          { href: "/portal/ai-signals/feed", icon: Briefcase, label: "Signal Feed" },
          { href: "/portal/ai-signals/generate", icon: Briefcase, label: "Generate" },
          { href: "/portal/ai-signals/my-signals", icon: Briefcase, label: "My Signals" },
          { href: "/portal/ai-signals/limits", icon: Briefcase, label: "Usage Limits" },
        ],
      },
    ],
  },
  {
    title: "IB & REFERRAL",
    items: [
      {
        href: "/portal/ib",
        icon: Share2,
        label: "IB Program",
        children: [
          { href: "/portal/ib/overview", icon: Briefcase, label: "Overview" },
          { href: "/portal/ib/invite", icon: Briefcase, label: "Invite" },
          { href: "/portal/ib/clients", icon: Briefcase, label: "My Clients" },
          { href: "/portal/ib/commission", icon: Briefcase, label: "Commission" },
          { href: "/portal/ib/sub-ib", icon: Briefcase, label: "Sub-IB" },
          { href: "/portal/ib/marketing", icon: Briefcase, label: "Marketing Tools" },
        ],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        href: "/portal/activity",
        icon: Briefcase,
        label: "Activity",
        children: [
          { href: "/portal/activity/tasks", icon: Briefcase, label: "Tasks" },
          { href: "/portal/activity/rewards", icon: Briefcase, label: "Rewards" },
          { href: "/portal/activity/promotions", icon: Briefcase, label: "Promotions" },
          { href: "/portal/activity/history", icon: Briefcase, label: "History" },
        ],
      },
      {
        href: "/portal/support",
        icon: Briefcase,
        label: "Support",
        children: [
          { href: "/portal/support/help", icon: Briefcase, label: "Help Center" },
          { href: "/portal/support/tickets", icon: Briefcase, label: "My Tickets" },
          { href: "/portal/support/tickets/new", icon: Briefcase, label: "Submit Ticket" },
          { href: "/portal/support/announcements", icon: Briefcase, label: "Announcements" },
          { href: "/portal/support/status", icon: Briefcase, label: "System Status" },
        ],
      },
      {
        href: "/portal/settings",
        icon: Settings,
        label: "Settings",
        children: [
          { href: "/portal/settings/profile", icon: Briefcase, label: "Profile" },
          { href: "/portal/settings/security", icon: Briefcase, label: "Security" },
          { href: "/portal/settings/verification", icon: Briefcase, label: "Verification" },
          { href: "/portal/settings/payment", icon: Briefcase, label: "Payment Methods" },
          { href: "/portal/settings/notifications", icon: Briefcase, label: "Notifications" },
          { href: "/portal/settings/language", icon: Briefcase, label: "Language" },
        ],
      },
    ],
  },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = usePortalStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const toggleExpanded = (href: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(href)) {
        next.delete(href);
      } else {
        next.add(href);
      }
      return next;
    });
  };

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col z-40 transition-all duration-200",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center px-3 border-b border-gray-100">
        {sidebarCollapsed ? (
          <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-bold">TP</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#1E40AF] flex items-center justify-center">
              <span className="text-white text-sm font-bold">TP</span>
            </div>
            <span className="text-sm font-semibold text-gray-900 font-heading">TradePass</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-6">
            {!sidebarCollapsed && (
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                {section.title}
              </h3>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.href}>
                  {item.children ? (
                    // 有子菜单：点击展开/收起
                    <div
                      className={cn(
                        "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent",
                        sidebarCollapsed && "justify-center px-0"
                      )}
                      onClick={() => !sidebarCollapsed && toggleExpanded(item.href)}
                      onMouseEnter={() => setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <item.icon size={18} />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium flex-1">{item.label}</span>
                      )}
                      {item.children && !sidebarCollapsed && (
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform duration-200",
                            expandedItems.has(item.href) ? "rotate-180" : ""
                          )}
                        />
                      )}
                      {/* Active indicator - left border */}
                      {isActive(item.href) && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1E40AF] rounded-r" />
                      )}
                    </div>
                  ) : (
                    // 无子菜单：点击跳转
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent",
                          sidebarCollapsed && "justify-center px-0"
                        )}
                        onMouseEnter={() => setHoveredItem(item.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <item.icon size={18} />
                        {!sidebarCollapsed && (
                          <span className="text-sm font-medium flex-1">{item.label}</span>
                        )}
                        {/* Active indicator - left border */}
                        {isActive(item.href) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#1E40AF] rounded-r" />
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Collapsible children */}
                  {item.children && expandedItems.has(item.href) && !sidebarCollapsed && (
                    <div className="mt-1 ml-6 space-y-0.5">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}>
                          <div
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200",
                              isActive(child.href)
                                ? "text-[#1E40AF]"
                                : "text-gray-500 hover:text-gray-700"
                            )}
                          >
                            <child.icon size={14} />
                            <span className="text-xs font-medium">{child.label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tooltip for collapsed state */}
                  {sidebarCollapsed && hoveredItem === item.href && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Info */}
      <div className="p-4 border-t border-gray-100">
        {!sidebarCollapsed && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-900 mb-1">Need help?</p>
            <p className="text-[11px] text-gray-500">Contact our support team</p>
          </div>
        )}
      </div>
    </aside>
  );
}
