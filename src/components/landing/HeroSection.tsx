import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CheckCircle2, Lock, Zap, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp, scaleIn } from "./LandingShared";
import { FloatingElements } from "./FloatingElements";
import { DashboardPreview } from "./DashboardPreview";

export function HeroSection() {
  const navigate = useNavigate();
  const [heroEmail, setHeroEmail] = useState("");
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

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

        {/* Heading */}
        <motion.h1
          variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight mb-8"
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
          className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-14 leading-[1.7] px-2"
        >
          The only trading journal that shows you <strong className="text-foreground font-semibold">why</strong> you win and{" "}
          <strong className="text-foreground font-semibold">why</strong> you lose — with segment-level analytics for Equity, F&O, and Commodities.
        </motion.p>

        {/* Email CTA */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.3} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-10 px-2">
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
        </motion.div>

        {/* Micro trust */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0.4} className="flex flex-wrap items-center justify-center gap-5 sm:gap-6 text-[13px] text-muted-foreground mb-20">
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-profit" /> Free during beta</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Bank-grade security</span>
          <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" /> No credit card</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Setup in 2 min</span>
        </motion.div>
      </motion.div>

      {/* Dashboard Preview */}
      <DashboardPreview />
    </section>
  );
}
