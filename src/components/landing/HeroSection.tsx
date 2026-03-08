import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Lock, Zap, Clock, Play, ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "./LandingShared";
import { FloatingElements } from "./FloatingElements";
import { DashboardPreview } from "./DashboardPreview";
import { VideoModal } from "./VideoModal";

export function HeroSection() {
  const navigate = useNavigate();
  const [heroEmail, setHeroEmail] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={heroRef} className="relative overflow-hidden" aria-label="Hero">
      {/* Subtle radial gradient wash */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-[radial-gradient(ellipse_at_center,hsl(var(--tb-accent)/0.04)_0%,transparent_70%)]" />
      </div>

      {/* Floating elements with connections — GitHub Discussions style */}
      <div className="absolute inset-0 top-16 bottom-0" style={{ minHeight: "700px" }}>
        <FloatingElements />
      </div>

      <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative max-w-3xl mx-auto px-6 pt-32 pb-10 lg:pt-44 lg:pb-20 text-center z-10">
        {/* Badge */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex justify-center mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[hsl(var(--tb-accent)/0.25)] bg-[hsl(var(--tb-accent)/0.04)] text-sm"
            whileHover={{ scale: 1.03 }}
          >
            <motion.span
              className="w-2 h-2 rounded-full bg-profit"
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[hsl(var(--tb-accent))] font-semibold text-xs tracking-wide">
              Built for Indian Markets · NSE · BSE · MCX
            </span>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight mb-7"
        >
          Know Your{" "}
          <span
            className="text-[hsl(var(--tb-accent))] italic"
            style={{ fontFamily: "'Dancing Script', 'Satisfy', cursive" }}
          >
            Edge
          </span>
          .
          <br />
          Compound It Daily.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
          className="text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto mb-12 leading-[1.7]"
        >
          The only trading journal that shows you <strong className="text-foreground font-semibold">why</strong> you win and{" "}
          <strong className="text-foreground font-semibold">why</strong> you lose — with segment-level analytics for Equity, F&O, and Commodities.
        </motion.p>

        {/* Email CTA + Watch Demo */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="flex flex-col items-center gap-4 max-w-lg mx-auto mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
            <Input
              type="email"
              placeholder="Enter your email"
              value={heroEmail}
              onChange={(e) => setHeroEmail(e.target.value)}
              aria-label="Email address for signup"
              className="h-12 sm:h-14 rounded-full px-6 text-base border-border/40 bg-card/70 backdrop-blur-md shadow-sm flex-1 w-full focus-visible:ring-[hsl(var(--tb-accent)/0.3)]"
              style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.1), var(--shadow-sm)" }}
            />
            <motion.div whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
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
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.4} className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-16">
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
              whileHover={{ scale: 1.04, borderColor: "hsl(var(--tb-accent) / 0.3)" }}
            >
              <badge.icon className={`w-3.5 h-3.5 ${badge.iconClass}`} />
              {badge.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>

      {/* Dashboard Preview — below hero content */}
      <DashboardPreview />

      {/* Video Modal */}
      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </section>
  );
}
