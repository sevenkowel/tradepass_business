/**
 * KYC 配置迁移脚本
 * 将 kyc-config.json 和 kyc-system-config.json 合并为统一的配置格式
 * 
 * 使用方式:
 * npx ts-node scripts/migrate-kyc-config.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type {
  UnifiedKYCConfig,
  UnifiedRegionConfig,
  OpeningStepsConfig,
  FormFieldsConfig,
  RegionFeatures,
  ContactVerificationConfig,
  UpgradePath,
  RegionSupplementalRules,
  KYCTier,
  StageConfig,
  TierPermissions,
} from '../src/lib/kyc/unified-config-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 地区名称映射
// ============================================================

const REGION_NAMES: Record<string, string> = {
  VN: 'Vietnam',
  TH: 'Thailand',
  IN: 'India',
  AE: 'UAE',
  KR: 'South Korea',
  JP: 'Japan',
  FR: 'France',
  ES: 'Spain',
  BR: 'Brazil',
};

// ============================================================
// 默认步骤配置
// ============================================================

const DEFAULT_OPENING_STEPS: OpeningStepsConfig = {
  document: {
    enabled: true,
    required: true,
    order: 1,
    requiredDocuments: 1,
    maxFileSize: 10,
    allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
  },
  liveness: {
    enabled: true,
    required: true,
    order: 2,
    maxAttempts: 3,
    videoDuration: 15,
  },
  personalInfo: {
    enabled: true,
    required: true,
    order: 3,
    sections: ['basic', 'education', 'investment', 'financial', 'declarations'],
  },
  agreements: {
    enabled: false,
    required: false,
    order: 4,
    requiredAgreements: ['terms_of_service', 'risk_disclosure', 'privacy_policy'],
  },
};

// ============================================================
// KYC Level 到 Tier Level 的映射
// ============================================================

function mapKYCLevelToTier(kycLevel: string): 0 | 1 | 2 | 3 | 4 {
  switch (kycLevel) {
    case 'basic': return 1;
    case 'standard': return 2;
    case 'enhanced': return 3;
    default: return 1;
  }
}

// ============================================================
// 迁移函数
// ============================================================

function migrateRegionConfig(
  regionCode: string,
  oldRegionConfig: any,
  oldSteps: any,
  oldDefaults: any,
  oldRegionFlow: any
): UnifiedRegionConfig {
  // 构建 opening.steps
  const steps: OpeningStepsConfig = {
    document: {
      ...DEFAULT_OPENING_STEPS.document,
      enabled: oldSteps.document?.enabled ?? true,
      requiredDocuments: oldSteps.document?.requiredDocuments ?? 1,
      maxFileSize: oldSteps.document?.maxFileSize ?? 10,
      allowedFormats: oldSteps.document?.allowedFormats ?? ['jpg', 'jpeg', 'png', 'pdf'],
    },
    liveness: {
      ...DEFAULT_OPENING_STEPS.liveness,
      enabled: oldSteps.liveness?.enabled ?? true,
      maxAttempts: oldSteps.liveness?.maxAttempts ?? 3,
      videoDuration: oldSteps.liveness?.videoDuration ?? 15,
    },
    personalInfo: {
      ...DEFAULT_OPENING_STEPS.personalInfo,
      enabled: oldSteps.personalInfo?.enabled ?? true,
      sections: oldSteps.personalInfo?.sections ?? ['basic', 'education', 'investment', 'financial', 'declarations'],
    },
    agreements: {
      ...DEFAULT_OPENING_STEPS.agreements,
      enabled: oldSteps.agreements?.enabled ?? false,
      requiredAgreements: oldSteps.agreements?.requiredAgreements ?? ['terms_of_service', 'risk_disclosure', 'privacy_policy'],
    },
  };

  // 构建 formFields
  const formFields: FormFieldsConfig = {
    personalInfo: oldRegionConfig.formFields?.personalInfo ?? [],
    education: oldRegionConfig.formFields?.education ?? true,
    investmentExperience: oldRegionConfig.formFields?.investmentExperience ?? true,
    financialStatus: oldRegionConfig.formFields?.financialStatus ?? true,
    pepDeclaration: oldRegionConfig.formFields?.pepDeclaration ?? true,
    usPersonDeclaration: oldRegionConfig.formFields?.usPersonDeclaration ?? true,
    professionalDeclaration: oldRegionConfig.formFields?.professionalDeclaration ?? true,
    militaryDeclaration: oldRegionConfig.formFields?.militaryDeclaration ?? false,
  };

  // 构建 features
  const features: RegionFeatures = {
    ocrEnabled: oldRegionConfig.features?.ocrEnabled ?? true,
    ocrProvider: 'tencent',
    livenessRequired: oldRegionConfig.features?.livenessRequired ?? true,
    livenessProvider: 'tencent',
    addressProofRequired: oldRegionConfig.features?.addressProofRequired ?? false,
    videoKYCRequired: oldRegionConfig.features?.videoKYCRequired ?? false,
    agreementEsign: false,
  };

  // 构建 contactVerification
  const contactVerification: ContactVerificationConfig = {
    phoneOtpRequired: oldRegionConfig.contactVerification?.phoneOtpRequired ?? true,
    emailOtpRequired: oldRegionConfig.contactVerification?.emailOtpRequired ?? true,
    skipIfPreVerified: oldRegionConfig.contactVerification?.skipIfPreVerified ?? false,
    lockIfPreVerified: oldRegionConfig.contactVerification?.lockIfPreVerified ?? true,
  };

  // 构建 KYC 升级路径
  const tierRequirements = oldRegionFlow?.tierRequirements ?? {};
  const upgradePaths: Record<0 | 1 | 2 | 3 | 4, UpgradePath[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
  };

  // 根据 tierRequirements 构建升级路径
  for (let tier = 0; tier <= 3; tier++) {
    const targetTier = (tier + 1) as 1 | 2 | 3 | 4;
    const currentStages = tierRequirements[tier] ?? [];
    const targetStages = tierRequirements[targetTier] ?? [];
    
    // 找出需要额外完成的阶段
    const requiredStages = targetStages.filter((s: string) => !currentStages.includes(s)) as any[];
    
    if (requiredStages.length > 0) {
      upgradePaths[tier as 0 | 1 | 2 | 3] = [{
        targetTier,
        requiredStages,
        autoApprove: targetTier <= 2, // Tier 1-2 自动审批，3-4 人工审批
        approverRole: targetTier >= 3 ? 'compliance_officer' : undefined,
      }];
    }
  }

  // 构建补充认证规则
  const supplementalRules: RegionSupplementalRules = {
    largeWithdrawal: {
      enabled: oldRegionFlow?.supplementalRules?.largeWithdrawal?.enabled ?? true,
      condition: 'amount_threshold',
      threshold: oldRegionFlow?.supplementalRules?.largeWithdrawal?.threshold ?? 5000,
      currency: oldRegionFlow?.supplementalRules?.largeWithdrawal?.currency ?? 'USD',
      requireStage: oldRegionFlow?.supplementalRules?.largeWithdrawal?.requireStage ?? 'address',
      messageLocal: oldRegionFlow?.supplementalRules?.largeWithdrawal?.messageLocal ?? {
        en: 'Large withdrawal requires address verification. Please complete address verification to proceed.',
        zh: '大额提款需要地址证明。请完成地址认证以继续。',
      },
    },
    documentExpiry: {
      enabled: oldRegionFlow?.supplementalRules?.documentExpiry?.enabled ?? true,
      warningDays: oldRegionFlow?.supplementalRules?.documentExpiry?.warningDays ?? 30,
      graceDays: oldRegionFlow?.supplementalRules?.documentExpiry?.graceDays ?? 30,
    },
  };

  // 确定默认等级
  const defaultTierOnComplete = oldRegionFlow?.defaultTier ?? mapKYCLevelToTier(oldRegionConfig.kycLevel);

  return {
    code: regionCode as any,
    name: REGION_NAMES[regionCode] || regionCode,
    enabled: oldRegionConfig.enabled ?? true,
    opening: {
      steps,
      formFields,
      features,
      contactVerification,
      idNumberPattern: oldRegionConfig.idNumberPattern,
      idNumberExample: oldRegionConfig.idNumberExample,
      defaultTierOnComplete: defaultTierOnComplete as 0 | 1 | 2 | 3 | 4,
    },
    kyc: {
      upgradePaths,
      supplementalTriggers: supplementalRules,
    },
  };
}

// ============================================================
// 主迁移函数
// ============================================================

function migrateConfig(): void {
  const dataDir = path.join(__dirname, '../public/data');
  
  // 读取旧配置
  const oldSystemConfigPath = path.join(dataDir, 'kyc-system-config.json');
  const oldAccountConfigPath = path.join(dataDir, 'kyc-config.json');
  
  console.log('Reading old configs...');
  
  const oldSystemConfig = JSON.parse(fs.readFileSync(oldSystemConfigPath, 'utf-8'));
  const oldAccountConfig = JSON.parse(fs.readFileSync(oldAccountConfigPath, 'utf-8'));
  
  console.log('Migrating configuration...');
  
  // 迁移地区配置
  const regions: Record<string, UnifiedRegionConfig> = {};
  
  for (const [regionCode, oldRegionConfig] of Object.entries(oldAccountConfig.regions || {})) {
    const oldRegionFlow = oldSystemConfig.regionFlows?.[regionCode];
    
    regions[regionCode] = migrateRegionConfig(
      regionCode,
      oldRegionConfig,
      oldAccountConfig.steps || {},
      oldAccountConfig.defaults || {},
      oldRegionFlow || {}
    );
  }
  
  // 构建统一配置
  const unifiedConfig: UnifiedKYCConfig = {
    version: '2.0.0',
    updatedAt: new Date().toISOString(),
    updatedBy: 'migration-script',
    changelog: 'Migrated from kyc-config.json and kyc-system-config.json to unified format',
    
    global: {
      enabled: oldAccountConfig.enabled ?? true,
      maintenanceMode: oldAccountConfig.maintenanceMode ?? false,
      maintenanceMessage: oldAccountConfig.maintenanceMessage ?? {
        en: 'Account opening is temporarily unavailable. Please try again later.',
        zh: '开户功能暂时维护中，请稍后再试。',
      },
      defaultRegion: oldAccountConfig.defaults?.defaultRegion || 'VN',
      reviewMode: oldAccountConfig.defaults?.reviewMode || 'auto',
      autoApprovalEnabled: oldSystemConfig.settings?.autoApprovalEnabled ?? true,
      autoApprovalThreshold: oldAccountConfig.defaults?.autoApproveThreshold ?? 30,
      riskCheckEnabled: oldSystemConfig.settings?.riskCheckEnabled ?? true,
      manualReviewTimeout: oldAccountConfig.defaults?.reviewTimeout ?? 24,
      allowRetryOnReject: oldSystemConfig.settings?.allowRetryOnReject ?? true,
      maxRetryAttempts: oldSystemConfig.settings?.maxRetryAttempts ?? 3,
      sessionTimeout: 30,
    },
    
    tiers: oldSystemConfig.tiers || [],
    
    stageDefinitions: oldSystemConfig.stageDefinitions || {},
    
    regions,
    
    tierPermissions: oldSystemConfig.tierPermissions || {},
  };
  
  // 写入新配置
  const outputPath = path.join(dataDir, 'kyc-config-unified.json');
  fs.writeFileSync(outputPath, JSON.stringify(unifiedConfig, null, 2) as any);
  
  console.log(`✅ Migration complete!`);
  console.log(`📄 Output: ${outputPath}`);
  console.log(`📊 Statistics:`);
  console.log(`   - Regions: ${Object.keys(regions).length}`);
  console.log(`   - Tiers: ${unifiedConfig.tiers.length}`);
  console.log(`   - Stages: ${Object.keys(unifiedConfig.stageDefinitions).length}`);
  
  // 生成迁移报告
  const report = {
    timestamp: new Date().toISOString(),
    sourceFiles: ['kyc-system-config.json', 'kyc-config.json'],
    outputFile: 'kyc-config-unified.json',
    statistics: {
      regions: Object.keys(regions).length,
      tiers: unifiedConfig.tiers.length,
      stages: Object.keys(unifiedConfig.stageDefinitions).length,
    },
    regions: Object.keys(regions),
    warnings: [],
  };
  
  // 检查潜在问题
  for (const [code, region] of Object.entries(regions)) {
    const r = region as UnifiedRegionConfig;
    if (!r.opening.formFields.personalInfo || r.opening.formFields.personalInfo.length === 0) {
      (report.warnings as string[]).push(`Region ${code}: No personal info fields configured`);
    }
  }
  
  const reportPath = path.join(dataDir, 'kyc-config-migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`📋 Report: ${reportPath}`);
  
  if (report.warnings.length > 0) {
    console.log(`⚠️  Warnings:`);
    report.warnings.forEach(w => console.log(`   - ${w}`));
  }
}

// 运行迁移
migrateConfig();
