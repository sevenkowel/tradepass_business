"use client";

import { Shield, Award, Landmark } from "lucide-react";

const regulators = [
  { name: "FCA", fullName: "英国金融行为监管局" },
  { name: "ASIC", fullName: "澳大利亚证券投资委员会" },
  { name: "SVG", fullName: "圣文森特和格林纳丁斯" },
];

const awards = [
  "Best Forex Broker 2025",
  "Most Trusted Broker 2024",
];

export function TrustSection() {
  return (
    <section className="py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 监管牌照 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Landmark size={16} className="text-gray-400" />
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              监管机构
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {regulators.map((reg) => (
              <span
                key={reg.name}
                className="text-xs px-2 py-1 border border-gray-200 rounded text-gray-600"
                title={reg.fullName}
              >
                {reg.name}
              </span>
            ))}
          </div>
        </div>

        {/* 奖项 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-gray-400" />
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              荣誉奖项
            </h4>
          </div>
          <div className="space-y-1">
            {awards.map((award) => (
              <p key={award} className="text-xs text-gray-600">
                {award}
              </p>
            ))}
          </div>
        </div>

        {/* 资金安全 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-gray-400" />
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              资金安全
            </h4>
          </div>
          <p className="text-xs text-gray-600">客户资金隔离存放</p>
          <p className="text-xs text-gray-600">银行级 SSL 加密</p>
        </div>
      </div>
    </section>
  );
}
