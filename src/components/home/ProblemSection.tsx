"use client";

import { motion } from "framer-motion";
import { AlertTriangle, XCircle, CheckCircle } from "lucide-react";

const problems = [
  { icon: AlertTriangle, title: "High operational costs", description: "Multiple vendors mean multiple bills, integrations, and overhead." },
  { icon: XCircle, title: "Poor data integration", description: "Fragmented systems create data silos and inconsistent customer experiences." },
  { icon: AlertTriangle, title: "Slow product innovation", description: "Complex integrations slow down new feature delivery and market responsiveness." },
  { icon: XCircle, title: "Limited customer growth", description: "Disconnected marketing tools hinder lead conversion and retention." },
];

const solution = "TradePass solves this by providing a unified broker operating system.";

export function ProblemSection() {
  return (
    <section className="section bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-white/5 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px]" />
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-4">
            The Broker Industry Is Built on{" "}
            <span className="gradient-text-light">Fragmented Systems</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Most brokers rely on multiple vendors for trading servers, CRM, payments, 
            risk management, and marketing.
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex gap-4 p-6 rounded-2xl glass"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                <problem.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{problem.title}</h3>
                <p className="text-white/60 text-sm">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Solution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-white/10 border border-white/20"
        >
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <p className="text-lg font-semibold text-white">{solution}</p>
        </motion.div>
      </div>
    </section>
  );
}