"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useBackofficeSidebarStore } from "@/store/backofficeSidebarStore";

// 菜单项类型 - 支持两级菜单
interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

interface MenuGroup {
  group: string;
  icon: LucideIcon;
  items: MenuItem[];
}

// 菜单配置 - 所有菜单项
const menuGroups: MenuGroup[] = [
  {
    group: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { label: "Overview", href: "/backoffice", icon: LayoutDashboard },
      { label: "Real-time Monitor", href: "/backoffice/monitor", icon: TrendingUp },
      { label: "Conversion Funnel", href: "/backoffice/funnel", icon: BarChart3 },
    ],
  },
  {
    group: "Users",
    icon: Users,
    items: [
      { label: "User List", href: "/backoffice/users", icon: Users },
      { label: "User Tags", href: "/backoffice/users/tags", icon: Users },
      { label: "User Levels", href: "/backoffice/users/levels", icon: Users },
    ],
  },
  {
    group: "Compliance",
    icon: ShieldCheck,
    items: [
      { label: "KYC Review", href: "/backoffice/compliance/kyc-review", icon: ShieldCheck },
      { label: "Risk Control", href: "/backoffice/compliance/risk", icon: AlertTriangle },
      { label: "Blacklist", href: "/backoffice/compliance/blacklist", icon: ShieldCheck },
      { label: "Audit Logs", href: "/backoffice/compliance/audit", icon: ShieldCheck },
    ],
  },
  {
    group: "Accounts",
    icon: Briefcase,
    items: [
      { label: "MT Accounts", href: "/backoffice/accounts", icon: Briefcase },
      { label: "Account Groups", href: "/backoffice/accounts/groups", icon: Briefcase },
      { label: "Leverage Settings", href: "/backoffice/accounts/leverage", icon: Briefcase },
    ],
  },
  {
    group: "Funds",
    icon: Wallet,
    items: [
      { label: "Deposit Orders", href: "/backoffice/funds/deposits", icon: Wallet },
      { label: "Withdrawal Requests", href: "/backoffice/funds/withdrawal-review", icon: Wallet },
      { label: "Transactions", href: "/backoffice/funds/transactions", icon: Wallet },
      { label: "Payment Channels", href: "/backoffice/funds/channels", icon: Wallet },
    ],
  },
  {
    group: "Trading",
    icon: TrendingUp,
    items: [
      { label: "Orders", href: "/backoffice/trading/orders", icon: TrendingUp },
      { label: "Positions", href: "/backoffice/trading/positions", icon: TrendingUp },
      { label: "Instruments", href: "/backoffice/trading/instruments", icon: TrendingUp },
      { label: "Trading Settings", href: "/backoffice/trading/settings", icon: TrendingUp },
    ],
  },
  {
    group: "IB / Referral",
    icon: Network,
    items: [
      { label: "IB List", href: "/backoffice/ib", icon: Network },
      { label: "Referral Tree", href: "/backoffice/ib/tree", icon: Network },
      { label: "Commission Records", href: "/backoffice/ib/commissions", icon: Network },
      { label: "Commission Settings", href: "/backoffice/ib/settings", icon: Network },
    ],
  },
  {
    group: "Copy Trading",
    icon: Copy,
    items: [
      { label: "Traders", href: "/backoffice/copy-trading/traders", icon: Copy },
      { label: "Followers", href: "/backoffice/copy-trading/followers", icon: Copy },
      { label: "Copy Settings", href: "/backoffice/copy-trading/settings", icon: Copy },
      { label: "Profit Sharing", href: "/backoffice/copy-trading/profits", icon: Copy },
    ],
  },
  {
    group: "AI Signals",
    icon: Brain,
    items: [
      { label: "Signal List", href: "/backoffice/ai-signals", icon: Brain },
      { label: "Usage Control", href: "/backoffice/ai-signals/usage", icon: Brain },
      { label: "Signal Pool", href: "/backoffice/ai-signals/pool", icon: Brain },
    ],
  },
  {
    group: "Risk",
    icon: AlertTriangle,
    items: [
      { label: "Risk Dashboard", href: "/backoffice/risk", icon: AlertTriangle },
      { label: "Risk Rules", href: "/backoffice/risk/rules", icon: AlertTriangle },
      { label: "Margin Alerts", href: "/backoffice/risk/margin", icon: AlertTriangle },
      { label: "NBP Protection", href: "/backoffice/risk/nbp", icon: AlertTriangle },
    ],
  },
  {
    group: "CRM / Support",
    icon: Headphones,
    items: [
      { label: "Tickets", href: "/backoffice/crm/tickets", icon: Headphones },
      { label: "Interaction Logs", href: "/backoffice/crm/logs", icon: Headphones },
      { label: "Feedback", href: "/backoffice/crm/feedback", icon: Headphones },
    ],
  },
  {
    group: "Marketing",
    icon: Megaphone,
    items: [
      { label: "Campaigns", href: "/backoffice/marketing/campaigns", icon: Megaphone },
      { label: "Messages", href: "/backoffice/marketing/messages", icon: Megaphone },
      { label: "Banner Management", href: "/backoffice/marketing/banners", icon: Megaphone },
      { label: "News / Insights", href: "/backoffice/marketing/news", icon: Megaphone },
    ],
  },
  {
    group: "Reports",
    icon: BarChart3,
    items: [
      { label: "Financial Reports", href: "/backoffice/reports/financial", icon: BarChart3 },
      { label: "Trading Reports", href: "/backoffice/reports/trading", icon: BarChart3 },
      { label: "User Reports", href: "/backoffice/reports/users", icon: BarChart3 },
    ],
  },
  {
    group: "System",
    icon: Settings,
    items: [
      { label: "Roles & Permissions", href: "/backoffice/system/roles", icon: Settings },
      { label: "Config Center", href: "/backoffice/system/config", icon: Settings },
      { label: "API Management", href: "/backoffice/system/api", icon: Settings },
      { label: "Operation Logs", href: "/backoffice/system/logs", icon: Settings },
    ],
  },
];

// 二级菜单项组件
interface SubMenuItemProps {
  item: MenuItem;
  isActive: (href?: string) => boolean;
}

function SubMenuItem({ item, isActive }: SubMenuItemProps) {
  const active = isActive(item.href);
  
  return (
    <Link href={item.href || "#"}>
      <div
        className={cn(
          "flex items-center py-2.5 pl-[48px] pr-3 rounded-lg transition-all duration-200 group",
          active
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <span className={cn("text-sm font-medium", active && "font-semibold")}>
          {item.label}
        </span>
      </div>
    </Link>
  );
}

// 一级菜单项组件
interface MenuItemProps {
  group: MenuGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (href?: string) => boolean;
  collapsed: boolean;
}

function MenuItem({ group, isExpanded, onToggle, isActive, collapsed }: MenuItemProps) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const iconRef = useRef<HTMLDivElement>(null);
  // 检查是否有子菜单被选中
  const hasActiveChild = group.items.some(item => isActive(item.href));

  // 判断是否为选中状态（优先级最高）
  const isSelected = hasActiveChild;
  // 判断是否为 hover 状态（选中状态下不应用 hover 样式）
  const isHovered = hovered && !isSelected;

  // 计算 tooltip 位置
  useEffect(() => {
    if (collapsed && hovered && iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
    }
  }, [collapsed, hovered]);

  return (
    <div className="relative">
      <div
        className={cn(
          "group flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer",
          collapsed
            ? "w-12 h-12 mx-auto justify-center"
            : "px-3 py-2.5",
          // 优先级：选中 > hover > 默认
          isSelected 
            ? "bg-blue-50/60" 
            : isHovered 
              ? "bg-slate-100/80" 
              : ""
        )}
        onClick={() => !collapsed ? onToggle() : onToggle()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 图标容器 */}
        <div
          ref={iconRef}
          className={cn(
            "flex items-center justify-center rounded-lg transition-all duration-200",
            // 优先级：选中 > hover > 默认
            isSelected
              ? "bg-blue-100 text-blue-600"
              : isHovered
                ? "bg-blue-50 text-blue-600"
                : "bg-slate-100 text-slate-500",
            collapsed ? "w-10 h-10" : "w-9 h-9"
          )}
        >
          <group.icon size={18} />
        </div>

        {/* 文字区域 - 收起时不显示 */}
        {!collapsed && (
          <div className="flex items-center flex-1 min-w-0">
            <span
              className={cn(
                "text-sm font-medium flex-1 transition-colors truncate",
                isSelected 
                  ? "text-blue-700" 
                  : isHovered 
                    ? "text-slate-900" 
                    : "text-slate-700"
              )}
            >
              {group.group}
            </span>
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform duration-200 flex-shrink-0 ml-2",
                isSelected 
                  ? "text-blue-500" 
                  : "text-slate-400",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </div>
        )}
      </div>

      {/* Tooltip for collapsed state - 使用 Portal 避免被裁剪 */}
      {collapsed && hovered && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] bg-slate-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-xl pointer-events-none"
          style={{ 
            top: tooltipPos.top, 
            left: tooltipPos.left,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full border-[6px] border-transparent border-r-slate-800" />
          {group.group}
        </div>,
        document.body
      )}

      {/* 二级菜单 - 展开时显示，二级菜单文字与一级菜单文字对齐 */}
      {isExpanded && !collapsed && (
        <div className="mt-1 space-y-0.5">
          {group.items.map((item) => (
            <SubMenuItem key={item.href || item.label} item={item} isActive={isActive} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useBackofficeSidebarStore();
  const [expandedGroup, setExpandedGroup] = useState<string | null>("Dashboard");
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const toggleGroup = (group: string) => {
    setExpandedGroup((prev) => (prev === group ? null : group));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    // 精确匹配
    if (pathname === href) return true;
    // 子路径匹配：href 必须以 "/" 结尾，或者 pathname 在 href 后紧跟 "/"
    // 避免 /backoffice 匹配 /backoffice/xxx，但允许 /backoffice/accounts 匹配 /backoffice/accounts/groups
    if (href === "/backoffice") {
      // /backoffice 只精确匹配首页，不匹配子路径
      return pathname === "/backoffice";
    }
    return pathname.startsWith(href + "/");
  };

  // 根据当前路径自动展开对应的分组
  const currentGroup = menuGroups.find(g => 
    g.items.some(item => isActive(item.href))
  );
  
  // 初始化展开状态
  if (currentGroup && expandedGroup !== currentGroup.group) {
    // 静默更新，不要触发重新渲染
  }

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
          "fixed top-0 left-0 h-full z-50 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80 transition-all duration-300 flex flex-col shadow-sm no-scrollbar",
          sidebarCollapsed ? "w-[80px]" : "w-[260px]",
          sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + Collapse Button */}
        <div className="h-[64px] flex items-center border-b border-slate-100/80 relative px-3">
          <Link href="/backoffice" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-sm font-bold text-slate-800 tracking-tight truncate">
                TradePass
              </span>
            )}
          </Link>
          
          {/* Collapse Toggle Button - 固定在侧边栏竖线正中间 */}
          <button
            onClick={toggleSidebar}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 z-[60]"
            )}
            style={{ right: "-13px" }}
          >
            {sidebarCollapsed ? (
              <ChevronRight size={12} className="text-slate-500" />
            ) : (
              <ChevronLeft size={12} className="text-slate-500" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 no-scrollbar">
          {menuGroups.map((group) => (
            <div key={group.group} className="mb-1">
              <MenuItem
                group={group}
                isExpanded={expandedGroup === group.group}
                onToggle={() => toggleGroup(group.group)}
                isActive={isActive}
                collapsed={sidebarCollapsed}
              />
            </div>
          ))}
        </nav>

        {/* Bottom Help */}
        <div className="p-3 border-t border-slate-100/80">
          {!sidebarCollapsed ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100/50">
              <p className="text-xs font-semibold text-blue-900 mb-0.5">Need help?</p>
              <p className="text-[11px] text-blue-600">Contact support</p>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center mx-auto border border-blue-100/50">
              <Headphones size={16} className="text-blue-600" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
