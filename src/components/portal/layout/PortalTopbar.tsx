"use client";

import { Bell, Search, Moon, Sun, Monitor, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ui/ThemeProvider";
import { useState } from "react";
import { usePortalStore } from "@/store/portalStore";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

interface PortalTopbarProps {
  breadcrumbs?: Array<{ label: string; href: string }>;
}

export function PortalTopbar({ breadcrumbs }: PortalTopbarProps) {
  const { theme, setTheme } = useTheme();
  const { sidebarCollapsed } = usePortalStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-4 z-30 transition-all duration-200",
        sidebarCollapsed ? "left-[72px]" : "left-[260px]"
      )}
    >
      {/* Left: Search */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 w-72 border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/10 transition-all">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-gray-700 placeholder:text-gray-400 flex-1 w-full"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="hover:bg-gray-200 rounded p-0.5 transition-colors"
            >
              <X size={14} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="w-9 h-9 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            {theme === "light" && <Sun size={18} className="text-gray-600" />}
            {theme === "dark" && <Moon size={18} className="text-gray-600" />}
            {theme === "system" && <Monitor size={18} className="text-gray-600" />}
          </button>
          <AnimatePresence>
            {showThemeMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute right-0 top-11 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-50"
              >
                <button
                  onClick={() => { setTheme("light"); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Sun size={14} className="text-gray-500" />
                  Light
                </button>
                <button
                  onClick={() => { setTheme("dark"); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Moon size={14} className="text-gray-500" />
                  Dark
                </button>
                <button
                  onClick={() => { setTheme("system"); setShowThemeMenu(false); }}
                  className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <Monitor size={14} className="text-gray-500" />
                  System
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-md hover:bg-gray-100 flex items-center justify-center transition-colors relative">
          <Bell size={18} className="text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
          <div className="w-9 h-9 rounded-full bg-[#1E40AF] flex items-center justify-center">
            <span className="text-white text-xs font-medium">JD</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-xs font-medium text-gray-900">John Doe</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
