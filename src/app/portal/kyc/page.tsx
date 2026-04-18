"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Globe, ChevronRight, Loader2, AlertTriangle, Construction } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useKYCStore } from "@/lib/kyc/store";
import { useKYCConfig } from "@/lib/config/hooks";
import type { RegionCode } from "@/lib/kyc/region-config";

const regionNames: Record<string, string> = {
  VN: "越南",
  TH: "泰国",
  IN: "印度",
  AE: "阿联酋",
  KR: "韩国",
  JP: "日本",
  FR: "法国",
  ES: "西班牙",
  BR: "巴西",
};

export default function KYCPage() {
  const router = useRouter();
  const [selectedRegion, setSelectedRegion] = useState<RegionCode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 选择地区后自动滚动到按钮位置
  useEffect(() => {
    if (selectedRegion && buttonRef.current) {
      // 等待 Requirements 区域展开后再滚动
      const timer = setTimeout(() => {
        buttonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedRegion]);

  const { config, isLoading: configLoading, error: configError, refetch, getRegionConfig, getEnabledRegions, isOpen, isInMaintenance, maintenanceMessage } = useKYCConfig();

  const enabledRegions = getEnabledRegions();
  const { setRegion, setCurrentStep } = useKYCStore();

  const handleStart = async () => {
    if (!selectedRegion) return;

    setIsLoading(true);
    setRegion(selectedRegion);
    setCurrentStep(1);

    await new Promise(resolve => setTimeout(resolve, 500));
    router.push("/portal/kyc/document");
  };

  // 加载配置中
  if (configLoading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--tp-accent-rgb))] mx-auto mb-4" />
          <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">正在加载配置...</p>
        </div>
      </div>
    );
  }

  // 配置加载失败
  if (configError || !config) {
    return (
      <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2">
              配置加载失败
            </h2>
            <p className="text-[rgba(var(--tp-fg-rgb),0.6)] mb-6">
              {configError || "无法加载 KYC 配置，请重试。"}
            </p>
            <Button onClick={refetch} variant="outline">
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 维护模式
  if (isInMaintenance) {
    return (
      <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <Construction className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2">
              系统维护中
            </h2>
            <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">
              {maintenanceMessage || "开户服务暂时不可用，请稍后再试。"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 开户功能关闭
  if (!isOpen) {
    return (
      <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 text-center">
            <Shield className="w-12 h-12 text-[rgb(var(--tp-accent-rgb))] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2">
              开户已关闭
            </h2>
            <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">
              当前无法开户，请稍后再试。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedRegionConfig = selectedRegion ? getRegionConfig(selectedRegion) : null;

  return (
    <div className="min-h-screen bg-[rgb(var(--tp-bg-rgb))] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[rgb(var(--tp-accent-rgb))]" />
          </div>
          <h1 className="text-3xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-3">
            身份认证
          </h1>
          <p className="text-[rgba(var(--tp-fg-rgb),0.7)] max-w-md mx-auto">
            完成 KYC 认证以解锁完整交易权限。整个过程约需 5-10 分钟。
          </p>
          {config.version && (
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.3)] mt-2">
              Config v{config.version}
            </p>
          )}
        </motion.div>

        {/* Region Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
                选择地区
              </CardTitle>
              <CardDescription>
                共 {enabledRegions.length} 个地区可选，请选择您的居住国家/地区。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select
                value={selectedRegion || undefined}
                onValueChange={(value) => setSelectedRegion(value as RegionCode)}
              >
                <SelectTrigger className="h-12 bg-[rgb(var(--tp-surface-rgb))]">
                  <SelectValue placeholder="请选择您的国家/地区" />
                </SelectTrigger>
                <SelectContent>
                  {enabledRegions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {regionNames[code] || code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dynamic Features Preview (from API config) */}
              {selectedRegion && selectedRegionConfig && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.05)] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
                      {regionNames[selectedRegion]} 的认证要求：
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))] capitalize">
                      {selectedRegionConfig.kycLevel}
                    </span>
                  </div>
                  <ul className="space-y-2 text-sm text-[rgba(var(--tp-fg-rgb),0.7)]">
                    {config.steps.document.enabled && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                        {selectedRegionConfig.allowedDocuments.join(" or ")}
                      </li>
                    )}
                    {selectedRegionConfig.features.livenessRequired && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                        人脸识别（活体检测）
                      </li>
                    )}
                    {selectedRegionConfig.features.addressProofRequired && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                        地址证明
                      </li>
                    )}
                    {config.steps.personalInfo.enabled && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                        个人及财务信息
                      </li>
                    )}
                    {config.steps.agreements.enabled && (
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[rgb(var(--tp-accent-rgb))]" />
                        协议签署
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}

              <Button
                ref={buttonRef}
                onClick={handleStart}
                disabled={!selectedRegion || isLoading}
                size="lg"
                className="w-full !bg-[var(--tp-accent,rgb(30,64,175))] hover:!bg-[var(--tp-accent-dark,rgb(20,50,150))] !text-white disabled:!opacity-60 disabled:!bg-[var(--tp-accent,rgb(30,64,175))]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    正在启动...
                  </>
                ) : (
                  <>
                    开始认证
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">5-10</p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">完成所需时间（分钟）</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">
              {config.defaults.reviewMode === "auto" ? "<1" : "1-2"}
            </p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">审核时间（天）· {config.defaults.reviewMode === "auto" ? "自动审核" : "人工审核"}</p>
          </div>
          <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
            <p className="text-2xl font-bold text-[rgb(var(--tp-accent-rgb))]">256-bit</p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">加密强度</p>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-[rgba(var(--tp-fg-rgb),0.4)] mt-8"
        >
          您的数据受银行级加密保护，并符合 GDPR 规范存储。
        </motion.p>
      </div>
    </div>
  );
}
