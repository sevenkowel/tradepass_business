"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Search, Bell, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import { usePortalStore } from "@/store/portalStore";
import { useTheme } from "@/components/ui/ThemeProvider";
import { navItems } from "@/config/portalNav";
import { cn } from "@/lib/utils";

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.replace("/portal", "").split("/").filter(Boolean);

  const getBreadcrumbs = () => {
    const crumbs: { label: string; href: string }[] = [
      { label: "Portal", href: "/portal/dashboard" },
    ];

    let path = "/portal";
    segments.forEach((seg) => {
      path += `/${seg}`;
      const label = seg
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      crumbs.push({ label, href: path });
    });

    return crumbs;
  };

  const crumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={`${crumb.href}-${i}`} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-[var(--foreground)]/30">/</span>}
          <span
            className={cn(
              i === crumbs.length - 1
                ? "text-[var(--foreground)] font-medium"
                : "text-[var(--foreground)]/50 hover:text-[var(--foreground)] cursor-pointer transition-colors"
            )}
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-md bg-[var(--surface-elevated)] border border-[var(--border)]">
      {(["light", "system", "dark"] as const).map((t) => {
        const Icon = t === "light" ? Sun : t === "dark" ? Moon : Monitor;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              "p-1.5 rounded-md transition-all duration-150",
              theme === t
                ? "bg-[var(--surface)] shadow-sm text-[var(--foreground)]"
                : "text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
            )}
            title={t}
          >
            <Icon size={13} />
          </button>
        );
      })}
    </div>
  );
}

export function PortalTopbar() {
  const { setMobileSidebarOpen, sidebarCollapsed, user } = usePortalStore();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-14 z-30",
        "bg-[var(--surface)]/80 backdrop-blur-md border-b border-[var(--border)]",
        "flex items-center px-4 gap-3",
        "transition-all duration-250",
        sidebarCollapsed ? "left-[64px]" : "left-[260px]",
        "max-lg:left-0"
      )}
    >
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden p-2 rounded-md text-[var(--foreground)]/60 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="hidden sm:block flex-1">
        <Breadcrumb />
      </div>

      <div className="flex-1 sm:flex-none" />

      {/* Search */}
      <button className="p-2 rounded-md text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all">
        <Search size={16} />
      </button>

      {/* Theme switcher */}
      <ThemeSwitcher />

      {/* Notifications */}
      <button className="relative p-2 rounded-md text-[var(--foreground)]/50 hover:text-[var(--foreground)] hover:bg-[var(--surface-elevated)] transition-all">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-accent)]" />
      </button>

      {/* User avatar */}
      <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--surface-elevated)] transition-all group">
        <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold">
          {user?.name?.charAt(0) ?? "U"}
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium leading-tight text-[var(--foreground)]">
            {user?.name ?? "User"}
          </div>
          <div className="text-[11px] text-[var(--foreground)]/50 mt-0.5 capitalize">
            {user?.level ?? "standard"}
          </div>
        </div>
        <ChevronDown size={13} className="text-[var(--foreground)]/40 group-hover:text-[var(--foreground)] transition-colors" />
      </button>
    </header>
  );
}
