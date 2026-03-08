import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./LandingShared";
import { DashboardPreview } from "./DashboardPreview";
import { VideoModal } from "./VideoModal";

const statsConfig = [
  { end: 1200, suffix: "+", label: "Traders Joined" },
  { end: 12, prefix: "₹", suffix: "Cr+", label: "Trades Tracked" },
  { end: 50, suffix: "+", label: "Analytics Metrics" },
  { end: 3, suffix: "", label: "Market Segments" },
];

function useCountUpOnView(end: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
          const start = performance.now();
          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration, hasStarted]);

  return { count, ref };
}

export function HeroSection() {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  const stat0 = useCountUpOnView(statsConfig[0].end, 1800);
  const stat1 = useCountUpOnView(statsConfig[1].end, 1400);
  const stat2 = useCountUpOnView(statsConfig[2].end, 1600);
  const stat3 = useCountUpOnView(statsConfig[3].end, 1000);
  const statRefs = [stat0, stat1, stat2, stat3];

  const formatStat = (i: number, count: number) => {
    const cfg = statsConfig[i];
    return `${cfg.prefix || ""}${count.toLocaleString("en-IN")}${cfg.suffix}`;
  };

  return (
    <>
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden" aria-label="Hero">
        {/* Dot grid pattern background */}
        <div className="absolute inset-0 dot-pattern opacity-40 dark:opacity-20" />

        {/* Radial gradient glow */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(var(--tb-accent) / 0.06) 0%, hsl(var(--tb-accent) / 0.02) 40%, transparent 70%)" }}
        />

        {/* Secondary cool glow */}
        <div className="absolute top-[50%] left-[20%] w-[500px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(210 80% 55% / 0.03) 0%, transparent 70%)" }}
        />

        {/* Bottom fade to background */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        {/* Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-14 text-center"
        >
          {/* Beta badge pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/30 bg-card/50 dark:bg-card/20 backdrop-blur-xl shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground text-[13px] font-medium tracking-[-0.01em]">
                Free during beta — no card needed
              </span>
            </div>
          </motion.div>

          {/* Headline — Sora, bold, gradient keyword */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="font-heading text-[2.5rem] sm:text-[3.25rem] md:text-[4rem] lg:text-[4.75rem] font-bold leading-[1.02] tracking-[-0.04em] text-foreground mb-7 max-w-4xl"
          >
            Know Your{" "}
            <span className="text-gradient">Edge</span>.
            <br />
            <span className="text-foreground/50">Compound It Daily.</span>
          </motion.h1>

          {/* Subtitle — Inter, clean */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-[1rem] md:text-[1.0625rem] lg:text-[1.125rem] text-muted-foreground max-w-[30rem] mx-auto mb-12 leading-[1.7] tracking-[-0.006em]"
          >
            The smart trading journal built for Indian markets. Track every trade across NSE, BSE & MCX — and find your real edge.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            className="flex flex-col sm:flex-row items-center gap-4 mb-7"
          >
            <Button
              size="lg"
              className="h-[3.25rem] px-10 text-[15px] gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-semibold tracking-[-0.01em] relative overflow-hidden group"
              onClick={() => navigate("/login?mode=signup")}
            >
              {/* Glow effect on hover */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/0 via-white/10 to-primary/0" />
              <span className="relative flex items-center gap-2.5">
                Start Free — No Card Needed
                <ArrowRight className="w-4 h-4" />
              </span>
            </Button>

            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium group tracking-[-0.01em]"
            >
              <span className="w-9 h-9 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm flex items-center justify-center group-hover:border-primary/30 group-hover:bg-card/60 transition-all duration-200">
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </span>
              Watch Demo
            </button>
          </motion.div>

          {/* Trust micro-line */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.4}
            className="flex items-center gap-4 text-[12px] text-muted-foreground/50"
          >
            <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Bank-grade security</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Setup in 2 minutes</span>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-2xl mb-10"
        >
          <div className="rounded-2xl bg-card/40 dark:bg-card/20 backdrop-blur-xl border border-border/20 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/15">
              {statsConfig.map((stat, i) => (
                <div key={stat.label} ref={statRefs[i].ref} className="px-4 sm:px-5 py-4 text-center">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground tracking-[-0.02em] font-mono tabular-nums">
                    {formatStat(i, statRefs[i].count)}
                  </p>
                  <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.12em] mt-1.5 font-semibold">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview */}
      <div className="relative bg-background">
        <div className="absolute inset-x-0 -top-32 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="pt-4 sm:pt-12 pb-4">
          <DashboardPreview />
        </div>
      </div>

      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </>
  );
}
