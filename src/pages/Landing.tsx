import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BarChart3, Activity, PieChart, Zap, Send, Menu, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import landingLogo from "@/assets/logo.png";
import { StickyCTA } from "@/components/landing/StickyCTA";

// Eagerly loaded — above the fold
import { HeroSection } from "@/components/landing/HeroSection";
import {
  useCountUp, fadeUp, MotionSection, GradientDivider,
} from "@/components/landing/LandingShared";

// Lazy-loaded — below the fold (only loaded when user scrolls)
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection").then(m => ({ default: m.FeaturesSection })));
const HowItWorksSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.HowItWorksSection })));
const ComparisonSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.ComparisonSection })));
const PricingSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.TestimonialsSection })));
const IndianMarketsSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.IndianMarketsSection })));
const FAQSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FAQSection })));
const FinalCTASection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FinalCTASection })));
const FooterSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FooterSection })));

function SectionFallback() {
  return <div className="py-24 flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const s3 = useCountUp(5, 1200);
  const s4 = useCountUp(50, 1500);
  const s5 = useCountUp(1200, 2000);

  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      <SEOHead
        title="Trading Journal for Indian Markets — NSE, MCX, F&O"
        description="Track, analyze, and improve your trades with TradeBook. Real-time alerts, broker integration, and segment-based analytics built for Equity, F&O, and Commodity traders in India."
        path="/"
        jsonLd={{
          "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "TradeBook",
          "applicationCategory": "FinanceApplication", "operatingSystem": "Web",
          "description": "Trading journal and analytics platform for Indian markets — NSE, BSE, MCX.",
          "url": "https://mytradebook.lovable.app",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1200", "bestRating": "5" }
        }}
      />

      {/* ── Navbar ────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      >
        <div className="flex items-center justify-between px-3 pl-4 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-foreground/[0.03]" style={{ boxShadow: "0 4px 20px -6px rgba(0,0,0,0.06), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
            <img src={landingLogo} alt="TradeBook" className="h-8 object-contain" />
          </motion.div>
          <div className="hidden md:flex items-center gap-0.5 text-sm text-muted-foreground">
            {["Features", "Pricing", "FAQ", "Docs"].map((item) => (
              <motion.a key={item} href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`} className="relative px-3.5 py-1.5 rounded-full hover:bg-muted/60 hover:text-foreground transition-colors duration-200 text-[13px] font-medium after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-[hsl(var(--tb-accent))] after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-200" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>{item}</motion.a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle navigation menu">
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex text-muted-foreground hover:text-foreground text-[13px] h-8 px-3 rounded-full">Sign In</Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button size="sm" onClick={() => navigate("/login?mode=signup")} className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 h-8 text-[13px] font-semibold shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]">Get Started</Button>
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.2 }} className="md:hidden mt-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl p-4 space-y-1">
              {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "Docs", href: "/docs" }].map((item) => (
                <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 hover:border-l-[3px] hover:border-l-[hsl(var(--tb-accent))] text-sm font-medium text-foreground/80 hover:text-foreground transition-all duration-150">{item.label}</a>
              ))}
              <div className="pt-2 border-t border-border/30 mt-2"><Button variant="ghost" className="w-full justify-center rounded-xl text-sm" onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}>Sign In</Button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero (eagerly loaded) ─────────────────────────── */}
      <HeroSection />


      <GradientDivider />

      {/* ── Below-fold sections (lazy loaded) ─────────────── */}
      <Suspense fallback={<SectionFallback />}>
        <FeaturesSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <HowItWorksSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <PricingSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <TestimonialsSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <IndianMarketsSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <FAQSection />
      </Suspense>

      <GradientDivider />

      <Suspense fallback={<SectionFallback />}>
        <FinalCTASection />
      </Suspense>

      <Suspense fallback={<SectionFallback />}>
        <FooterSection />
      </Suspense>

      {/* Sticky CTA bar */}
      <StickyCTA />
    </div>
  );
}
