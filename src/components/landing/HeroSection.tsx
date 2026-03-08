import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./LandingShared";
import { DashboardPreview } from "./DashboardPreview";
import { VideoModal } from "./VideoModal";
import heroLifestyle from "@/assets/hero-lifestyle.jpg";

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

const avatarColors = [
  "hsl(var(--tb-accent))",
  "hsl(var(--profit))",
  "hsl(210 80% 55%)",
  "hsl(270 60% 55%)",
  "hsl(340 70% 55%)",
];
const avatarInitials = ["RP", "AK", "SM", "VK", "PT"];

export function HeroSection() {
  const navigate = useNavigate();
  const [videoOpen, setVideoOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 50]);

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
        {/* Background */}
        <motion.div className="absolute inset-0 will-change-transform" style={{ scale: imgScale }}>
          <img
            src={heroLifestyle}
            alt=""
            className="w-full h-full object-cover will-change-transform"
            fetchPriority="high"
            decoding="async"
            style={{ filter: "blur(28px) saturate(1.1) brightness(1.08)", transform: "scale(1.1)" }}
          />
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-background/82 dark:bg-background/88" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background" />

        {/* Subtle radial accent */}
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-[hsl(var(--tb-accent)/0.025)] blur-[180px] pointer-events-none" />

        {/* Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-14 text-center"
        >
          {/* Social proof pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-10"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-card/50 dark:bg-card/25 backdrop-blur-xl border border-border/25 shadow-sm">
              <div className="flex -space-x-2">
                {avatarInitials.map((init, i) => (
                  <div
                    key={init}
                    className="w-6 h-6 rounded-full ring-2 ring-background flex items-center justify-center text-[7px] font-bold text-white"
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground text-[13px] font-medium tracking-[-0.01em]">
                1,200+ traders trust TradeBook
              </span>
            </div>
          </motion.div>

          {/* Headline — Bodoni, 60-68px desktop */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="font-heading text-[2.25rem] sm:text-[3rem] md:text-[3.75rem] lg:text-[4.25rem] font-semibold leading-[1.04] tracking-[-0.02em] text-foreground mb-8 max-w-4xl"
          >
            Know Your{" "}
            <span className="accent-serif text-primary">Edge</span>.
            <br />
            <span className="text-foreground/70">Compound It Daily.</span>
          </motion.h1>

          {/* Subtitle — Source Sans, 18px, clean */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-[1rem] md:text-[1.0625rem] lg:text-[1.125rem] text-muted-foreground max-w-[28rem] mx-auto mb-14 leading-[1.7] tracking-[-0.006em]"
          >
            The smart trading journal built for Indian markets. Track every trade across NSE, BSE & MCX — and find your real edge.
          </motion.p>

          {/* CTA buttons — clear hierarchy */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            className="flex flex-col sm:flex-row items-center gap-4 mb-6"
          >
            <Button
              size="lg"
              className="h-[3.25rem] px-10 text-[15px] gap-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg shadow-primary/15 font-semibold tracking-[-0.01em]"
              onClick={() => navigate("/login?mode=signup")}
            >
              Start Free — No Card Needed
              <ArrowRight className="w-4 h-4" />
            </Button>

            <button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium group tracking-[-0.01em]"
            >
              <span className="w-9 h-9 rounded-full border border-border/30 bg-card/40 backdrop-blur-sm flex items-center justify-center group-hover:border-foreground/20 group-hover:bg-card/60 transition-all duration-200">
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

        {/* Stats bar — cleaner, tighter */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-2xl mb-10"
        >
          <div className="rounded-2xl bg-card/40 dark:bg-card/25 backdrop-blur-xl border border-border/20 shadow-sm">
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

      {/* Dashboard Preview — editorial transition */}
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
