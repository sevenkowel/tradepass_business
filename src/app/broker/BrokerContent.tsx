"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  TrendingUp,
  Shield,
  Zap,
  Globe,
  BarChart3,
  ChevronRight,
  Menu,
  X,
  ArrowRight,
  Lock,
  Headphones,
  Award,
  Loader2,
} from "lucide-react";

interface BrandConfig {
  brandName: string;
  slogan: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  primaryColor: string;
  subdomain: string | null;
}

const DEFAULT_BRAND: BrandConfig = {
  brandName: "TradePass",
  slogan: "The Operating System for Modern Brokers",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "#f59e0b",
  subdomain: null,
};

const navLinks = [
  { label: "Products", href: "#markets" },
  { label: "Why Us", href: "#features" },
  { label: "Support", href: "#support" },
];

const features = [
  {
    icon: TrendingUp,
    title: "Ultra-Low Spreads",
    desc: "Spreads from 0.0 pips on major pairs. Maximize every trade with razor-thin pricing.",
  },
  {
    icon: Zap,
    title: "Lightning Execution",
    desc: "Sub-millisecond order execution. No requotes, no dealer intervention.",
  },
  {
    icon: Shield,
    title: "Funds Protection",
    desc: "Segregated client accounts + negative balance protection. Your capital is safe.",
  },
  {
    icon: Globe,
    title: "Global Markets",
    desc: "Access 1000+ instruments across Forex, Indices, Commodities, and Crypto.",
  },
];

const markets = [
  { name: "Forex", pairs: "80+", spread: "0.0 pips", icon: BarChart3 },
  { name: "Indices", pairs: "15+", spread: "0.3 pts", icon: TrendingUp },
  { name: "Gold & Silver", pairs: "6+", spread: "0.15¢", icon: Award },
  { name: "Crypto", pairs: "30+", spread: "0.1%", icon: Zap },
];

const stats = [
  { value: "500K+", label: "Active Traders" },
  { value: "0.0", label: "Min Spread (pips)" },
  { value: "$0", label: "Deposit Fee" },
  { value: "24/7", label: "Support" },
];

function lightenColor(hex: string, percent: number) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export default function BrokerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");

  const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
  const [brandLoading, setBrandLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadBrand() {
      try {
        const params = tenantId ? `?tenantId=${tenantId}` : "";
        const res = await fetch(`/api/tenant/brand${params}`);
        const data = await res.json();
        if (data.success && data.data) {
          setBrand({ ...DEFAULT_BRAND, ...data.data });
        }
      } catch {
        // keep default
      } finally {
        setBrandLoading(false);
      }
    }
    loadBrand();
  }, [tenantId]);

  const primary = brand.primaryColor;
  const primaryLight = lightenColor(primary, 30);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const qp = tenantId
      ? `?tenantId=${tenantId}${email ? `&email=${encodeURIComponent(email)}` : ""}`
      : email
      ? `?email=${encodeURIComponent(email)}`
      : "";
    router.push(`/auth/portal/register${qp}`);
  };

  const BrandLogo = () => {
    if (brand.logoUrl) {
      return <img src={brand.logoUrl} alt={brand.brandName} className="h-8 w-auto object-contain" />;
    }
    return (
      <>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})` }}
        >
          <TrendingUp className="w-5 h-5 text-slate-950" />
        </div>
        <span className="text-lg font-bold tracking-tight">{brand.brandName}</span>
      </>
    );
  };

  if (brandLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: primary }} />
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/broker" className="flex items-center gap-2">
              <BrandLogo />
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href={`/auth/portal/login${tenantId ? `?tenantId=${tenantId}` : ""}`}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
              >
                Log In
              </Link>
              <Link
                href={`/auth/portal/register${tenantId ? `?tenantId=${tenantId}` : ""}`}
                className="text-sm font-medium text-slate-950 px-5 py-2 rounded-lg transition-colors"
                style={{ backgroundColor: primary }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = primaryLight; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = primary; }}
              >
                Sign Up
              </Link>
            </div>

            <button className="md:hidden text-slate-300" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="block text-sm text-slate-400 hover:text-white py-2" onClick={() => setMobileOpen(false)}>
                {link.label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
              <Link href={`/auth/portal/login${tenantId ? `?tenantId=${tenantId}` : ""}`} className="text-center text-sm font-medium text-slate-300 hover:text-white py-2">
                Log In
              </Link>
              <Link
                href={`/auth/portal/register${tenantId ? `?tenantId=${tenantId}` : ""}`}
                className="text-center text-sm font-medium text-slate-950 py-2 rounded-lg"
                style={{ backgroundColor: primary }}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full blur-[120px] pointer-events-none"
          style={{ backgroundColor: primary + "26" }}
        />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Now accepting new clients worldwide
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            Trade Global Markets
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${primary}, ${lightenColor(primary, 40)})` }}
            >
              With Zero Friction
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            {brand.slogan || "Access 1000+ CFD instruments with ultra-low spreads, sub-millisecond execution, and institutional-grade fund protection."}
          </p>

          <form onSubmit={handleRegister} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full sm:flex-1 h-12 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            <button
              type="submit"
              className="w-full sm:w-auto h-12 px-8 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: primary }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = primaryLight; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = primary; }}
            >
              SIGN UP NOW <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-slate-500 mt-3">No minimum deposit. Start trading in minutes.</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{s.value}</div>
                <div className="text-sm text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Traders Choose {brand.brandName}
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Built for serious traders who demand speed, transparency, and security.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ backgroundColor: primary + "1a" }}
                >
                  <f.icon className="w-5 h-5" style={{ color: primary }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section id="markets" className="py-20 lg:py-28 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Trade What You Want</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From major forex pairs to emerging crypto assets. One account, unlimited possibilities.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {markets.map((m) => (
              <div key={m.name} className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-white/20 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <m.icon className="w-6 h-6" style={{ color: primary }} />
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{ backgroundColor: primary + "1a", color: primary }}
                  >
                    {m.pairs} pairs
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{m.name}</h3>
                <p className="text-sm text-slate-500">From {m.spread}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Support */}
      <section id="support" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Your Security Is Our Priority
              </h2>
              <div className="space-y-5">
                {[
                  {
                    icon: Lock,
                    title: "Segregated Client Funds",
                    desc: "All client funds are held in segregated accounts with tier-1 banks, completely separate from company operating capital.",
                  },
                  {
                    icon: Shield,
                    title: "Negative Balance Protection",
                    desc: "You can never lose more than your account balance. Automatic protection against market gaps and volatility.",
                  },
                  {
                    icon: Headphones,
                    title: "24/7 Multilingual Support",
                    desc: "Our dedicated support team is available around the clock via live chat, email, and phone.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: primary + "1a" }}
                    >
                      <item.icon className="w-5 h-5" style={{ color: primary }} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl blur-2xl"
                style={{ background: `linear-gradient(135deg, ${primary + "1a"}, rgba(59,130,246,0.05))` }}
              />
              <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: primary + "1a" }}>
                    <Shield className="w-5 h-5" style={{ color: primary }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Regulated & Licensed</div>
                    <div className="text-xs text-slate-500">VFSC · FSA · CIMA</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    "SSL-encrypted data transmission",
                    "Two-factor authentication (2FA)",
                    "Real-time risk monitoring",
                    "Automated fraud detection",
                  ].map((text) => (
                    <div key={text} className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Trading in Minutes</h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">
            Open your live account today and get instant access to global markets with institutional-grade trading conditions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/auth/portal/register${tenantId ? `?tenantId=${tenantId}` : ""}`}
              className="w-full sm:w-auto px-8 py-3 text-slate-950 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              style={{ backgroundColor: primary }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = primaryLight; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = primary; }}
            >
              OPEN LIVE ACCOUNT <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/auth/portal/login${tenantId ? `?tenantId=${tenantId}` : ""}`}
              className="w-full sm:w-auto px-8 py-3 border border-white/10 hover:border-white/20 text-white font-medium rounded-lg transition-colors"
            >
              CLIENT LOGIN
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.brandName} className="h-6 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${primary}, ${primaryLight})` }}
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-slate-950" />
                  </div>
                  <span className="text-sm font-semibold text-white">{brand.brandName}</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-600 text-center">
              Risk Warning: CFDs are complex instruments and come with a high risk of losing money rapidly due to leverage. 78% of retail investor accounts lose money when trading CFDs.
            </p>
            <div className="flex items-center gap-6">
              <Link href={`/auth/portal/login${tenantId ? `?tenantId=${tenantId}` : ""}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Login
              </Link>
              <Link href={`/auth/portal/register${tenantId ? `?tenantId=${tenantId}` : ""}`} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                Register
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
