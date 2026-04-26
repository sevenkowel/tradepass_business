"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Building2, Rocket, Zap, Shield, Newspaper, Brain } from "lucide-react";
import Link from "next/link";

const products = [
  {
    icon: Building2,
    title: "TradePass Business",
    description: "外汇经纪商业务系统基础层。KYC、开户、存取款、用户管理、基础报表。",
    features: ["Portal + Backoffice", "9 地区 KYC 适配", "USDT / 银行 / 信用卡", "基础报表"],
    price: "$7,000/月",
  },
  {
    icon: Rocket,
    title: "TradePass Growth",
    description: "增长营销引擎。多级 IB、营销自动化、转化漏斗、客户数据平台。",
    features: ["L1/L2/L3 IB 代理", "营销自动化", "客户画像 CDP", "转化漏斗"],
    price: "$5,000/月",
  },
  {
    icon: Zap,
    title: "TradePass Engine",
    description: "交易基础设施。MT5 终端、订单持仓、跟单交易、AI 信号、API。",
    features: ["MT5 Web 终端", "订单持仓管理", "跟单交易", "AI 交易信号", "API 集成"],
    price: "$10,000/月",
  },
  {
    icon: Shield,
    title: "TradePass Edge",
    description: "风控与流动性层。实时风控、保证金告警、黑名单、LP 聚合。",
    features: ["实时风控引擎", "保证金告警", "黑名单管理", "LP 聚合"],
    price: "$9,000/月",
  },
  {
    icon: Newspaper,
    title: "TradePass Media",
    description: "媒体资讯服务。财经日历、新闻快讯、财经头条、市场评论。",
    features: ["财经日历", "新闻快讯", "市场评论", "数据可视化"],
    price: "$2,000/月",
  },
  {
    icon: Brain,
    title: "TradePass AI",
    description: "AI 智能服务。AI 交易信号、策略、订单分析、日报周报月报。",
    features: ["AI 交易策略", "订单深度分析", "AI 日报/周报/月报", "AI 风控预警"],
    price: "$5,000/月",
  },
];

export function CoreProductsSection() {
  return (
    <section className="section bg-background relative overflow-hidden">
      <div className="container-main">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            6 大产品线，构建完整的{" "}
            <span className="gradient-text">经纪商生态</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            从业务运营到交易技术，从增长营销到 AI 智能，
            TradePass 提供一站式外汇经纪商 SaaS 解决方案。
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-8 rounded-2xl bg-surface border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <product.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {product.title}
              </h3>
              <p className="text-foreground/60 text-sm mb-4">
                {product.description}
              </p>
              <p className="text-accent font-bold text-lg mb-4">
                {product.price}
              </p>
              <ul className="space-y-2 mb-6">
                {product.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-2 text-sm text-foreground/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <Button variant="ghost" size="sm" className="group/btn">
                  免费试用
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}