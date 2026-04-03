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
  Newspaper,
  Calendar,
  Video,
  Sparkles,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  CreditCard,
  Landmark,
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
  isGroup?: boolean; // 标记这是一个分组项（如 News & Analysis），点击不跳转只展开
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
        href: "/portal/fund",
        icon: DollarSign,
        label: "Fund",
        children: [
          { href: "/portal/fund/deposit", icon: ArrowDownLeft, label: "Deposit" },
          { href: "/portal/fund/withdraw", icon: ArrowUpRight, label: "Withdraw" },
          { href: "/portal/fund/transfer", icon: ArrowLeftRight, label: "Transfer" },
          { href: "/portal/fund/history", icon: History, label: "History" },
          { href: "/portal/fund/wallet", icon: Wallet, label: "Wallet" },
          { href: "/portal/fund/accounts", icon: CreditCard, label: "Payment Accounts" },
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
          // { href: "/portal/trading/open-account", icon: Briefcase, label: "Open Account" },
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
        href: "/portal/pamm",
        icon: TrendingUp,
        label: "PAMM",
        children: [
          { href: "/portal/pamm/overview", icon: Briefcase, label: "Overview" },
          { href: "/portal/pamm/invest", icon: Briefcase, label: "Invest" },
          { href: "/portal/pamm/my-investments", icon: Briefcase, label: "My Investments" },
          { href: "/portal/pamm/become-manager", icon: Briefcase, label: "Become Manager" },
        ],
      },
      {
        href: "/portal/mamm",
        icon: TrendingUp,
        label: "MAMM",
        children: [
          { href: "/portal/mamm/overview", icon: Briefcase, label: "Overview" },
          { href: "/portal/mamm/invest", icon: Briefcase, label: "Invest" },
          { href: "/portal/mamm/my-investments", icon: Briefcase, label: "My Investments" },
          { href: "/portal/mamm/become-manager", icon: Briefcase, label: "Become Manager" },
        ],
      },
    ],
  },
  {
    title: "INSIGHTS",
    items: [
      {
        href: "/portal/insights/news",
        icon: Newspaper,
        label: "News & Analysis",
        children: [
          { href: "/portal/insights/news/market", icon: Briefcase, label: "Market News" },
          { href: "/portal/insights/news/flash", icon: Briefcase, label: "News Flash" },
        ],
      },
      {
        href: "/portal/insights/data",
        icon: Calendar,
        label: "Data & Calendar",
        children: [
          { href: "/portal/insights/data/calendar", icon: Briefcase, label: "Economic Calendar" },
        ],
      },
      {
        href: "/portal/insights/media",
        icon: Video,
        label: "Media",
        children: [
          { href: "/portal/insights/media/videos", icon: Briefcase, label: "Videos" },
          { href: "/portal/insights/media/live", icon: Briefcase, label: "Live" },
        ],
      },
      {
        href: "/portal/ai-signals",
        icon: Bot,
        label: "AI Insights",
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
          { href: "/portal/kyc", icon: Briefcase, label: "Verification" },
          { href: "/portal/settings/payment", icon: Briefcase, label: "Payment Methods" },
          { href: "/portal/settings/notifications", icon: Briefcase, label: "Notifications" },
          { href: "/portal/settings/language", icon: Briefcase, label: "Language" },
        ],
      },
    ],
  },
];

// 渲染导航项（支持两级菜单）
interface NavItemRendererProps {
  item: NavItem;
  isActive: (href: string) => boolean;
  expandedItems: Set<string>;
  toggleExpanded: (href: string) => void;
  sidebarCollapsed: boolean;
  hoveredItem: string | null;
  setHoveredItem: (href: string | null) => void;
}

function NavItemRenderer({
  item,
  isActive,
  expandedItems,
  toggleExpanded,
  sidebarCollapsed,
  hoveredItem,
  setHoveredItem,
}: NavItemRendererProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.href);
  const active = isActive(item.href);

  return (
    <div className="relative">
      {hasChildren ? (
        // 有子菜单：点击展开/收起
        <div
          className={cn(
            "group relative flex items-center gap-3 transition-all duration-200 cursor-pointer rounded-xl",
            sidebarCollapsed
              ? "w-12 h-12 mx-auto justify-center hover:bg-blue-50"
              : "px-3 py-2.5 hover:bg-slate-100/80",
            active && "bg-blue-50"
          )}
          onClick={() => !sidebarCollapsed && toggleExpanded(item.href)}
          onMouseEnter={() => setHoveredItem(item.href)}
          onMouseLeave={() => setHoveredItem(null)}
        >
          {/* 图标容器 */}
          <div
            className={cn(
              "flex items-center justify-center rounded-lg transition-all duration-200",
              active
                ? "bg-blue-100 text-blue-600"
                : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600",
              sidebarCollapsed ? "w-10 h-10" : "w-9 h-9"
            )}
          >
            <item.icon size={18} />
          </div>

          {/* 文字区域（展开时显示） */}
          {!sidebarCollapsed && (
            <>
              <span
                className={cn(
                  "text-sm font-medium flex-1 transition-colors",
                  active ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
                )}
              >
                {item.label}
              </span>
              <ChevronDown
                size={14}
                className={cn(
                  "text-slate-400 transition-transform duration-200",
                  isExpanded ? "rotate-180" : ""
                )}
              />
            </>
          )}

          {/* 左侧选中指示器 */}
          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-600 rounded-r-full" />
          )}
        </div>
      ) : (
        // 无子菜单：点击跳转
        <Link href={item.href}>
          <div
            className={cn(
              "group relative flex items-center gap-3 transition-all duration-200 rounded-xl",
              sidebarCollapsed
                ? "w-12 h-12 mx-auto justify-center hover:bg-blue-50"
                : "px-3 py-2.5 hover:bg-slate-100/80",
              active && "bg-blue-50"
            )}
            onMouseEnter={() => setHoveredItem(item.href)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* 图标容器 */}
            <div
              className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-200",
                active
                  ? "bg-blue-100 text-blue-600"
                  : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600",
                sidebarCollapsed ? "w-10 h-10" : "w-9 h-9"
              )}
            >
              <item.icon size={18} />
            </div>

            {/* 文字区域（展开时显示） */}
            {!sidebarCollapsed && (
              <span
                className={cn(
                  "text-sm font-medium flex-1 transition-colors",
                  active ? "text-blue-700" : "text-slate-700 group-hover:text-slate-900"
                )}
              >
                {item.label}
              </span>
            )}

            {/* 左侧选中指示器 */}
            {active && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-600 rounded-r-full" />
            )}
          </div>
        </Link>
      )}

      {/* 二级菜单 */}
      {hasChildren && isExpanded && !sidebarCollapsed && (
        <div className="mt-1 ml-[52px] space-y-0.5 pr-3">
          {item.children!.map((child) => (
            <Link key={child.href} href={child.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                  isActive(child.href)
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
                onMouseEnter={() => setHoveredItem(child.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <child.icon size={16} />
                <span className="text-sm">{child.label}</span>
                
                {/* 子菜单 Tooltip */}
                {hoveredItem === child.href && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg">
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
                    {child.label}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {sidebarCollapsed && hoveredItem === item.href && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-50 shadow-lg">
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-800" />
          {item.label}
        </div>
      )}
    </div>
  );
}

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
        "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80 flex flex-col z-40 transition-all duration-300 ease-out shadow-sm",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo 区域 */}
      <div className="h-[64px] flex items-center border-b border-slate-100/80 relative">
        {sidebarCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center mx-auto shadow-md shadow-blue-200">
            <span className="text-white text-sm font-bold">TP</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white text-sm font-bold">TP</span>
            </div>
            <span className="text-base font-bold text-slate-800 tracking-tight">TradePass</span>
          </div>
        )}
        
        {/* 折叠按钮 - 放在右侧（展开时）/ 中间（收起时） */}
        <button
          onClick={toggleSidebar}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 z-10",
            sidebarCollapsed ? "right-1/2 translate-x-1/2" : "-right-3"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={12} className="text-slate-500" />
          ) : (
            <ChevronLeft size={12} className="text-slate-500" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="mb-5">
            {/* 分类标题 */}
            {!sidebarCollapsed ? (
              <div className="px-4 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {section.title}
                </span>
              </div>
            ) : (
              <div className="h-4" /> // 保持对齐
            )}
            
            <div className={cn("space-y-0.5", sidebarCollapsed && "px-2")}>
              {section.items.map((item) => (
                <NavItemRenderer
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  expandedItems={expandedItems}
                  toggleExpanded={toggleExpanded}
                  sidebarCollapsed={sidebarCollapsed}
                  hoveredItem={hoveredItem}
                  setHoveredItem={setHoveredItem}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Info */}
      <div className="p-3 border-t border-slate-100/80">
        {!sidebarCollapsed ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100/50">
            <p className="text-xs font-semibold text-blue-900 mb-0.5">Need help?</p>
            <p className="text-[11px] text-blue-600">Contact support</p>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mx-auto border border-blue-100/50">
            <Sparkles size={16} className="text-blue-600" />
          </div>
        )}
      </div>
    </aside>
  );
}
