"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  FileCheck,
  ScanFace,
  Home,
  ClipboardList,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  ChevronRight,
  User,
  Calendar,
  MessageSquare,
  Lock,
  Unlock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  Ban,
  Send,
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/crm/ui";
import type {
  SupplementalKYCRequest,
  SupplementalKYCType,
  SupplementalKYCStatus,
  VerificationStage,
} from "@/lib/kyc/supplemental-types";
import type { RegionCode } from "@/lib/kyc/region-config";

const REGION_NAMES: Record<RegionCode, { name: string; flag: string }> = {
  VN: { name: "Vietnam", flag: "🇻🇳" },
  TH: { name: "Thailand", flag: "🇹🇭" },
  IN: { name: "India", flag: "🇮🇳" },
  AE: { name: "UAE", flag: "🇦🇪" },
  KR: { name: "South Korea", flag: "🇰🇷" },
  JP: { name: "Japan", flag: "🇯🇵" },
  FR: { name: "France", flag: "🇫🇷" },
  ES: { name: "Spain", flag: "🇪🇸" },
  BR: { name: "Brazil", flag: "🇧🇷" },
};

const STAGE_ICONS: Record<VerificationStage, React.ReactNode> = {
  identity: <FileCheck className="w-4 h-4" />,
  liveness: <ScanFace className="w-4 h-4" />,
  address: <Home className="w-4 h-4" />,
  questionnaire: <ClipboardList className="w-4 h-4" />,
};

const STAGE_COLORS: Record<VerificationStage, string> = {
  identity: "blue",
  liveness: "purple",
  address: "green",
  questionnaire: "orange",
};

const TYPE_LABELS: Record<SupplementalKYCType, { label: string; color: string }> = {
  document_expiry: { label: "Document Expiry", color: "amber" },
  risk_control: { label: "Risk Control", color: "red" },
  manual_review: { label: "Manual Review", color: "blue" },
  aml_compliance: { label: "AML Compliance", color: "purple" },
  large_withdrawal: { label: "Large Withdrawal", color: "orange" },
  tier_upgrade: { label: "Tier Upgrade", color: "green" },
};

const STATUS_LABELS: Record<SupplementalKYCStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "yellow", icon: <Clock className="w-4 h-4" /> },
  in_progress: { label: "In Progress", color: "blue", icon: <RefreshCw className="w-4 h-4" /> },
  completed: { label: "Completed", color: "green", icon: <CheckCircle2 className="w-4 h-4" /> },
  expired: { label: "Expired", color: "gray", icon: <AlertCircle className="w-4 h-4" /> },
  cancelled: { label: "Cancelled", color: "red", icon: <XCircle className="w-4 h-4" /> },
};

// ============================================================
// Status Badge
// ============================================================
function StatusBadge({ status }: { status: SupplementalKYCStatus }) {
  const config = STATUS_LABELS[status];
  const colorClasses: Record<string, string> = {
    yellow: "bg-yellow-100 text-yellow-700",
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

// ============================================================
// Type Badge
// ============================================================
function TypeBadge({ type }: { type: SupplementalKYCType }) {
  const config = TYPE_LABELS[type];
  const colorClasses: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    green: "bg-green-100 text-green-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
      {config.label}
    </span>
  );
}

// ============================================================
// Stage Badge
// ============================================================
function StageBadge({ stage }: { stage: VerificationStage }) {
  const color = STAGE_COLORS[stage];
  const icon = STAGE_ICONS[stage];
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    green: "bg-green-100 text-green-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${colorClasses[color]}`}>
      {icon}
      <span className="capitalize">{stage}</span>
    </span>
  );
}

// ============================================================
// Request Detail Modal
// ============================================================
function RequestDetailModal({
  request,
  onClose,
  onCancel,
}: {
  request: SupplementalKYCRequest;
  onClose: () => void;
  onCancel: (reason: string) => void;
}) {
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={request.status} />
            <TypeBadge type={request.type} />
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">User ID: {request.userId}</p>
              <p className="text-sm text-gray-500">Region: {/* TODO: Add region */}</p>
            </div>
          </div>

          {/* Required Stages */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Required Stages</h3>
            <div className="flex flex-wrap gap-2">
              {request.requiredStages.map((stage) => (
                <StageBadge key={stage} stage={stage} />
              ))}
            </div>
            {request.completedStages.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">Completed:</p>
                <div className="flex flex-wrap gap-2">
                  {request.completedStages.map((stage) => (
                    <span key={stage} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="capitalize">{stage}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Restrictions */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Restrictions Applied</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg border ${request.restrictions.depositEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {request.restrictions.depositEnabled ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${request.restrictions.depositEnabled ? "text-green-700" : "text-red-700"}`}>
                    Deposit {request.restrictions.depositEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${request.restrictions.withdrawEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {request.restrictions.withdrawEnabled ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${request.restrictions.withdrawEnabled ? "text-green-700" : "text-red-700"}`}>
                    Withdraw {request.restrictions.withdrawEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${request.restrictions.tradingEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {request.restrictions.tradingEnabled ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${request.restrictions.tradingEnabled ? "text-green-700" : "text-red-700"}`}>
                    Trading {request.restrictions.tradingEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${request.restrictions.accountOpeningEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center gap-2">
                  {request.restrictions.accountOpeningEnabled ? <Unlock className="w-4 h-4 text-green-600" /> : <Lock className="w-4 h-4 text-red-600" />}
                  <span className={`text-sm font-medium ${request.restrictions.accountOpeningEnabled ? "text-green-700" : "text-red-700"}`}>
                    Account Opening {request.restrictions.accountOpeningEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reason & Notes */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.reason}</p>
            </div>
            {request.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.notes}</p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Created:</span>
                <span className="text-gray-900">{new Date(request.createdAt).toLocaleString()}</span>
              </div>
              {request.deadline && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Deadline:</span>
                  <span className="text-gray-900">{new Date(request.deadline).toLocaleString()}</span>
                </div>
              )}
              {request.completedAt && (
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-gray-500">Completed:</span>
                  <span className="text-gray-900">{new Date(request.completedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500">Initiated by:</span>
                <span className="text-gray-900">{request.initiatedByName || request.initiatedBy}</span>
              </div>
            </div>
          </div>

          {/* Cancel Form */}
          {showCancelForm && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Cancel Request</h3>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowCancelForm(false)}>
                  Back
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onCancel(cancelReason)}
                  disabled={!cancelReason.trim()}
                >
                  Confirm Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!showCancelForm && ["pending", "in_progress"].includes(request.status) && (
          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowCancelForm(true)}>
              <Ban className="w-4 h-4" />
              Cancel Request
            </Button>
            <Button onClick={onClose}>
              <Send className="w-4 h-4" />
              Send Reminder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Initiate Request Modal
// ============================================================
function InitiateRequestModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: {
    userId: string;
    type: SupplementalKYCType;
    requiredStages: VerificationStage[];
    reason: string;
    notes?: string;
    deadline?: string;
    restrictions: {
      depositEnabled: boolean;
      withdrawEnabled: boolean;
      tradingEnabled: boolean;
      accountOpeningEnabled: boolean;
    };
  }) => void;
}) {
  const [formData, setFormData] = useState({
    userId: "",
    type: "manual_review" as SupplementalKYCType,
    requiredStages: [] as VerificationStage[],
    reason: "",
    notes: "",
    deadline: "",
    restrictions: {
      depositEnabled: true,
      withdrawEnabled: false,
      tradingEnabled: true,
      accountOpeningEnabled: true,
    },
  });

  const toggleStage = (stage: VerificationStage) => {
    setFormData((prev) => ({
      ...prev,
      requiredStages: prev.requiredStages.includes(stage)
        ? prev.requiredStages.filter((s) => s !== stage)
        : [...prev.requiredStages, stage],
    }));
  };

  const handleSubmit = () => {
    if (!formData.userId || formData.requiredStages.length === 0 || !formData.reason) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Initiate Supplemental KYC</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID *</label>
            <input
              type="text"
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter user ID"
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Request Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as SupplementalKYCType })}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(TYPE_LABELS).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Required Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Required Stages *</label>
            <div className="grid grid-cols-2 gap-2">
              {(["identity", "liveness", "address", "questionnaire"] as VerificationStage[]).map((stage) => (
                <button
                  key={stage}
                  onClick={() => toggleStage(stage)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                    formData.requiredStages.includes(stage)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                    formData.requiredStages.includes(stage) ? "bg-blue-500 border-blue-500" : "border-gray-300"
                  }`}>
                    {formData.requiredStages.includes(stage) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className="capitalize text-sm">{stage}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for supplemental KYC..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Restrictions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Restrictions</label>
            <div className="space-y-2">
              {[
                { key: "depositEnabled", label: "Allow Deposit" },
                { key: "withdrawEnabled", label: "Allow Withdraw" },
                { key: "tradingEnabled", label: "Allow Trading" },
                { key: "accountOpeningEnabled", label: "Allow Account Opening" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <span className="text-sm text-gray-700">{label}</span>
                  <input
                    type="checkbox"
                    checked={formData.restrictions[key as keyof typeof formData.restrictions]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        restrictions: { ...formData.restrictions, [key]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.userId || formData.requiredStages.length === 0 || !formData.reason}
          >
            Initiate Request
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function SupplementalReviewPage() {
  const [requests, setRequests] = useState<SupplementalKYCRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SupplementalKYCRequest | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<SupplementalKYCStatus | "all">("all");
  const [filterType, setFilterType] = useState<SupplementalKYCType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("type", filterType);

      const res = await fetch(`/api/backoffice/kyc/supplemental?${params}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterType]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleInitiate = async (formData: {
    userId: string;
    type: SupplementalKYCType;
    requiredStages: VerificationStage[];
    reason: string;
    notes?: string;
    deadline?: string;
    restrictions: {
      depositEnabled: boolean;
      withdrawEnabled: boolean;
      tradingEnabled: boolean;
      accountOpeningEnabled: boolean;
    };
  }) => {
    try {
      const res = await fetch("/api/backoffice/kyc/supplemental", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          notifyUser: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Supplemental KYC request initiated" });
        setShowInitiateModal(false);
        fetchRequests();
      } else {
        setToast({ type: "error", message: data.error || "Failed to initiate request" });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    }
  };

  const handleCancel = async (reason: string) => {
    if (!selectedRequest) return;
    try {
      const res = await fetch(`/api/backoffice/kyc/supplemental/${selectedRequest.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Request cancelled" });
        setSelectedRequest(null);
        fetchRequests();
      } else {
        setToast({ type: "error", message: data.error || "Failed to cancel request" });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        req.userId.toLowerCase().includes(query) ||
        req.reason.toLowerCase().includes(query) ||
        req.type.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplemental KYC Review"
        description="Manage supplemental KYC requests initiated for existing users."
        actions={
          <Button onClick={() => setShowInitiateModal(true)}>
            <Shield className="w-4 h-4" />
            Initiate Request
          </Button>
        }
      />

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as SupplementalKYCStatus | "all")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Type:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as SupplementalKYCType | "all")}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {Object.entries(TYPE_LABELS).map(([type, config]) => (
                <option key={type} value={type}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user ID, reason..."
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={fetchRequests}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Requests Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No supplemental KYC requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Required Stages</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{request.userId}</p>
                          <p className="text-xs text-gray-500">{/* TODO: Add region */}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <TypeBadge type={request.type} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {request.requiredStages.map((stage) => (
                          <StageBadge key={stage} stage={stage} />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-900">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onCancel={handleCancel}
        />
      )}

      {/* Initiate Modal */}
      {showInitiateModal && (
        <InitiateRequestModal
          onClose={() => setShowInitiateModal(false)}
          onSubmit={handleInitiate}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
              toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
