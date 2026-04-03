import { NextRequest, NextResponse } from "next/server";
import { mockOCR } from "@/lib/kyc/mock-service";
import type { DocumentType } from "@/lib/kyc/region-config";

/**
 * POST /api/kyc/ocr
 * OCR 识别接口 (Mock)
 * 
 * 支持通过 header 控制行为（仅开发环境）：
 * - X-Mock-OCR-Confidence: 0.7~0.99
 * - X-Mock-OCR-Error: "true" 模拟失败
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

    // 检查是否模拟 OCR 失败
    const simulateError = request.headers.get("X-Mock-OCR-Error") === "true";
    if (simulateError) {
      return NextResponse.json({
        success: false,
        error: "OCR engine error: Unable to process document image. Please ensure the image is clear and well-lit.",
      });
    }

    // 调用 Mock OCR 服务
    const result = await mockOCR(documentType, imageBase64);

    // 如果指定了置信度，覆盖结果
    const customConfidence = parseFloat(request.headers.get("X-Mock-OCR-Confidence") || "0");
    if (customConfidence >= 0.7 && customConfidence <= 0.99) {
      result.confidence = customConfidence;
    }

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
