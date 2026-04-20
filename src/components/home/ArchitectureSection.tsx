"use client";

import { motion } from "framer-motion";
import { Layers, Monitor, Cpu, Shield, Database, Rocket, Globe, Server } from "lucide-react";

const architectureLayers = [
  {
    layer: "Client Experience",
    icon: Monitor,
    description: "Web, Mobile, API interfaces",
  },
  {
    layer: "Trading Core",
    icon: Cpu,
    description: "Order matching & execution",
  },
  {
    layer: "Risk Management",
    icon: Shield,
    description: "Real-time risk controls",
  },
  {
    layer: "Liquidity Connectivity",
    icon: Database,
    description: "Multi-LP integration",
  },
  {
    layer: "Broker Business Platform",
    icon: Layers,
    description: "Back-office & operations",
  },
  {
    layer: "Growth Engine",
    icon: Rocket,
    description: "Marketing & CRM",
  },
  {
    layer: "Trading Ecosystem",
    icon: Globe,
    description: "Social trading & marketplace",
  },
  {
    layer: "Infrastructure",
    icon: Server,
    description: "Cloud & security",
  },
];

export function ArchitectureSection() {
  return (
    <section className="section bg-primary-dark relative overflow-hidden">
      <div className="container-main">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
            TradePass Platform{" "}
            <span className="gradient-text-light">Architecture</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            TradePass is built on a modular, scalable architecture designed for modern brokerages.
          </p>
        </motion.div>

        {/* Architecture Layers */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {architectureLayers.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group p-6 rounded-2xl glass border border-white/5 hover:border-white/30 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/70 mb-1">Layer {index + 1}</div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    {item.layer}
                  </h3>
                  <p className="text-sm text-white/40">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Connecting Line (Desktop) */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-y-1/2 w-[2px] h-[400px] bg-gradient-to-b from-accent/0 via-accent/30 to-accent/0" />
      </div>
    </section>
  );
}