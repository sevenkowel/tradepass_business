/**
 * Portal 权限检查 API
 * GET: 检查用户是否有权限执行特定操作
 */

import { NextRequest, NextResponse } from "next/server";
import { supplementalKYCService } from "@/lib/kyc/supplemental-service";

// ============================================================
// GET - 检查操作权限
// ============================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") as
      | "deposit"
      | "withdraw"
      | "trade"
      | "open_account"
      | "transfer"
      | null;
    const amount = searchParams.get("amount")
      ? parseFloat(searchParams.get("amount")!)
      : undefined;
    const currency = searchParams.get("currency") || "USD";

    if (!action) {
      return NextResponse.json(
        { success: false, error: "action is required" },
        { status: 400 }
      );
    }

    const validActions = ["deposit", "withdraw", "trade", "open_account", "transfer"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Invalid action. Must be one of: ${validActions.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: 从 session 获取当前用户 ID
    const userId = request.headers.get("x-user-id") || "user-001"; // 临时

    const result = await supplementalKYCService.checkPermission(
      userId,
      action,
      amount,
      currency
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Failed to check permission:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
