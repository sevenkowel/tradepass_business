import { prisma } from "@/lib/prisma";

export type KYCStatus =
  | "not_started"
  | "document_uploaded"
  | "ocr_processing"
  | "ocr_completed"
  | "liveness_pending"
  | "liveness_completed"
  | "personal_info_pending"
  | "personal_info_completed"
  | "agreement_pending"
  | "agreement_completed"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "supplemental_required";

const VALID_TRANSITIONS: Record<KYCStatus, KYCStatus[]> = {
  not_started: ["document_uploaded"],
  document_uploaded: ["ocr_processing", "rejected"],
  ocr_processing: ["ocr_completed", "rejected"],
  ocr_completed: ["liveness_pending"],
  liveness_pending: ["liveness_completed", "rejected"],
  liveness_completed: ["personal_info_pending"],
  personal_info_pending: ["personal_info_completed"],
  personal_info_completed: ["agreement_pending"],
  agreement_pending: ["agreement_completed"],
  agreement_completed: ["submitted"],
  submitted: ["under_review", "approved", "rejected"],
  under_review: ["approved", "rejected", "supplemental_required"],
  approved: [], // terminal
  rejected: ["not_started"], // can restart
  supplemental_required: ["submitted"], // resubmit after supplemental
};

export function canTransition(from: KYCStatus, to: KYCStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionKYCStatus(
  userId: string,
  toStatus: KYCStatus,
  meta?: { reviewedBy?: string; rejectionReason?: string; notes?: string }
): Promise<{ success: boolean; error?: string }> {
  const record = await prisma.kYCRecord.findUnique({ where: { userId } });
  if (!record) {
    return { success: false, error: "KYC record not found" };
  }

  const fromStatus = record.status as KYCStatus;
  if (!canTransition(fromStatus, toStatus)) {
    return {
      success: false,
      error: `Invalid transition: ${fromStatus} -> ${toStatus}`,
    };
  }

  const updateData: Record<string, unknown> = { status: toStatus };
  if (toStatus === "approved" || toStatus === "rejected") {
    updateData.reviewedAt = new Date();
    if (meta?.reviewedBy) updateData.reviewedBy = meta.reviewedBy;
    if (meta?.rejectionReason) updateData.rejectionReason = meta.rejectionReason;
  }
  if (toStatus === "submitted") {
    updateData.submittedAt = new Date();
  }

  await prisma.kYCRecord.update({
    where: { userId },
    data: updateData,
  });

  // Write review log for terminal states
  if (["approved", "rejected", "under_review", "supplemental_required"].includes(toStatus)) {
    await prisma.kYCReviewLog.create({
      data: {
        kycId: record.id,
        adminId: meta?.reviewedBy ?? "system",
        action: toStatus,
        fromStatus,
        toStatus,
        reason: meta?.rejectionReason ?? meta?.notes,
        notes: meta?.notes,
      },
    });
  }

  // Sync user.kycStatus
  await prisma.user.update({
    where: { id: userId },
    data: { kycStatus: toStatus },
  });

  return { success: true };
}

export async function createKYCRecord(userId: string, regionCode: string, kycLevel: string) {
  return prisma.kYCRecord.create({
    data: {
      userId,
      regionCode,
      kycLevel,
      status: "not_started",
    },
  });
}

export async function getKYCRecord(userId: string) {
  return prisma.kYCRecord.findUnique({
    where: { userId },
    include: { reviewLogs: { orderBy: { createdAt: "desc" } } },
  });
}
