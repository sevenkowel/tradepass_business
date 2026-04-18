"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Rocket, TrendingUp, Building } from "lucide-react";
import Link from "next/link";

const useCases = [
  {
    icon: Rocket,
    title: "Startup Broker",
    description: "Launch a brokerage in weeks with a ready-to-use infrastructure.",
    features: ["Quick setup", "Low cost", "Full-featured"],
    href: "/solutions/startup-broker",
  },
  {
    icon: TrendingUp,
    title: "Growth Broker",
    description: "Scale your client base with powerful marketing automation.",
    features: ["Marketing tools", "CRM integration", "Growth analytics"],
    href: "/solutions/growth-broker",
  },
  {
    icon: Building,
    title: "Enterprise Broker",
    description: "Unify trading infrastructure and customer growth across regions.",
    features: ["Multi-region", "Custom integration", "Dedicated support"],
    href: "/solutions/enterprise-broker",
  },
];

export function UseCasesSection() {
  return (
    <section className="section bg-surface relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-accent/3 blur-[200px]" />
      </div>

      <div className="container-main relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            Built for Every Stage of{" "}
            <span className="gradient-text">Brokerage Growth</span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Whether you&apos;re just starting or already operating at scale,
            TradePass has the right solution for you.
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative p-8 rounded-3xl bg-background border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <useCase.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-3">
                  {useCase.title}
                </h3>
                <p className="text-foreground/60 mb-6">
                  {useCase.description}
                </p>
                <ul className="space-y-2 mb-8">
                  {useCase.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-2 text-sm text-foreground/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={useCase.href}>
                  <Button variant="outline" className="w-full group/btn">
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}