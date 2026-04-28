import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { transitionKYCStatus, createKYCRecord } from "@/lib/kyc/state-machine";
import { getRegionConfig } from "@/lib/kyc/region-config";
import type { RegionCode } from "@/lib/kyc/region-config";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // 兼容前端字段名（前端旧代码用 region / ocrConfidence / livenessPassed）
    const regionCode = (body.regionCode || body.region) as RegionCode | undefined;
    const kycLevel = body.kycLevel;
    const documents = body.documents;
    const personalInfo = body.personalInfo;
    const ocrConfidence =
      body.ocrResult?.confidence ?? body.ocrConfidence ?? undefined;
    const livenessPassed =
      body.livenessResult?.passed ?? body.livenessPassed ?? undefined;

    if (!regionCode) {
      return NextResponse.json(
        { error: "Missing regionCode" },
        { status: 400 }
      );
    }

    // Ensure KYC record exists
    let record = await prisma.kYCRecord.findUnique({
      where: { userId: user.id },
    });

    // 若为新记录且未传 kycLevel，从地区配置推导默认值
    const resolvedKycLevel =
      kycLevel ||
      record?.kycLevel ||
      getRegionConfig(regionCode).kycLevel;

    if (!record) {
      record = await createKYCRecord(user.id, regionCode, resolvedKycLevel);
    }

    // Build update data —— 优先使用前端传来的数据，否则保留已有记录数据
    const updateData: Record<string, unknown> = { regionCode };
    if (resolvedKycLevel) updateData.kycLevel = resolvedKycLevel;
    if (documents?.type) updateData.documentType = documents.type;
    if (documents?.frontUrl) updateData.documentFrontUrl = documents.frontUrl;
    if (documents?.backUrl) updateData.documentBackUrl = documents.backUrl;
    if (documents?.selfieUrl) updateData.selfieUrl = documents.selfieUrl;
    if (ocrConfidence !== undefined) updateData.ocrConfidence = ocrConfidence;
    if (livenessPassed !== undefined)
      updateData.livenessPassed = livenessPassed;
    if (personalInfo) updateData.personalInfo = JSON.stringify(personalInfo);

    // Update record with submitted data
    await prisma.kYCRecord.update({
      where: { userId: user.id },
      data: updateData,
    });

    // Transition to submitted
    const result = await transitionKYCStatus(user.id, "submitted");
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "KYC submitted successfully",
    });
  } catch (err) {
    console.error("KYC submit error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
