/**
 * KYC 系统配置历史记录 API
 * GET /api/config/kyc-system/history
 */

import { NextResponse } from "next/server";
import { getConfigHistory } from "@/lib/kyc/config-service";

export async function GET() {
  try {
    const history = await getConfigHistory();
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load history",
      },
      { status: 500 }
    );
  }
}
