/**
 * 开户配置 React Hooks
 * Portal 侧使用，从 API 读取 Backoffice 下发的配置
 */

"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { AccountOpeningConfig, RegionAccountConfig, ContactVerificationConfig } from "./types";
import type { RegionCode } from "@/lib/kyc/region-config";

interface UseKYCConfigResult {
  config: AccountOpeningConfig | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  /** 获取指定地区配置 */
  getRegionConfig: (regionCode: RegionCode) => RegionAccountConfig | undefined;
  /** 获取已启用的地区列表 */
  getEnabledRegions: () => RegionCode[];
  /** 开户是否开放 */
  isOpen: boolean;
  /** 是否维护中 */
  isInMaintenance: boolean;
  /** 维护公告 */
  maintenanceMessage: string;
  /** 当前配置版本 */
  version: string;
}

/**
 * 获取全局开户配置
 */
export function useKYCConfig(): UseKYCConfigResult {
  const [config, setConfig] = useState<AccountOpeningConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config/kyc");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to load config");

      setConfig(data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch KYC config:", err);
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();

    // 每 30 秒轮询配置变更（Backoffice 修改后自动生效）
    pollTimerRef.current = setInterval(fetchConfig, 30_000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [fetchConfig]);

  const getRegionConfig = useCallback(
    (regionCode: RegionCode): RegionAccountConfig | undefined => {
      if (!config) return undefined;
      return config.regions[regionCode];
    },
    [config]
  );

  const getEnabledRegions = useCallback((): RegionCode[] => {
    if (!config) return [];
    return (Object.entries(config.regions) as [RegionCode, RegionAccountConfig][])
      .filter(([, r]) => r.enabled)
      .map(([code]) => code);
  }, [config]);

  return {
    config,
    isLoading,
    error,
    refetch: fetchConfig,
    getRegionConfig,
    getEnabledRegions,
    isOpen: config?.enabled ?? false,
    isInMaintenance: config?.maintenanceMode ?? false,
    maintenanceMessage: config?.maintenanceMessage?.en ?? "",
    version: config?.version ?? "",
  };
}

/**
 * 获取指定地区的 KYC 配置
 */
export function useRegionKYCConfig(regionCode: RegionCode | null) {
  const { config, isLoading, error, refetch } = useKYCConfig();
  const [regionConfig, setRegionConfig] = useState<RegionAccountConfig | null>(null);

  useEffect(() => {
    if (config && regionCode) {
      const rc = config.regions[regionCode];
      setRegionConfig(rc ?? null);
    }
  }, [config, regionCode]);

  return {
    regionConfig,
    steps: config?.steps ?? null,
    defaults: config?.defaults ?? null,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 获取联系信息验证配置（OTP 设置）
 */
export function useContactVerificationConfig(regionCode: RegionCode | null) {
  const { regionConfig, isLoading, error } = useRegionKYCConfig(regionCode);

  const contactConfig: ContactVerificationConfig = regionConfig?.contactVerification ?? {
    phoneOtpRequired: true,
    emailOtpRequired: true,
    skipIfPreVerified: false,
    lockIfPreVerified: true,
  };

  return {
    contactConfig,
    isLoading,
    error,
  };
}

/**
 * 获取资金限额配置（按币种 → KYC 等级）
 * 直接从静态 JSON 读取，不经过兼容层 API
 * @param regionCode 地区代码
 * @param currency 交易账户币种（如 USD/JPY/EUR/USC），不传则使用 default
 */
export function useFundLimitsConfig(regionCode: RegionCode | null, currency?: string) {
  const [regionConfig, setRegionConfig] = useState<RegionAccountConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    if (!regionCode) {
      setRegionConfig(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch("/data/kyc-config.json?t=" + Date.now());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AccountOpeningConfig = await res.json();
      const rc = data.regions[regionCode];
      setRegionConfig(rc ?? null);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch fund limits config:", err);
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setIsLoading(false);
    }
  }, [regionCode]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const fundLimits = useMemo(() => {
    const all = regionConfig?.fundLimits;
    if (!all) return null;
    // 优先查指定币种，没有则回退 default
    if (currency && all[currency]) {
      return all[currency];
    }
    return all["default"] ?? null;
  }, [regionConfig, currency]);

  return {
    fundLimits,
    isLoading,
    error,
  };
}
