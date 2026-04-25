import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { transitionKYCStatus, createKYCRecord } from "@/lib/kyc/state-machine";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { regionCode, kycLevel, documents, personalInfo, ocrResult, livenessResult } = body;

    if (!regionCode || !kycLevel) {
      return NextResponse.json({ error: "Missing regionCode or kycLevel" }, { status: 400 });
    }

    // Ensure KYC record exists
    let record = await prisma.kYCRecord.findUnique({ where: { userId: user.id } });
    if (!record) {
      record = await createKYCRecord(user.id, regionCode, kycLevel);
    }

    // Update record with submitted data
    await prisma.kYCRecord.update({
      where: { userId: user.id },
      data: {
        regionCode,
        kycLevel,
        documentType: documents?.type,
        documentFrontUrl: documents?.frontUrl,
        documentBackUrl: documents?.backUrl,
        selfieUrl: documents?.selfieUrl,
        ocrConfidence: ocrResult?.confidence,
        livenessPassed: livenessResult?.passed ?? false,
        personalInfo: personalInfo ? JSON.stringify(personalInfo) : undefined,
      },
    });

    // Transition to submitted
    const result = await transitionKYCStatus(user.id, "submitted");
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "KYC submitted successfully" });
  } catch (err) {
    console.error("KYC submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
