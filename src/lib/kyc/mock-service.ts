/**
 * eKYC Mock 服务
 * 模拟 OCR 识别、活体检测和审核流程
 */

import type { OCRResult } from "./types";
import type { DocumentType, RegionCode } from "./region-config";

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 模拟 OCR 结果
const mockOCRResults: Record<DocumentType, Partial<OCRResult>> = {
  id_card: {
    documentType: "id_card",
    fullName: "NGUYEN VAN A",
    idNumber: "012345678901",
    dateOfBirth: "1990-01-01",
    nationality: "Vietnamese",
    expiryDate: "2030-01-01",
    address: "123 Le Loi Street, District 1, Ho Chi Minh City",
    confidence: 0.95,
  },
  passport: {
    documentType: "passport",
    fullName: "NGUYEN VAN A",
    idNumber: "P1234567",
    dateOfBirth: "1990-01-01",
    nationality: "Vietnamese",
    expiryDate: "2030-01-01",
    confidence: 0.98,
  },
  driving_license: {
    documentType: "driving_license",
    fullName: "NGUYEN VAN A",
    idNumber: "DL123456",
    dateOfBirth: "1990-01-01",
    nationality: "Vietnamese",
    expiryDate: "2028-01-01",
    address: "123 Le Loi Street, District 1, Ho Chi Minh City",
    confidence: 0.92,
  },
};

/**
 * 模拟 OCR 识别
 */
export async function mockOCR(
  documentType: DocumentType,
  _imageBase64: string
): Promise<OCRResult> {
  // 模拟处理时间 1-2 秒
  await delay(1000 + Math.random() * 1000);
  
  const mockResult = mockOCRResults[documentType];
  
  // 随机添加一些变化
  const confidence = Math.min(0.99, Math.max(0.85, mockResult.confidence! + (Math.random() - 0.5) * 0.1));
  
  return {
    ...mockResult,
    confidence,
    rawData: {
      processingTime: 1200,
      engineVersion: "mock-v1.0",
      imageQuality: "good",
    },
  } as OCRResult;
}

/**
 * 模拟活体检测结果
 */
export interface LivenessResult {
  passed: boolean;
  confidence: number;
  actionsDetected: string[];
  error?: string;
}

export async function mockLivenessCheck(
  _videoBase64: string,
  requiredActions: string[]
): Promise<LivenessResult> {
  // 模拟处理时间 2-3 秒
  await delay(2000 + Math.random() * 1000);
  
  // 90% 概率通过
  const passed = Math.random() > 0.1;
  
  if (passed) {
    return {
      passed: true,
      confidence: 0.92 + Math.random() * 0.07,
      actionsDetected: requiredActions,
    };
  } else {
    // 模拟失败原因
    const failReasons = [
      "Face not clearly visible",
      "Action not completed",
      "Multiple faces detected",
      "Poor lighting conditions",
    ];
    
    return {
      passed: false,
      confidence: 0.3 + Math.random() * 0.3,
      actionsDetected: requiredActions.slice(0, Math.max(1, requiredActions.length - 1)),
      error: failReasons[Math.floor(Math.random() * failReasons.length)],
    };
  }
}

/**
 * 模拟 KYC 审核结果
 */
export type ReviewResult = "approved" | "manual_review" | "rejected";

export interface ReviewDecision {
  result: ReviewResult;
  confidence: number;
  riskScore: number;
  flags?: string[];
  rejectionReason?: string;
}

export async function mockKYCReview(
  _region: RegionCode,
  ocrConfidence: number,
  livenessPassed: boolean
): Promise<ReviewDecision> {
  // 模拟审核时间 1-2 秒
  await delay(1000 + Math.random() * 1000);
  
  // 计算风险分数
  let riskScore = 0;
  
  // OCR 置信度影响
  if (ocrConfidence < 0.8) riskScore += 30;
  else if (ocrConfidence < 0.9) riskScore += 15;
  
  // 活体检测影响
  if (!livenessPassed) riskScore += 40;
  
  // 随机因素
  riskScore += Math.random() * 20;
  
  // 根据风险分数决定结果
  if (riskScore < 30) {
    return {
      result: "approved",
      confidence: 0.9 + Math.random() * 0.09,
      riskScore,
    };
  } else if (riskScore < 60) {
    return {
      result: "manual_review",
      confidence: 0.7 + Math.random() * 0.2,
      riskScore,
      flags: ["Low OCR confidence", "Requires manual verification"],
    };
  } else {
    const rejectionReasons = [
      "Document appears to be fraudulent",
      "Identity verification failed",
      "Document expired or invalid",
      "Liveness check failed",
    ];
    
    return {
      result: "rejected",
      confidence: 0.6 + Math.random() * 0.3,
      riskScore,
      rejectionReason: rejectionReasons[Math.floor(Math.random() * rejectionReasons.length)],
    };
  }
}

/**
 * 模拟地址证明 OCR
 */
export interface AddressProofResult {
  documentType: string;
  address: string;
  issueDate?: string;
  confidence: number;
}

export async function mockAddressProofOCR(
  _imageBase64: string
): Promise<AddressProofResult> {
  await delay(1500);
  
  return {
    documentType: "utility_bill",
    address: "123 Le Loi Street, District 1, Ho Chi Minh City, Vietnam",
    issueDate: "2024-01-01",
    confidence: 0.88,
  };
}

/**
 * 模拟 AML/PEP 筛查
 */
export interface AMLScreeningResult {
  passed: boolean;
  hits: Array<{
    list: string;
    name: string;
    matchScore: number;
  }>;
  riskLevel: "low" | "medium" | "high";
}

export async function mockAMLScreening(
  _fullName: string,
  _idNumber: string
): Promise<AMLScreeningResult> {
  await delay(800);
  
  // 95% 概率通过
  const passed = Math.random() > 0.05;
  
  if (passed) {
    return {
      passed: true,
      hits: [],
      riskLevel: "low",
    };
  } else {
    return {
      passed: false,
      hits: [
        {
          list: "PEP Database",
          name: "Similar Name Match",
          matchScore: 0.75,
        },
      ],
      riskLevel: "medium",
    };
  }
}
