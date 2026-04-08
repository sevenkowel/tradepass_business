/**
 * Portal 完成补充认证阶段 API
 * POST: 完成指定的补充认证阶段
 */

import { NextRequest, NextResponse } from "next/server";
import { supplementalKYCService } from "@/lib/kyc/supplemental-service";
import type { VerificationStage } from "@/lib/kyc/supplemental-types";

// ============================================================
// POST - 完成补充认证阶段
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, stage, data } = body as {
      requestId: string;
      stage: VerificationStage;
      data?: Record<string, unknown>;
    };

    if (!requestId || !stage) {
      return NextResponse.json(
        { success: false, error: "requestId and stage are required" },
        { status: 400 }
      );
    }

    const validStages: VerificationStage[] = ["identity", "liveness", "address", "questionnaire"];
    if (!validStages.includes(stage)) {
      return NextResponse.json(
        { success: false, error: `Invalid stage. Must be one of: ${validStages.join(", ")}` },
        { status: 400 }
      );
    }

    // TODO: 从 session 获取当前用户 ID
    const userId = request.headers.get("x-user-id") || "user-001"; // 临时

    const result = await supplementalKYCService.completeSupplementalStage(
      requestId,
      stage,
      userId,
      data
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to complete supplemental stage:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
