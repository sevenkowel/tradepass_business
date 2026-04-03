"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ui/ThemeProvider";
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ChevronDown,
  TrendingUp,
  Building2,
  Shield,
  Rocket,
  Globe,
  FileText,
  Users,
  Mail
} from "lucide-react";

const products = [
  { name: "Trading Infrastructure", href: "/products/trading-infrastructure", icon: TrendingUp },
  { name: "Broker Platform", href: "/products/broker-platform", icon: Building2 },
  { name: "Risk Management", href: "/products/risk-management", icon: Shield },
  { name: "Growth Engine", href: "/products/growth-engine", icon: Rocket },
  { name: "Trading Ecosystem", href: "/products/trading-ecosystem", icon: Globe },
];

const solutions = [
  { name: "Startup Broker", href: "/solutions/startup-broker" },
  { name: "Growth Broker", href: "/solutions/growth-broker" },
  { name: "Enterprise Broker", href: "/solutions/enterprise-broker" },
];

const resources = [
  { name: "Blog", href: "/resources/blog", icon: FileText },
  { name: "Documentation", href: "/resources/docs", icon: FileText },
  { name: "API", href: "/resources/api", icon: FileText },
  { name: "Whitepaper", href: "/resources/whitepaper", icon: FileText },
];

const company = [
  { name: "About", href: "/company/about", icon: Users },
  { name: "Contact", href: "/contact", icon: Mail },
];

interface NavItemProps {
  label: string;
  items?: { name: string; href: string; icon?: React.ElementType }[];
  href?: string;
}

function NavItem({ label, items, href }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasDropdown = items && items.length > 0;

  return (
    <div 
      className="relative"
      onMouseEnter={() => hasDropdown && setIsOpen(true)}
      onMouseLeave={() => hasDropdown && setIsOpen(false)}
    >
      {href ? (
        <Link 
          href={href}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          {label}
        </Link>
      ) : (
        <button className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
          {label}
          {hasDropdown && <ChevronDown className="w-4 h-4" />}
        </button>
      )}

      <AnimatePresence>
        {hasDropdown && isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 pt-2"
          >
            <div className="glass-dark rounded-xl shadow-xl border border-white/10 overflow-hidden min-w-[220px]">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {item.icon && <item.icon className="w-4 h-4 text-accent" />}
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="container-main">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-primary font-bold text-xl">T</span>
            </div>
            <span className="font-heading font-bold text-xl text-foreground">TradePass</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <NavItem label="Products" items={products} />
            <NavItem label="Solutions" items={solutions} />
            <NavItem label="Ecosystem" href="/ecosystem" />
            <NavItem label="Resources" items={resources} />
            <NavItem label="Company" items={company} />
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-foreground/60 hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <Button size="sm">Start Demo</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-white/10"
          >
            <div className="container-main py-6 space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white/40 px-4">Products</div>
                {products.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <item.icon className="w-4 h-4 text-accent" />
                    {item.name}
                  </Link>
                ))}
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-semibold text-white/40 px-4">Solutions</div>
                {solutions.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>

              <Link
                href="/ecosystem"
                className="block px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
              >
                Ecosystem
              </Link>

              <div className="pt-4 border-t border-white/10 space-y-3">
                <Button className="w-full">Start Demo</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}