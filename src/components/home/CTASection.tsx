"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Mail } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="section bg-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-white/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[120px]" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 212, 170, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 212, 170, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-6">
            Launch Your Brokerage with{" "}
            <span className="gradient-text-light">TradePass</span>
          </h2>
          <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
            Start building your brokerage platform with a modern trading infrastructure. 
            Get started today and scale with confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="group">
                Request Demo
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="mailto:sales@tradepass.io">
              <Button variant="outline" size="lg" className="border-white/20 text-white hover:border-white hover:text-white hover:bg-white/10">
                <Mail className="w-4 h-4 mr-2" />
                Contact Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}