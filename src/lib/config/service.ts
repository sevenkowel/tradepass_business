/**
 * 开户配置服务
 * 读写 public/data/kyc-config.json，内存缓存，版本历史
 */

import fs from "fs";
import path from "path";
import type { AccountOpeningConfig, ConfigVersion } from "./types";

const CONFIG_PATH = path.join(process.cwd(), "public", "data", "kyc-config.json");
const HISTORY_PATH = path.join(process.cwd(), "public", "data", "kyc-config-history.json");

// 内存缓存
let configCache: AccountOpeningConfig | null = null;
let cacheVersion: string | null = null;

/**
 * 读取配置文件
 */
export function readConfigFile(): AccountOpeningConfig {
  const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw) as AccountOpeningConfig;
}

/**
 * 写入配置文件
 */
export function writeConfigFile(config: AccountOpeningConfig): void {
  // 确保目录存在
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * 获取配置（带缓存）
 */
export function getConfig(): AccountOpeningConfig {
  if (configCache && configCache.version === cacheVersion) {
    return configCache;
  }
  configCache = readConfigFile();
  cacheVersion = configCache.version;
  return configCache;
}

/**
 * 更新配置
 */
export function updateConfig(
  partial: Partial<AccountOpeningConfig>,
  updatedBy: string,
  reason?: string
): AccountOpeningConfig {
  const current = getConfig();
  const oldVersion = current.version;

  // 递增版本号
  const versionParts = oldVersion.split(".");
  const newPatch = parseInt(versionParts[2] || "0") + 1;
  const newVersion = `${versionParts[0]}.${versionParts[1] || "0"}.${newPatch}`;

  // 合并配置
  const merged: AccountOpeningConfig = {
    ...current,
    ...partial,
    version: newVersion,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  // 深合并 regions
  if (partial.regions) {
    merged.regions = {
      ...current.regions,
      ...partial.regions,
    } as AccountOpeningConfig["regions"];
    // 对每个 region 做深合并
    for (const [code, regionPartial] of Object.entries(partial.regions)) {
      if (current.regions[code as keyof typeof current.regions]) {
        (merged.regions as Record<string, unknown>)[code] = {
          ...(current.regions[code as keyof typeof current.regions] as object),
          ...regionPartial,
        };
      }
    }
  }

  // 深合并 steps
  if (partial.steps) {
    merged.steps = {
      ...current.steps,
      ...partial.steps,
    };
    for (const [step, stepPartial] of Object.entries(partial.steps)) {
      const currentSteps = current.steps as unknown as Record<string, unknown>;
      const mergedSteps = merged.steps as unknown as Record<string, unknown>;
      mergedSteps[step] = {
        ...(currentSteps[step] as object || {}),
        ...stepPartial,
      };
    }
  }

  // 深合并 defaults
  if (partial.defaults) {
    merged.defaults = {
      ...current.defaults,
      ...partial.defaults,
    };
  }

  // 记录版本历史
  const changes = reason || `Config updated to v${newVersion}`;
  appendHistory(newVersion, updatedBy, changes);

  // 写入文件 + 刷新缓存
  writeConfigFile(merged);
  configCache = merged;
  cacheVersion = newVersion;

  return merged;
}

/**
 * 切换地区启用/禁用
 */
export function toggleRegion(
  regionCode: string,
  enabled: boolean,
  updatedBy: string
): AccountOpeningConfig {
  const config = getConfig();
  const regions = config.regions as Record<string, unknown>;

  if (!regions[regionCode]) {
    throw new Error(`Region ${regionCode} not found`);
  }

  return updateConfig(
    {
      regions: {
        ...config.regions,
        [regionCode]: {
          ...regions[regionCode],
          enabled,
        },
      },
    } as Partial<AccountOpeningConfig>,
    updatedBy,
    `Region ${regionCode} ${enabled ? "enabled" : "disabled"}`
  );
}

/**
 * 切换全局开户开关
 */
export function toggleAccountOpening(
  enabled: boolean,
  updatedBy: string
): AccountOpeningConfig {
  return updateConfig({ enabled }, updatedBy, `Account opening ${enabled ? "enabled" : "disabled"}`);
}

/**
 * 切换维护模式
 */
export function toggleMaintenanceMode(
  enabled: boolean,
  updatedBy: string
): AccountOpeningConfig {
  return updateConfig(
    { maintenanceMode: enabled },
    updatedBy,
    `Maintenance mode ${enabled ? "enabled" : "disabled"}`
  );
}

/**
 * 更新地区 KYC 配置
 */
export function updateRegionConfig(
  regionCode: string,
  regionConfig: Record<string, unknown>,
  updatedBy: string
): AccountOpeningConfig {
  const config = getConfig();
  const regions = config.regions as Record<string, unknown>;

  if (!regions[regionCode]) {
    throw new Error(`Region ${regionCode} not found`);
  }

  return updateConfig(
    {
      regions: {
        ...config.regions,
        [regionCode]: {
          ...regions[regionCode],
          ...regionConfig,
        },
      },
    } as Partial<AccountOpeningConfig>,
    updatedBy,
    `Region ${regionCode} config updated`
  );
}

/**
 * 更新步骤配置
 */
export function updateStepConfig(
  stepName: string,
  stepConfig: Record<string, unknown>,
  updatedBy: string
): AccountOpeningConfig {
  const config = getConfig();
  const steps = config.steps as unknown as Record<string, unknown>;

  if (!steps[stepName]) {
    throw new Error(`Step ${stepName} not found`);
  }

  const mergedSteps = {
    ...config.steps,
    [stepName]: {
      ...(steps[stepName] as object),
      ...stepConfig,
    },
  };

  return updateConfig(
    {
      steps: mergedSteps,
    } as Partial<AccountOpeningConfig>,
    updatedBy,
    `Step ${stepName} config updated`
  );
}

// ============================================================
// 版本历史
// ============================================================

function readHistory(): ConfigVersion[] {
  try {
    if (!fs.existsSync(HISTORY_PATH)) return [];
    const raw = fs.readFileSync(HISTORY_PATH, "utf-8");
    return JSON.parse(raw) as ConfigVersion[];
  } catch {
    return [];
  }
}

function appendHistory(version: string, updatedBy: string, changes: string): void {
  const history = readHistory();
  history.unshift({
    version,
    updatedAt: new Date().toISOString(),
    updatedBy,
    changes,
  });
  // 只保留最近 50 条
  if (history.length > 50) history.length = 50;
  const dir = path.dirname(HISTORY_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2), "utf-8");
}

export function getHistory(): ConfigVersion[] {
  return readHistory();
}

/**
 * 回滚到指定版本（暂未实现完整回滚逻辑，仅标记）
 */
export function rollbackToVersion(
  targetVersion: string,
  updatedBy: string
): AccountOpeningConfig {
  // 目前只是更新版本号标记，真实回滚需要保存每个版本的快照
  return updateConfig({}, updatedBy, `Rollback to v${targetVersion} requested`);
}
