import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight, Eye, Zap, Trophy,
  Crown, Lock, Shield, Star, Quote, Sparkles, Minus,
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

const shortFeatures = [
  "Unlimited trade logging", "AI-powered trade insights", "Advanced analytics suite",
  "Trailing stop loss engine", "Broker integration (Dhan)",
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
  { q: "Is it really free during beta?", a: "Yes — all features are completely free during the beta period. No credit card required. We'll notify you before any pricing changes." },
  { q: "Can I import from Zerodha, Angel One, or other brokers?", a: "Yes! Our CSV import supports all major Indian brokers. Simply export your trade history as CSV and import it into TradeBook with automatic column mapping." },
  { q: "Does it work on mobile?", a: "TradeBook is a Progressive Web App (PWA) that works beautifully on any device — phone, tablet, or desktop. Install it on your home screen for a native app experience." },
  { q: "How is TradeBook different from a spreadsheet?", a: "Unlike spreadsheets, TradeBook offers automated analytics, segment-level breakdowns, trailing stop loss tracking, real-time alerts, and AI-powered insights — all purpose-built for Indian market traders." },
  { q: "Can I track F&O and multi-leg strategies?", a: "Yes! Full options support with multi-leg strategies, strategy-level P&L tracking, and segment-wise breakdowns for Futures, Options, and Commodities." },
  { q: "Do you have AI-powered insights?", a: "Yes — AI analyzes your trading patterns, identifies recurring mistakes, highlights your best setups, and suggests actionable improvements to sharpen your edge." },
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
    <section className="py-28 lg:py-36" aria-label="How it works">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>How It Works</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-6 leading-[1.06] tracking-[-0.03em]">Three steps to{" "}<span className="text-gradient">mastery</span></h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">From first trade to consistent edge — in minutes.</p>
        </motion.div>

        {/* Timeline steps */}
        <div className="relative">
          {/* Vertical connector line — desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div className="h-full w-full bg-gradient-to-b from-transparent via-border/40 to-transparent" />
          </div>

          <div className="space-y-16 md:space-y-24">
            {steps.map((item, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  custom={i * 0.12}
                  className={cn(
                    "relative grid md:grid-cols-2 gap-8 md:gap-16 items-center",
                    !isEven && "md:direction-rtl"
                  )}
                >
                  {/* Center dot on timeline */}
                  <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background shadow-sm" />
                  </div>

                  {/* Number side */}
                  <div className={cn("flex items-center gap-6", isEven ? "md:justify-end" : "md:justify-start md:order-2")}>
                    <span className="text-[7rem] lg:text-[9rem] font-black leading-none tracking-tighter text-foreground/[0.04] select-none">
                      {item.step}
                    </span>
                  </div>

                  {/* Content card */}
                  <motion.div
                    className={cn(
                      "rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm p-8 relative overflow-hidden",
                      isEven ? "md:order-2" : "md:order-1"
                    )}
                    style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
                    whileHover={{ y: -3, borderColor: "hsl(var(--border) / 0.5)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center"
                      >
                        <item.icon className="w-5.5 h-5.5 text-primary" />
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 tracking-[-0.015em]">{item.title}</h3>
                    <p className="text-[15px] text-muted-foreground leading-[1.65]">{item.desc}</p>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div variants={fadeUp} className="text-center mt-20">
          <p className="text-muted-foreground mb-5 text-[15px] tracking-[-0.006em]">Ready to start? Takes less than 60 seconds.</p>
          <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="inline-block">
            <Button size="lg" className="h-14 px-10 gap-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg font-semibold tracking-wide" onClick={() => navigate("/login?mode=signup")}>
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function ComparisonSection() {
  return null; // Comparison data is now inline in PricingSection
}

export function PricingSection() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 lg:py-32" aria-label="Pricing">
      <MotionSection className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold mb-5 leading-[1.08] tracking-[-0.018em]">
            Simple,{" "}<span className="accent-serif">transparent</span>{" "}pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">
            Everything free during beta. No credit card. No catch.
          </p>
        </motion.div>

        {/* 2-card layout */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-3xl mx-auto mb-14">
          {/* Free Beta Card */}
          <motion.div variants={fadeUp} custom={0}>
            <motion.div
              className="group rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-6 lg:p-7 h-full flex flex-col relative overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}
              whileHover={{ y: -3, borderColor: "hsl(var(--primary) / 0.35)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {/* Top accent */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent" />

              <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full bg-profit/8 text-profit text-[10px] font-bold tracking-wide mb-5">
                <Zap className="w-3 h-3" /> Currently Active
              </div>

              <h3 className="text-xl font-semibold tracking-[-0.015em] mb-3">Free Beta</h3>

              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-base text-muted-foreground/40 line-through font-mono">₹499</span>
                <span className="text-4xl font-extrabold font-mono tracking-[-0.03em]">₹0</span>
                <span className="text-muted-foreground text-[13px] tracking-[-0.006em]">/month</span>
              </div>
              <p className="text-[13px] text-muted-foreground/70 mb-6 leading-[1.6]">Full access to every feature. Free while we're in beta.</p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  "Unlimited trade logging",
                  "AI-powered trade insights",
                  "Advanced analytics & reports",
                  "Trailing stop loss engine",
                  "Broker integration (Dhan)",
                  "Telegram notifications",
                  "Pattern & mistake tracking",
                  "Weekly performance reports",
                  "Watchlists & alerts",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-[1.6]">
                    <CheckCircle2 className="w-4 h-4 text-profit shrink-0 mt-[1px]" />
                    <span className="tracking-[-0.006em]">{f}</span>
                  </li>
                ))}
              </ul>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  className="w-full h-11 rounded-lg text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={() => navigate("/login?mode=signup")}
                >
                  Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Pro Card (Coming Soon) */}
          <motion.div variants={fadeUp} custom={0.08}>
            <motion.div
              className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-6 lg:p-7 h-full flex flex-col relative overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}
              whileHover={{ y: -3, borderColor: "hsl(var(--border) / 0.4)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="inline-flex self-start items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 text-muted-foreground text-[10px] font-bold tracking-wide mb-5">
                <Crown className="w-3 h-3" /> Coming Soon
              </div>

              <h3 className="text-xl font-semibold tracking-[-0.015em] mb-3">Pro</h3>

              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="text-4xl font-extrabold font-mono tracking-[-0.03em] text-muted-foreground/30">₹499</span>
                <span className="text-muted-foreground text-[13px] tracking-[-0.006em]">/month</span>
              </div>
              <p className="text-[13px] text-muted-foreground/70 mb-6 leading-[1.6]">Priority support, advanced AI, and team features.</p>

              <ul className="space-y-2.5 flex-1 mb-6">
                {[
                  "Everything in Free Beta",
                  "Priority support & onboarding",
                  "Advanced AI coach",
                  "Team & shared workspaces",
                  "Custom report exports",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] leading-[1.6] text-muted-foreground/60">
                    <Lock className="w-4 h-4 text-muted-foreground/20 shrink-0 mt-[1px]" />
                    <span className="tracking-[-0.006em]">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-11 rounded-lg text-[13px] font-semibold"
                disabled
              >
                Notify Me
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Comparison table */}
        <motion.div variants={fadeUp} className="max-w-3xl mx-auto mb-12">
          <h3 className="text-base font-semibold text-center mb-5 tracking-[-0.015em]">How we compare</h3>
          <div className="rounded-xl border border-border/20 bg-card/50 overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}>
            <div className="grid grid-cols-3 gap-0 border-b border-border/15 px-5 py-3 bg-muted/15">
              <span className="text-[13px] font-bold text-foreground">Feature</span>
              <span className="text-[13px] font-bold text-center text-primary flex items-center justify-center gap-1.5"><Trophy className="w-3.5 h-3.5" />TradeBook</span>
              <span className="text-[13px] font-medium text-center text-muted-foreground/50">Others</span>
            </div>
            {comparisonFeatures.map((row, i) => (
              <div key={row.feature} className={cn("grid grid-cols-3 gap-0 border-b border-border/8 last:border-0 px-5 py-3", i % 2 === 0 ? "bg-muted/[0.03]" : "")}>
                <span className="text-[13px] text-foreground/80">{row.feature}</span>
                <div className="flex justify-center">{row.tradebook === true ? <CheckCircle2 className="w-4 h-4 text-profit" /> : <span className="text-[13px] text-muted-foreground">{String(row.tradebook)}</span>}</div>
                <div className="flex justify-center">{row.others === true ? <CheckCircle2 className="w-4 h-4 text-muted-foreground/25" /> : row.others === false ? <Minus className="w-4 h-4 text-muted-foreground/15" /> : <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground/50">{String(row.others)}</span>}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          {[{ icon: Lock, text: "No credit card required" }, { icon: Shield, text: "Your data stays private" }, { icon: Clock, text: "Set up in under 2 minutes" }].map((item) => (
            <div key={item.text} className="flex items-center gap-1.5 bg-muted/20 rounded-full px-3 py-1.5 text-[12px] text-muted-foreground/60">
              <item.icon className="w-3 h-3" /><span>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function TestimonialsSection() {
  const featured = testimonials[0]; // Rahul — strongest quote with metrics
  const secondary = [testimonials[2], testimonials[3], testimonials[4]]; // Aditya, Vikram, Sneha

  return (
    <section className="py-28 lg:py-36" aria-label="Testimonials">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>Testimonials</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold mb-6 leading-[1.08] tracking-[-0.018em]">
            Trusted by{" "}<span className="accent-serif">real traders</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">Here's what traders across India are saying.</p>
        </motion.div>

        {/* Hero testimonial — dark card */}
        <motion.div variants={fadeUp} className="mb-8">
          <motion.div
            className="rounded-2xl border border-foreground/10 bg-foreground text-background p-10 md:p-14 relative overflow-hidden"
            whileHover={{ y: -3 }}
            transition={{ duration: 0.3 }}
          >
            <Quote className="w-10 h-10 text-primary/15 mb-6" />
            <p className="text-xl md:text-2xl leading-[1.7] mb-8 font-medium max-w-3xl tracking-[-0.01em]">
              "<HighlightedQuote testimonial={featured} />"
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="flex items-center gap-1.5">
                {[...Array(featured.stars)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {featured.avatar}
                </div>
                <div>
                  <p className="font-semibold">{featured.name}</p>
                  <p className="text-sm text-background/50">{featured.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 3 smaller testimonials */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {secondary.map((t, i) => (
            <motion.div key={t.name} variants={fadeUp} custom={i * 0.08}>
              <motion.div
                className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm p-7 h-full flex flex-col"
                style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
                whileHover={{ y: -3, borderColor: "hsl(var(--border) / 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                <Quote className="w-6 h-6 text-primary/10 mb-3" />
                <p className="text-[15px] text-muted-foreground leading-[1.65] flex-1 mb-5 tracking-[-0.006em]">
                  "<HighlightedQuote testimonial={t} />"
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground/60">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Stats strip */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 bg-muted/30 rounded-full px-4 py-2 text-sm font-medium">
            <span className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} className="w-3 h-3 fill-primary text-primary" />))}</span>4.9/5 average rating
          </span>
          <span className="text-muted-foreground/20">·</span>
          <span className="inline-flex items-center gap-1.5 bg-muted/30 rounded-full px-4 py-2 text-sm font-medium">1,200+ active traders</span>
          <span className="text-muted-foreground/20">·</span>
          <span className="inline-flex items-center gap-1.5 bg-muted/30 rounded-full px-4 py-2 text-sm font-medium">42,000+ trades tracked</span>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function IndianMarketsSection() {
  const navigate = useNavigate();
  return (
    <section className="py-28 lg:py-36" aria-label="Built for Indian markets">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text side */}
          <motion.div variants={fadeUp}>
            <SectionBadge>Made in India</SectionBadge>
            <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold mb-6 leading-[1.08] tracking-[-0.018em]">
              Built for{" "}<span className="accent-serif">Indian</span>{" "}markets
            </h2>
            <p className="text-muted-foreground text-[15px] lg:text-[1rem] leading-[1.7] mb-8 tracking-[-0.006em]">
              Unlike generic journals, TradeBook understands Indian market structure — segments, lot sizes, INR formatting, and trading hours.
            </p>
            <ul className="space-y-2 mb-10">
              {[
                "NSE, BSE & MCX exchange support",
                "INR formatting with Lakhs & Crores",
                "Dhan broker auto-sync",
                "Market hours & holiday awareness",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[15px] text-foreground/85 tracking-[-0.006em]">
                  <CheckCircle2 className="w-4 h-4 text-profit shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* Exchange badges */}
            <div className="flex items-center gap-3 mb-8">
              {["NSE", "BSE", "MCX"].map((exchange) => (
                <div key={exchange} className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 bg-card/70 text-sm font-bold tracking-wide">
                  <div className="w-2 h-2 rounded-full bg-profit" />
                  {exchange}
                </div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" className="rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold shadow-lg h-13 px-8" onClick={() => navigate("/login?mode=signup")}>
                Start Journaling <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Segments card */}
          <motion.div variants={fadeUp} custom={0.15}>
            <div className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
              {/* Tricolor stripe */}
              <div className="h-1 flex">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white dark:bg-white/80" />
                <div className="flex-1 bg-[#128807]" />
              </div>

              {/* Mock window chrome */}
              <div className="px-5 py-3 border-b border-border/20 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/15" />
                </div>
                <span className="text-[10px] text-muted-foreground/50 font-mono ml-2">tradebook / segments</span>
              </div>

              <div className="p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">Market Segments</h4>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: "Equity", color: "hsl(152 60% 42%)", Icon: TrendingUp },
                    { label: "F&O", color: "hsl(24 90% 55%)", Icon: Layers },
                    { label: "Commodity", color: "hsl(45 90% 50%)", Icon: CandlestickChart },
                    { label: "Currency", color: "hsl(210 80% 55%)", Icon: Globe },
                    { label: "Intraday", color: "hsl(340 75% 55%)", Icon: Zap },
                    { label: "Positional", color: "hsl(270 60% 55%)", Icon: Clock },
                  ].map((seg) => (
                    <motion.div
                      key={seg.label}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/20 bg-muted/5 text-sm font-semibold cursor-default"
                      whileHover={{ backgroundColor: `${seg.color.replace(")", " / 0.06)")}`, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <seg.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: seg.color }} />
                      <span style={{ color: seg.color }}>{seg.label}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-5 pt-4 border-t border-border/20 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-profit opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-profit" />
                  </span>
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
  return (
    <section id="faq" className="py-28 lg:py-36" aria-label="Frequently asked questions">
      <MotionSection className="max-w-2xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge>FAQ</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold mb-5 leading-[1.08] tracking-[-0.018em]">
            Got{" "}<span className="accent-serif">questions</span>?
          </h2>
          <p className="text-muted-foreground text-[15px] lg:text-[1rem] leading-[1.7]">Everything you need to know about TradeBook.</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="rounded-xl border border-border/30 bg-card/70 px-6 data-[state=open]:border-primary/20 data-[state=open]:shadow-sm transition-colors"
              >
                <AccordionTrigger className="text-left text-[15px] font-semibold hover:no-underline py-4 tracking-[-0.01em]">
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground/50 bg-muted/20 rounded-md px-1.5 py-0.5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-[15px] text-muted-foreground leading-[1.7] pl-8 pb-5 tracking-[-0.006em]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Docs CTA — simplified */}
        <motion.div variants={fadeUp} className="mt-14">
          <div className="rounded-2xl border border-border/30 bg-card/70 p-8 flex flex-col sm:flex-row items-center justify-between gap-5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
            <div>
              <h3 className="text-base font-semibold mb-1 flex items-center gap-2 tracking-[-0.015em]">
                <BookOpen className="w-4 h-4 text-primary" />Want to dive deeper?
              </h3>
              <p className="text-sm text-muted-foreground leading-[1.6]">Explore our docs with visual guides and tutorials.</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/docs")} className="gap-2 shrink-0 rounded-full">
              <BookOpen className="w-4 h-4" />Browse Docs
            </Button>
          </div>
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden" aria-label="Call to action">
      {/* Single subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05)_0%,transparent_65%)] pointer-events-none" />

      <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
          <div className="flex -space-x-2">
            {["hsl(var(--primary))", "hsl(var(--profit))", "hsl(210 80% 55%)"].map((c, i) => (
              <div key={i} className="w-7 h-7 rounded-full ring-2 ring-background" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="text-[13px] font-medium text-muted-foreground">1,200+ traders · 42,000+ trades</span>
        </motion.div>

        <motion.h2 variants={fadeUp} className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.018em] mb-3">
          Stop losing money to
        </motion.h2>
        <motion.h2 variants={fadeUp} className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-semibold leading-[1.08] tracking-[-0.018em] mb-10">
          <span className="accent-serif">undisciplined</span> trading
        </motion.h2>

        <motion.p variants={fadeUp} className="text-[1rem] lg:text-[1.125rem] text-muted-foreground mb-14 max-w-xl mx-auto leading-[1.7] tracking-[-0.006em]">
          Join traders who journal, analyze, and compound their edge — every single day.
        </motion.p>

        <motion.div variants={fadeUp} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            className="h-16 px-12 text-[17px] gap-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg font-semibold tracking-[-0.01em]"
            onClick={() => navigate("/login?mode=signup")}
          >
            Get Started — It's Free <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[{ icon: Lock, text: "Bank-grade encryption" }, { icon: Shield, text: "No credit card required" }, { icon: Clock, text: "Setup in 2 minutes" }].map((item) => (
            <span key={item.text} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1.5">
              <item.icon className="w-3 h-3" /> {item.text}
            </span>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function FooterSection() {
  const navigate = useNavigate();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  const [email, setEmail] = useState("");

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setEmail("");
    // Visual feedback — backend integration pending
    const el = document.createElement("div");
    el.textContent = "✓ Thanks! We'll keep you posted.";
    el.className = "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-card border border-border/40 text-foreground text-sm px-4 py-2.5 rounded-lg shadow-lg";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };

  return (
    <footer className="border-t border-border/15 bg-card/30 py-20 lg:py-24" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid md:grid-cols-12 gap-10 mb-14">
          {/* Brand column */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-3">
              <img src="/favicon-32x32.png" alt="TradeBook" className="h-6 w-6 object-contain" loading="lazy" />
              <span className="text-base font-bold tracking-tight text-foreground">TradeBook</span>
            </div>
            <p className="text-[14px] text-muted-foreground leading-[1.65] mb-6 max-w-xs tracking-[-0.006em]">
              The trading journal built for Indian markets. Track, analyze, and improve your edge.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleNewsletter} className="flex gap-2 mb-6 max-w-xs">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 h-9 px-3.5 rounded-full bg-muted/30 border border-border/30 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                required
              />
              <button
                type="submit"
                className="h-9 px-4 rounded-full bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Subscribe
              </button>
            </form>

            <div className="flex items-center gap-2">
              {[
                { href: "mailto:founder@mrchartist.com", icon: "✉", label: "Email" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-8 h-8 rounded-full bg-muted/30 border border-border/20 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all text-xs">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs uppercase tracking-[0.12em] font-bold text-muted-foreground/50 mb-4">Product</h4>
            <ul className="space-y-1.5 text-[14px] text-muted-foreground">
              {[
                { label: "Features", action: () => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Pricing", action: () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Documentation", action: () => navigate("/docs") },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="inline-block py-0.5 hover:text-foreground transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.12em] font-bold text-muted-foreground/50 mb-4">Resources</h4>
            <ul className="space-y-1.5 text-[14px] text-muted-foreground">
              {[
                { label: "FAQ", action: () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }) },
                { label: "Contact Us", action: () => window.open("mailto:founder@mrchartist.com", "_blank") },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="inline-block py-0.5 hover:text-foreground transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h4 className="text-xs uppercase tracking-[0.12em] font-bold text-muted-foreground/50 mb-4">Legal</h4>
            <ul className="space-y-1.5 text-[14px] text-muted-foreground">
              {[
                { label: "Privacy Policy", action: () => navigate("/privacy") },
                { label: "Terms of Service", action: () => navigate("/terms") },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="inline-block py-0.5 hover:text-foreground transition-colors">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-border/30 to-transparent mb-7" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5">
            © {new Date().getFullYear()} TradeBook. All rights reserved.{" "}
            <span className="inline-flex items-center gap-1">
              Made with ❤️ in{" "}
              <span className="inline-flex gap-[2px]">
                <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
                <span className="w-2 h-2 rounded-full bg-white border border-border/30" />
                <span className="w-2 h-2 rounded-full bg-[#138808]" />
              </span>{" "}
              India
            </span>
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-muted-foreground/50 bg-muted/20 border border-border/20 rounded-full px-3 py-1">
              Not SEBI registered · For educational purposes only
            </span>
            <button onClick={scrollToTop} className="text-[11px] text-muted-foreground hover:text-foreground bg-muted/20 border border-border/20 rounded-full px-3 py-1 hover:bg-muted/40 transition-all" aria-label="Back to top">
              ↑ Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
