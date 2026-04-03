/**
 * KYC 系统配置服务
 * 管理 KYC 等级、阶段、地区流程、权限配置的读写
 */

import type {
  KYCSystemConfig,
  KYCTier,
  StageConfig,
  RegionKYCFlow,
  TierPermissions,
  KYCTierLevel,
  VerificationStage,
  KYCConfigVersion,
} from "./config-types";
import {
  DEFAULT_KYC_TIERS,
  DEFAULT_STAGE_CONFIGS,
  DEFAULT_TIER_PERMISSIONS,
} from "./config-types";
import type { RegionCode } from "./region-config";

// ============================================================
// 内存缓存
// ============================================================

let configCache: KYCSystemConfig | null = null;
let configHistory: KYCConfigVersion[] = [];

// ============================================================
// 初始化配置
// ============================================================

function initializeConfig(): KYCSystemConfig {
  return {
    version: "1.0.0",
    updatedAt: new Date().toISOString(),
    updatedBy: "system",
    tiers: [...DEFAULT_KYC_TIERS],
    stageDefinitions: { ...DEFAULT_STAGE_CONFIGS },
    regionFlows: {} as Record<RegionCode, RegionKYCFlow>,
    tierPermissions: { ...DEFAULT_TIER_PERMISSIONS },
    settings: {
      autoApprovalEnabled: true,
      autoApprovalThreshold: 85,
      riskCheckEnabled: true,
      manualReviewTimeout: 24,
      allowRetryOnReject: true,
      maxRetryAttempts: 3,
    },
  };
}

// ============================================================
// 配置读取
// ============================================================

export async function getKYCSystemConfig(): Promise<KYCSystemConfig> {
  if (configCache) {
    return configCache;
  }

  // 尝试从文件读取（服务端）
  try {
    if (typeof window === "undefined") {
      const fs = await import("fs");
      const path = await import("path");
      const configPath = path.join(
        process.cwd(),
        "public/data/kyc-system-config.json"
      );

      if (fs.existsSync(configPath)) {
        const data = fs.readFileSync(configPath, "utf-8");
        configCache = JSON.parse(data) as KYCSystemConfig;
        return configCache;
      }
    }
  } catch {
    // 文件读取失败，使用默认配置
  }

  // 返回默认配置
  configCache = initializeConfig();
  return configCache;
}

// ============================================================
// 配置保存
// ============================================================

export async function saveKYCSystemConfig(
  config: Partial<KYCSystemConfig>,
  updatedBy: string = "admin",
  reason?: string
): Promise<{ success: boolean; version: string; error?: string }> {
  try {
    const currentConfig = await getKYCSystemConfig();

    // 合并配置
    const newConfig: KYCSystemConfig = {
      ...currentConfig,
      ...config,
      version: incrementVersion(currentConfig.version),
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    // 确保嵌套对象正确合并
    if (config.tiers) newConfig.tiers = config.tiers;
    if (config.stageDefinitions)
      newConfig.stageDefinitions = config.stageDefinitions;
    if (config.regionFlows) newConfig.regionFlows = config.regionFlows;
    if (config.tierPermissions)
      newConfig.tierPermissions = config.tierPermissions;
    if (config.settings) newConfig.settings = config.settings;

    // 保存到文件（服务端）
    if (typeof window === "undefined") {
      const fs = await import("fs");
      const path = await import("path");
      const configPath = path.join(
        process.cwd(),
        "public/data/kyc-system-config.json"
      );

      // 确保目录存在
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
    }

    // 更新缓存
    configCache = newConfig;

    // 添加到历史
    configHistory.unshift({
      version: newConfig.version,
      updatedAt: newConfig.updatedAt,
      updatedBy: newConfig.updatedBy,
      changes: reason || "Configuration updated",
    });

    // 限制历史记录数量
    if (configHistory.length > 50) {
      configHistory = configHistory.slice(0, 50);
    }

    return { success: true, version: newConfig.version };
  } catch (error) {
    return {
      success: false,
      version: configCache?.version || "1.0.0",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ============================================================
// 版本号递增
// ============================================================

function incrementVersion(version: string): string {
  const parts = version.split(".").map(Number);
  parts[2] = (parts[2] || 0) + 1;
  if (parts[2] >= 100) {
    parts[2] = 0;
    parts[1] = (parts[1] || 0) + 1;
  }
  if (parts[1] >= 100) {
    parts[1] = 0;
    parts[0] = (parts[0] || 0) + 1;
  }
  return parts.join(".");
}

// ============================================================
// 快捷操作方法
// ============================================================

export async function updateTier(
  tier: KYCTier
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const tiers = config.tiers.map((t) => (t.level === tier.level ? tier : t));
  return saveKYCSystemConfig(
    { tiers },
    "admin",
    `Updated tier ${tier.name} (Level ${tier.level})`
  );
}

export async function updateStage(
  stage: StageConfig
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const stageDefinitions = {
    ...config.stageDefinitions,
    [stage.id]: stage,
  };
  return saveKYCSystemConfig(
    { stageDefinitions },
    "admin",
    `Updated stage ${stage.name}`
  );
}

export async function updateRegionFlow(
  flow: RegionKYCFlow
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const regionFlows = {
    ...config.regionFlows,
    [flow.regionCode]: flow,
  };
  return saveKYCSystemConfig(
    { regionFlows },
    "admin",
    `Updated region flow for ${flow.regionCode}`
  );
}

export async function updateTierPermissions(
  permissions: TierPermissions
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const tierPermissions = {
    ...config.tierPermissions,
    [permissions.tier]: permissions,
  };
  return saveKYCSystemConfig(
    { tierPermissions },
    "admin",
    `Updated permissions for tier ${permissions.tier}`
  );
}

export async function toggleStage(
  stageId: VerificationStage,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const stage = config.stageDefinitions[stageId];
  if (!stage) {
    return { success: false, error: "Stage not found" };
  }

  const stageDefinitions = {
    ...config.stageDefinitions,
    [stageId]: { ...stage, enabled },
  };

  return saveKYCSystemConfig(
    { stageDefinitions },
    "admin",
    `${enabled ? "Enabled" : "Disabled"} stage ${stage.name}`
  );
}

export async function toggleRegion(
  regionCode: RegionCode,
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  const config = await getKYCSystemConfig();
  const flow = config.regionFlows[regionCode];
  if (!flow) {
    return { success: false, error: "Region not found" };
  }

  const regionFlows = {
    ...config.regionFlows,
    [regionCode]: { ...flow, enabled },
  };

  return saveKYCSystemConfig(
    { regionFlows },
    "admin",
    `${enabled ? "Enabled" : "Disabled"} region ${regionCode}`
  );
}

// ============================================================
// 历史记录
// ============================================================

export async function getConfigHistory(): Promise<KYCConfigVersion[]> {
  return configHistory;
}

// ============================================================
// 工具函数
// ============================================================

export function getTierByLevel(
  config: KYCSystemConfig,
  level: KYCTierLevel
): KYCTier | undefined {
  return config.tiers.find((t) => t.level === level);
}

export function getStageById(
  config: KYCSystemConfig,
  stageId: VerificationStage
): StageConfig | undefined {
  return config.stageDefinitions[stageId];
}

export function getRegionFlow(
  config: KYCSystemConfig,
  regionCode: RegionCode
): RegionKYCFlow | undefined {
  return config.regionFlows[regionCode];
}

export function getTierPermissions(
  config: KYCSystemConfig,
  tier: KYCTierLevel
): TierPermissions | undefined {
  return config.tierPermissions[tier];
}

export function calculateTierFromStages(
  config: KYCSystemConfig,
  completedStages: VerificationStage[]
): KYCTierLevel {
  const completedSet = new Set(completedStages);

  // 从高到低检查
  for (let level = 4; level >= 0; level--) {
    const tier = config.tiers.find((t) => t.level === level);
    if (!tier) continue;

    const requiredStages = tier.requiredStages;
    const allCompleted = requiredStages.every((stage) =>
      completedSet.has(stage)
    );

    if (allCompleted) {
      return level as KYCTierLevel;
    }
  }

  return 0;
}
