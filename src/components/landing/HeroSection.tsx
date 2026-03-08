import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./LandingShared";
import { DashboardPreview } from "./DashboardPreview";
import { VideoModal } from "./VideoModal";
import heroLifestyle from "@/assets/hero-lifestyle.jpg";

const stats = [
  { value: "1,200+", label: "Traders Joined" },
  { value: "₹12Cr+", label: "Trades Tracked" },
  { value: "50+", label: "Analytics Metrics" },
  { value: "3", label: "Market Segments" },
];

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
  const blurAmount = useTransform(scrollYProgress, [0, 0.5], [20, 30]);

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
            style={{ filter: "blur(18px) saturate(1.1)", transform: "scale(1.05)" }}
          />
        </motion.div>

        {/* Light overlays — soft, airy feel */}
        <div className="absolute inset-0 bg-background/70 dark:bg-background/75" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/90" />

        {/* Subtle warm accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[hsl(var(--tb-accent)/0.06)] blur-[120px] pointer-events-none" />

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
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm">
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
            <span className="accent-script">
              Edge
            </span>
            .
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
              className="inline-flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="w-11 h-11 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 flex items-center justify-center group-hover:bg-card transition-colors shadow-sm">
                <Play className="w-4 h-4 text-foreground ml-0.5" />
              </span>
              <span className="font-medium tracking-wide">Watch Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl mb-8 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/40 shadow-sm"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/30">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 sm:px-6 py-5 text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-[0.14em] mt-1.5 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview — on normal background */}
      <div className="bg-background">
        <div className="pt-16 sm:pt-24">
          <DashboardPreview />
        </div>
      </div>

      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </>
  );
}
