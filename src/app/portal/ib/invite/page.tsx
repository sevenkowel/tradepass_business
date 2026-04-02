"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Copy, CheckCircle2, Share2, Mail, MessageCircle,
  Link2, Users, Gift, TrendingUp
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { cn } from "@/lib/utils";

export default function InvitePage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://tradepass.com/ref/IB784321";
  const referralCode = "IB784321";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { icon: Mail, label: "Email", color: "blue" },
    { icon: MessageCircle, label: "WhatsApp", color: "emerald" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Invite Friends" description="Share your referral link and earn commission from their trades." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Referral link */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main referral card */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Gift size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Refer & Earn</h3>
                <p className="text-sm text-white/80">Get up to 30% commission from your referrals</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
              <p className="text-xs text-white/70 mb-2">Your Referral Link</p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-sm font-mono text-white truncate">{referralLink}</code>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors",
                    copied ? "bg-emerald-500 text-white" : "bg-white text-blue-600 hover:bg-blue-50"
                  )}
                >
                  {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Link"}
                </motion.button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xs text-white/70">Or share via:</p>
              <div className="flex items-center gap-2">
                {shareOptions.map(({ icon: Icon, label, color }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      color === "blue" && "bg-white/20 hover:bg-white/30",
                      color === "emerald" && "bg-emerald-500/30 hover:bg-emerald-500/40",
                      color === "sky" && "bg-sky-500/30 hover:bg-sky-500/40",
                      color === "indigo" && "bg-indigo-500/30 hover:bg-indigo-500/40",
                    )}
                    title={label}
                  >
                    <Icon size={14} className="text-white" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Referral code */}
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800">Referral Code</p>
                <p className="text-xs text-gray-500">Share this code for manual entry</p>
              </div>
              <div className="flex items-center gap-3">
                <code className="px-4 py-2 rounded-xl bg-gray-50 border-2 border-gray-200 font-mono text-sm font-bold text-gray-900">
                  {referralCode}
                </code>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { navigator.clipboard.writeText(referralCode); }}
                  className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Copy size={16} />
                </motion.button>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-4">How It Works</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Share", desc: "Send your link to friends" },
                { step: "2", title: "Sign Up", desc: "They create an account" },
                { step: "3", title: "Earn", desc: "Get commission on their trades" },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm mx-auto mb-2">
                    {step}
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Your Stats</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Total Invited", value: "24" },
                { label: "Active Traders", value: "18" },
                { label: "Total Earnings", value: "$3,247" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{label}</span>
                  <span className="font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-emerald-200 flex items-center justify-center">
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-emerald-800">Commission Tiers</h3>
            </div>
            <div className="space-y-2">
              {[
                { tier: "Bronze", clients: "0-5", rate: "20%" },
                { tier: "Silver", clients: "6-15", rate: "25%" },
                { tier: "Gold", clients: "16-30", rate: "30%" },
              ].map(({ tier, clients, rate }) => (
                <div key={tier} className="flex items-center justify-between py-2 border-b border-emerald-200/50 last:border-0">
                  <div>
                    <span className="text-sm font-bold text-emerald-800">{tier}</span>
                    <span className="text-xs text-emerald-600 ml-2">({clients})</span>
                  </div>
                  <span className="font-bold text-emerald-700">{rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
