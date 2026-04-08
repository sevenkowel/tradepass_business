/**
 * Portal 补充认证要求 API
 * GET: 获取当前用户的补充认证要求
 */

import { NextRequest, NextResponse } from "next/server";
import { supplementalKYCService } from "@/lib/kyc/supplemental-service";

// ============================================================
// GET - 获取当前用户的补充认证要求
// ============================================================

export async function GET(request: NextRequest) {
  try {
    // TODO: 从 session 获取当前用户 ID
    const userId = request.headers.get("x-user-id") || "user-001"; // 临时

    const status = await supplementalKYCService.getUserSupplementalStatus(userId);

    return NextResponse.json({
      success: true,
      status,
    });
  } catch (error) {
    console.error("Failed to get supplemental requirements:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
