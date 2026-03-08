import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, BookOpen, CheckCircle2, ChevronRight, Zap,
  Crown, Lock, Shield, Star, Quote, Sparkles,
  TrendingUp, Layers, Globe, Clock, BarChart3, CandlestickChart,
  ChevronDown,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

import { fadeUp, blurIn, slideFromLeft, slideFromRight, popIn, MotionSection, SectionBadge, GradientDivider } from "./LandingShared";

/* ─── Data ─── */

const testimonials = [
  { name: "Rahul M.", role: "Options Trader, Mumbai", style: "Options", quote: "TradeBook helped me identify that my Monday morning trades were consistently losing. After adjusting my strategy, my win rate went from 42% to 61%.", highlight: "win rate went from 42% to 61%", stars: 5, avatar: "R", featured: true },
  { name: "Priya S.", role: "Swing Trader, Bangalore", style: "Swing", quote: "The segment-level analytics are a game-changer. I can see exactly which setups work for intraday vs positional.", highlight: "segment-level analytics", stars: 5, avatar: "P", featured: false },
  { name: "Aditya K.", role: "F&O Trader, Delhi", style: "F&O", quote: "I tried 4 journals before TradeBook. None understood Indian markets — segments, lot sizes, MCX. Finally something built for how we actually trade.", highlight: "built for how we actually trade", stars: 5, avatar: "A", featured: false },
  { name: "Vikram T.", role: "Scalper, Hyderabad", style: "Scalping", quote: "The trading rules checklist changed everything. I used to revenge trade after losses — now the pre-trade checklist keeps me disciplined and my drawdowns are half of what they were.", highlight: "drawdowns are half", stars: 5, avatar: "V", featured: true },
  { name: "Sneha R.", role: "Positional Trader, Pune", style: "Positional", quote: "Getting EOD reports and morning briefings on Telegram means I never miss a setup. It's like having a trading assistant that actually understands my portfolio.", highlight: "EOD reports and morning briefings", stars: 5, avatar: "S", featured: false },
  { name: "Karan D.", role: "Commodity Trader, Ahmedabad", style: "Commodity", quote: "The trailing stop loss engine saved me from a 3% drawdown on a gold trade last week. It auto-adjusted my SL as the price moved — I didn't have to touch anything.", highlight: "trailing stop loss engine", stars: 5, avatar: "K", featured: false },
];

const shortFeatures = [
  "Unlimited trade logging", "AI-powered trade insights", "Advanced analytics suite",
  "Trailing stop loss engine", "Broker integration (Dhan)",
];



function HighlightedQuote({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <>{testimonial.quote.split(testimonial.highlight).map((part, i, arr) => (
      <React.Fragment key={i}>{part}{i < arr.length - 1 && <span className="text-[hsl(var(--tb-accent))] font-bold">{testimonial.highlight}</span>}</React.Fragment>
    ))}</>
  );
}


export function PricingSection() {
  const navigate = useNavigate();
  return (
    <section id="pricing" className="py-24 lg:py-32" aria-label="Pricing">
      <MotionSection className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge>Pricing</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-5 leading-[1.06] tracking-[-0.03em]">
            Simple,{" "}<span className="text-shimmer">transparent</span>{" "}pricing
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">
            Everything free during beta. No credit card. No catch.
          </p>
        </motion.div>

        {/* 2-card layout */}
        <div className="grid md:grid-cols-2 gap-4 lg:gap-5 max-w-3xl mx-auto mb-14">
          {/* Free Beta Card */}
          <motion.div variants={popIn} custom={0}>
            <motion.div
              className="group rounded-xl border border-primary/20 bg-card/60 backdrop-blur-sm p-6 lg:p-7 h-full flex flex-col relative overflow-hidden liquid-shine"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}
              whileHover={{ y: -4, borderColor: "hsl(var(--primary) / 0.35)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
                ].map((f, i) => (
                  <motion.li
                    key={f}
                    className="flex items-start gap-2 text-[13px] leading-[1.6]"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                  >
                    <CheckCircle2 className="w-4 h-4 text-profit shrink-0 mt-[1px]" />
                    <span className="tracking-[-0.006em]">{f}</span>
                  </motion.li>
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
          <motion.div variants={popIn} custom={0.1}>
            <motion.div
              className="group rounded-xl border border-border/20 bg-card/40 backdrop-blur-sm p-6 lg:p-7 h-full flex flex-col relative overflow-hidden"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}
              whileHover={{ y: -4, borderColor: "hsl(var(--border) / 0.4)" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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

        {/* Trust badges */}
        <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3">
          {[{ icon: Lock, text: "No credit card required" }, { icon: Shield, text: "Your data stays private" }, { icon: Clock, text: "Set up in under 2 minutes" }].map((item, i) => (
            <motion.div
              key={item.text}
              className="flex items-center gap-1.5 bg-muted/20 rounded-full px-3 py-1.5 text-[12px] text-muted-foreground/60"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <item.icon className="w-3 h-3" /><span>{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}

export function TestimonialsSection() {
  const featured = testimonials[0];
  const secondary = [testimonials[1], testimonials[2], testimonials[5]];

  return (
    <section id="testimonials" className="py-28 lg:py-36" aria-label="Testimonials">
      <MotionSection className="max-w-5xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-20">
          <SectionBadge>Testimonials</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-6 leading-[1.06] tracking-[-0.03em]">
            Trusted by{" "}<span className="text-shimmer">real traders</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">Here's what traders across India are saying.</p>
        </motion.div>

        {/* Hero testimonial — dark card with gradient border */}
        <motion.div variants={fadeUp} className="mb-8">
          <motion.div
            className="rounded-2xl border border-foreground/10 bg-foreground text-background p-10 md:p-14 relative overflow-hidden gradient-border-animated"
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

        {/* 3 smaller testimonials — staggered popIn */}
        <div className="grid md:grid-cols-3 gap-5 mb-14">
          {secondary.map((t, i) => (
            <motion.div key={t.name} variants={popIn} custom={i * 0.1}>
              <motion.div
                className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm p-7 h-full flex flex-col"
                style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
                whileHover={{ y: -4, borderColor: "hsl(var(--border) / 0.5)" }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
          <motion.div variants={slideFromLeft}>
            <SectionBadge>Made in India</SectionBadge>
            <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-6 leading-[1.06] tracking-[-0.03em]">
              Built for{" "}<span className="text-shimmer">Indian</span>{" "}markets
            </h2>
            <p className="text-muted-foreground text-[15px] lg:text-[1rem] leading-[1.7] mb-8 tracking-[-0.006em]">
              Unlike generic journals, TradeBook understands Indian market structure — segments, lot sizes, INR formatting, and trading hours.
            </p>
            <ul className="space-y-2 mb-10">
              {[
                { text: "NSE, BSE & MCX exchange support", icon: Globe },
                { text: "INR formatting with Lakhs & Crores", icon: CandlestickChart },
                { text: "Dhan broker auto-sync", icon: Layers },
                { text: "Market hours & holiday awareness", icon: Clock },
              ].map((item, i) => (
                <motion.li
                  key={item.text}
                  className="flex items-center gap-2.5 text-[15px] text-foreground/85 tracking-[-0.006em]"
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.4 }}
                >
                  <div className="w-6 h-6 rounded-md bg-profit/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-profit" />
                  </div>
                  <span>{item.text}</span>
                </motion.li>
              ))}
            </ul>

            {/* Exchange badges — animated pulse borders */}
            <div className="flex items-center gap-3 mb-8">
              {["NSE", "BSE", "MCX"].map((exchange, i) => (
                <motion.div
                  key={exchange}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 bg-card/70 text-sm font-bold tracking-wide"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 }}
                  whileHover={{ borderColor: "hsl(var(--profit) / 0.4)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-profit animate-pulse" />
                  {exchange}
                </motion.div>
              ))}
            </div>

            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="inline-block">
              <Button size="lg" className="rounded-full bg-foreground hover:bg-foreground/90 text-background font-semibold shadow-lg h-13 px-8" onClick={() => navigate("/login?mode=signup")}>
                Try It Free <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Segments card — cascade reveal */}
          <motion.div variants={slideFromRight} custom={0.15}>
            <div className="rounded-2xl border border-border/30 bg-card/70 backdrop-blur-sm overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
              {/* Animated tricolor stripe */}
              <div className="h-1 flex overflow-hidden relative">
                <div className="flex-1 bg-[#FF9933]" />
                <div className="flex-1 bg-white dark:bg-white/80" />
                <div className="flex-1 bg-[#128807]" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                />
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
                  ].map((seg, i) => (
                    <motion.div
                      key={seg.label}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/20 bg-muted/5 text-sm font-semibold cursor-default"
                      whileHover={{ backgroundColor: `${seg.color.replace(")", " / 0.06)")}`, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      // Cascade from top-left
                      {...{ transition: { delay: (Math.floor(i / 2) + (i % 2)) * 0.06, duration: 0.3 } }}
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

export function DocsCTASection() {
  const navigate = useNavigate();
  const docTopics = [
    { label: "Comprehensive Guides", icon: BookOpen },
    { label: "Visual Mockups", icon: Layers },
    { label: "Step-by-Step Tutorials", icon: Sparkles },
    { label: "Analytics Deep-Dives", icon: BarChart3 },
  ];

  return (
    <section className="py-28 lg:py-36 relative overflow-hidden" aria-label="Documentation">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.04)_0%,transparent_65%)] pointer-events-none" />

      <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={fadeUp}>
          <SectionBadge>Documentation</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-5 leading-[1.06] tracking-[-0.03em]">
            Explore the{" "}<span className="text-shimmer">Documentation</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-[15px] lg:text-[1rem] leading-[1.7] mb-10 tracking-[-0.006em]">
            Visual guides, feature walkthroughs, analytics tutorials, and setup instructions — everything you need to master TradeBook.
          </p>
        </motion.div>

        <motion.div variants={popIn} className="mb-10" whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            className="h-14 px-10 text-[15px] gap-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg font-semibold tracking-[-0.01em] relative overflow-hidden group"
            onClick={() => navigate("/docs")}
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000" />
            <span className="relative flex items-center gap-2.5">
              <BookOpen className="w-4.5 h-4.5" />
              Browse Documentation
              <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </motion.div>

        {/* Topic pills */}
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
          {docTopics.map((topic, i) => (
            <motion.span
              key={topic.label}
              className="inline-flex items-center gap-2 bg-card/70 border border-border/30 rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              whileHover={{ borderColor: "hsl(var(--primary) / 0.3)", y: -2 }}
            >
              <topic.icon className="w-3.5 h-3.5 text-primary" />
              {topic.label}
            </motion.span>
          ))}
        </motion.div>
      </MotionSection>
    </section>
  );
}

/* ─── FAQ Section ─── */

const faqs = [
  { q: "Is TradeBook free?", a: "Yes, TradeBook is completely free during the beta period. All features — trade logging, AI analytics, alerts, broker integration — are included at no cost. No credit card required." },
  { q: "Which Indian markets does TradeBook support?", a: "TradeBook supports NSE, BSE, and MCX markets covering Equity Cash, Equity Intraday, Futures, Options, Commodities, and Currency segments." },
  { q: "Does TradeBook integrate with brokers?", a: "Yes, TradeBook integrates with Dhan for live portfolio sync, auto-trade import, and one-click execution. More broker integrations are on the roadmap." },
  { q: "Can I use TradeBook on mobile?", a: "Absolutely. TradeBook is a Progressive Web App (PWA) that works on any device. Install it on your phone for a native app-like experience with offline support." },
  { q: "How does the AI analytics work?", a: "TradeBook uses AI to detect trading patterns, provide trade coaching, generate performance insights, and suggest improvements based on your trading history — all without sharing your data externally." },
  { q: "Is my data secure?", a: "Yes. TradeBook uses bank-grade encryption and your data is stored securely. We never share or sell your trading data to anyone." },
];

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      custom={index * 0.05}
      className="border border-border/30 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm"
      style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 md:p-6 text-left gap-4 hover:bg-muted/20 transition-colors"
        aria-expanded={open}
      >
        <span className="text-[15px] md:text-base font-medium tracking-[-0.01em]">{faq.q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 md:px-6 pb-5 md:pb-6 text-[14px] md:text-[15px] text-muted-foreground leading-[1.7] tracking-[-0.006em]">
              {faq.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="py-28 lg:py-36" aria-label="Frequently asked questions">
      <MotionSection className="max-w-3xl mx-auto px-6">
        <motion.div variants={fadeUp} className="text-center mb-16">
          <SectionBadge>FAQ</SectionBadge>
          <h2 className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold mb-5 leading-[1.06] tracking-[-0.03em]">
            Frequently asked{" "}<span className="text-shimmer">questions</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto text-[15px] lg:text-[1rem] leading-[1.7]">
            Everything you need to know about TradeBook.
          </p>
        </motion.div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </MotionSection>
    </section>
  );
}

export function FinalCTASection() {
  const navigate = useNavigate();
  return (
    <section className="py-32 lg:py-40 relative overflow-hidden" aria-label="Call to action">
      {/* Aurora animated background */}
      <div className="absolute inset-0 aurora-bg" />
      
      {/* Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.06)_0%,transparent_65%)] pointer-events-none" />
      <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsl(210_80%_55%/0.03)_0%,transparent_70%)] pointer-events-none" />

      {/* Grain */}
      <div className="absolute inset-0 grain-overlay pointer-events-none" />

      <MotionSection className="relative max-w-3xl mx-auto px-6 text-center">
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-10">
          <div className="flex -space-x-2">
            {["hsl(var(--primary))", "hsl(var(--profit))", "hsl(210 80% 55%)"].map((c, i) => (
              <motion.div
                key={i}
                className="w-7 h-7 rounded-full ring-2 ring-background"
                style={{ backgroundColor: c }}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.1 }}
              />
            ))}
          </div>
          <span className="text-[13px] font-medium text-muted-foreground">1,200+ traders · 42,000+ trades</span>
        </motion.div>

        <motion.h2 variants={blurIn} className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold leading-[1.06] tracking-[-0.03em] mb-3">
          Stop losing money to
        </motion.h2>
        <motion.h2 variants={blurIn} custom={0.1} className="font-heading text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] font-bold leading-[1.06] tracking-[-0.03em] mb-10">
          <span className="text-shimmer">undisciplined</span> trading
        </motion.h2>

        <motion.p variants={fadeUp} className="text-[1rem] lg:text-[1.125rem] text-muted-foreground mb-14 max-w-xl mx-auto leading-[1.7] tracking-[-0.006em]">
          Join traders who journal, analyze, and compound their edge — every single day.
        </motion.p>

        <motion.div variants={popIn} whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
          <Button
            size="lg"
            className="h-16 px-12 text-[17px] gap-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg font-semibold tracking-[-0.01em] relative overflow-hidden group"
            onClick={() => navigate("/login?mode=signup")}
          >
            {/* Shine sweep */}
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000" />
            <span className="relative flex items-center gap-2.5">
              Start Your Journal — It's Free <ArrowRight className="w-4 h-4" />
            </span>
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[{ icon: Lock, text: "Bank-grade encryption" }, { icon: Shield, text: "No credit card required" }, { icon: Clock, text: "Setup in 2 minutes" }].map((item, i) => (
            <motion.span
              key={item.text}
              className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 rounded-full px-3 py-1.5"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <item.icon className="w-3 h-3" /> {item.text}
            </motion.span>
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

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });
      if (error && error.code === "23505") {
        // duplicate — still show success
      } else if (error) {
        throw error;
      }
    } catch {
      // Silently fail — still show confirmation
    }
    setEmail("");
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
            <div className="flex flex-col mb-3">
              <span className="text-base font-heading font-bold tracking-tight text-foreground">TradeBook</span>
              <span className="text-[10px] font-medium text-muted-foreground/50">by Mr Chartist</span>
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
                { href: "https://x.com/mrchartist_in", icon: "𝕏", label: "X / Twitter" },
                { href: "https://youtube.com/@mrchartist", icon: "▶", label: "YouTube" },
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
                { label: "Changelog", action: () => navigate("/docs#changelog") },
                { label: "Contact Us", action: () => window.open("mailto:founder@mrchartist.com", "_blank") },
                { label: "FAQ", action: () => document.getElementById("faq")?.scrollIntoView({ behavior: "smooth" }) },
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
