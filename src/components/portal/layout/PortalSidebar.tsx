"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, X, TrendingUp } from "lucide-react";
import { navItems, type NavItem } from "@/config/portalNav";
import { usePortalStore } from "@/store/portalStore";
import { cn } from "@/lib/utils";

function NavItemRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive =
    pathname === item.href ||
    (item.children && item.children.some((c) => pathname.startsWith(c.href)));
  const hasChildren = item.children && item.children.length > 0;
  const [open, setOpen] = useState(isActive || false);

  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  const Icon = item.icon;

  if (!hasChildren) {
    return (
      <Link href={item.href}>
        <motion.div
          whileHover={{ x: collapsed ? 0 : 2 }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer group relative",
            "transition-all duration-150",
            isActive
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
          )}
        >
          <Icon
            size={16}
            className={cn(
              "shrink-0",
              isActive ? "text-white" : "text-[var(--foreground)]/50"
            )}
          />
          {!collapsed && (
            <span className="text-[13px] font-medium truncate">{item.label}</span>
          )}
          {!collapsed && item.badge && (
            <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--color-accent)] text-white">
              {item.badge}
            </span>
          )}
          {/* Tooltip when collapsed */}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[13px] font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {item.label}
            </div>
          )}
        </motion.div>
      </Link>
    );
  }

  return (
    <div>
      <motion.div
        whileHover={{ x: collapsed ? 0 : 2 }}
        onClick={() => !collapsed && setOpen(!open)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer group relative",
          "transition-all duration-150",
          isActive
            ? "text-[var(--color-primary)] font-semibold"
            : "text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
        )}
      >
        <Icon
          size={16}
          className={cn(
            "shrink-0",
            isActive ? "text-[var(--color-primary)]" : "text-[var(--foreground)]/50"
          )}
        />
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium truncate flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--color-accent)] text-white">
                {item.badge}
              </span>
            )}
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} className="opacity-40" />
            </motion.div>
          </>
        )}
        {collapsed && (
          <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[13px] font-medium shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {item.label}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {!collapsed && open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pl-9 pr-2 pb-1 space-y-0.5">
              {item.children!.map((child) => {
                const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                const ChildIcon = child.icon;
                return (
                  <Link key={child.href} href={child.href}>
                    <div
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition-all duration-150",
                        childActive
                          ? "bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-medium"
                          : "text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)]"
                      )}
                    >
                      {ChildIcon && <ChildIcon size={13} className="shrink-0" />}
                      <span>{child.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PortalSidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } =
    usePortalStore();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 260 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col",
          "bg-[var(--surface)] border-r border-[var(--border)]",
          // Mobile
          "lg:translate-x-0",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ willChange: "width" }}
      >
        {/* Logo */}
        <div
          className={cn(
            "h-14 flex items-center shrink-0 border-b border-[var(--border)]",
            sidebarCollapsed ? "justify-center px-3" : "px-4"
          )}
        >
          <Link href="/portal/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[var(--color-primary)] flex items-center justify-center shrink-0 shadow-sm">
              <TrendingUp size={15} className="text-white" />
            </div>
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="font-heading font-semibold text-base text-[var(--foreground)]"
                >
                  TradePass
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Mobile close */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="ml-auto lg:hidden text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 no-scrollbar">
          {navItems.map((item) => (
            <NavItemRow key={item.id} item={item} collapsed={sidebarCollapsed} />
          ))}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden lg:flex items-center justify-end p-3 border-t border-[var(--border)]">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-[var(--foreground)]/40 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all"
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={16} className="-rotate-90" />
            </motion.div>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
