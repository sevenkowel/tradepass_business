"use client";

import { Monitor, Globe, Smartphone, Download, ExternalLink } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    id: "mt5",
    name: "MT5",
    description: "专业交易平台",
    icon: Monitor,
    platforms: ["iOS", "Android", "PC", "Mac"],
    action: "下载",
    href: "#download-mt5",
  },
  {
    id: "webtrader",
    name: "WebTrader",
    description: "无需下载，浏览器直接交易",
    icon: Globe,
    action: "打开",
    href: "/portal/trading/web",
  },
  {
    id: "app",
    name: "TradePass App",
    description: "随时随地管理账户",
    icon: Smartphone,
    action: "下载",
    href: "#download-app",
  },
];

export function ToolsDownload() {
  return (
    <section className="py-6 border-b border-gray-100">
      <h3 className="text-sm font-medium text-gray-900 mb-4">交易工具</h3>

      <div className="space-y-3">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center border border-gray-100 rounded-lg">
                <tool.icon size={20} className="text-gray-600" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {tool.name}
                </h4>
                <p className="text-xs text-gray-500">{tool.description}</p>
                {tool.platforms && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tool.platforms.join(" / ")}
                  </p>
                )}
              </div>
            </div>

            <Link
              href={tool.href}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
            >
              {tool.id === "webtrader" ? (
                <ExternalLink size={12} />
              ) : (
                <Download size={12} />
              )}
              {tool.action}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
