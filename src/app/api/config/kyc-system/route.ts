/**
 * KYC 系统配置 API
 * GET /api/config/kyc-system - 获取配置
 * PUT /api/config/kyc-system - 更新配置
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getKYCSystemConfig,
  saveKYCSystemConfig,
  getConfigHistory,
  updateTier,
  updateStage,
  updateRegionFlow,
  updateTierPermissions,
  toggleStage,
  toggleRegion,
} from "@/lib/kyc/config-service";
import type {
  KYCSystemConfig,
  KYCTier,
  StageConfig,
  RegionKYCFlow,
  TierPermissions,
} from "@/lib/kyc/config-types";
import type { RegionCode } from "@/lib/kyc/region-config";

// GET /api/config/kyc-system
export async function GET() {
  try {
    const config = await getKYCSystemConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load config",
      },
      { status: 500 }
    );
  }
}

// PUT /api/config/kyc-system
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { config, reason, updatedBy = "admin" } = body;

    const result = await saveKYCSystemConfig(config, updatedBy, reason);

    if (result.success) {
      return NextResponse.json({
        success: true,
        version: result.version,
        message: "Configuration saved successfully",
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save config",
      },
      { status: 500 }
    );
  }
}
