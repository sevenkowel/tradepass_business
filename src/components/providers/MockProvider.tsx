'use client';

import { useEffect, useState } from 'react';
import { enableMockMode } from '@/lib/mock';

/**
 * MockProvider - 启用纯前端 Mock 模式
 * 
 * 功能：
 * 1. 自动启用 API Mock
 * 2. 提供全局调试工具
 * 3. 显示 Mock 模式指示器
 */
export function MockProvider({ children }: { children: React.ReactNode }) {
  const [isMockEnabled, setIsMockEnabled] = useState(false);

  useEffect(() => {
    // 检查是否开启 Mock 模式
    const urlParams = new URLSearchParams(window.location.search);
    const hasMockParam = urlParams.get('mock') === 'true';
    const hasMockCookie = document.cookie.includes('mock_mode=true');
    
    if (hasMockParam || hasMockCookie) {
      enableMockMode();
      setIsMockEnabled(true);
      
      // 移除 URL 中的 mock 参数（避免分享链接时带参数）
      if (hasMockParam) {
        urlParams.delete('mock');
        const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  return (
    <>
      {children}
      {isMockEnabled && <MockIndicator />}
    </>
  );
}

/**
 * Mock 模式指示器
 */
function MockIndicator() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end gap-2">
      {isExpanded && (
        <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xl max-w-xs text-sm">
          <h4 className="font-semibold mb-2">🎭 Mock Demo 模式</h4>
          <p className="text-slate-300 mb-3">
            所有数据存储在浏览器 LocalStorage 中，刷新不丢失。
          </p>
          
          <div className="space-y-2">
            <div className="flex gap-2">
              <button
                onClick={() => (window as any).MockTools?.switchUser('admin@tradepass.io')}
                className="flex-1 bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs"
              >
                切到平台管理员
              </button>
              <button
                onClick={() => (window as any).MockTools?.switchUser('owner@demobroker.com')}
                className="flex-1 bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded text-xs"
              >
                切到租户管理员
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => (window as any).MockTools?.switchUser('admin@demobroker.com')}
                className="flex-1 bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded text-xs"
              >
                切到 CRM 管理员
              </button>
              <button
                onClick={() => (window as any).MockTools?.switchUser('user@example.com')}
                className="flex-1 bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded text-xs"
              >
                切到普通用户
              </button>
            </div>
            <hr className="border-slate-700 my-2" />
            <button
              onClick={() => (window as any).MockTools?.reset()}
              className="w-full bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-xs"
            >
              🔄 重置所有数据
            </button>
          </div>
          
          <p className="text-slate-500 text-xs mt-3">
            控制台输入 MockTools 查看更多命令
          </p>
        </div>
      )}
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2 font-medium"
      >
        <span>🎭</span>
        <span>Mock 模式</span>
        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
          {isExpanded ? '收起' : '展开'}
        </span>
      </button>
    </div>
  );
}
