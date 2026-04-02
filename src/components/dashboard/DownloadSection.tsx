"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Smartphone,
  Monitor,
  Apple,
  Globe,
  Download,
  ExternalLink,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Platform = "ios" | "android" | "windows" | "mac" | "unknown";

function detectPlatform(): Platform {
  if (typeof window === "undefined") return "unknown";

  const userAgent = window.navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) return "ios";
  if (/android/.test(userAgent)) return "android";
  if (/macintosh|mac os x/.test(userAgent)) return "mac";
  if (/windows/.test(userAgent)) return "windows";

  return "unknown";
}

interface DownloadOption {
  id: string;
  icon: React.ElementType;
  label: string;
  platform: Platform;
  href: string;
}

const mt5Options: DownloadOption[] = [
  { id: "ios", icon: Smartphone, label: "iOS", platform: "ios", href: "#" },
  {
    id: "android",
    icon: Smartphone,
    label: "Android",
    platform: "android",
    href: "#",
  },
  { id: "windows", icon: Monitor, label: "PC", platform: "windows", href: "#" },
  { id: "mac", icon: Apple, label: "Mac", platform: "mac", href: "#" },
];

export function DownloadSection() {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    setPlatform(detectPlatform());
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2 mb-4">
        <span className="text-lg">📱</span>
        开始交易
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* MT5 Download */}
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">MT5</h3>
              <p className="text-xs text-gray-500">专业交易平台</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            {mt5Options.map((option) => {
              const Icon = option.icon;
              const isActive = platform === option.platform;
              return (
                <Link key={option.id} href={option.href}>
                  <div
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg transition-all cursor-pointer",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 hover:bg-blue-100"
                    )}
                  >
                    <Icon size={16} />
                    <span className="text-[10px] font-medium">
                      {option.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <button className="w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <Download size={16} />
            下载 MT5
          </button>
        </div>

        {/* WebTrader */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">WebTrader</h3>
              <p className="text-xs text-gray-500">无需下载，即开即交易</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            通过浏览器直接交易，支持所有主流功能，随时随地访问您的账户。
          </p>

          <Link href="/portal/webtrader">
            <button className="w-full py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
              <ExternalLink size={16} />
              立即交易
            </button>
          </Link>
        </div>

        {/* Mobile App QR */}
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">TradePass App</h3>
              <p className="text-xs text-gray-500">随时随地交易</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg bg-white border-2 border-dashed border-purple-200 flex items-center justify-center">
              <QrCode size={32} className="text-purple-300" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-2">
                扫描二维码下载 App
              </p>
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Apple size={16} className="text-gray-700" />
                </div>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                  <Smartphone size={16} className="text-gray-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
