import { NextRequest, NextResponse } from "next/server";
import { getConfig as getUnifiedConfig } from "@/lib/kyc/unified-config-service";
import type { ConfigUpdateResponse } from "@/lib/config/types";

/**
 * GET /api/config/kyc
 * Portal & Backoffice 读取开户配置（向后兼容层）
 * 内部转发到新的统一配置系统
 * 
 * ⚠️ 已弃用：请使用 /api/config/kyc-system
 *
 * Query params:
 *   - region: string  (可选) 只返回指定地区配置
 *   - fields: string  (可选) 只返回指定字段，逗号分隔（如 "regions,steps"）
 */
export async function GET(request: NextRequest) {
  try {
    const config = await getUnifiedConfig();
    const { searchParams } = new URL(request.url);

    const region = searchParams.get("region");
    const fields = searchParams.get("fields");

    // 转换为旧格式（兼容层）
    const legacyConfig = {
      version: config.version,
      enabled: config.global.enabled,
      maintenanceMode: config.global.maintenanceMode,
      maintenanceMessage: config.global.maintenanceMessage,
      updatedAt: config.updatedAt,
      updatedBy: config.updatedBy,
      regions: Object.fromEntries(
        Object.entries(config.regions).map(([code, r]) => [
          code,
          {
            enabled: r.enabled,
            kycLevel: config.tiers.find(t => t.level === r.opening.defaultTierOnComplete)?.name.toLowerCase() || 'standard',
            allowedDocuments: r.opening.features.ocrEnabled 
              ? ['id_card', 'passport', 'driving_license'] 
              : [],
            features: {
              ocrEnabled: r.opening.features.ocrEnabled,
              livenessRequired: r.opening.features.livenessRequired,
              addressProofRequired: r.opening.features.addressProofRequired,
              videoKYCRequired: r.opening.features.videoKYCRequired,
            },
            contactVerification: r.opening.contactVerification,
            formFields: r.opening.formFields,
            idNumberPattern: r.opening.idNumberPattern,
            idNumberExample: r.opening.idNumberExample,
          },
        ])
      ),
      steps: {
        document: {
          enabled: Object.values(config.regions)[0]?.opening.steps.document.enabled ?? true,
          requiredDocuments: Object.values(config.regions)[0]?.opening.steps.document.requiredDocuments ?? 1,
          maxFileSize: Object.values(config.regions)[0]?.opening.steps.document.maxFileSize ?? 10,
          allowedFormats: Object.values(config.regions)[0]?.opening.steps.document.allowedFormats ?? ['jpg', 'jpeg', 'png', 'pdf'],
        },
        liveness: {
          enabled: Object.values(config.regions)[0]?.opening.steps.liveness.enabled ?? true,
          maxAttempts: Object.values(config.regions)[0]?.opening.steps.liveness.maxAttempts ?? 3,
          videoDuration: Object.values(config.regions)[0]?.opening.steps.liveness.videoDuration ?? 15,
        },
        personalInfo: {
          enabled: Object.values(config.regions)[0]?.opening.steps.personalInfo.enabled ?? true,
          sections: Object.values(config.regions)[0]?.opening.steps.personalInfo.sections ?? ['basic', 'education', 'investment', 'financial', 'declarations'],
        },
        agreements: {
          enabled: Object.values(config.regions)[0]?.opening.steps.agreements.enabled ?? false,
          requiredAgreements: Object.values(config.regions)[0]?.opening.steps.agreements.requiredAgreements ?? ['terms_of_service', 'risk_disclosure', 'privacy_policy'],
        },
      },
      defaults: {
        defaultRegion: config.global.defaultRegion,
        reviewMode: config.global.reviewMode,
        autoApproveThreshold: config.global.autoApprovalThreshold,
        reviewTimeout: config.global.manualReviewTimeout,
      },
    };

    // 只返回指定地区
    if (region) {
      const regionCode = region.toUpperCase();
      const regionConfig = legacyConfig.regions[regionCode as keyof typeof legacyConfig.regions];
      if (!regionConfig) {
        return NextResponse.json(
          { error: `Region ${regionCode} not found`, supportedRegions: Object.keys(legacyConfig.regions) },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        version: config.version,
        region: regionCode,
        data: {
          enabled: legacyConfig.enabled,
          maintenanceMode: legacyConfig.maintenanceMode,
          maintenanceMessage: legacyConfig.maintenanceMessage,
          regionConfig,
          steps: legacyConfig.steps,
        },
      });
    }

    // 只返回指定字段
    if (fields) {
      const fieldList = fields.split(",");
      const filtered: Record<string, unknown> = { version: legacyConfig.version };
      const configAsRecord = legacyConfig as unknown as Record<string, unknown>;

      for (const field of fieldList) {
        const key = field.trim();
        if (key in configAsRecord) {
          filtered[key] = configAsRecord[key];
        }
      }

      return NextResponse.json({ success: true, data: filtered });
    }

    // 返回完整配置
    return NextResponse.json({
      success: true,
      version: config.version,
      data: legacyConfig,
    });
  } catch (error) {
    console.error("Error reading KYC config:", error);
    return NextResponse.json(
      { error: "Failed to read configuration" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config/kyc
 * Backoffice 更新开户配置（向后兼容层）
 * ⚠️ 已弃用：请使用 PUT /api/config/kyc-system
 */
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: "This endpoint is deprecated. Please use PUT /api/config/kyc-system",
      deprecated: true,
      newEndpoint: "/api/config/kyc-system",
    },
    { status: 410 }
  );
}
