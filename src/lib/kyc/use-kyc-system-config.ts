/**
 * KYC System Config Hook
 * Portal 端读取统一 KYC 配置的 Hook
 * 
 * 替代原有的 useAccountConfig，支持新的统一配置格式
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { UnifiedKYCConfig, UnifiedRegionConfig } from "./unified-config-types";
import type { RegionCode } from "./region-config";

interface UseKYCSystemConfigReturn {
  config: UnifiedKYCConfig | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getRegionConfig: (regionCode: string) => UnifiedRegionConfig | null;
}

const CONFIG_CACHE_KEY = "kyc-system-config-cache";
const CONFIG_VERSION_KEY = "kyc-system-config-version";
const POLLING_INTERVAL = 30000; // 30秒轮询

/**
 * 读取统一 KYC 配置
 * 支持缓存和版本检测
 */
export function useKYCSystemConfig(): UseKYCSystemConfigReturn {
  const [config, setConfig] = useState<UnifiedKYCConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastVersionRef = useRef<string>('');

  const fetchConfig = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const response = await fetch("/api/config/kyc-system");
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }

      const data: UnifiedKYCConfig = await response.json();

      // 版本检测：如果版本变化，更新缓存
      if (data.version !== lastVersionRef.current) {
        lastVersionRef.current = data.version;
        setConfig(data);

        // 更新本地缓存
        if (typeof window !== "undefined") {
          localStorage.setItem(CONFIG_CACHE_KEY, JSON.stringify(data));
          localStorage.setItem(CONFIG_VERSION_KEY, String(data.version));
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);

      // 如果请求失败，尝试使用缓存
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem(CONFIG_CACHE_KEY);
        if (cached && !config) {
          try {
            const parsed = JSON.parse(cached);
            setConfig(parsed);
          } catch {
            // 缓存解析失败，忽略
          }
        }
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [config]);

  // 初始加载
  useEffect(() => {
    // 尝试从缓存加载
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(CONFIG_CACHE_KEY);
      const cachedVersion = localStorage.getItem(CONFIG_VERSION_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setConfig(parsed);
          lastVersionRef.current = cachedVersion || '';
          setLoading(false);
        } catch {
          // 缓存解析失败，继续请求
        }
      }
    }

    fetchConfig();

    // 启动轮询
    pollingRef.current = setInterval(() => {
      fetchConfig(true);
    }, POLLING_INTERVAL);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchConfig]);

  // 获取指定地区配置
  const getRegionConfig = useCallback(
    (regionCode: string): UnifiedRegionConfig | null => {
      if (!config) return null;
      return config.regions[regionCode.toUpperCase() as RegionCode] || null;
    },
    [config]
  );

  return {
    config,
    loading,
    error,
    refetch: () => fetchConfig(),
    getRegionConfig,
  };
}

/**
 * 获取开户流程步骤
 * 根据地区配置返回启用的步骤列表
 */
export function useOpeningSteps(regionCode: string) {
  const { config, loading, error } = useKYCSystemConfig();

  const steps = (() => {
    if (!config) return [];
    const region = config.regions[regionCode.toUpperCase() as RegionCode];
    if (!region) return [];

    const { steps } = region.opening;
    return [
      { id: "document", ...steps.document, order: 1 },
      { id: "liveness", ...steps.liveness, order: 2 },
      { id: "personalInfo", ...steps.personalInfo, order: 3 },
      { id: "agreements", ...steps.agreements, order: 4 },
    ]
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);
  })();

  return { steps, loading, error };
}

/**
 * 获取 KYC 升级路径
 */
export function useKYCUpgradePaths(regionCode: string, currentTier: number) {
  const { config, loading, error } = useKYCSystemConfig();

  const upgradePaths = (() => {
    if (!config) return [];
    const region = config.regions[regionCode.toUpperCase() as RegionCode];
    if (!region) return [];

    return region.kyc.upgradePaths[currentTier as 0 | 1 | 2 | 3 | 4] || [];
  })();

  const targetTier = upgradePaths[0]?.targetTier || null;
  const requiredStages = upgradePaths[0]?.requiredStages || [];

  return {
    upgradePaths,
    targetTier,
    requiredStages,
    loading,
    error,
  };
}

/**
 * 获取用户当前 Tier 信息
 */
export function useUserTier(tierLevel: number) {
  const { config, loading, error } = useKYCSystemConfig();

  const tier = config?.tiers.find((t) => t.level === tierLevel);
  const permissions = config?.tierPermissions[tierLevel as 0 | 1 | 2 | 3 | 4];

  return {
    tier,
    permissions,
    loading,
    error,
  };
}

/**
 * 检查功能权限
 */
export function useTierPermission(tierLevel: number, permission: string): boolean {
  const { permissions } = useUserTier(tierLevel);
  return (permissions as Record<string, boolean> | undefined)?.[permission] ?? false;
}

/**
 * 获取补充认证规则
 */
export function useSupplementalRules(regionCode: string) {
  const { config, loading, error } = useKYCSystemConfig();

  const rules = (() => {
    if (!config) return null;
    const region = config.regions[regionCode.toUpperCase() as RegionCode];
    if (!region) return null;
    return region.kyc.supplementalTriggers;
  })();

  return { rules, loading, error };
}

/**
 * 检查是否需要补充认证
 */
export function useShouldTriggerSupplemental(
  regionCode: string,
  tierLevel: number,
  context: {
    transactionAmount?: number;
    daysSinceOnboarding?: number;
  }
): { shouldTrigger: boolean; triggeredRule: string | null } {
  const { rules, loading } = useSupplementalRules(regionCode);

  if (loading || !rules) {
    return { shouldTrigger: false, triggeredRule: null };
  }

  // 检查大额提现规则
  if (rules.largeWithdrawal?.enabled) {
    if (
      context.transactionAmount &&
      rules.largeWithdrawal.threshold &&
      context.transactionAmount >= rules.largeWithdrawal.threshold
    ) {
      return { shouldTrigger: true, triggeredRule: "largeWithdrawal" };
    }
  }

  // 检查时间规则
  if (rules.timeBased?.enabled) {
    if (
      context.daysSinceOnboarding &&
      rules.timeBased.daysSinceOnboarding &&
      context.daysSinceOnboarding >= rules.timeBased.daysSinceOnboarding
    ) {
      return { shouldTrigger: true, triggeredRule: "timeBased" };
    }
  }

  return { shouldTrigger: false, triggeredRule: null };
}
