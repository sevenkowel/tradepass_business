"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileText, 
  RefreshCw,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Shield,
  Lock,
  Unlock,
  FileCheck,
  ScanFace,
  Home,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useKYCStore } from "@/lib/kyc/store";
import type { KYCStatus } from "@/lib/kyc/types";
import type { UserSupplementalKYCStatus, VerificationStage } from "@/lib/kyc/supplemental-types";

const STAGE_ICONS: Record<VerificationStage, React.ReactNode> = {
  identity: <FileCheck className="w-5 h-5" />,
  liveness: <ScanFace className="w-5 h-5" />,
  address: <Home className="w-5 h-5" />,
  questionnaire: <ClipboardList className="w-5 h-5" />,
};

const STAGE_LABELS: Record<VerificationStage, string> = {
  identity: "Identity Verification",
  liveness: "Liveness Check",
  address: "Address Verification",
  questionnaire: "Questionnaire",
};

export default function KYCStatusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<KYCStatus>("not_started");
  const [progress, setProgress] = useState(0);
  const [supplementalStatus, setSupplementalStatus] = useState<UserSupplementalKYCStatus | null>(null);
  
  const { kycData, reset } = useKYCStore();

  useEffect(() => {
    // Fetch KYC status and supplemental requirements
    const fetchStatus = async () => {
      try {
        const [kycResponse, supplementalResponse] = await Promise.all([
          fetch("/api/kyc/status"),
          fetch("/api/portal/kyc/supplemental-requirements"),
        ]);

        if (kycResponse.ok) {
          const kycData = await kycResponse.json();
          setStatus(kycData.data.status);
          setProgress(kycData.data.progress);
        }

        if (supplementalResponse.ok) {
          const supplementalData = await supplementalResponse.json();
          if (supplementalData.success) {
            setSupplementalStatus(supplementalData.status);
          }
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const getStatusConfig = (status: KYCStatus) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
          title: "KYC Approved",
          description: "Your identity verification has been completed successfully. You can now access all trading features.",
          action: {
            label: "Go to Dashboard",
            onClick: () => router.push("/portal"),
          },
        };
      case "under_review":
      case "submitted":
        return {
          icon: Clock,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
          title: "Under Review",
          description: "Your application is being reviewed by our compliance team. This usually takes 1-2 business days.",
          action: {
            label: "Refresh Status",
            onClick: () => window.location.reload(),
          },
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          bgColor: "bg-red-500/10",
          title: "Application Rejected",
          description: kycData?.rejectionReason || "Your application could not be approved. Please contact support for more information.",
          action: {
            label: "Contact Support",
            onClick: () => router.push("/portal/support"),
          },
        };
      default:
        return {
          icon: FileText,
          color: "text-[rgb(var(--tp-accent-rgb))]",
          bgColor: "bg-[rgba(var(--tp-accent-rgb),0.1)]",
          title: "Complete Your KYC",
          description: "Please complete the identity verification process to start trading.",
          action: {
            label: "Start KYC",
            onClick: () => router.push("/portal/kyc"),
          },
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--tp-accent-rgb))]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="text-center">
            <CardContent className="pt-12 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className={`w-24 h-24 rounded-full ${statusConfig.bgColor} flex items-center justify-center mx-auto mb-6`}
              >
                <StatusIcon className={`w-12 h-12 ${statusConfig.color}`} />
              </motion.div>
              
              <h1 className={`text-2xl font-bold mb-2 ${statusConfig.color}`}>
                {statusConfig.title}
              </h1>
              <p className="text-[rgba(var(--tp-fg-rgb),0.7)] max-w-md mx-auto mb-8">
                {statusConfig.description}
              </p>

              <Button
                onClick={statusConfig.action.onClick}
                className="h-12 px-8 bg-tp-accent hover:bg-tp-accent-hover text-white"
              >
                {statusConfig.action.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Progress</CardTitle>
              <CardDescription>Track your KYC verification steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { step: 1, label: "Document Upload", status: kycData?.documentFrontUrl ? "completed" : "pending" },
                  { step: 2, label: "Liveness Check", status: kycData?.livenessPassed ? "completed" : "pending" },
                  { step: 3, label: "Personal Information", status: kycData?.personalInfo ? "completed" : "pending" },
                  { step: 4, label: "Agreement Signatures", status: kycData?.agreementsSigned?.length ? "completed" : "pending" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      item.status === "completed" 
                        ? "bg-green-500 text-white" 
                        : "bg-[rgba(var(--tp-fg-rgb),0.1)] text-[rgba(var(--tp-fg-rgb),0.5)]"
                    }`}>
                      {item.status === "completed" ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        item.step
                      )}
                    </div>
                    <span className={`flex-1 ${
                      item.status === "completed" 
                        ? "text-[rgb(var(--tp-fg-rgb))]" 
                        : "text-[rgba(var(--tp-fg-rgb),0.5)]"
                    }`}>
                      {item.label}
                    </span>
                    {item.status === "completed" && (
                      <span className="text-xs text-green-500 font-medium">Completed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        {(status === "under_review" || status === "submitted") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[rgb(var(--tp-accent-rgb))]">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-[rgb(var(--tp-fg-rgb))]">Automated Review</p>
                    <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Our system is analyzing your submitted documents</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[rgb(var(--tp-accent-rgb))]">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-[rgb(var(--tp-fg-rgb))]">Manual Verification</p>
                    <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Our compliance team reviews your application</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-[rgb(var(--tp-accent-rgb))]">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-[rgb(var(--tp-fg-rgb))]">Approval Notification</p>
                    <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">You will receive an email once approved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Supplemental KYC Requirements */}
        {supplementalStatus?.hasPendingRequest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-amber-700">Additional Verification Required</CardTitle>
                    <CardDescription className="text-amber-600/70">
                      Please complete the following steps to unlock full account features
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Required Stages */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-amber-700">Required Steps</h3>
                  {supplementalStatus.requiredStages.map((stage) => (
                    <div
                      key={stage}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-amber-200/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                          {STAGE_ICONS[stage]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{STAGE_LABELS[stage]}</p>
                          <p className="text-sm text-gray-500">Required for account upgrade</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => router.push(`/portal/kyc/${stage}`)}
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                      >
                        Complete
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Restrictions */}
                {!supplementalStatus.effectiveRestrictions.withdrawEnabled && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">Withdrawal Temporarily Disabled</p>
                        <p className="text-sm text-red-600/70">
                          Withdrawals are currently disabled until you complete the required verification steps.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!supplementalStatus.effectiveRestrictions.depositEnabled && (
                  <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="font-medium text-red-700">Deposit Temporarily Disabled</p>
                        <p className="text-sm text-red-600/70">
                          Deposits are currently disabled until you complete the required verification steps.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pending Requests Info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-amber-700">Pending Requests</h3>
                  {supplementalStatus.pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="p-4 bg-white/50 rounded-xl border border-amber-200/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {request.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.reason}</p>
                      {request.deadline && (
                        <p className="text-xs text-gray-500 mt-2">
                          Deadline: {new Date(request.deadline).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
