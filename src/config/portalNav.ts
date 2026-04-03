import {
  LayoutDashboard,
  Wallet,
  BarChart2,
  Copy,
  Zap,
  Users,
  Gift,
  LifeBuoy,
  Settings,
  ChevronDown,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  TrendingUp,
  UserCheck,
  History,
  BookOpen,
  Star,
  Lightbulb,
  Bookmark,
  Award,
  Share2,
  UserPlus,
  DollarSign,
  Network,
  Megaphone,
  CheckSquare,
  Trophy,
  Tag,
  HelpCircle,
  Ticket,
  Activity,
  User,
  Shield,
  CreditCard,
  Bell,
  Globe,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";

export interface NavChild {
  label: string;
  href: string;
  icon?: LucideIcon;
  hidden?: boolean;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavChild[];
}

export const navItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "wallet",
    label: "Wallet",
    href: "/portal/wallet",
    icon: Wallet,
    children: [
      { label: "Overview", href: "/portal/wallet", icon: Wallet },
      { label: "Deposit", href: "/portal/wallet/deposit", icon: ArrowDownToLine },
      { label: "Withdraw", href: "/portal/wallet/withdraw", icon: ArrowUpFromLine },
      { label: "Transfer", href: "/portal/wallet/transfer", icon: ArrowLeftRight },
      { label: "Transactions", href: "/portal/wallet/transactions", icon: FileText },
    ],
  },
  {
    id: "trading",
    label: "Trading",
    href: "/portal/trading",
    icon: BarChart2,
    children: [
      { label: "Accounts", href: "/portal/trading/accounts", icon: BarChart2 },
      { label: "Open Account", href: "/portal/trading/open-account", icon: UserPlus, hidden: true },
      { label: "Positions", href: "/portal/trading/positions", icon: TrendingUp },
      { label: "Orders", href: "/portal/trading/orders", icon: BookOpen },
      { label: "History", href: "/portal/trading/history", icon: History },
    ],
  },
  {
    id: "copy-trading",
    label: "Copy Trading",
    href: "/portal/copy-trading",
    icon: Copy,
    children: [
      { label: "Discover Traders", href: "/portal/copy-trading/discover", icon: Star },
      { label: "My Copy", href: "/portal/copy-trading/my-copy", icon: Copy },
      { label: "Copy Settings", href: "/portal/copy-trading/settings", icon: Settings },
      { label: "Become Trader", href: "/portal/copy-trading/become-trader", icon: UserCheck },
    ],
  },
  {
    id: "ai-signals",
    label: "AI Signals",
    href: "/portal/ai-signals",
    icon: Zap,
    badge: "NEW",
    children: [
      { label: "Signal Feed", href: "/portal/ai-signals/feed", icon: Zap },
      { label: "Generate Signal", href: "/portal/ai-signals/generate", icon: Lightbulb },
      { label: "My Signals", href: "/portal/ai-signals/my-signals", icon: Bookmark },
    ],
  },
  {
    id: "ib",
    label: "IB / Referral",
    href: "/portal/ib",
    icon: Users,
    children: [
      { label: "Overview", href: "/portal/ib/overview", icon: Award },
      { label: "Invite Clients", href: "/portal/ib/invite", icon: Share2 },
      { label: "My Clients", href: "/portal/ib/clients", icon: Users },
      { label: "Commission", href: "/portal/ib/commission", icon: DollarSign },
      { label: "Sub-IB", href: "/portal/ib/sub-ib", icon: Network },
      { label: "Marketing Tools", href: "/portal/ib/tools", icon: Megaphone },
    ],
  },
  {
    id: "activity",
    label: "Activity",
    href: "/portal/activity",
    icon: Gift,
    children: [
      { label: "Tasks", href: "/portal/activity/tasks", icon: CheckSquare },
      { label: "Rewards", href: "/portal/activity/rewards", icon: Trophy },
      { label: "Promotions", href: "/portal/activity/promotions", icon: Tag },
    ],
  },
  {
    id: "support",
    label: "Support",
    href: "/portal/support",
    icon: LifeBuoy,
    children: [
      { label: "Help Center", href: "/portal/support/help", icon: HelpCircle },
      { label: "Submit Ticket", href: "/portal/support/tickets/new", icon: Ticket },
      { label: "My Tickets", href: "/portal/support/tickets", icon: FileText },
      { label: "System Status", href: "/portal/support/status", icon: Activity },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/portal/settings",
    icon: Settings,
    children: [
      { label: "Profile", href: "/portal/settings/profile", icon: User },
      { label: "Security", href: "/portal/settings/security", icon: Shield },
      { label: "Verification", href: "/portal/kyc", icon: UserCheck },
      { label: "Payment Methods", href: "/portal/settings/payment", icon: CreditCard },
      { label: "Notifications", href: "/portal/settings/notifications", icon: Bell },
      { label: "Language", href: "/portal/settings/language", icon: Globe },
    ],
  },
];

// Re-export icons used in nav for convenience
export { ChevronDown };
