import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
        {/* Heavily blurred lifestyle background */}
        <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
          <img
            src={heroLifestyle}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
            style={{ filter: "blur(24px) saturate(1.15) brightness(1.1)", transform: "scale(1.08)" }}
          />
        </motion.div>

        {/* Light overlays — crisp, white-washed editorial feel */}
        <div className="absolute inset-0 bg-background/80 dark:bg-background/85" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background dark:from-background/60 dark:via-background/20 dark:to-background/95" />

        {/* Subtle warm accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[hsl(var(--tb-accent)/0.04)] dark:bg-[hsl(var(--tb-accent)/0.04)] blur-[140px] pointer-events-none" />

        {/* Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-8 text-center"
        >
          {/* Social proof pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/40 dark:border-border/30 shadow-sm">
              <div className="flex -space-x-2">
                {avatarInitials.map((init, i) => (
                  <div
                    key={init}
                    className="w-7 h-7 rounded-full ring-2 ring-background flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <span className="text-muted-foreground text-sm font-medium tracking-wide">
                1,200+ traders joined. <span className="text-foreground font-semibold">Join us!</span>
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem] font-extrabold leading-[0.95] tracking-[-0.04em] text-foreground mb-8"
          >
            Know Your{" "}
            <span className="accent-script">Edge</span>.
            <br />
            Compound It Daily.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-xl lg:text-2xl text-muted-foreground max-w-xl mx-auto mb-14 leading-relaxed font-medium tracking-wide"
          >
            The trading journal built for Indian markets — NSE, BSE, MCX.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-16 px-12 text-lg gap-2.5 bg-foreground hover:bg-foreground/90 text-background rounded-full shadow-lg font-semibold tracking-wide"
                onClick={() => navigate("/login?mode=signup")}
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground font-medium tracking-wide"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats bar with animated count-up */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl mb-8 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-xl border border-border/40 dark:border-border/30 shadow-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/30">
            {statsConfig.map((stat, i) => (
              <div key={stat.label} ref={statRefs[i].ref} className="px-4 sm:px-6 py-5 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight font-mono tabular-nums">
                  {formatStat(i, statRefs[i].count)}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.14em] mt-1.5 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview — smooth transition from hero */}
      <div className="relative bg-background">
        <div className="absolute inset-x-0 -top-24 h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
        <div className="pt-8 sm:pt-16">
          <DashboardPreview />
        </div>
      </div>

      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </>
  );
}
