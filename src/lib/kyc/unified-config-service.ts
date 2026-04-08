/**
 * 统一 KYC 配置服务
 * 管理 kyc-config-unified.json 的读写、缓存和版本控制
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  UnifiedKYCConfig,
  UnifiedRegionConfig,
  ConfigValidationResult,
  ConfigDiff,
  UnifiedConfigVersion,
} from './unified-config-types';
import type { RegionCode } from './region-config';

// ============================================================
// 配置常量
// ============================================================

const CONFIG_FILE_PATH = path.join(process.cwd(), 'public/data/kyc-config-unified.json');
const HISTORY_DIR = path.join(process.cwd(), 'public/data/kyc-config-history');
const MAX_HISTORY_VERSIONS = 50;

// ============================================================
// 内存缓存
// ============================================================

let configCache: UnifiedKYCConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5秒缓存

// ============================================================
// 辅助函数
// ============================================================

function ensureHistoryDir(): void {
  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

function generateVersion(): string {
  const now = new Date();
  const major = 2;
  const minor = now.getMonth() + 1;
  const patch = Math.floor(now.getTime() / 1000) % 10000;
  return `${major}.${minor}.${patch}`;
}

function getConfigMtime(): number {
  try {
    const stats = fs.statSync(CONFIG_FILE_PATH);
    return stats.mtimeMs;
  } catch {
    return 0;
  }
}

// ============================================================
// 配置验证
// ============================================================

export function validateConfig(config: Partial<UnifiedKYCConfig>): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证必填字段
  if (!config.version) errors.push('Missing required field: version');
  if (!config.global) errors.push('Missing required field: global');
  if (!config.tiers || config.tiers.length === 0) errors.push('Missing required field: tiers');
  if (!config.regions || Object.keys(config.regions).length === 0) {
    errors.push('Missing required field: regions');
  }

  // 验证 tiers
  if (config.tiers) {
    const tierLevels = new Set<number>();
    for (const tier of config.tiers) {
      if (tierLevels.has(tier.level)) {
        errors.push(`Duplicate tier level: ${tier.level}`);
      }
      tierLevels.add(tier.level);

      if (!tier.name) warnings.push(`Tier ${tier.level} is missing name`);
      if (!tier.requiredStages) warnings.push(`Tier ${tier.level} is missing requiredStages`);
    }
  }

  // 验证 regions
  if (config.regions) {
    for (const [code, region] of Object.entries(config.regions)) {
      if (!region.opening) {
        errors.push(`Region ${code}: missing opening configuration`);
      } else {
        if (!region.opening.steps) errors.push(`Region ${code}: missing opening.steps`);
        if (!region.opening.formFields) errors.push(`Region ${code}: missing opening.formFields`);
        if (!region.opening.features) errors.push(`Region ${code}: missing opening.features`);
      }

      if (!region.kyc) {
        errors.push(`Region ${code}: missing kyc configuration`);
      } else {
        if (!region.kyc.upgradePaths) errors.push(`Region ${code}: missing kyc.upgradePaths`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================================
// 配置差异对比
// ============================================================

export function diffConfigs(
  oldConfig: UnifiedKYCConfig,
  newConfig: UnifiedKYCConfig
): ConfigDiff[] {
  const diffs: ConfigDiff[] = [];

  function compare(path: string, oldVal: any, newVal: any): void {
    if (typeof oldVal !== typeof newVal) {
      diffs.push({ path, oldValue: oldVal, newValue: newVal, type: 'modified' });
      return;
    }

    if (typeof oldVal === 'object' && oldVal !== null && newVal !== null) {
      const oldKeys = Object.keys(oldVal);
      const newKeys = Object.keys(newVal);

      // 检查删除的键
      for (const key of oldKeys) {
        if (!newKeys.includes(key)) {
          diffs.push({ path: `${path}.${key}`, oldValue: oldVal[key], newValue: undefined, type: 'removed' });
        }
      }

      // 检查新增和修改的键
      for (const key of newKeys) {
        if (!oldKeys.includes(key)) {
          diffs.push({ path: `${path}.${key}`, oldValue: undefined, newValue: newVal[key], type: 'added' });
        } else {
          compare(`${path}.${key}`, oldVal[key], newVal[key]);
        }
      }
    } else if (oldVal !== newVal) {
      diffs.push({ path, oldValue: oldVal, newValue: newVal, type: 'modified' });
    }
  }

  compare('root', oldConfig, newConfig);
  return diffs;
}

// ============================================================
// 核心服务函数
// ============================================================

/**
 * 读取配置（带缓存）
 */
export async function getConfig(): Promise<UnifiedKYCConfig> {
  const now = Date.now();
  const mtime = getConfigMtime();

  // 检查缓存是否有效
  if (configCache && cacheTimestamp >= mtime && now - cacheTimestamp < CACHE_TTL) {
    return configCache;
  }

  // 读取文件
  const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
  const config: UnifiedKYCConfig = JSON.parse(data);

  // 更新缓存
  configCache = config;
  cacheTimestamp = now;

  return config;
}

/**
 * 强制刷新缓存
 */
export function invalidateCache(): void {
  configCache = null;
  cacheTimestamp = 0;
}

/**
 * 保存配置
 */
export async function saveConfig(
  newConfig: Partial<UnifiedKYCConfig>,
  updatedBy: string,
  reason?: string
): Promise<{ success: boolean; version: string; error?: string }> {
  try {
    // 读取当前配置
    const currentConfig = await getConfig();

    // 合并配置
    const mergedConfig: UnifiedKYCConfig = {
      ...currentConfig,
      ...newConfig,
      // 深度合并 regions
      regions: {
        ...currentConfig.regions,
        ...newConfig.regions,
      },
      // 深度合并 global
      global: {
        ...currentConfig.global,
        ...newConfig.global,
      },
    };

    // 验证配置
    const validation = validateConfig(mergedConfig);
    if (!validation.valid) {
      return {
        success: false,
        version: currentConfig.version,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // 生成新版本
    const newVersion = generateVersion();
    mergedConfig.version = newVersion;
    mergedConfig.updatedAt = new Date().toISOString();
    mergedConfig.updatedBy = updatedBy;
    if (reason) {
      mergedConfig.changelog = reason;
    }

    // 保存历史版本
    ensureHistoryDir();
    const historyFile = path.join(HISTORY_DIR, `${newVersion}.json`);
    fs.writeFileSync(historyFile, JSON.stringify(currentConfig, null, 2));

    // 保存新配置
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(mergedConfig, null, 2));

    // 更新缓存
    configCache = mergedConfig;
    cacheTimestamp = Date.now();

    // 清理旧历史版本
    cleanupHistory();

    return { success: true, version: newVersion };
  } catch (error) {
    return {
      success: false,
      version: configCache?.version || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 更新特定地区配置
 */
export async function updateRegionConfig(
  regionCode: string,
  regionConfig: Partial<UnifiedRegionConfig>,
  updatedBy: string,
  reason?: string
): Promise<{ success: boolean; version: string; error?: string }> {
  const currentConfig = await getConfig();

  const mergedRegion: UnifiedRegionConfig = {
    ...currentConfig.regions[regionCode as RegionCode],
    ...regionConfig,
    code: regionCode as RegionCode,
  };

  return saveConfig(
    {
      regions: {
        ...currentConfig.regions,
        [regionCode]: mergedRegion,
      },
    },
    updatedBy,
    reason || `Updated region ${regionCode} configuration`
  );
}

/**
 * 切换地区启用状态
 */
export async function toggleRegion(
  regionCode: string,
  enabled: boolean,
  updatedBy: string
): Promise<{ success: boolean; version: string; error?: string }> {
  return updateRegionConfig(
    regionCode,
    { enabled },
    updatedBy,
    `${enabled ? 'Enabled' : 'Disabled'} region ${regionCode}`
  );
}

/**
 * 获取配置历史版本列表
 */
export function getHistoryVersions(): UnifiedConfigVersion[] {
  ensureHistoryDir();

  const files = fs.readdirSync(HISTORY_DIR);
  const versions: UnifiedConfigVersion[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const version = file.replace('.json', '');
      const filePath = path.join(HISTORY_DIR, file);
      const stats = fs.statSync(filePath);

      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        versions.push({
          version,
          updatedAt: data.updatedAt || stats.mtime.toISOString(),
          updatedBy: data.updatedBy || 'unknown',
          changes: data.changelog || 'No changelog',
        });
      } catch {
        // 跳过无效文件
      }
    }
  }

  return versions.sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

/**
 * 回滚到指定版本
 */
export async function rollbackToVersion(
  version: string,
  updatedBy: string,
  reason?: string
): Promise<{ success: boolean; version: string; error?: string }> {
  try {
    const historyFile = path.join(HISTORY_DIR, `${version}.json`);

    if (!fs.existsSync(historyFile)) {
      return {
        success: false,
        version: '',
        error: `Version ${version} not found in history`,
      };
    }

    const historyConfig: UnifiedKYCConfig = JSON.parse(
      fs.readFileSync(historyFile, 'utf-8')
    );

    // 生成新版本号（基于回滚）
    const newVersion = generateVersion();
    historyConfig.version = newVersion;
    historyConfig.updatedAt = new Date().toISOString();
    historyConfig.updatedBy = updatedBy;
    historyConfig.changelog = `Rollback to version ${version}${reason ? `: ${reason}` : ''}`;

    // 保存当前配置到历史
    const currentConfig = await getConfig();
    ensureHistoryDir();
    fs.writeFileSync(
      path.join(HISTORY_DIR, `${currentConfig.version}.json`),
      JSON.stringify(currentConfig, null, 2)
    );

    // 写入回滚的配置
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(historyConfig, null, 2));

    // 更新缓存
    configCache = historyConfig;
    cacheTimestamp = Date.now();

    return { success: true, version: newVersion };
  } catch (error) {
    return {
      success: false,
      version: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 清理旧历史版本
 */
function cleanupHistory(): void {
  try {
    const files = fs.readdirSync(HISTORY_DIR);
    const jsonFiles = files
      .filter(f => f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(HISTORY_DIR, f),
        mtime: fs.statSync(path.join(HISTORY_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    // 保留最近的 MAX_HISTORY_VERSIONS 个版本
    if (jsonFiles.length > MAX_HISTORY_VERSIONS) {
      const toDelete = jsonFiles.slice(MAX_HISTORY_VERSIONS);
      for (const file of toDelete) {
        fs.unlinkSync(file.path);
      }
    }
  } catch {
    // 忽略清理错误
  }
}

// ============================================================
// 便捷查询函数
// ============================================================

/**
 * 获取地区配置摘要（用于列表展示）
 */
export async function getRegionSummaries() {
  const config = await getConfig();

  return Object.entries(config.regions).map(([code, region]) => ({
    code,
    name: region.name,
    enabled: region.enabled,
    stepCount: Object.values(region.opening.steps).filter(s => s.enabled).length,
    defaultTier: region.opening.defaultTierOnComplete,
    kycLevel: config.tiers.find(t => t.level === region.opening.defaultTierOnComplete)?.name || 'Unknown',
    lastModified: config.updatedAt,
  }));
}

/**
 * 获取用户的开户流程配置
 */
export async function getOpeningFlowForRegion(regionCode: string) {
  const config = await getConfig();
  const region = config.regions[regionCode as RegionCode];

  if (!region) {
    throw new Error(`Region ${regionCode} not found`);
  }

  return {
    enabled: region.enabled,
    steps: region.opening.steps,
    formFields: region.opening.formFields,
    features: region.opening.features,
    contactVerification: region.opening.contactVerification,
    idNumberPattern: region.opening.idNumberPattern,
    idNumberExample: region.opening.idNumberExample,
  };
}

/**
 * 获取用户的 KYC 升级路径
 */
export async function getUpgradePathsForRegion(regionCode: string, currentTier: number) {
  const config = await getConfig();
  const region = config.regions[regionCode as RegionCode];

  if (!region) {
    throw new Error(`Region ${regionCode} not found`);
  }

  return region.kyc.upgradePaths[currentTier as 0 | 1 | 2 | 3 | 4] || [];
}

/**
 * 获取 Tier 权限配置
 */
export async function getTierPermissions(tierLevel: number) {
  const config = await getConfig();
  return config.tierPermissions[tierLevel as 0 | 1 | 2 | 3 | 4];
}
