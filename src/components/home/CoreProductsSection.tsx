"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Zap, Shield, Building2, Rocket, Globe } from "lucide-react";
import Link from "next/link";

const products = [
  {
    icon: Zap,
    title: "Trading Core",
    description: "Ultra-low latency order execution and position management.",
    features: ["< 1ms latency", "Multi-asset support", "High-frequency trading"],
  },
  {
    icon: Shield,
    title: "Risk Management",
    description: "Real-time monitoring and automated risk control.",
    features: ["Real-time alerts", "Position limits", "Margin calls"],
  },
  {
    icon: Building2,
    title: "Broker Platform",
    description: "Complete back-office for broker operations.",
    features: ["User management", "Payment processing", "KYC/AML compliance"],
  },
  {
    icon: Rocket,
    title: "Growth Engine",
    description: "CRM, marketing automation, and customer data platform.",
    features: ["Lead tracking", "Campaign automation", "Analytics dashboard"],
  },
  {
    icon: Globe,
    title: "Trading Ecosystem",
    description: "Copy trading, signal marketplace, and strategy hub.",
    features: ["Social trading", "Signal providers", "Strategy marketplace"],
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
            Powerful Products Built for{" "}
            <span className="gradient-text">Broker Growth</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From trading infrastructure to customer acquisition, 
            we have everything you need to build a successful brokerage.
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
              <p className="text-foreground/60 text-sm mb-6">
                {product.description}
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
                  Learn more
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