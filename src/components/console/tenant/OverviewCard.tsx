"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, ExternalLink } from "lucide-react";

interface OverviewCardProps {
  tenant: {
    name: string;
    subdomain: string;
    brand: {
      brandName: string;
      logoUrl: string | null;
    };
  };
}

export function OverviewCard({ tenant }: OverviewCardProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.protocol + "//" : "http://";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:3002";
  const mainDomain = host.replace(/^[^.]+\./, "");

  const websiteUrl = `${baseUrl}${tenant.subdomain}.${mainDomain}`;
  const portalUrl = `${baseUrl}portal.${tenant.subdomain}.${mainDomain}`;
  const crmUrl = `${baseUrl}crm.${tenant.subdomain}.${mainDomain}/crm`;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
          <Globe className="w-4 h-4" /> 业务系统入口
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-medium">租户官网</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-medium">Portal 门户</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
        <a
          href={crmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <span className="text-sm font-medium">CRM 后台</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </CardContent>
    </Card>
  );
}
