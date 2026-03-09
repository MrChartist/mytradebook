import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* ─── Animated counter ──────────────────────────────────── */
export function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = React.useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
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
  }, [end, duration]);
  return { count, ref };
}

/* ─── Motion Variants ───────────────────────────────────── */
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export const blurIn = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export const slideFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export const slideFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export const popIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay: number = 0) => ({
    opacity: 1, scale: 1,
    transition: { duration: 0.5, delay, type: "spring" as const, stiffness: 260, damping: 20 },
  }),
};

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export function MotionSection({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section Label Badge — animated glow dot ──── */
export function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-border/25 bg-card/40 dark:bg-card/15 backdrop-blur-sm text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60 mb-6 relative overflow-hidden">
      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
      {children}
      {/* Subtle animated border shimmer */}
      <span className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500" 
        style={{ 
          background: "conic-gradient(from 0deg, transparent 60%, hsl(var(--tb-accent) / 0.15) 80%, transparent 100%)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }} 
      />
    </div>
  );
}

/* ─── Gradient Divider ──────────────────────────────────── */
export const GradientDivider = React.forwardRef<HTMLDivElement>((_, ref) => {
  return <div ref={ref} className="h-px bg-gradient-to-r from-transparent via-border/25 to-transparent max-w-4xl mx-auto my-2" />;
});
GradientDivider.displayName = "GradientDivider";
