import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight, Eye, Zap, Trophy,
  Crown, Lock, Shield, RefreshCw, Star, Quote, Sparkles, Minus,
  TrendingUp, Layers, Globe, Clock, BarChart3, CandlestickChart,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { fadeUp, MotionSection, SectionBadge, GradientDivider } from "./LandingShared";

/* ─── Data ─── */
const steps = [
  { step: "01", icon: BookOpen, title: "Log Your Trades", desc: "Add trades manually or auto-sync from Dhan. Tag setups, patterns, and mistakes." },
  { step: "02", icon: Eye, title: "Spot Patterns", desc: "Segment-level analytics reveal what's working — by setup, time, and condition." },
  { step: "03", icon: Zap, title: "Automate & Scale", desc: "Set rules, alerts, and trailing stops. Let the system enforce your discipline." },
];

const testimonials = [
  { name: "Rahul M.", role: "Options Trader, Mumbai", style: "Options", quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.", highlight: "win rate went from 42% to 61%", stars: 5, avatar: "R", featured: true },
  { name: "Priya S.", role: "Swing Trader, Bangalore", style: "Swing", quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional.", highlight: "segment-level analytics", stars: 5, avatar: "P", featured: false },
  { name: "Aditya K.", role: "F&O Trader, Delhi", style: "F&O", quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.", highlight: "built for how we actually trade", stars: 5, avatar: "A", featured: false },
  { name: "Vikram T.", role: "Scalper, Hyderabad", style: "Scalping", quote: "The trading rules checklist changed everything. I used to revenge trade after losses — now the pre-trade checklist keeps me disciplined and my drawdowns are half of what they were.", highlight: "drawdowns are half", stars: 5, avatar: "V", featured: true },
  { name: "Sneha R.", role: "Positional Trader, Pune", style: "Positional", quote: "Getting EOD reports and morning briefings on Telegram means I never miss a setup. It's like having a trading assistant that actually understands my portfolio.", highlight: "EOD reports and morning briefings", stars: 5, avatar: "S", featured: false },
];

const allFeatures = [
  "Unlimited trades", "Advanced analytics & reports", "Telegram notifications",
  "Trailing stop loss engine", "Broker integration (Dhan)", "Unlimited watchlists",
  "Pattern & mistake tracking", "Weekly reports", "Priority support",
];

const shortFeatures = [
  "Unlimited trade logging", "AI-powered trade insights", "Advanced analytics suite",
  "Trailing stop loss engine", "Broker integration (Dhan)",
];

const pricingPlans = [
  { name: "Monthly", price: "₹0", originalPrice: "₹199", period: "/mo", description: "Full access, billed monthly", features: shortFeatures, cta: "Start Free", highlighted: false, isBeta: true, saveBadge: null, badge: null, badgeIcon: null, showAllNote: true },
  { name: "Quarterly", price: "₹0", originalPrice: "₹499", period: "/quarter", description: "All features, best for active traders", features: allFeatures, cta: "Start Free", highlighted: true, isBeta: true, saveBadge: "Save 17%", badge: "Most Popular", badgeIcon: Zap, showAllNote: false },
  { name: "Yearly", price: "₹1,499", originalPrice: null, period: "/year", description: "All features, best value", features: shortFeatures, cta: "Subscribe", highlighted: false, isBeta: false, saveBadge: "Save 37%", badge: "Best Value", badgeIcon: Crown, showAllNote: true },
];

const comparisonFeatures = [
  { feature: "Multi-segment support", tradebook: true, others: false },
  { feature: "Indian market focus (NSE/BSE/MCX)", tradebook: true, others: false },
  { feature: "Trailing stop loss engine", tradebook: true, others: false },
  { feature: "AI-powered trade insights", tradebook: true, others: false },
  { feature: "Position sizing calculator", tradebook: true, others: "Basic" as string | boolean },
  { feature: "Telegram notifications", tradebook: true, others: "Paid" as string | boolean },
  { feature: "Broker integration", tradebook: true, others: "Limited" as string | boolean },
  { feature: "Equity curve & drawdown", tradebook: true, others: true },
  { feature: "Pattern & mistake tagging", tradebook: true, others: false },
  { feature: "Free beta access", tradebook: true, others: "Limited" as string | boolean },
];

const faqs = [
  { q: "Is my data safe?", a: "Absolutely. All data is encrypted at rest and in transit with bank-grade security. We never share or sell your trading data to anyone." },
  { q: "Can I import from Zerodha, Angel One, or other brokers?", a: "Yes! Our CSV import supports all major Indian brokers. Simply export your trade history as CSV and import it into TradeBook with automatic column mapping." },
  { q: "Is it really free during beta?", a: "Yes — all features are completely free during the beta period. No credit card required. We'll notify you before any pricing changes." },
  { q: "Does it work on mobile?", a: "TradeBook is a Progressive Web App (PWA) that works beautifully on any device — phone, tablet, or desktop. Install it on your home screen for a native app experience." },
  { q: "How is TradeBook different from a spreadsheet?", a: "Unlike spreadsheets, TradeBook offers automated analytics, segment-level breakdowns, trailing stop loss tracking, real-time alerts, and AI-powered insights — all purpose-built for Indian market traders." },
  { q: "What broker integrations are supported?", a: "Currently Dhan is supported with live sync for real-time portfolio tracking. For all other brokers — Zerodha, Angel One, Groww, Upstox, and more — you can import trades via CSV with smart column mapping." },
  { q: "Can I track F&O and multi-leg strategies?", a: "Yes! Full options support with multi-leg strategies, strategy-level P&L tracking, and segment-wise breakdowns for Futures, Options, and Commodities." },
  { q: "Do you have AI-powered insights?", a: "Yes — AI analyzes your trading patterns, identifies recurring mistakes, highlights your best setups, and suggests actionable improvements to sharpen your edge." },
  { q: "Can I set alerts and notifications?", a: "Set price alerts, percentage-change alerts, and volume spike alerts. Get notified via in-app notifications or Telegram for real-time monitoring." },
  { q: "Is there a trading rules checklist?", a: "Yes! Create custom pre-trade checklists to enforce discipline. Review your rules before every trade and track how often you follow them." },
];

function HighlightedQuote({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <>{testimonial.quote.split(testimonial.highlight).map((part, i, arr) => (
      <React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-bold">{testimonial.highlight}</span>}</React.Fragment>
    ))}</>
  );
}

const glassInner = "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)";

export function HowItWorksSection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="How it works">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>How It Works</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Three steps to{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>mastery</span></h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">From first trade to edge mastery — in minutes.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((item, i) => (
            <motion.div key={item.step} variants={fadeUp} custom={i * 0.1} className="relative">
              {i < steps.length - 1 && (<div className="hidden md:flex absolute top-16 -right-5 z-10 w-10 items-center justify-center"><ChevronRight className="w-5 h-5 text-[hsl(var(--tb-accent))] opacity-50" /></div>)}
              <motion.div
                className="relative rounded-2xl border border-border/40 bg-card p-9 h-full text-center overflow-hidden"
                style={{ boxShadow: glassInner }}
                whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
              >
                <div className="absolute top-2 right-4 text-7xl font-black text-[hsl(var(--tb-accent))] opacity-[0.04] select-none">{item.step}</div>
                <span className="inline-flex items-center bg-[hsl(var(--tb-accent)/0.06)] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--tb-accent))] mb-3">Step {item.step}</span>
                <motion.div className="w-14 h-14 rounded-2xl bg-[hsl(var(--tb-accent)/0.06)] ring-4 ring-[hsl(var(--tb-accent)/0.04)] flex items-center justify-center mx-auto mb-6" whileHover={{ scale: 1.08, rotate: -3 }}>
                  <item.icon className="w-6 h-6 text-[hsl(var(--tb-accent))]" />
                </motion.div>
                <h3 className="text-xl font-bold mb-3 tracking-tight">{item.title}</h3>
                <p className="text-[15px] text-foreground/80 leading-relaxed">{item.desc}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div variants={fadeUp} className="text-center mt-14">
          <p className="text-muted-foreground mb-5">Ready to start? It takes less than 60 seconds.</p>
          <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" className="h-12 px-8 gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_4px_16px_hsl(var(--tb-accent)/0.25)] font-semibold" onClick={() => navigate("/login?mode=signup")}>Create Free Account <ArrowRight className="w-4 h-4" /></Button>
          </motion.div>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function ComparisonSection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 lg:py-32" aria-label="Comparison">
      <MotionSection className="max-w-3xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionBadge>Comparison</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Why{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>TradeBook</span>?</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">See how we compare to generic trading journals.</p>
        </motion.div>
        <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-card overflow-hidden" style={{ boxShadow: `${glassInner}, 0 4px 20px -6px rgba(0,0,0,0.06)` }}>
          <div className="grid grid-cols-3 gap-0 border-b border-border/40 px-6 py-5 bg-muted/30">
            <span className="text-base font-bold text-foreground">Feature</span>
            <span className="text-sm font-bold text-center text-[hsl(var(--tb-accent))] flex items-center justify-center gap-1.5"><Trophy className="w-4 h-4" />TradeBook</span>
            <span className="text-sm font-medium text-center text-muted-foreground/70">Others</span>
          </div>
          {comparisonFeatures.map((row, i) => (
             <motion.div key={row.feature} variants={fadeUp} custom={i * 0.05} className={cn("grid grid-cols-3 gap-0 border-b border-border/20 last:border-0 px-6 py-5 transition-colors duration-200 hover:bg-muted/30", i % 2 === 0 ? "bg-muted/10" : "")}>
              <span className="text-[15px] text-foreground/90">{row.feature}</span>
              <div className="flex justify-center">{row.tradebook === true ? <CheckCircle2 className="w-5 h-5 text-profit drop-shadow-[0_0_4px_rgba(34,197,94,0.3)]" /> : <span className="text-sm text-muted-foreground">{String(row.tradebook)}</span>}</div>
              <div className="flex justify-center">{row.others === true ? <CheckCircle2 className="w-5 h-5 text-muted-foreground/40" /> : row.others === false ? <Minus className="w-5 h-5 text-muted-foreground/30" /> : <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">{String(row.others)}</span>}</div>
            </motion.div>
          ))}
          <div className="flex items-center justify-between px-6 py-4 bg-[hsl(var(--tb-accent)/0.06)] border-t border-border/30">
            <p className="text-sm text-muted-foreground">All features included in <span className="font-semibold text-foreground">free beta</span></p>
            <Button size="sm" className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white" onClick={() => navigate("/login?mode=signup")}>Start Free <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function PricingSection() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Pricing">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Simple,{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>transparent</span>{" "}pricing</h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">One plan. All features. Pick your billing cycle.</p>
        </motion.div>
        <motion.div variants={fadeUp} className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-muted/50 rounded-full p-1 gap-0.5">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billing === "monthly" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billing === "annual" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Annual {billing === "annual" && <span className="ml-1 text-[10px] text-profit font-bold">Save 37%</span>}
            </button>
          </div>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-7 items-start">
          {pricingPlans.map((plan, i) => {
            const showAnnual = billing === "annual";
            const displayPrice = showAnnual && plan.name === "Monthly" ? "₹149" : showAnnual && plan.name === "Quarterly" ? "₹399" : plan.price;
            const displayPeriod = showAnnual && plan.name !== "Yearly" ? "/mo (billed yearly)" : plan.period;
            return (
            <motion.div key={plan.name} variants={fadeUp} custom={i * 0.1}>
              <motion.div
                className={cn(
                  "rounded-2xl border bg-card/80 p-8 flex flex-col relative overflow-hidden",
                  plan.highlighted
                    ? "border-[hsl(var(--tb-accent)/0.35)] ring-2 ring-[hsl(var(--tb-accent)/0.12)] scale-[1.02] lg:scale-105 shadow-glow shimmer-cta dot-pattern backdrop-blur-sm"
                    : "border-border/40"
                )}
                style={{ boxShadow: glassInner }}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.3 }}
              >
                {plan.highlighted && <div className="absolute top-0 left-0 right-0 h-0.5 bg-[hsl(var(--tb-accent))]" />}
                {plan.badge && <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] text-xs font-semibold mb-5">{plan.badgeIcon && <plan.badgeIcon className="w-3 h-3" />} {plan.badge}</div>}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.isBeta && <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-profit/10 text-profit text-[11px] font-semibold mt-2 animate-pulse">Free During Beta</div>}
                <div className="mt-4 mb-1 flex items-baseline gap-1 flex-wrap">
                  {plan.originalPrice && <span className="text-lg text-muted-foreground/50 line-through mr-1">{plan.originalPrice}</span>}
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={displayPrice}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="text-5xl font-extrabold font-mono"
                    >
                      {displayPrice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-muted-foreground/70 text-sm">{displayPeriod}</span>
                  {plan.saveBadge && <span className="ml-2 px-2 py-0.5 rounded-full bg-profit/10 text-profit text-[10px] font-bold">{plan.saveBadge}</span>}
                </div>
                <p className="text-[15px] text-muted-foreground mb-8">{plan.description}</p>
                <ul className="space-y-3.5 flex-1 mb-4">
                  {plan.features.map((f) => (<li key={f} className="flex items-start gap-2.5 text-[15px] leading-relaxed"><CheckCircle2 className="w-[18px] h-[18px] text-[hsl(var(--tb-accent))] shrink-0 mt-0.5" /><span>{f}</span></li>))}
                </ul>
                {plan.showAllNote && <p className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[hsl(var(--tb-accent))]" /> All features included</p>}
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className={!plan.showAllNote ? "mt-5" : ""}>
                  <Button className={cn("w-full h-12 rounded-full text-base", plan.highlighted ? "bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white shadow-[0_4px_12px_hsl(var(--tb-accent)/0.25)]" : "")} variant={plan.highlighted ? "default" : "outline"} onClick={() => navigate("/login?mode=signup")}>{plan.cta}{plan.highlighted && <ArrowRight className="w-4 h-4 ml-1" />}</Button>
                </motion.div>
              </motion.div>
            </motion.div>
            );
          })}
        </div>
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4 mt-14">
          {[{ icon: Lock, text: "No credit card required" }, { icon: RefreshCw, text: "Cancel anytime" }, { icon: Shield, text: "14-day money-back guarantee" }].map((item) => (
            <div key={item.text} className="flex items-center gap-2 bg-muted/40 rounded-full px-4 py-2 text-sm text-muted-foreground"><item.icon className="w-3.5 h-3.5" /><span>{item.text}</span></div>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}

function TestimonialCard({ testimonial, large = false }: { testimonial: typeof testimonials[0]; large?: boolean }) {
  if (large) {
    return (
      <motion.div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-10 h-full flex flex-col dot-pattern relative overflow-hidden" whileHover={{ y: -3 }}>
        <Quote className="w-12 h-12 text-[hsl(var(--tb-accent)/0.15)] mb-7" />
        <p className="text-xl leading-[1.7] flex-1 mb-7 font-medium">"<HighlightedQuote testimonial={testimonial} />"</p>
        <div className="flex items-center gap-1.5 mb-5">{[...Array(testimonial.stars)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] ring-2 ring-background flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">{testimonial.avatar}</div>
          <div><p className="font-semibold">{testimonial.name}</p><p className="text-sm text-background/50">{testimonial.role}</p><span className="inline-block mt-1 bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonial.style}</span></div>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      className="rounded-2xl border border-border/40 bg-card p-8 h-full flex flex-col"
      style={{ boxShadow: glassInner }}
      whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
    >
      <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.15)] mb-4" />
      <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 mb-5">"<HighlightedQuote testimonial={testimonial} />"</p>
      <div className="flex items-center gap-1 mb-3">{[...Array(testimonial.stars)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] ring-2 ring-background flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonial.avatar}</div>
        <div><p className="text-sm font-semibold">{testimonial.name}</p><p className="text-xs text-muted-foreground/60">{testimonial.role}</p></div>
      </div>
    </motion.div>
  );
}

function MobileTestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {testimonials.map((t, i) => (
            <div key={i} className="flex-[0_0_85%] min-w-0">
              <TestimonialCard testimonial={t} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={cn("w-2 h-2 rounded-full transition-all", i === selectedIndex ? "bg-[hsl(var(--tb-accent))] w-5" : "bg-muted-foreground/30")}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const isMobile = useIsMobile();
  return (
    <section className="py-24 lg:py-32" aria-label="Testimonials">
      <MotionSection className="max-w-6xl mx-auto px-6 lg:px-10">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>Testimonials</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Trusted by{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>real traders</span></h2>
          <p className="text-muted-foreground max-w-md mx-auto text-lg">Here's what traders across India are saying.</p>
        </motion.div>
        {isMobile ? (
          <MobileTestimonialCarousel />
        ) : (
        <div className="grid md:grid-cols-3 gap-7">
        )}
          <motion.div variants={fadeUp} className="md:col-span-2">
            <motion.div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-10 h-full flex flex-col dot-pattern relative overflow-hidden" whileHover={{ y: -3 }}>
              <Quote className="w-12 h-12 text-[hsl(var(--tb-accent)/0.15)] mb-7" />
              <p className="text-xl leading-[1.7] flex-1 mb-7 font-medium">"<HighlightedQuote testimonial={testimonials[0]} />"</p>
              <div className="flex items-center gap-1.5 mb-5">{[...Array(testimonials[0].stars)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] ring-2 ring-background flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">{testimonials[0].avatar}</div>
                <div><p className="font-semibold">{testimonials[0].name}</p><p className="text-sm text-background/50">{testimonials[0].role}</p><span className="inline-block mt-1 bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[0].style}</span></div>
              </div>
            </motion.div>
          </motion.div>
          <div className="space-y-7">
            {[1, 2].map((idx) => (
              <motion.div key={idx} variants={fadeUp} custom={idx * 0.1}>
                <motion.div
                  className="rounded-2xl border border-border/40 bg-card p-8 h-full flex flex-col"
                  style={{ boxShadow: glassInner }}
                  whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
                >
                  <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.15)] mb-4" />
                  <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 mb-5">"<HighlightedQuote testimonial={testimonials[idx]} />"</p>
                  <div className="flex items-center gap-1 mb-3">{[...Array(testimonials[idx].stars)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] ring-2 ring-background flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[idx].avatar}</div>
                    <div><p className="text-sm font-semibold">{testimonials[idx].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[idx].role}</p></div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-7 mt-7">
          <motion.div variants={fadeUp} custom={0.2}>
            <motion.div
              className="rounded-2xl border border-border/40 bg-card p-8 h-full flex flex-col"
              style={{ boxShadow: glassInner }}
              whileHover={{ y: -3, borderColor: "hsl(var(--tb-accent) / 0.25)" }}
            >
              <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.15)] mb-4" />
              <p className="text-[15px] text-muted-foreground leading-relaxed flex-1 mb-5">"<HighlightedQuote testimonial={testimonials[3]} />"</p>
              <div className="flex items-center gap-1 mb-3">{[...Array(testimonials[3].stars)].map((_, j) => (<Star key={j} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] ring-2 ring-background flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[3].avatar}</div>
                <div><p className="text-sm font-semibold">{testimonials[3].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[3].role}</p></div>
              </div>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeUp} custom={0.3} className="md:col-span-2">
            <motion.div className="rounded-2xl border border-foreground/10 bg-foreground text-background p-10 h-full flex flex-col dot-pattern relative overflow-hidden" whileHover={{ y: -3 }}>
              <Quote className="w-12 h-12 text-[hsl(var(--tb-accent)/0.15)] mb-7" />
              <p className="text-xl leading-[1.7] flex-1 mb-7 font-medium">"<HighlightedQuote testimonial={testimonials[3]} />"</p>
              <div className="flex items-center gap-1.5 mb-5">{[...Array(testimonials[3].stars)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.2)] ring-2 ring-background flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">{testimonials[3].avatar}</div>
                <div><p className="font-semibold">{testimonials[3].name}</p><p className="text-sm text-background/50">{testimonials[3].role}</p><span className="inline-block mt-1 bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[3].style}</span></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        <motion.div variants={fadeUp} custom={0.4} className="mt-7">
          <motion.div className="rounded-2xl border border-[hsl(var(--tb-accent)/0.2)] bg-[hsl(var(--tb-accent)/0.04)] p-7 flex flex-col md:flex-row md:items-center gap-6" whileHover={{ y: -2, borderColor: "hsl(var(--tb-accent) / 0.4)" }}>
            <Quote className="w-7 h-7 text-[hsl(var(--tb-accent)/0.2)] shrink-0" />
            <p className="text-[15px] text-muted-foreground leading-relaxed flex-1">"<HighlightedQuote testimonial={testimonials[4]} />"</p>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-1 mr-2">{[...Array(testimonials[4].stars)].map((_, j) => (<Star key={j} className="w-3.5 h-3.5 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))] drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]" />))}</div>
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.08)] ring-2 ring-background flex items-center justify-center text-xs font-bold text-[hsl(var(--tb-accent))]">{testimonials[4].avatar}</div>
              <div><p className="text-sm font-semibold">{testimonials[4].name}</p><p className="text-xs text-muted-foreground/60">{testimonials[4].role}</p><span className="inline-block mt-0.5 bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] rounded-full px-2 py-0.5 text-[10px] font-semibold">{testimonials[4].style}</span></div>
            </div>
          </motion.div>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-14 flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium" style={{ boxShadow: glassInner }}><span className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className="w-3 h-3 fill-[hsl(var(--tb-accent))] text-[hsl(var(--tb-accent))]" />))}</span>4.9/5 average rating</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium" style={{ boxShadow: glassInner }}>1,200+ active traders</span>
          <span className="text-muted-foreground/30">·</span>
          <span className="inline-flex items-center gap-1.5 bg-muted/40 rounded-full px-4 py-2 text-sm font-medium" style={{ boxShadow: glassInner }}>42,000+ trades tracked</span>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function IndianMarketsSection() {
  const navigate = useNavigate();
  return (
    <section className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Built for Indian markets">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <motion.div variants={fadeUp}>
            <SectionBadge>Made in India</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-6 leading-[1.1]">Built for{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>Indian</span>{" "}markets</h2>
            <p className="text-foreground/80 text-[15px] leading-[1.7] mb-6">Unlike generic journals, TradeBook understands Indian market structure — segments, lot sizes, INR formatting, and market hours (9:15 AM – 3:30 PM).</p>
            <ul className="space-y-2.5 mb-8">
              {["NSE, BSE & MCX exchange support", "INR currency with Indian numbering (Lakhs, Crores)", "Dhan broker integration for auto-sync", "Indian market hours & holiday awareness"].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[15px] rounded-lg bg-muted/5 px-3 py-2.5 group hover:bg-muted/15 hover:border-l-2 hover:border-l-[hsl(var(--tb-accent))] transition-all cursor-default">
                  <CheckCircle2 className="w-4 h-4 text-[hsl(var(--tb-accent))] shrink-0" /><span className="flex-1">{item}</span><ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/40 transition-colors" />
                </li>
              ))}
            </ul>
            <Button size="lg" className="rounded-full bg-gradient-primary text-primary-foreground" onClick={() => navigate("/login?mode=signup")}>Start Journaling <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </motion.div>
          <motion.div variants={fadeUp} custom={0.15}>
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden" style={{ boxShadow: glassInner }}>
              <div className="h-1 flex"><div className="flex-1 bg-[#FF9933]" /><div className="flex-1 bg-white" /><div className="flex-1 bg-[#128807]" /></div>
              <div className="p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">Market Segments</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[{ label: "Equity", color: "hsl(152 60% 42%)", Icon: TrendingUp }, { label: "F&O", color: "hsl(24 90% 55%)", Icon: Layers }, { label: "Commodity", color: "hsl(45 90% 50%)", Icon: CandlestickChart }, { label: "Currency", color: "hsl(210 80% 55%)", Icon: Globe }, { label: "Intraday", color: "hsl(340 75% 55%)", Icon: Zap }, { label: "Positional", color: "hsl(270 60% 55%)", Icon: Clock }].map((seg) => (
                    <motion.div key={seg.label} className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border/40 bg-card text-sm font-semibold cursor-default transition-colors" style={{ borderColor: `${seg.color.replace(")", " / 0.25)")}`, boxShadow: glassInner }} whileHover={{ backgroundColor: `${seg.color.replace(")", " / 0.08)")}`, scale: 1.03 }}>
                      <seg.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: seg.color }} /><span style={{ color: seg.color }}>{seg.label}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-profit ring-4 ring-profit/10" /></span>
                  <span>Market Open — 09:15 AM to 03:30 PM IST</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </MotionSection>
    </section>
  );
}

export function FAQSection() {
  const navigate = useNavigate();
  const left = faqs.slice(0, 5);
  const right = faqs.slice(5);
  return (
    <section id="faq" className="py-24 lg:py-32 bg-muted/10 dot-pattern" aria-label="Frequently asked questions">
      <MotionSection className="max-w-4xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-14">
          <SectionBadge>FAQ</SectionBadge>
          <h2 className="text-4xl lg:text-6xl font-extrabold mb-5 leading-[1.1]">Got{" "}<span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>questions</span>?</h2>
          <p className="text-muted-foreground text-lg">Everything you need to know about TradeBook</p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0">
            <Accordion type="single" collapsible className="space-y-3">
              {left.map((faq, i) => (
                <AccordionItem key={i} value={`faq-l-${i}`} className="rounded-xl border border-border/40 bg-card/80 px-6 data-[state=open]:border-l-2 data-[state=open]:border-l-[hsl(var(--tb-accent))] data-[state=open]:border-[hsl(var(--tb-accent)/0.25)] data-[state=open]:shadow-sm">
                  <AccordionTrigger className="text-left text-[15px] font-semibold hover:no-underline py-4"><span className="flex items-center gap-3"><span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 rounded-md px-1.5 py-0.5">{String(i + 1).padStart(2, "0")}</span>{faq.q}</span></AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground leading-[1.7] pl-8">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Accordion type="single" collapsible className="space-y-3">
              {right.map((faq, i) => (
                <AccordionItem key={i} value={`faq-r-${i}`} className="rounded-xl border border-border/40 bg-card/80 px-6 data-[state=open]:border-l-2 data-[state=open]:border-l-[hsl(var(--tb-accent))] data-[state=open]:border-[hsl(var(--tb-accent)/0.25)] data-[state=open]:shadow-sm">
                  <AccordionTrigger className="text-left text-[15px] font-semibold hover:no-underline py-4"><span className="flex items-center gap-3"><span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/30 rounded-md px-1.5 py-0.5">{String(i + 6).padStart(2, "0")}</span>{faq.q}</span></AccordionTrigger>
                  <AccordionContent className="text-[15px] text-muted-foreground leading-[1.7] pl-8">{faq.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-14">
          <div className="relative p-[1px] rounded-2xl bg-gradient-to-r from-[hsl(var(--tb-accent)/0.4)] via-border/30 to-[hsl(var(--tb-accent)/0.4)]">
            <div className="rounded-2xl bg-card p-9 flex flex-col md:flex-row items-center justify-between gap-6" style={{ boxShadow: glassInner }}>
              <div>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2"><BookOpen className="w-5 h-5 text-[hsl(var(--tb-accent))]" />Want to dive deeper?</h3>
                <p className="text-sm text-muted-foreground mb-3">Explore our comprehensive documentation with visual guides</p>
                <div className="flex flex-wrap gap-2">
                  {["Getting Started", "Trade Management", "Analytics", "AI Insights", "Alerts & Notifications"].map(tag => (
                    <span key={tag} className="text-[10px] uppercase tracking-wider font-medium bg-muted px-2.5 py-1 rounded-full text-muted-foreground">{tag}</span>
                  ))}
                </div>
              </div>
              <Button onClick={() => navigate("/docs")} className="gap-2 shrink-0"><BookOpen className="w-4 h-4" />Browse Documentation</Button>
            </div>
          </div>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-28 lg:py-36 relative overflow-hidden" aria-label="Call to action">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.15)_0%,transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.04)_0%,transparent_70%)]" />
      </div>
      <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {["bg-[hsl(var(--tb-accent))]", "bg-[hsl(var(--profit))]", "bg-[hsl(var(--ring))]"].map((bg, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${bg} ring-2 ring-background`} />
              ))}
            </div>
            <span className="text-sm font-semibold">1,200+ traders</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm font-semibold"><BarChart3 className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />42,000+ trades logged</div>
        </motion.div>
        <motion.div variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="mb-8 space-y-2">
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold leading-[1.1]">Stop losing money to</motion.h2>
          <motion.h2 variants={fadeUp} className="text-4xl lg:text-6xl font-extrabold leading-[1.1]"><span className="text-[hsl(var(--tb-accent))] italic" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>undisciplined</span>{" "}trading</motion.h2>
        </motion.div>
        <motion.p variants={fadeUp} className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto leading-[1.7]">Join 1,200+ traders who journal, analyze, and compound their edge — every single day.</motion.p>
        <motion.div variants={fadeUp} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}>
          <Button size="lg" className="shimmer-cta h-14 px-12 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_6px_24px_hsl(var(--tb-accent)/0.3)] font-semibold" onClick={() => navigate("/login?mode=signup")}>Get Started — It's Free <ArrowRight className="w-4 h-4" aria-hidden="true" /></Button>
        </motion.div>
        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[{ icon: Lock, text: "Bank-grade encryption" }, { icon: Shield, text: "No credit card required" }, { icon: Clock, text: "Setup in 2 minutes" }].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5" style={{ boxShadow: glassInner }}><item.icon className="w-3 h-3" /> {item.text}</span>
          ))}
        </motion.div>
      </MotionSection>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.3)] to-transparent max-w-md mx-auto mt-16" />
    </section>
  );
}

export function FooterSection() {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm dot-pattern py-20" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="relative flex items-center gap-2.5 mb-3">
              <div className="absolute -inset-4 rounded-full bg-[hsl(var(--tb-accent)/0.06)] blur-2xl pointer-events-none" />
              <img src="/favicon-32x32.png" alt="TradeBook" className="h-8 object-contain relative" loading="lazy" />
              <span className="text-lg font-bold tracking-tight text-foreground relative">TradeBook</span>
            </div>
            <p className="text-[15px] text-muted-foreground leading-relaxed mb-5 max-w-xs">The trading journal built for Indian markets. Track, analyze, and improve your edge.</p>
            <div className="flex items-center gap-3 mb-5">
              <motion.a href="/login?mode=signup" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[hsl(var(--tb-accent))] text-white rounded-full px-4 py-1.5 hover:bg-[hsl(var(--tb-accent-hover))] transition-all hover:-translate-y-0.5 shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]" whileHover={{ scale: 1.03 }}>Get Started <ArrowRight className="w-3 h-3" /></motion.a>
            </div>
            <div className="flex items-center gap-2">
              {[
                { href: "https://x.com", icon: "𝕏", label: "Twitter" },
                { href: "https://t.me", icon: "✈", label: "Telegram" },
                { href: "mailto:founder@mrchartist.com", icon: "✉", label: "Email" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-8 h-8 rounded-full bg-muted/40 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all text-xs">{s.icon}</a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5 border-l-2 border-[hsl(var(--tb-accent))] pl-2">Product</h4>
            <ul className="space-y-1 text-[15px] text-muted-foreground">
              {[
                { label: "Features", href: "#features" },
                { label: "Pricing", href: "#pricing" },
                { label: "Documentation", href: "/docs" },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground hover:translate-x-0.5 transition-all duration-200">{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5 border-l-2 border-[hsl(var(--tb-accent))] pl-2">Resources</h4>
            <ul className="space-y-1 text-[15px] text-muted-foreground">
              {[
                { label: "Changelog", href: "#" },
                { label: "FAQ", href: "#faq" },
                { label: "Blog", href: "#" },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground hover:translate-x-0.5 transition-all duration-200">{l.label}</a></li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5 border-l-2 border-[hsl(var(--tb-accent))] pl-2">Support</h4>
            <ul className="space-y-1 text-[15px] text-muted-foreground mb-6">
              {[
                { label: "Contact Us", href: "mailto:founder@mrchartist.com" },
                { label: "Documentation", href: "/docs" },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground hover:translate-x-0.5 transition-all duration-200">{l.label}</a></li>
              ))}
            </ul>
            <h4 className="text-xs uppercase tracking-[0.1em] font-bold text-muted-foreground/60 mb-5 border-l-2 border-[hsl(var(--tb-accent))] pl-2">Legal</h4>
            <ul className="space-y-1 text-[15px] text-muted-foreground">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((l) => (
                <li key={l.label}><a href={l.href} className="inline-block rounded-full px-2.5 py-1 -mx-2.5 hover:bg-muted/50 hover:text-foreground hover:translate-x-0.5 transition-all duration-200">{l.label}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.25)] to-transparent mb-7" />

        {/* Bottom bar */}
        <div className="bg-muted/20 rounded-2xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/80 flex items-center gap-1.5">© {new Date().getFullYear()} TradeBook. All rights reserved. <span className="inline-flex items-center gap-1">Made with ❤️ in <span className="inline-flex gap-[2px]"><span className="w-2 h-2 rounded-full bg-[#FF9933]" /><span className="w-2 h-2 rounded-full bg-white border border-border/40" /><span className="w-2 h-2 rounded-full bg-[#138808]" /></span> India</span></p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/60 bg-muted/30 border border-border/30 rounded-full px-3 py-1">Not SEBI registered · For educational purposes only</span>
            <button onClick={scrollToTop} className="text-[11px] text-muted-foreground hover:text-foreground bg-muted/30 border border-border/30 rounded-full px-3 py-1 hover:bg-muted/50 transition-all" aria-label="Back to top">↑ Top</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
