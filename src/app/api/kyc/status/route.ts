import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/kyc/status
 * 获取当前登录用户的 KYC 状态
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const record = await prisma.kYCRecord.findUnique({
      where: { userId: user.id },
    });

    if (!record) {
      return NextResponse.json({
        success: true,
        data: {
          status: "not_started",
          currentStep: 1,
          progress: 0,
          canProceed: true,
          requiredActions: [],
        },
      });
    }

    // 计算当前步骤和进度
    let currentStep = 1;
    let progress = 0;
    const status = record.status;

    if (record.documentFrontUrl) {
      currentStep = 2;
      progress += 25;
    }
    if (record.livenessPassed) {
      currentStep = 3;
      progress += 25;
    }
    if (record.personalInfo) {
      currentStep = 4;
      progress += 25;
    }
    if (status === "submitted" || status === "under_review") {
      progress = 100;
    }
    if (status === "approved" || status === "rejected") {
      progress = 100;
    }

    return NextResponse.json({
      success: true,
      data: {
        status: record.status,
        currentStep,
        progress,
        canProceed: !["submitted", "under_review", "approved"].includes(status),
        requiredActions: [],
        rejectionReason: record.rejectionReason || undefined,
        reviewedAt: record.reviewedAt?.toISOString() || undefined,
        kycLevel: record.kycLevel,
        regionCode: record.regionCode,
      },
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
