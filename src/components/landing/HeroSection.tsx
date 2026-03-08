import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Lock, Zap, Clock, Play, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "./LandingShared";
import { FloatingElements, WORDS } from "./FloatingElements";
import { VideoModal } from "./VideoModal";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

export function HeroSection() {
  const navigate = useNavigate();
  const [heroEmail, setHeroEmail] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [emailFocused, setEmailFocused] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Typing word rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={heroRef} className="relative overflow-hidden" aria-label="Hero">
      <FloatingElements />

      {/* Multi-color pastel gradient wash */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsl(340_80%_85%/0.15)_0%,transparent_70%)]" />
        <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(24_90%_80%/0.12)_0%,transparent_70%)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,hsl(280_60%_88%/0.08)_0%,transparent_70%)]" />
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-5xl mx-auto px-6 pt-28 pb-10 lg:pt-40 lg:pb-20 text-center">
        {/* Badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass-sm !rounded-full text-sm"
            whileHover={{ scale: 1.03 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-profit"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-muted-foreground font-medium text-xs tracking-wide">
              Built for Indian Markets · NSE · BSE · MCX
            </span>
          </motion.div>
        </motion.div>

        {/* Heading with animated word */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8"
        >
          Know Your{" "}
          <span className="relative inline-block w-[3.2ch] sm:w-[3.8ch] text-left align-bottom">
            <AnimatePresence mode="wait">
              <motion.span
                key={WORDS[wordIndex]}
                className="text-[hsl(var(--tb-accent))] italic absolute left-0"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
                initial={{ opacity: 0, y: 20, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, rotateX: 40 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
            {/* Invisible sizing element */}
            <span className="invisible" style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}>
              {WORDS.reduce((a, b) => (a.length > b.length ? a : b))}
            </span>
          </span>
          .
          <br />
          Compound It Daily.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-[1.7] px-2"
        >
          The only trading journal that shows you <strong className="text-foreground font-semibold">why</strong> you win and{" "}
          <strong className="text-foreground font-semibold">why</strong> you lose — with segment-level analytics for Equity, F&O, and Commodities.
        </motion.p>

        {/* Email CTA with micro-interactions */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="flex flex-col items-center gap-4 max-w-lg mx-auto mb-10 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full relative">
            {/* Glow ring on focus */}
            <div className="relative flex-1 w-full">
              <motion.div
                className="absolute -inset-1 rounded-full bg-[hsl(var(--tb-accent)/0.15)] blur-md pointer-events-none"
                animate={{ opacity: emailFocused ? 1 : 0, scale: emailFocused ? 1 : 0.95 }}
                transition={{ duration: 0.3 }}
              />
              <Input
                type="email"
                placeholder="Enter your email"
                value={heroEmail}
                onChange={(e) => setHeroEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                aria-label="Email address for signup"
                className="relative h-12 sm:h-14 rounded-full px-6 text-base border-border/40 bg-card/70 backdrop-blur-md shadow-sm w-full focus-visible:ring-[hsl(var(--tb-accent)/0.3)] transition-shadow duration-300"
                style={{ boxShadow: emailFocused 
                  ? "inset 0 1px 0 0 hsl(0 0% 100% / 0.1), 0 0 0 2px hsl(var(--tb-accent) / 0.2), 0 4px 16px hsl(var(--tb-accent) / 0.1)" 
                  : "inset 0 1px 0 0 hsl(0 0% 100% / 0.1), var(--shadow-sm)" 
                }}
              />
            </div>
            <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                size="lg"
                className="h-12 sm:h-14 px-8 text-base gap-2 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_6px_24px_hsl(var(--tb-accent)/0.3)] font-semibold whitespace-nowrap w-full sm:w-auto shimmer-cta"
                onClick={() => navigate(`/login?mode=signup${heroEmail ? `&email=${encodeURIComponent(heroEmail)}` : ""}`)}
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
          <motion.button
            onClick={() => setVideoOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.1)] border border-[hsl(var(--tb-accent)/0.2)] flex items-center justify-center group-hover:bg-[hsl(var(--tb-accent)/0.15)] transition-colors">
              <Play className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))] ml-0.5" />
            </span>
            <span className="font-medium">Watch Demo</span>
            <span className="text-muted-foreground/60 text-xs">2 min</span>
          </motion.button>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.4} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-20">
          {[
            { icon: CheckCircle2, label: "Free during beta", iconClass: "text-profit" },
            { icon: ShieldCheck, label: "256-bit SSL", iconClass: "text-[hsl(var(--tb-accent))]" },
            { icon: Lock, label: "Bank-grade security", iconClass: "text-muted-foreground" },
            { icon: Zap, label: "No credit card", iconClass: "text-[hsl(var(--tb-accent))]" },
            { icon: Clock, label: "Setup in 2 min", iconClass: "text-muted-foreground" },
          ].map((badge) => (
            <motion.span
              key={badge.label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/30 bg-card/50 backdrop-blur-sm text-[12px] sm:text-[13px] text-muted-foreground font-medium"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.05)" }}
              whileHover={{ scale: 1.04, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
            >
              <badge.icon className={`w-3.5 h-3.5 ${badge.iconClass}`} />
              {badge.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Dashboard Preview — Real Screenshot */}
      <div className="relative max-w-6xl mx-auto px-2 sm:px-6 pb-16 sm:pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          {/* Glow */}
          <div className="absolute -inset-8 sm:-inset-16 bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.06)_0%,transparent_70%)] pointer-events-none" />
          {/* Layered shadows */}
          <div className="absolute inset-x-4 sm:inset-x-8 -bottom-4 h-8 rounded-3xl bg-foreground/[0.03] blur-xl" />
          <div className="absolute inset-x-2 sm:inset-x-4 -bottom-2 h-6 rounded-3xl bg-foreground/[0.04] blur-md" />

          <motion.div
            className="relative rounded-2xl sm:rounded-3xl border border-border/40 bg-card overflow-hidden cursor-pointer group"
            style={{
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.08), 0 0 0 1px hsl(var(--border)/0.3), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)",
            }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4 }}
            onClick={() => navigate("/login?mode=signup")}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-b border-border/30 bg-gradient-to-b from-muted/20 to-muted/10">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FF605C]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFBD44]" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#00CA4E]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-4 py-0.5 rounded-full bg-muted/30 text-[9px] text-muted-foreground font-medium">
                  mytradebook.lovable.app/dashboard
                </div>
              </div>
            </div>

            {/* Screenshot */}
            <div className="relative overflow-hidden">
              <img
                src={dashboardPreview}
                alt="TradeBook dashboard showing trading analytics, P&L tracking, and alert management"
                className="w-full h-auto"
                loading="lazy"
                width={1920}
                height={1080}
              />
              {/* Hover overlay */}
              <motion.div
                className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-[hsl(var(--tb-accent))] text-white font-semibold shadow-[0_6px_24px_hsl(var(--tb-accent)/0.4)]">
                  Try it yourself →
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Video Modal */}
      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </section>
  );
}
