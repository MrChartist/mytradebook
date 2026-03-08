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
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.55, 0.8]);

  return (
    <>
      <section ref={heroRef} className="relative min-h-[100svh] flex flex-col overflow-hidden" aria-label="Hero">
        {/* Background image with parallax zoom */}
        <motion.div className="absolute inset-0" style={{ scale: imgScale }}>
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover"
            loading="eager"
          />
        </motion.div>

        {/* Dark overlay for text readability */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"
          style={{ opacity: overlayOpacity }}
        />

        {/* Warm gradient accent at top */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-8 text-center">
          {/* Social proof pill */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/15 shadow-lg">
              <div className="flex -space-x-2">
                {avatarInitials.map((init, i) => (
                  <div
                    key={init}
                    className="w-7 h-7 rounded-full ring-2 ring-white/20 flex items-center justify-center text-[8px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarColors[i] }}
                  >
                    {init}
                  </div>
                ))}
              </div>
              <span className="text-white/90 text-sm font-medium">
                1,200+ traders joined. <span className="text-white font-semibold">Join us!</span>
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp} initial="hidden" animate="visible" custom={0.1}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.05] tracking-tight text-white mb-6 drop-shadow-[0_4px_24px_rgba(0,0,0,0.3)]"
          >
            Know Your{" "}
            <span
              className="text-[hsl(var(--tb-accent))] italic drop-shadow-[0_0_30px_hsl(var(--tb-accent)/0.4)]"
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
            className="text-lg lg:text-xl text-white/75 max-w-xl mx-auto mb-10 leading-relaxed"
          >
            The trading journal built for Indian markets — NSE, BSE, MCX.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp} initial="hidden" animate="visible" custom={0.3}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="h-14 px-10 text-base gap-2.5 bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full shadow-[0_8px_32px_hsl(var(--tb-accent)/0.4)] font-semibold shimmer-cta"
                onClick={() => navigate("/login?mode=signup")}
              >
                Start Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>

            <motion.button
              onClick={() => setVideoOpen(true)}
              className="inline-flex items-center gap-2.5 text-sm text-white/70 hover:text-white transition-colors group"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </span>
              <span className="font-medium">Watch Demo</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Stats bar at bottom — glassmorphic */}
        <motion.div
          variants={fadeUp} initial="hidden" animate="visible" custom={0.5}
          className="relative z-10 mx-4 sm:mx-8 lg:mx-auto lg:max-w-4xl mb-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 sm:px-8 py-5 text-center">
                <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[11px] sm:text-xs text-white/60 uppercase tracking-[0.12em] mt-1 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Dashboard Preview — below hero, on normal background */}
      <div className="bg-background">
        <div className="pt-16 sm:pt-24">
          <DashboardPreview />
        </div>
      </div>

      <VideoModal open={videoOpen} onOpenChange={setVideoOpen} />
    </>
  );
}
