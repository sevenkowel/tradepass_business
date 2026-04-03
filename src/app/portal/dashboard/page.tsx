"use client";

import {
  OnboardingFunnel,
  AccountOverview,
  QuickActions,
  TradingAccounts,
  Promotions,
  MarketOpportunities,
  ToolsDownload,
  Announcements,
  TrustSection,
} from "@/components/dashboard";
import { useDevConfig } from "@/lib/dev-config";
import { getDashboardConfig } from "@/lib/user-perspectives";

export default function DashboardPage() {
  // 使用开发者配置中的视角
  const { currentPerspective } = useDevConfig();
  
  // 获取 Dashboard 配置（基于用户阶段）
  const config = getDashboardConfig(currentPerspective);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div>
              <h1 className="text-base font-medium text-gray-900">
                欢迎, 用户{currentPerspective.id.toUpperCase()}
              </h1>
              {currentPerspective.vipLevel > 0 && (
                <span className="text-xs text-gray-500">
                  VIP {currentPerspective.vipLevel}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Onboarding Funnel - 用户引导（核心转化） */}
        {config.showOnboarding && <OnboardingFunnel user={currentPerspective} />}

        {/* 2. 账户概览 + 快捷操作 */}
        <AccountOverview user={currentPerspective} />
        
        {config.showQuickActions && <QuickActions />}

        {/* 3. 我的交易账户 */}
        {config.showAccounts && <TradingAccounts user={currentPerspective} />}

        {/* 4. 热门活动 */}
        {config.showPromotions && <Promotions />}

        {/* 5. 市场机会 / AI Signals */}
        {config.showMarketOpportunities && <MarketOpportunities />}

        {/* 6. 交易工具下载 */}
        <ToolsDownload />

        {/* 7. 公告通知 */}
        <Announcements />

        {/* 8. 监管 & 安全背书 */}
        <TrustSection />
      </main>
    </div>
  );
}
