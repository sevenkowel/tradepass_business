"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Gift,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ─── Mock Data ─────────────────────────────────────────────
const tasks = [
  {
    id: 1,
    title: "Complete KYC Verification",
    description: "Verify your identity to unlock all features",
    reward: "$50 Bonus",
    progress: 100,
    status: "completed",
    icon: CheckCircle2,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    category: "verification",
  },
  {
    id: 2,
    title: "Make First Deposit",
    description: "Deposit at least $100 to get started",
    reward: "Welcome Bonus",
    progress: 100,
    status: "completed",
    icon: Gift,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    category: "deposit",
  },
  {
    id: 3,
    title: "Complete 5 Trades",
    description: "Execute 5 trades in any instrument",
    reward: "$25 Credit",
    progress: 60,
    status: "in_progress",
    current: 3,
    total: 5,
    icon: Target,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    category: "trading",
  },
  {
    id: 4,
    title: "Invite a Friend",
    description: "Share your referral link with friends",
    reward: "$30 per friend",
    progress: 0,
    status: "pending",
    icon: Trophy,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    category: "referral",
  },
  {
    id: 5,
    title: "Enable 2FA Security",
    description: "Add an extra layer of security to your account",
    reward: "Security Badge",
    progress: 0,
    status: "pending",
    icon: Zap,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    category: "security",
  },
  {
    id: 6,
    title: "Trade for 7 Consecutive Days",
    description: "Maintain trading streak for a week",
    reward: "$100 Bonus",
    progress: 28,
    status: "in_progress",
    current: 2,
    total: 7,
    icon: Clock,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    category: "trading",
  },
];

const filterOptions = [
  { id: "all", label: "All Tasks" },
  { id: "in_progress", label: "In Progress" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
];

// ─── Components ────────────────────────────────────────────
function TaskCard({ task }: { task: (typeof tasks)[0] }) {
  const Icon = task.icon;
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border-2 p-5 transition-all",
        task.status === "completed"
          ? "border-emerald-200 bg-emerald-50/30"
          : "border-gray-200 hover:border-blue-300"
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            task.iconBg
          )}
        >
          <Icon size={22} className={task.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-800">{task.title}</h3>
              <p className="text-sm text-gray-500">{task.description}</p>
            </div>
            <div className="text-right shrink-0">
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  task.status === "completed"
                    ? "bg-emerald-100 text-emerald-700"
                    : task.status === "in_progress"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {task.reward}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-gray-500">
                {task.status === "completed"
                  ? "Completed"
                  : task.status === "in_progress"
                  ? `${task.current}/${task.total} done`
                  : "Not started"}
              </span>
              <span className="font-medium text-gray-700">{task.progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  task.status === "completed"
                    ? "bg-emerald-500"
                    : task.status === "in_progress"
                    ? "bg-amber-500"
                    : "bg-gray-300"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredTasks =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks & Missions"
        description="Complete tasks to earn rewards and bonuses"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
              <Clock size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border-2 border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center">
              <Circle size={18} className="text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveFilter(opt.id)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
              activeFilter === opt.id
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <TaskCard task={task} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
