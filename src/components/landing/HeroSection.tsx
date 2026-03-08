import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "./LandingShared";
import { DashboardPreview } from "./DashboardPreview";
import { VideoModal } from "./VideoModal";
import heroBg from "@/assets/hero-bg.jpg";

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
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <>
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden" aria-label="Hero">
        {/* Background image with subtle parallax zoom */}
        <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Layered overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Content */}
        <motion.div
          style={{ y: contentY }}
          className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-8 text-center"
        >
          {/* Social proof pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              <div className="flex -space-x-2">
                {avatarInitials.map((init, i) => (
                  <div
                    key={init}
                    className="w-7 h-7 rounded-full ring-2 ring-black/20 flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <span className="text-white/80 text-sm font-medium tracking-wide">
                1,200+ traders joined. <span className="text-white font-semibold">Join us!</span>
              </span>
            </div>
          </motion.div>

          {/* Headline — Sora display font */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white mb-6"
            style={{
              fontFamily: "'Sora', 'Inter', sans-serif",
              textShadow: "0 4px 40px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            Know Your{" "}
            <span
              className="text-[hsl(var(--tb-accent))] italic"
              style={{
                fontFamily: "'Dancing Script', cursive",
                textShadow: "0 0 40px hsl(var(--tb-accent) / 0.35), 0 4px 40px rgba(0,0,0,0.3)",
              }}
            >
              Edge
            </span>
            .
            <br />
            <span className="bg-gradient-to-r from-white via-white/95 to-white/80 bg-clip-text text-transparent">
              Compound It Daily.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp} initial="hidden" animate="visible" custom={0.2}
            className="text-lg lg:text-xl text-white/65 max-w-lg mx-auto mb-12 leading-relaxed font-medium tracking-wide"
            style={{ fontFamily: "'Inter', sans-serif" }}
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
                className="h-14 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_8px_32px_hsl(var(--tb-accent)/0.45)] font-semibold shimmer-cta tracking-wide"
                style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}
                onClick={() => navigate("/login?mode=signup")}
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 text-sm text-white/60 hover:text-white transition-colors group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="w-11 h-11 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/15 flex items-center justify-center group-hover:bg-white/15 transition-colors shadow-lg">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </span>
              <span className="font-medium tracking-wide">Watch Demo</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Stats bar — glassmorphic, anchored at bottom */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-3xl mb-8 rounded-2xl bg-white/[0.07] backdrop-blur-2xl border border-white/[0.1] shadow-[0_16px_64px_rgba(0,0,0,0.15)]"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.08]">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 sm:px-6 py-5 text-center">
                <p
                  className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight"
                  style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-[11px] text-white/50 uppercase tracking-[0.14em] mt-1.5 font-medium">
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
