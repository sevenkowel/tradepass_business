"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Copy,
  Brain,
  Network,
  BarChart3,
  Shield,
  Monitor,
  Download,
  Trash2,
  Check,
  Loader2,
  Puzzle,
  ArrowRight,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/backoffice/ui";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  Copy,
  Brain,
  Network,
  BarChart3,
  Shield,
  Monitor,
};

const APP_ROUTES: Record<string, string> = {
  copy_trading: "/backoffice/copy-trading/traders",
  ai_signals: "/backoffice/ai-signals",
  ib_referral: "/backoffice/ib",
  advanced_reports: "/backoffice/reports/financial",
  risk_enhanced: "/backoffice/risk",
  multi_terminal: "/backoffice/accounts",
};

interface AppItem {
  id: string;
  appId: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  isInstalled: boolean;
  installedAt: string | null;
}

export default function AppsPage() {
  const router = useRouter();
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    const res = await fetch("/api/apps");
    const data = await res.json();
    setApps(data.apps || []);
    setLoading(false);
  };

  const install = async (appId: string) => {
    setActionId(appId);
    await fetch(`/api/apps/${appId}/install`, { method: "POST" });
    await fetchApps();
    setActionId(null);
  };

  const uninstall = async (appId: string) => {
    setActionId(appId);
    await fetch(`/api/apps/${appId}/uninstall`, { method: "POST" });
    await fetchApps();
    setActionId(null);
  };

  const installedCount = apps.filter((a) => a.isInstalled).length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="应用中心"
        description="扩展您的经纪商平台能力"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted-foreground">已安装应用</p>
          <p className="text-2xl font-bold text-foreground mt-1">{installedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted-foreground">可用应用</p>
          <p className="text-2xl font-bold text-foreground mt-1">{apps.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-sm text-muted-foreground">待安装</p>
          <p className="text-2xl font-bold text-foreground mt-1">{apps.length - installedCount}</p>
        </div>
      </div>

      {/* App Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app, index) => {
            const Icon = ICON_MAP[app.icon] || Puzzle;
            const isProcessing = actionId === app.appId;

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "p-5 rounded-xl border transition-all duration-200",
                  app.isInstalled
                    ? "bg-green-50/50 border-green-200"
                    : "bg-surface border-border hover:border-primary/30 hover:shadow-md"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      app.isInstalled
                        ? "bg-green-100 text-green-600"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{app.name}</h3>
                      {app.isInstalled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <Check className="w-3 h-3" /> 已安装
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{app.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      {app.isInstalled ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => router.push(APP_ROUTES[app.appId] || "#")}
                          >
                            <ArrowRight className="w-4 h-4 mr-1" />
                            进入应用
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/backoffice/apps/${app.appId}`)}
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            配置
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => uninstall(app.appId)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => install(app.appId)}
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-1" />
                          )}
                          安装
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
