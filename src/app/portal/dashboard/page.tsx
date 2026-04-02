"use client";

import { useState, useEffect } from "react";
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
  UserPerspectiveSwitcher,
} from "@/components/dashboard";
import { UserPerspective } from "@/types/user";
import { getCurrentPerspective, getDashboardConfig, getUserPerspective } from "@/lib/user-perspectives";


export default function DashboardPage() {
  // 获取当前用户视角（开发时可切换）
  const [user, setUser] = useState<UserPerspective>(getCurrentPerspective());

  // 从 localStorage 恢复上次选择的视角
  useEffect(() => {
    const savedPerspectiveId = localStorage.getItem('dashboard_perspective_id');
    if (savedPerspectiveId) {
      setUser(getUserPerspective(savedPerspectiveId));
    }
  }, []);

  // 切换视角时保存到 localStorage
  const handlePerspectiveChange = (perspective: UserPerspective) => {
    setUser(perspective);
    localStorage.setItem('dashboard_perspective_id', perspective.id);
  };
  
  // 获取 Dashboard 配置（基于用户阶段）
  const config = getDashboardConfig(user);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div>
              <h1 className="text-base font-medium text-gray-900">
                欢迎, 用户{user.id.toUpperCase()}
              </h1>
              {user.vipLevel > 0 && (
                <span className="text-xs text-gray-500">
                  VIP {user.vipLevel}
                </span>
              )}
            </div>
            
            {/* 开发调试：用户视角切换器 */}
            <UserPerspectiveSwitcher onChange={handlePerspectiveChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 1. Onboarding Funnel - 用户引导（核心转化） */}
        {config.showOnboarding && <OnboardingFunnel user={user} />}

        {/* 2. 账户概览 + 快捷操作 */}
        <AccountOverview user={user} />
        
        {config.showQuickActions && <QuickActions />}

        {/* 3. 我的交易账户 */}
        {config.showAccounts && <TradingAccounts user={user} />}

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
