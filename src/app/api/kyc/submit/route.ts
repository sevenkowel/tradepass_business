import { NextRequest, NextResponse } from "next/server";
import { mockKYCReview } from "@/lib/kyc/mock-service";
import type { RegionCode } from "@/lib/kyc/types";

/**
 * POST /api/kyc/submit
 * 提交 KYC 审核
 * 
 * 支持通过 header 控制行为（仅开发环境）：
 * - X-Mock-Review-Force: "approved" | "manual_review" | "rejected" | "auto"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { region, ocrConfidence, livenessPassed } = body;

    if (!region) {
      return NextResponse.json(
        { error: "Missing required field: region" },
        { status: 400 }
      );
    }

    const forceResult = request.headers.get("X-Mock-Review-Force") || "auto";

    let reviewResult;

    if (forceResult !== "auto" && ["approved", "manual_review", "rejected"].includes(forceResult)) {
      // 强制结果模式
      reviewResult = {
        result: forceResult as "approved" | "manual_review" | "rejected",
        confidence: 0.9,
        riskScore: forceResult === "approved" ? 10 : forceResult === "rejected" ? 75 : 45,
        flags: forceResult === "manual_review" ? ["Requires manual verification"] : undefined,
        rejectionReason: forceResult === "rejected" ? "Document verification failed" : undefined,
      };
    } else {
      // 正常 Mock
      reviewResult = await mockKYCReview(
        region as RegionCode,
        ocrConfidence || 0.9,
        livenessPassed !== false
      );
    }

    // 映射审核结果到状态
    let status: string;
    switch (reviewResult.result) {
      case "approved":
        status = "approved";
        break;
      case "manual_review":
        status = "under_review";
        break;
      case "rejected":
        status = "rejected";
        break;
      default:
        status = "under_review";
    }

    return NextResponse.json({
      success: true,
      data: {
        status,
        confidence: reviewResult.confidence,
        riskScore: reviewResult.riskScore,
        flags: reviewResult.flags,
        rejectionReason: reviewResult.rejectionReason,
        estimatedReviewTime: reviewResult.result === "manual_review" 
          ? "1-2 business days" 
          : undefined,
      },
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "KYC submission failed" },
      { status: 500 }
    );
  }
}
