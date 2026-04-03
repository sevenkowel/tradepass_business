import { NextRequest, NextResponse } from "next/server";
import { mockLivenessCheck } from "@/lib/kyc/mock-service";

/**
 * POST /api/kyc/liveness
 * 活体检测接口 (Mock)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoBase64, requiredActions } = body;

    if (!videoBase64 || !requiredActions || !Array.isArray(requiredActions)) {
      return NextResponse.json(
        { error: "Missing required fields: videoBase64, requiredActions" },
        { status: 400 }
      );
    }

    // 调用 Mock 活体检测服务
    const result = await mockLivenessCheck(videoBase64, requiredActions);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Liveness check error:", error);
    return NextResponse.json(
      { error: "Liveness check failed" },
      { status: 500 }
    );
  }
}
