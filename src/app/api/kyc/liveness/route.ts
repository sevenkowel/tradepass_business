import { NextRequest, NextResponse } from "next/server";
import { mockLivenessCheck } from "@/lib/kyc/mock-service";

/**
 * POST /api/kyc/liveness
 * 活体检测接口 (Mock)
 * 
 * 支持通过 header 控制行为（仅开发环境）：
 * - X-Mock-Liveness-Pass-Rate: 0~1 通过率
 * - X-Mock-Liveness-Force: "pass" | "fail" | "auto"
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

    const forceResult = request.headers.get("X-Mock-Liveness-Force") || "auto";

    // 如果指定了强制结果，直接返回
    if (forceResult === "pass") {
      return NextResponse.json({
        success: true,
        data: {
          passed: true,
          confidence: 0.95,
          actionsDetected: requiredActions,
        },
      });
    }

    if (forceResult === "fail") {
      return NextResponse.json({
        success: true,
        data: {
          passed: false,
          confidence: 0.35,
          actionsDetected: requiredActions.slice(0, 1),
          error: "Face verification failed - DevTool forced failure",
        },
      });
    }

    // 自动模式：读取通过率配置
    const passRate = parseFloat(request.headers.get("X-Mock-Liveness-Pass-Rate") || "0.9");

    if (passRate >= 1) {
      return NextResponse.json({
        success: true,
        data: {
          passed: true,
          confidence: 0.95,
          actionsDetected: requiredActions,
        },
      });
    }

    if (passRate <= 0) {
      return NextResponse.json({
        success: true,
        data: {
          passed: false,
          confidence: 0.35,
          actionsDetected: requiredActions.slice(0, 1),
          error: "Face verification failed - DevTool forced failure",
        },
      });
    }

    // 调用 Mock 活体检测服务（随机结果）
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
