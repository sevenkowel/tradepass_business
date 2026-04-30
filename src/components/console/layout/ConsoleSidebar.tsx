"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Package,
  CreditCard,
  Layers,
  BookOpen,
  Key,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headphones,
  type LucideIcon,
} from "lucide-react";

// 菜单项类型
interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// 菜单分组类型
interface MenuGroup {
  group: string;
  icon: LucideIcon;
  items: MenuItem[];
}

// 菜单配置
const menuGroups: MenuGroup[] = [
  {
    group: "概览",
    icon: LayoutDashboard,
    items: [
      { label: "仪表盘", href: "/console", icon: LayoutDashboard },
    ],
  },
  {
    group: "业务管理",
    icon: Building2,
    items: [
      { label: "租户管理", href: "/console/tenants", icon: Building2 },
      { label: "产品管理", href: "/console/products", icon: Package },
      { label: "产品矩阵", href: "/console/modules", icon: Layers },
    ],
  },
  {
    group: "财务与开发",
    icon: CreditCard,
    items: [
      { label: "账单管理", href: "/console/billing", icon: CreditCard },
      { label: "OAuth2 应用", href: "/console/oauth-apps", icon: Key },
      { label: "API 文档", href: "/console/api-docs", icon: BookOpen },
    ],
  },
];

// 二级菜单项组件
interface SubMenuItemProps {
  item: MenuItem;
  isActive: (href: string) => boolean;
}

function SubMenuItem({ item, isActive }: SubMenuItemProps) {
  const active = isActive(item.href);
  const Icon = item.icon;

  return (
    <Link href={item.href}>
      <div
        className={cn(
          "flex items-center gap-3 py-2.5 pl-3 pr-3 rounded-lg transition-all duration-200",
          active
            ? "bg-blue-50 text-blue-700"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <Icon size={16} className={cn("flex-shrink-0", active ? "text-blue-600" : "text-slate-400")} />
        <span className={cn("text-sm font-medium", active && "font-semibold")}>
          {item.label}
        </span>
      </div>
    </Link>
  );
}

// 一级菜单分组组件
interface MenuGroupProps {
  group: MenuGroup;
  isExpanded: boolean;
  onToggle: () => void;
  isActive: (href: string) => boolean;
  collapsed: boolean;
}

function MenuGroupItem({ group, isExpanded, onToggle, isActive, collapsed }: MenuGroupProps) {
  const [hovered, setHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  // 检查是否有子菜单被选中
  const hasActiveChild = group.items.some(item => isActive(item.href));
  const isHovered = hovered && !hasActiveChild;

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
      {/* 分组标题/按钮 */}
      <div
        className={cn(
          "group flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer",
          collapsed
            ? "w-12 h-12 mx-auto justify-center"
            : "px-3 py-2.5",
          hasActiveChild
            ? "bg-blue-50/60"
            : isHovered
              ? "bg-slate-100/80"
              : ""
        )}
        onClick={() => !collapsed && onToggle()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* 图标容器 */}
        <div
          ref={iconRef}
          className={cn(
            "flex items-center justify-center rounded-lg transition-all duration-200",
            hasActiveChild
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
                hasActiveChild
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
                hasActiveChild ? "text-blue-500" : "text-slate-400",
                isExpanded ? "rotate-180" : ""
              )}
            />
          </div>
        )}
      </div>

      {/* Tooltip for collapsed state */}
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

      {/* 二级菜单 - 展开时显示 */}
      {isExpanded && !collapsed && (
        <div className="mt-1 space-y-0.5 pl-3">
          {group.items.map((item) => (
            <SubMenuItem key={item.href} item={item} isActive={isActive} />
          ))}
        </div>
      )}
    </div>
  );
}

interface ConsoleSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function ConsoleSidebar({ collapsed, onToggle }: ConsoleSidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["概览", "业务管理"]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group)
        ? prev.filter((g) => g !== group)
        : [...prev, group]
    );
  };

  const isActive = (href: string) => {
    if (href === "/console") {
      return pathname === "/console";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // 根据当前路径自动展开对应的分组
  useEffect(() => {
    const currentGroup = menuGroups.find((g) =>
      g.items.some((item) => isActive(item.href))
    );
    if (currentGroup && !expandedGroups.includes(currentGroup.group)) {
      setExpandedGroups((prev) => [...prev, currentGroup.group]);
    }
  }, [pathname]);

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen sticky top-0 z-50 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200/80 transition-all duration-300 flex flex-col shadow-sm shrink-0",
          collapsed ? "w-[80px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo + Collapse Button */}
        <div className="h-[64px] flex items-center border-b border-slate-100/80 relative px-3">
          <Link href="/console" className="flex items-center gap-2.5 flex-1 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-700"
            >
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            {!collapsed && (
              <span className="text-sm font-bold text-slate-800 tracking-tight truncate">
                TradePass
              </span>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggle}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:bg-slate-50 hover:border-blue-300 transition-all duration-200 z-[60]"
            )}
            style={{ right: "-13px" }}
          >
            {collapsed ? (
              <ChevronRight size={12} className="text-slate-500" />
            ) : (
              <ChevronLeft size={12} className="text-slate-500" />
            )}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuGroups.map((group) => (
            <div key={group.group} className="mb-1 px-2">
              <MenuGroupItem
                group={group}
                isExpanded={expandedGroups.includes(group.group)}
                onToggle={() => toggleGroup(group.group)}
                isActive={isActive}
                collapsed={collapsed}
              />
            </div>
          ))}
        </nav>

        {/* Bottom Help */}
        <div className="p-3 border-t border-slate-100/80">
          {!collapsed ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100/50">
              <p className="text-xs font-semibold text-blue-900 mb-0.5">需要帮助?</p>
              <p className="text-[11px] text-blue-600">联系支持团队</p>
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center mx-auto border border-blue-100/50">
              <Headphones size={16} className="text-blue-600" />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Toggle Button - Fixed to header */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-sm border border-slate-200"
      >
        <LayoutDashboard size={20} className="text-slate-600" />
      </button>
    </>
  );
}
