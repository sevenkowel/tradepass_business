import { NextRequest, NextResponse } from "next/server";
import {
  toggleRegion,
  toggleAccountOpening,
  toggleMaintenanceMode,
} from "@/lib/config/service";

/**
 * POST /api/config/kyc/toggle
 * 快捷开关操作
 *
 * Body:
 *   - action: "toggleAccountOpening" | "toggleMaintenance" | "toggleRegion"
 *   - region?: string  (action=toggleRegion 时必填)
 *   - enabled: boolean
 *   - updatedBy?: string
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, region, enabled, updatedBy } = body;

    if (typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "enabled (boolean) is required" },
        { status: 400 }
      );
    }

    const operator = updatedBy || "admin";

    switch (action) {
      case "toggleAccountOpening": {
        const config = toggleAccountOpening(enabled, operator);
        return NextResponse.json({
          success: true,
          version: config.version,
          message: `Account opening ${enabled ? "enabled" : "disabled"}`,
        });
      }

      case "toggleMaintenance": {
        const config = toggleMaintenanceMode(enabled, operator);
        return NextResponse.json({
          success: true,
          version: config.version,
          message: `Maintenance mode ${enabled ? "enabled" : "disabled"}`,
        });
      }

      case "toggleRegion": {
        if (!region) {
          return NextResponse.json(
            { error: "region is required for toggleRegion action" },
            { status: 400 }
          );
        }
        const config = toggleRegion(region.toUpperCase(), enabled, operator);
        return NextResponse.json({
          success: true,
          version: config.version,
          message: `Region ${region.toUpperCase()} ${enabled ? "enabled" : "disabled"}`,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error toggling config:", error);
    const message = error instanceof Error ? error.message : "Failed to toggle configuration";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
