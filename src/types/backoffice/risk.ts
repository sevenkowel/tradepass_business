// Backoffice Risk Types
export type RiskAlertLevel = 'info' | 'warning' | 'critical';
export type RiskRuleStatus = 'active' | 'inactive';
export type MarginAlertStatus = 'normal' | 'warning' | 'margin_call' | 'stop_out';

export interface RiskAlert {
  id: string;
  alertId: string;
  accountId: string;
  username: string;
  type: 'margin' | 'concentration' | 'rapid_loss' | 'unusual_volume' | 'nbp_breach';
  level: RiskAlertLevel;
  title: string;
  description: string;
  metrics: Record<string, number | string>;
  status: 'new' | 'acknowledged' | 'resolved' | 'escalated';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
}

export interface RiskRule {
  id: string;
  ruleId: string;
  name: string;
  description: string;
  type: 'margin' | 'exposure' | 'volume' | 'frequency' | 'nbp' | 'rapid_loss' | 'concentration' | 'unusual_volume';
  condition: string;
  threshold: number;
  action: 'alert' | 'freeze' | 'close_position' | 'limit_trade';
  status: RiskRuleStatus;
  priority: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MarginAlert {
  id: string;
  accountId: string;
  username: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  status: MarginAlertStatus;
  triggeredRules: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface NBPProtection {
  id: string;
  accountId: string;
  username: string;
  balance: number;
  equity: number;
  nbpLevel: number;
  protectionEnabled: boolean;
  lastUpdated: string;
}

export interface RiskMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
}
