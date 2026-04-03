/**
 * KYC 系统配置快捷切换 API
 * POST /api/config/kyc-system/toggle
 */

import { NextRequest, NextResponse } from "next/server";
import {
  toggleStage,
  toggleRegion,
  updateTier,
  updateStage,
  updateRegionFlow,
  updateTierPermissions,
} from "@/lib/kyc/config-service";
import type {
  KYCTier,
  StageConfig,
  RegionKYCFlow,
  TierPermissions,
  VerificationStage,
} from "@/lib/kyc/config-types";
import type { RegionCode } from "@/lib/kyc/region-config";

interface ToggleRequest {
  action: string;
  data?: unknown;
  updatedBy?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ToggleRequest = await request.json();
    const { action, data, updatedBy = "admin" } = body;

    let result: { success: boolean; error?: string };

    switch (action) {
      case "toggleStage": {
        const { stageId, enabled } = data as {
          stageId: VerificationStage;
          enabled: boolean;
        };
        result = await toggleStage(stageId, enabled);
        break;
      }

      case "toggleRegion": {
        const { regionCode, enabled } = data as {
          regionCode: RegionCode;
          enabled: boolean;
        };
        result = await toggleRegion(regionCode, enabled);
        break;
      }

      case "updateTier": {
        const tier = data as KYCTier;
        result = await updateTier(tier);
        break;
      }

      case "updateStage": {
        const stage = data as StageConfig;
        result = await updateStage(stage);
        break;
      }

      case "updateRegionFlow": {
        const flow = data as RegionKYCFlow;
        result = await updateRegionFlow(flow);
        break;
      }

      case "updateTierPermissions": {
        const permissions = data as TierPermissions;
        result = await updateTierPermissions(permissions);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: "Unknown action" },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${action} completed successfully`,
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
        error: error instanceof Error ? error.message : "Toggle failed",
      },
      { status: 500 }
    );
  }
}
