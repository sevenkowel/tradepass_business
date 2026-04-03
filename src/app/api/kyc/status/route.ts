import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/kyc/status
 * 获取用户 KYC 状态
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: 从 session 获取用户 ID
    // const userId = getUserIdFromSession(request);
    
    // Mock 数据 - 实际应从数据库查询
    const mockStatus = {
      status: "not_started",
      currentStep: 1,
      progress: 0,
      canProceed: true,
      requiredActions: [],
    };

    return NextResponse.json({
      success: true,
      data: mockStatus,
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
