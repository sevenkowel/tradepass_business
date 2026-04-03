"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Layers,
  Globe,
  Lock,
  Save,
  RotateCcw,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  History,
  Loader2,
  ChevronRight,
  ChevronDown,
  Settings,
  FileCheck,
  ScanFace,
  Home,
  ClipboardList,
  Crown,
  BadgeCheck,
  CircleDashed,
  DollarSign,
  ArrowLeftRight,
  BarChart3,
  Gift,
} from "lucide-react";
import { PageHeader, Card, Button } from "@/components/backoffice/ui";
import type {
  KYCSystemConfig,
  KYCTier,
  KYCTierLevel,
  StageConfig,
  VerificationStage,
  RegionKYCFlow,
  TierPermissions,
  KYCConfigVersion,
} from "@/lib/kyc/config-types";
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

const TIER_ICONS: Record<KYCTierLevel, React.ReactNode> = {
  0: <CircleDashed className="w-5 h-5" />,
  1: <Shield className="w-5 h-5" />,
  2: <BadgeCheck className="w-5 h-5" />,
  3: <Shield className="w-5 h-5" />,
  4: <Crown className="w-5 h-5" />,
};

const TIER_COLORS: Record<KYCTierLevel, string> = {
  0: "gray",
  1: "blue",
  2: "green",
  3: "purple",
  4: "amber",
};

// ============================================================
// Toggle Switch
// ============================================================
function Toggle({
  checked,
  onChange,
  disabled,
  size = "md",
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const sizes = { sm: "h-5 w-9", md: "h-6 w-11" };
  const dotSizes = { sm: "h-3.5 w-3.5", md: "h-4.5 w-4.5" };
  const translateX = { sm: checked ? "translate-x-4" : "translate-x-0.5", md: checked ? "translate-x-5" : "translate-x-0.5" };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        sizes[size]
      } ${checked ? "bg-blue-600" : "bg-gray-300"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${dotSizes[size]} ${translateX[size]}`}
      />
    </button>
  );
}

// ============================================================
// Tier Card
// ============================================================
function TierCard({
  tier,
  isSelected,
  onSelect,
}: {
  tier: KYCTier;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = TIER_COLORS[tier.level];
  const bgColors: Record<string, string> = {
    gray: "bg-gray-50 border-gray-200",
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    purple: "bg-purple-50 border-purple-200",
    amber: "bg-amber-50 border-amber-200",
  };
  const iconColors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-600",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
  };

  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl p-4 cursor-pointer transition-all ${
        isSelected ? `${bgColors[color]} ring-2 ring-${color}-500` : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColors[color]}`}>
          {TIER_ICONS[tier.level]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">Level {tier.level}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 text-gray-600">{tier.name}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{tier.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {tier.requiredStages.length === 0 ? (
          <span className="text-xs text-gray-400">No stages required</span>
        ) : (
          tier.requiredStages.map((stage) => (
            <span
              key={stage}
              className={`text-xs px-2 py-0.5 rounded-full bg-${STAGE_COLORS[stage]}-100 text-${STAGE_COLORS[stage]}-700 capitalize`}
            >
              {stage}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================
// Stage Card
// ============================================================
function StageCard({
  stage,
  onToggle,
}: {
  stage: StageConfig;
  onToggle: (enabled: boolean) => void;
}) {
  const color = STAGE_COLORS[stage.id];
  const iconBgColors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className={`border rounded-xl p-4 ${stage.enabled ? "border-gray-200" : "border-gray-100 opacity-60"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBgColors[color]}`}>
            {STAGE_ICONS[stage.id]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{stage.name}</span>
              {stage.required && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600">Required</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{stage.description}</p>
          </div>
        </div>
        <Toggle checked={stage.enabled} onChange={onToggle} />
      </div>

      {stage.enabled && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Auto Approve</span>
            <p className="font-medium text-gray-900">{stage.autoApprove ? "Yes" : "No"}</p>
          </div>
          <div>
            <span className="text-gray-500">Max Attempts</span>
            <p className="font-medium text-gray-900">{stage.maxAttempts || "-"}</p>
          </div>
          <div>
            <span className="text-gray-500">Timeout</span>
            <p className="font-medium text-gray-900">{stage.timeout ? `${stage.timeout}min` : "-"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Region Flow Card
// ============================================================
function RegionFlowCard({
  regionCode,
  flow,
  isExpanded,
  onToggleExpand,
  onToggleEnabled,
}: {
  regionCode: RegionCode;
  flow: RegionKYCFlow;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (enabled: boolean) => void;
}) {
  const info = REGION_NAMES[regionCode];

  return (
    <div className={`border rounded-xl transition-all ${isExpanded ? "border-blue-200" : "border-gray-200"} ${!flow.enabled ? "opacity-60" : ""}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{info.flag}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{info.name}</span>
              <span className="text-xs text-gray-400">{regionCode}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                Default: L{flow.defaultTier}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Toggle checked={flow.enabled} onChange={onToggleEnabled} size="sm" />
          <button
            onClick={onToggleExpand}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && flow.enabled && (
        <div className="border-t border-gray-100 p-4 space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Stage Configuration</span>
            <div className="space-y-2">
              {(Object.entries(flow.stages) as [VerificationStage, StageConfig][]).map(([stageId, stage]) => (
                <div key={stageId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {STAGE_ICONS[stageId]}
                    <span className="text-sm text-gray-700 capitalize">{stageId}</span>
                    {stage.required && <span className="text-xs text-red-500">*</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{stage.enabled ? "Enabled" : "Disabled"}</span>
                    <span>{stage.autoApprove ? "Auto" : "Manual"}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-700 block mb-2">Tier Requirements</span>
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(flow.tierRequirements) as [string, VerificationStage[]][]).map(([tier, stages]) => (
                <div key={tier} className="text-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-900">L{tier}</span>
                  <p className="text-xs text-gray-500 mt-1">{stages.length} stages</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Permissions Panel
// ============================================================
function PermissionsPanel({
  permissions,
  onChange,
}: {
  permissions: TierPermissions;
  onChange: (perms: TierPermissions) => void;
}) {
  const updateFunds = (key: keyof TierPermissions["funds"], value: unknown) => {
    onChange({
      ...permissions,
      funds: { ...permissions.funds, [key]: value },
    });
  };

  const updateTransfer = (key: keyof TierPermissions["transfer"], value: unknown) => {
    onChange({
      ...permissions,
      transfer: { ...permissions.transfer, [key]: value },
    });
  };

  const updateTrading = (key: keyof TierPermissions["trading"], value: unknown) => {
    onChange({
      ...permissions,
      trading: { ...permissions.trading, [key]: value },
    });
  };

  const updateGrowth = (key: keyof TierPermissions["growth"], value: unknown) => {
    onChange({
      ...permissions,
      growth: { ...permissions.growth, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Funds */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">Funds</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deposit Enabled</span>
            <Toggle checked={permissions.funds.depositEnabled} onChange={(v) => updateFunds("depositEnabled", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Deposit Limit</span>
            <input
              type="number"
              value={permissions.funds.depositLimit}
              onChange={(e) => updateFunds("depositLimit", parseInt(e.target.value) || 0)}
              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Withdraw Enabled</span>
            <Toggle checked={permissions.funds.withdrawEnabled} onChange={(v) => updateFunds("withdrawEnabled", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Max Balance</span>
            <input
              type="number"
              value={permissions.funds.maxBalance}
              onChange={(e) => updateFunds("maxBalance", parseInt(e.target.value) || 0)}
              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right"
            />
          </div>
        </div>
      </div>

      {/* Transfer */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ArrowLeftRight className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">Transfer</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Internal Transfer</span>
            <Toggle checked={permissions.transfer.internalTransferEnabled} onChange={(v) => updateTransfer("internalTransferEnabled", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Wire Transfer</span>
            <Toggle checked={permissions.transfer.wireTransferEnabled} onChange={(v) => updateTransfer("wireTransferEnabled", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Crypto Transfer</span>
            <Toggle checked={permissions.transfer.cryptoTransferEnabled} onChange={(v) => updateTransfer("cryptoTransferEnabled", v)} size="sm" />
          </div>
        </div>
      </div>

      {/* Trading */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span className="font-medium text-gray-900">Trading</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Can Open Account</span>
            <Toggle checked={permissions.trading.canOpenAccount} onChange={(v) => updateTrading("canOpenAccount", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Max Accounts</span>
            <input
              type="number"
              value={permissions.trading.maxAccounts}
              onChange={(e) => updateTrading("maxAccounts", parseInt(e.target.value) || 0)}
              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Max Leverage</span>
            <input
              type="number"
              value={permissions.trading.leverageMax}
              onChange={(e) => updateTrading("leverageMax", parseInt(e.target.value) || 0)}
              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right"
            />
          </div>
        </div>
      </div>

      {/* Growth */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-amber-600" />
          <span className="font-medium text-gray-900">Growth</span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Campaign Access</span>
            <Toggle checked={permissions.growth.campaignAccess} onChange={(v) => updateGrowth("campaignAccess", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Bonus Eligible</span>
            <Toggle checked={permissions.growth.bonusEligible} onChange={(v) => updateGrowth("bonusEligible", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Referral Enabled</span>
            <Toggle checked={permissions.growth.referralEnabled} onChange={(v) => updateGrowth("referralEnabled", v)} size="sm" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">AI Signals Quota</span>
            <input
              type="number"
              value={permissions.growth.aiSignalsQuota}
              onChange={(e) => updateGrowth("aiSignalsQuota", parseInt(e.target.value) || 0)}
              className="w-24 text-sm border border-gray-200 rounded-lg px-2 py-1 text-right"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// History Panel
// ============================================================
function HistoryPanel({ onClose }: { onClose: () => void }) {
  const [history, setHistory] = useState<KYCConfigVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config/kyc-system/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setHistory(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Configuration History</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
              <span className="text-gray-400">&times;</span>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No history yet</p>
          ) : (
            <div className="space-y-3">
              {history.map((v, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-mono font-medium text-gray-900">v{v.version}</span>
                    <span className="text-xs text-gray-400">{new Date(v.updatedAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{v.changes}</p>
                  <p className="text-xs text-gray-400 mt-1">by {v.updatedBy}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function KYCSystemConfigPage() {
  const [config, setConfig] = useState<KYCSystemConfig | null>(null);
  const [originalConfig, setOriginalConfig] = useState<KYCSystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"tiers" | "stages" | "regions" | "permissions">("tiers");
  const [selectedTier, setSelectedTier] = useState<KYCTierLevel | null>(null);
  const [expandedRegion, setExpandedRegion] = useState<RegionCode | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/config/kyc-system");
      const data = await res.json();
      if (data.success) {
        setConfig(data.data);
        setOriginalConfig(JSON.parse(JSON.stringify(data.data)));
        setHasChanges(false);
      }
    } catch (err) {
      console.error("Failed to fetch config:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const saveConfig = async (reason?: string) => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/config/kyc-system", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          reason,
          updatedBy: "admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: `Saved as v${data.version}` });
        setOriginalConfig(JSON.parse(JSON.stringify(config)));
        setHasChanges(false);
      } else {
        setToast({ type: "error", message: data.error || "Save failed" });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    } finally {
      setSaving(false);
    }
  };

  const handleStageToggle = async (stageId: VerificationStage, enabled: boolean) => {
    if (!config) return;
    
    // Update local state
    setConfig({
      ...config,
      stageDefinitions: {
        ...config.stageDefinitions,
        [stageId]: { ...config.stageDefinitions[stageId], enabled },
      },
    });
    setHasChanges(true);

    // Call API
    try {
      const res = await fetch("/api/config/kyc-system/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleStage",
          data: { stageId, enabled },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast({ type: "error", message: data.error || "Toggle failed" });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    }
  };

  const handleRegionToggle = async (regionCode: RegionCode, enabled: boolean) => {
    if (!config) return;
    
    setConfig({
      ...config,
      regionFlows: {
        ...config.regionFlows,
        [regionCode]: { ...config.regionFlows[regionCode], enabled },
      },
    });
    setHasChanges(true);

    try {
      const res = await fetch("/api/config/kyc-system/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleRegion",
          data: { regionCode, enabled },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setToast({ type: "error", message: data.error || "Toggle failed" });
      }
    } catch {
      setToast({ type: "error", message: "Network error" });
    }
  };

  const handlePermissionsChange = (perms: TierPermissions) => {
    if (!config) return;
    setConfig({
      ...config,
      tierPermissions: {
        ...config.tierPermissions,
        [perms.tier]: perms,
      },
    });
    setHasChanges(true);
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const selectedTierData = selectedTier !== null ? config.tiers.find((t) => t.level === selectedTier) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="KYC System Config"
        description="Manage KYC tiers, verification stages, region flows, and permission mappings."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4" />
              History
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchConfig}>
              <RefreshCw className="w-4 h-4" />
            </Button>
            {hasChanges && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (originalConfig) {
                      setConfig(JSON.parse(JSON.stringify(originalConfig)));
                      setHasChanges(false);
                    }
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  Discard
                </Button>
                <Button size="sm" onClick={() => saveConfig("Manual config update")} loading={saving}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        }
      />

      {/* Version Bar */}
      <Card padding="sm">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-mono text-gray-500">v{config.version}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">
              Updated {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </span>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        {[
          { id: "tiers", label: "Tiers", icon: Layers },
          { id: "stages", label: "Stages", icon: FileCheck },
          { id: "regions", label: "Regions", icon: Globe },
          { id: "permissions", label: "Permissions", icon: Lock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Tiers Tab */}
        {activeTab === "tiers" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">KYC Tiers</h2>
              <div className="grid grid-cols-1 gap-3">
                {config.tiers.map((tier) => (
                  <TierCard
                    key={tier.level}
                    tier={tier}
                    isSelected={selectedTier === tier.level}
                    onSelect={() => setSelectedTier(tier.level)}
                  />
                ))}
              </div>
            </div>
            <div>
              {selectedTierData ? (
                <Card>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${TIER_COLORS[selectedTierData.level]}-100 text-${TIER_COLORS[selectedTierData.level]}-600`}>
                      {TIER_ICONS[selectedTierData.level]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Level {selectedTierData.level}</h3>
                      <p className="text-sm text-gray-500">{selectedTierData.name}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Required Stages</span>
                      <div className="flex flex-wrap gap-2">
                        {selectedTierData.requiredStages.map((stage) => (
                          <span
                            key={stage}
                            className={`text-xs px-2 py-1 rounded-full bg-${STAGE_COLORS[stage]}-100 text-${STAGE_COLORS[stage]}-700 capitalize`}
                          >
                            {stage}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-2">Description</span>
                      <p className="text-sm text-gray-700">{selectedTierData.description}</p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Select a tier to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stages Tab */}
        {activeTab === "stages" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Verification Stages</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(Object.entries(config.stageDefinitions) as [VerificationStage, StageConfig][]).map(([stageId, stage]) => (
                <StageCard
                  key={stageId}
                  stage={stage}
                  onToggle={(enabled) => handleStageToggle(stageId, enabled)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === "regions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Region Flows</h2>
            <div className="grid grid-cols-1 gap-3">
              {(Object.entries(config.regionFlows) as [RegionCode, RegionKYCFlow][]).map(([regionCode, flow]) => (
                <RegionFlowCard
                  key={regionCode}
                  regionCode={regionCode}
                  flow={flow}
                  isExpanded={expandedRegion === regionCode}
                  onToggleExpand={() => setExpandedRegion(expandedRegion === regionCode ? null : regionCode)}
                  onToggleEnabled={(enabled) => handleRegionToggle(regionCode, enabled)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Tier</h2>
              {([0, 1, 2, 3, 4] as KYCTierLevel[]).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    selectedTier === tier
                      ? `bg-${TIER_COLORS[tier]}-50 border border-${TIER_COLORS[tier]}-200`
                      : "bg-white border border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${TIER_COLORS[tier]}-100 text-${TIER_COLORS[tier]}-600`}>
                    {TIER_ICONS[tier]}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Level {tier}</span>
                    <p className="text-xs text-gray-500">{config.tiers.find((t) => t.level === tier)?.name}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="lg:col-span-3">
              {selectedTier !== null && config.tierPermissions[selectedTier] ? (
                <Card>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${TIER_COLORS[selectedTier]}-100 text-${TIER_COLORS[selectedTier]}-600`}>
                      {TIER_ICONS[selectedTier]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Level {selectedTier} Permissions</h3>
                      <p className="text-sm text-gray-500">
                        {config.tiers.find((t) => t.level === selectedTier)?.name}
                      </p>
                    </div>
                  </div>
                  <PermissionsPanel
                    permissions={config.tierPermissions[selectedTier]}
                    onChange={handlePermissionsChange}
                  />
                </Card>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p>Select a tier to configure permissions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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

      {/* History Drawer */}
      {showHistory && <HistoryPanel onClose={() => setShowHistory(false)} />}
    </div>
  );
}
