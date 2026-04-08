"use client";

import { Shield, Award, Landmark, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const regulators = [
  { name: "FCA", fullName: "英国金融行为监管局" },
  { name: "ASIC", fullName: "澳大利亚证券投资委员会" },
  { name: "SVG", fullName: "圣文森特和格林纳丁斯" },
];

const awards = [
  "Best Forex Broker 2025",
  "Most Trusted Broker 2024",
];

const securityFeatures = [
  "客户资金隔离存放",
  "银行级 SSL 加密",
  "负余额保护",
];

export function TrustSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full"
    >
      {/* 全球监管 */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Landmark size={18} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            全球监管
          </h4>
          <div className="flex flex-wrap gap-2">
            {regulators.map((reg) => (
              <span
                key={reg.name}
                className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600"
                title={reg.fullName}
              >
                {reg.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 行业认可 */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
          <Award size={18} className="text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            行业认可
          </h4>
          <div className="space-y-0.5">
            {awards.map((award) => (
              <p key={award} className="text-xs text-slate-500">
                {award}
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* 资金安全 */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
          <Shield size={18} className="text-emerald-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">
            资金安全
          </h4>
          <div className="space-y-0.5">
            {securityFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-1.5">
                <CheckCircle2 size={10} className="text-emerald-500" />
                <span className="text-xs text-slate-500">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
