"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  CreditCard, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  AlertTriangle,
  Eye,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, PageHeader, StatusBadge } from "@/components/backoffice/ui";
import { LineChartComponent, BarChartComponent, AreaChartComponent, PieChartComponent } from "@/components/backoffice/charts";
import { Breadcrumb } from "@/components/backoffice/layout";

// Mock data
const kpiData = [
  {
    title: "Today's Deposits",
    value: "$1,234,567",
    change: 12.5,
    icon: DollarSign,
    color: "emerald",
  },
  {
    title: "Today's Withdrawals",
    value: "$456,789",
    change: -5.2,
    icon: CreditCard,
    color: "red",
  },
  {
    title: "Net Deposit",
    value: "$777,778",
    change: 18.3,
    icon: TrendingUp,
    color: "blue",
  },
  {
    title: "New Users",
    value: "1,234",
    change: 8.7,
    icon: Users,
    color: "purple",
  },
  {
    title: "Active Traders",
    value: "5,678",
    change: -2.1,
    icon: Activity,
    color: "orange",
  },
  {
    title: "Pending Reviews",
    value: "89",
    change: -15.3,
    icon: Clock,
    color: "amber",
  },
];

const volumeData = [
  { date: "Mon", value: 4500, volume: 3200 },
  { date: "Tue", value: 5200, volume: 3800 },
  { date: "Wed", value: 4800, volume: 3500 },
  { date: "Thu", value: 6100, volume: 4200 },
  { date: "Fri", value: 5500, volume: 4000 },
  { date: "Sat", value: 3200, volume: 2500 },
  { date: "Sun", value: 2800, volume: 2100 },
];

const userData = [
  { date: "Week 1", registered: 120, verified: 80, deposited: 45 },
  { date: "Week 2", registered: 145, verified: 95, deposited: 52 },
  { date: "Week 3", registered: 132, verified: 88, deposited: 48 },
  { date: "Week 4", registered: 168, verified: 110, deposited: 62 },
];

const depositWithdrawData = [
  { date: "Mon", deposit: 450, withdraw: 120 },
  { date: "Tue", deposit: 520, withdraw: 180 },
  { date: "Wed", deposit: 480, withdraw: 150 },
  { date: "Thu", deposit: 610, withdraw: 200 },
  { date: "Fri", deposit: 550, withdraw: 190 },
  { date: "Sat", deposit: 320, withdraw: 80 },
  { date: "Sun", deposit: 280, withdraw: 60 },
];

const instrumentData = [
  { name: "XAUUSD", value: 45000, color: "#F59E0B" },
  { name: "EURUSD", value: 32000, color: "#3B82F6" },
  { name: "GBPJPY", value: 18000, color: "#10B981" },
  { name: "USDJPY", value: 15000, color: "#8B5CF6" },
  { name: "Others", value: 12000, color: "#6B7280" },
];

const recentOrders = [
  { id: "ORD001", user: "John D.", symbol: "XAUUSD", type: "buy", volume: 0.5, profit: 125.50, time: "2 min ago" },
  { id: "ORD002", user: "Sarah M.", symbol: "EURUSD", type: "sell", volume: 1.0, profit: -45.20, time: "5 min ago" },
  { id: "ORD003", user: "Mike T.", symbol: "GBPJPY", type: "buy", volume: 2.0, profit: 320.80, time: "8 min ago" },
  { id: "ORD004", user: "Emma W.", symbol: "XAUUSD", type: "buy", volume: 0.1, profit: 25.00, time: "12 min ago" },
  { id: "ORD005", user: "Alex K.", symbol: "USDJPY", type: "sell", volume: 5.0, profit: 180.50, time: "15 min ago" },
];

const riskAlerts = [
  { id: 1, user: "USR12345", alert: "Margin level below 100%", severity: "high", time: "3 min ago" },
  { id: 2, user: "USR67890", alert: "Large drawdown detected", severity: "medium", time: "8 min ago" },
  { id: 3, user: "USR11223", alert: "Multiple failed withdrawals", severity: "low", time: "15 min ago" },
];

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

function KPICard({ title, value, change, icon: Icon, color, delay = 0 }: KPICardProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;

  const colorMap: Record<string, { bg: string; icon: string; border: string }> = {
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", border: "border-emerald-200" },
    red: { bg: "bg-red-50", icon: "text-red-600", border: "border-red-200" },
    blue: { bg: "bg-blue-50", icon: "text-blue-600", border: "border-blue-200" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600", border: "border-purple-200" },
    orange: { bg: "bg-orange-50", icon: "text-orange-600", border: "border-orange-200" },
    amber: { bg: "bg-amber-50", icon: "text-amber-600", border: "border-amber-200" },
  };

  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border", c.bg, c.border)}>
          <Icon size={20} className={c.icon} />
        </div>
        <div className={cn(
          "flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg",
          isPositive && "bg-emerald-50 text-emerald-600 border border-emerald-200",
          isNegative && "bg-red-50 text-red-600 border border-red-200",
          !isPositive && !isNegative && "bg-gray-50 text-gray-500 border border-gray-200"
        )}>
          {isPositive ? <ArrowUpRight size={11} /> : isNegative ? <ArrowDownRight size={11} /> : null}
          {isPositive && "+"}
          {change}%
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "month">("7d");

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <PageHeader
        title="Dashboard Overview"
        description="Real-time monitoring of platform operations"
        actions={
          <div className="flex gap-2">
            {(["7d", "30d", "month"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "This Month"}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={kpi.title}
            {...kpi}
            delay={index * 0.05}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Volume Trend */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Trading Volume Trend</h3>
            <p className="text-sm text-gray-500 mt-1">Volume and transaction count over time</p>
          </div>
          <div className="p-5">
            <LineChartComponent
              data={volumeData}
              xKey="date"
              yKeys={[
                { key: "value", name: "Volume ($)", color: "#3B82F6" },
                { key: "volume", name: "Transactions", color: "#10B981" },
              ]}
              height={280}
            />
          </div>
        </Card>

        {/* User Registration Trend */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">User Registration Funnel</h3>
            <p className="text-sm text-gray-500 mt-1">Weekly user registration and conversion</p>
          </div>
          <div className="p-5">
            <BarChartComponent
              data={userData}
              xKey="date"
              yKeys={[
                { key: "registered", name: "Registered", color: "#3B82F6" },
                { key: "verified", name: "Verified", color: "#10B981" },
                { key: "deposited", name: "Deposited", color: "#F59E0B" },
              ]}
              stacked
              height={280}
            />
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deposit/Withdraw Comparison */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Deposit vs Withdrawal</h3>
            <p className="text-sm text-gray-500 mt-1">Daily comparison of deposits and withdrawals</p>
          </div>
          <div className="p-5">
            <AreaChartComponent
              data={depositWithdrawData}
              xKey="date"
              yKeys={[
                { key: "deposit", name: "Deposit", color: "#10B981" },
                { key: "withdraw", name: "Withdrawal", color: "#EF4444" },
              ]}
              height={250}
            />
          </div>
        </Card>

        {/* Trading by Instrument */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Trading by Instrument</h3>
            <p className="text-sm text-gray-500 mt-1">Distribution by trading instrument</p>
          </div>
          <div className="p-5">
            <PieChartComponent
              data={instrumentData}
              height={250}
            />
          </div>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500 mt-1">Latest trading activity</p>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Symbol</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Volume</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Profit</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-mono text-gray-900">{order.id}</td>
                    <td className="px-5 py-3 text-sm text-gray-700">{order.user}</td>
                    <td className="px-5 py-3 text-sm text-gray-900">{order.symbol}</td>
                    <td className="px-5 py-3">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 text-xs font-semibold rounded",
                        order.type === "buy" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}>
                        {order.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-900 text-right">{order.volume}</td>
                    <td className={cn(
                      "px-5 py-3 text-sm font-medium text-right",
                      order.profit >= 0 ? "text-emerald-600" : "text-red-600"
                    )}>
                      {order.profit >= 0 ? "+" : ""}${order.profit.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Risk Alerts */}
        <Card padding="none">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Risk Alerts</h3>
              <p className="text-sm text-gray-500 mt-1">Active risk warnings</p>
            </div>
            <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-600 rounded-lg">
              {riskAlerts.length} Active
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {riskAlerts.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    alert.severity === "high" && "bg-red-100",
                    alert.severity === "medium" && "bg-amber-100",
                    alert.severity === "low" && "bg-gray-100"
                  )}>
                    <AlertTriangle 
                      size={16} 
                      className={
                        alert.severity === "high" ? "text-red-600" : 
                        alert.severity === "medium" ? "text-amber-600" : "text-gray-600"
                      } 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.user}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{alert.alert}</p>
                    <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                  </div>
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-100">
            <button className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Alerts
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
