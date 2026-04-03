import { NextRequest, NextResponse } from "next/server";
import { mockKYCReview } from "@/lib/kyc/mock-service";
import type { RegionCode } from "@/lib/kyc/types";

/**
 * POST /api/kyc/submit
 * 提交 KYC 审核
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

    // 调用 Mock 审核服务
    const reviewResult = await mockKYCReview(
      region as RegionCode,
      ocrConfidence || 0.9,
      livenessPassed !== false
    );

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
