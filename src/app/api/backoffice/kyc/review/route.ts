/**
 * Backoffice KYC 审核 API
 * GET  /api/backoffice/kyc/review  - 获取 KYC 审核列表
 * POST /api/backoffice/kyc/review  - 执行审核操作（approve/reject/request_info）
 */

import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";
import { requireCsrf } from "@/lib/security";

// ─── 模拟数据库 ─────────────────────────────────────────────────────────────────

export interface KYCReviewRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  regionCode: string;
  country: string;
  kycLevel: "basic" | "standard" | "enhanced";
  status: "submitted" | "under_review" | "approved" | "rejected";
  riskLevel: "low" | "medium" | "high";
  documentType: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  ocrConfidence: number;
  livenessPassed: boolean;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  personalInfo?: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    country: string;
  };
  amlPassed: boolean;
  amlRiskScore: number;
  flags: string[];
}

// 模拟数据 - 真实项目中应接数据库
const mockKYCQueue: KYCReviewRecord[] = [
  {
    id: "KYC-2024-001",
    userId: "USR-001",
    userName: "Nguyen Van An",
    email: "nguyen.van.an@gmail.com",
    phone: "+84 90 123 4567",
    regionCode: "VN",
    country: "Vietnam",
    kycLevel: "standard",
    status: "submitted",
    riskLevel: "low",
    documentType: "id_card",
    documentFrontUrl: "/mock/id-front.jpg",
    documentBackUrl: "/mock/id-back.jpg",
    selfieUrl: "/mock/selfie.jpg",
    ocrConfidence: 0.96,
    livenessPassed: true,
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    amlPassed: true,
    amlRiskScore: 12,
    flags: [],
    personalInfo: {
      fullName: "Nguyen Van An",
      dateOfBirth: "1992-05-15",
      nationality: "Vietnamese",
      address: "123 Nguyen Hue Blvd",
      city: "Ho Chi Minh City",
      country: "Vietnam",
    },
  },
  {
    id: "KYC-2024-002",
    userId: "USR-002",
    userName: "Maria Elena Garcia",
    email: "maria.garcia@hotmail.es",
    phone: "+34 612 345 678",
    regionCode: "ES",
    country: "Spain",
    kycLevel: "enhanced",
    status: "under_review",
    riskLevel: "medium",
    documentType: "passport",
    documentFrontUrl: "/mock/passport.jpg",
    selfieUrl: "/mock/selfie2.jpg",
    ocrConfidence: 0.88,
    livenessPassed: true,
    submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    amlPassed: true,
    amlRiskScore: 35,
    flags: ["Low OCR confidence", "Large deposit history"],
    personalInfo: {
      fullName: "Maria Elena Garcia",
      dateOfBirth: "1985-11-22",
      nationality: "Spanish",
      address: "Calle Mayor 45, 2B",
      city: "Madrid",
      country: "Spain",
    },
  },
  {
    id: "KYC-2024-003",
    userId: "USR-003",
    userName: "Priya Sharma",
    email: "priya.sharma@outlook.in",
    phone: "+91 98765 43210",
    regionCode: "IN",
    country: "India",
    kycLevel: "standard",
    status: "submitted",
    riskLevel: "high",
    documentType: "driving_license",
    documentFrontUrl: "/mock/dl-front.jpg",
    documentBackUrl: "/mock/dl-back.jpg",
    ocrConfidence: 0.79,
    livenessPassed: false,
    submittedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    amlPassed: false,
    amlRiskScore: 72,
    flags: ["Liveness check failed", "AML hit: PEP match 78%", "Low OCR confidence"],
    personalInfo: {
      fullName: "Priya Sharma",
      dateOfBirth: "1990-03-08",
      nationality: "Indian",
      address: "B-204 Andheri West",
      city: "Mumbai",
      country: "India",
    },
  },
  {
    id: "KYC-2024-004",
    userId: "USR-004",
    userName: "Tanaka Hiroshi",
    email: "tanaka.hiroshi@yahoo.co.jp",
    phone: "+81 90 8765 4321",
    regionCode: "JP",
    country: "Japan",
    kycLevel: "basic",
    status: "submitted",
    riskLevel: "low",
    documentType: "id_card",
    documentFrontUrl: "/mock/id-front4.jpg",
    documentBackUrl: "/mock/id-back4.jpg",
    selfieUrl: "/mock/selfie4.jpg",
    ocrConfidence: 0.98,
    livenessPassed: true,
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    amlPassed: true,
    amlRiskScore: 8,
    flags: [],
    personalInfo: {
      fullName: "Tanaka Hiroshi",
      dateOfBirth: "1988-07-30",
      nationality: "Japanese",
      address: "2-1-1 Shibuya",
      city: "Tokyo",
      country: "Japan",
    },
  },
  {
    id: "KYC-2024-005",
    userId: "USR-005",
    userName: "Ahmed Al-Rashid",
    email: "ahmed.rashid@gmail.ae",
    phone: "+971 50 234 5678",
    regionCode: "AE",
    country: "United Arab Emirates",
    kycLevel: "enhanced",
    status: "approved",
    riskLevel: "low",
    documentType: "passport",
    documentFrontUrl: "/mock/passport5.jpg",
    selfieUrl: "/mock/selfie5.jpg",
    ocrConfidence: 0.97,
    livenessPassed: true,
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reviewedBy: "admin_sarah",
    amlPassed: true,
    amlRiskScore: 5,
    flags: [],
    personalInfo: {
      fullName: "Ahmed Al-Rashid",
      dateOfBirth: "1980-12-01",
      nationality: "Emirati",
      address: "Palm Jumeirah, Villa 12",
      city: "Dubai",
      country: "UAE",
    },
  },
  {
    id: "KYC-2024-006",
    userId: "USR-006",
    userName: "Jin-ho Kim",
    email: "jinho.kim@naver.com",
    phone: "+82 10 1234 5678",
    regionCode: "KR",
    country: "South Korea",
    kycLevel: "standard",
    status: "rejected",
    riskLevel: "medium",
    documentType: "id_card",
    documentFrontUrl: "/mock/id-front6.jpg",
    documentBackUrl: "/mock/id-back6.jpg",
    ocrConfidence: 0.71,
    livenessPassed: true,
    submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    reviewedBy: "admin_lee",
    rejectionReason: "Document image quality is too low to verify. Please resubmit with a clearer photo.",
    amlPassed: true,
    amlRiskScore: 28,
    flags: ["Very low OCR confidence"],
    personalInfo: {
      fullName: "Kim Jin-ho",
      dateOfBirth: "1995-09-14",
      nationality: "South Korean",
      address: "Gangnam-gu, Teheran-ro 123",
      city: "Seoul",
      country: "South Korea",
    },
  },
];

// ─── GET 获取审核列表 ────────────────────────────────────────────────────────────

export const GET = requireRole(["admin", "compliance_officer"], async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const regionCode = searchParams.get("region");
  const riskLevel = searchParams.get("risk");
  const search = searchParams.get("search")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  let records = [...mockKYCQueue];

  // 过滤
  if (status && status !== "all") {
    records = records.filter((r) => r.status === status);
  }
  if (regionCode && regionCode !== "all") {
    records = records.filter((r) => r.regionCode === regionCode);
  }
  if (riskLevel && riskLevel !== "all") {
    records = records.filter((r) => r.riskLevel === riskLevel);
  }
  if (search) {
    records = records.filter(
      (r) =>
        r.userName.toLowerCase().includes(search) ||
        r.email.toLowerCase().includes(search) ||
        r.userId.toLowerCase().includes(search) ||
        r.id.toLowerCase().includes(search)
    );
  }

  const total = records.length;
  const start = (page - 1) * limit;
  const items = records.slice(start, start + limit);

  // 统计
  const stats = {
    total: mockKYCQueue.length,
    submitted: mockKYCQueue.filter((r) => r.status === "submitted").length,
    under_review: mockKYCQueue.filter((r) => r.status === "under_review").length,
    approved: mockKYCQueue.filter((r) => r.status === "approved").length,
    rejected: mockKYCQueue.filter((r) => r.status === "rejected").length,
    high_risk: mockKYCQueue.filter((r) => r.riskLevel === "high").length,
  };

  return NextResponse.json({
    success: true,
    items,
    total,
    page,
    limit,
    stats,
  });
});

// ─── POST 执行审核操作 ──────────────────────────────────────────────────────────

export const POST = requireRole(["admin", "compliance_officer"], async (request: NextRequest) => {
  const csrfError = requireCsrf(request);
  if (csrfError) return csrfError;

  try {
    const body = await request.json();
    const { id, action, reason, notes } = body as {
      id: string;
      action: "approve" | "reject" | "request_info" | "start_review";
      reason?: string;
      notes?: string;
    };

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: id, action" },
        { status: 400 }
      );
    }

    const record = mockKYCQueue.find((r) => r.id === id);
    if (!record) {
      return NextResponse.json(
        { success: false, error: "KYC record not found" },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const currentUser = await getCurrentUser(request);
    const adminId = currentUser?.id ?? "unknown";

    switch (action) {
      case "start_review":
        if (record.status !== "submitted") {
          return NextResponse.json(
            { success: false, error: "Can only start review for submitted applications" },
            { status: 400 }
          );
        }
        record.status = "under_review";
        record.reviewedBy = adminId;
        break;

      case "approve":
        if (!["submitted", "under_review"].includes(record.status)) {
          return NextResponse.json(
            { success: false, error: "Can only approve submitted or under-review applications" },
            { status: 400 }
          );
        }
        record.status = "approved";
        record.reviewedAt = now;
        record.reviewedBy = adminId;
        break;

      case "reject":
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Rejection reason is required" },
            { status: 400 }
          );
        }
        if (!["submitted", "under_review"].includes(record.status)) {
          return NextResponse.json(
            { success: false, error: "Can only reject submitted or under-review applications" },
            { status: 400 }
          );
        }
        record.status = "rejected";
        record.reviewedAt = now;
        record.reviewedBy = adminId;
        record.rejectionReason = reason;
        break;

      case "request_info":
        if (!reason) {
          return NextResponse.json(
            { success: false, error: "Request information reason is required" },
            { status: 400 }
          );
        }
        // 状态保持 under_review，标注需要补充材料
        record.flags = [...record.flags, `Info requested: ${reason}`];
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Invalid action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      record,
      message: `KYC application ${action === "approve" ? "approved" : action === "reject" ? "rejected" : action === "start_review" ? "moved to review" : "flagged for more info"} successfully`,
    });
  } catch (error) {
    console.error("KYC review action failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
