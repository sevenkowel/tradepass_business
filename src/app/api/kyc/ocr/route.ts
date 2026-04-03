import { NextRequest, NextResponse } from "next/server";
import { mockOCR } from "@/lib/kyc/mock-service";
import type { DocumentType } from "@/lib/kyc/region-config";

/**
 * POST /api/kyc/ocr
 * OCR 识别接口 (Mock)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { documentType, imageBase64 } = body;

    if (!documentType || !imageBase64) {
      return NextResponse.json(
        { error: "Missing required fields: documentType, imageBase64" },
        { status: 400 }
      );
    }

    // 验证证件类型
    const validTypes: DocumentType[] = ["id_card", "passport", "driving_license"];
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: "Invalid document type" },
        { status: 400 }
      );
    }

    // 调用 Mock OCR 服务
    const result = await mockOCR(documentType, imageBase64);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("OCR processing error:", error);
    return NextResponse.json(
      { error: "OCR processing failed" },
      { status: 500 }
    );
  }
}
