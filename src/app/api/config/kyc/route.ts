import { NextRequest, NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/config/service";
import type { AccountOpeningConfig, ConfigUpdateResponse } from "@/lib/config/types";

/**
 * GET /api/config/kyc
 * Portal & Backoffice 读取开户配置
 *
 * Query params:
 *   - region: string  (可选) 只返回指定地区配置
 *   - fields: string  (可选) 只返回指定字段，逗号分隔（如 "regions,steps"）
 */
export async function GET(request: NextRequest) {
  try {
    const config = getConfig();
    const { searchParams } = new URL(request.url);

    const region = searchParams.get("region");
    const fields = searchParams.get("fields");

    // 只返回指定地区
    if (region) {
      const regionCode = region.toUpperCase();
      const regionConfig = config.regions[regionCode as keyof typeof config.regions];
      if (!regionConfig) {
        return NextResponse.json(
          { error: `Region ${regionCode} not found`, supportedRegions: Object.keys(config.regions) },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        version: config.version,
        region: regionCode,
        data: {
          enabled: config.enabled,
          maintenanceMode: config.maintenanceMode,
          maintenanceMessage: config.maintenanceMessage,
          regionConfig,
          steps: config.steps,
        },
      });
    }

    // 只返回指定字段
    if (fields) {
      const fieldList = fields.split(",");
      const filtered: Record<string, unknown> = { version: config.version };
      const configAsRecord = config as unknown as Record<string, unknown>;

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
      data: config,
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
 * Backoffice 更新开户配置
 *
 * Body:
 *   - config: Partial<AccountOpeningConfig>
 *   - reason?: string  (变更原因)
 *   - updatedBy?: string  (操作人，默认 "admin")
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config: partialConfig, reason, updatedBy } = body;

    if (!partialConfig || typeof partialConfig !== "object") {
      return NextResponse.json(
        { error: "Config object is required" },
        { status: 400 }
      );
    }

    const updated = updateConfig(
      partialConfig as Partial<AccountOpeningConfig>,
      updatedBy || "admin",
      reason
    );

    const response: ConfigUpdateResponse = {
      success: true,
      version: updated.version,
      updatedAt: updated.updatedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating KYC config:", error);
    const message = error instanceof Error ? error.message : "Failed to update configuration";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
