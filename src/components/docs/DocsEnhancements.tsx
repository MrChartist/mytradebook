import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, ChevronDown, ChevronRight, Check, X, Crown,
  Zap, Star, ArrowRight, Lock, Unlock, Info, AlertTriangle,
  Sparkles, Target, Shield, BookOpen, Eye
} from "lucide-react";

/* ──────────────────────────────────────────────
   ProTip — Callout box with trading advice
   ────────────────────────────────────────────── */
export function ProTip({ children, variant = "tip" }: { children: ReactNode; variant?: "tip" | "warning" | "info" | "best-practice" }) {
  const styles = {
    tip: {
      border: "border-primary/20",
      bg: "bg-primary/[0.04]",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      icon: Lightbulb,
      label: "Pro Tip",
    },
    warning: {
      border: "border-[hsl(var(--warning))]/20",
      bg: "bg-[hsl(var(--warning))]/[0.04]",
      iconBg: "bg-[hsl(var(--warning))]/10",
      iconColor: "text-[hsl(var(--warning))]",
      icon: AlertTriangle,
      label: "Watch Out",
    },
    info: {
      border: "border-[hsl(var(--tb-accent))]/20",
      bg: "bg-[hsl(var(--tb-accent))]/[0.04]",
      iconBg: "bg-[hsl(var(--tb-accent))]/10",
      iconColor: "text-[hsl(var(--tb-accent))]",
      icon: Info,
      label: "Did You Know",
    },
    "best-practice": {
      border: "border-profit/20",
      bg: "bg-profit/[0.04]",
      iconBg: "bg-profit/10",
      iconColor: "text-profit",
      icon: Star,
      label: "Best Practice",
    },
  };
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div className={cn("rounded-xl border p-4.5 my-6 relative overflow-hidden", s.border, s.bg)}>
      <div className="absolute top-0 left-0 w-1 h-full rounded-full" style={{ backgroundColor: variant === "tip" ? "hsl(var(--primary))" : variant === "warning" ? "hsl(var(--warning))" : variant === "info" ? "hsl(var(--tb-accent))" : "hsl(var(--profit))" }} />
      <div className="flex items-start gap-3.5 pl-2.5">
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", s.iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", s.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-1.5", s.iconColor)}>{s.label}</p>
          <div className="text-[13px] text-muted-foreground/80 leading-[1.7] [&>p]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   StepByStep — Numbered workflow guide
   ────────────────────────────────────────────── */
interface Step {
  title: string;
  description: string;
  detail?: string;
}

export function StepByStep({ steps, title }: { steps: Step[]; title?: string }) {
  return (
    <div className="my-7">
      {title && <p className="text-sm font-bold text-foreground mb-5">{title}</p>}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-primary/30 via-primary/15 to-transparent" />
        <div className="space-y-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="flex items-start gap-4 relative"
            >
              <div className="w-[30px] h-[30px] rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 z-10 relative">
                <span className="text-[11px] font-bold text-primary">{i + 1}</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[13px] font-semibold text-foreground leading-tight">{step.title}</p>
                <p className="text-[12.5px] text-muted-foreground/80 mt-1 leading-relaxed">{step.description}</p>
                {step.detail && (
                  <p className="text-[11px] text-muted-foreground/55 mt-1.5 italic leading-relaxed">{step.detail}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ComparisonTable — Free vs Pro feature comparison
   ────────────────────────────────────────────── */
interface ComparisonRow {
  feature: string;
  free: boolean | string;
  pro: boolean | string;
}

export function ComparisonTable({ rows, title }: { rows: ComparisonRow[]; title?: string }) {
  return (
    <div className="my-6 rounded-xl border border-border/20 overflow-hidden bg-card/40">
      {title && (
        <div className="px-4 py-2.5 bg-muted/20 border-b border-border/15">
          <p className="text-[12px] font-bold text-foreground flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-primary" />
            {title}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-border/15">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground/70 w-[55%]">Feature</th>
              <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground/70 w-[22.5%]">
                <span className="flex items-center justify-center gap-1"><Unlock className="w-3 h-3" /> Free</span>
              </th>
              <th className="text-center px-3 py-2.5 font-semibold w-[22.5%]">
                <span className="flex items-center justify-center gap-1 text-primary"><Crown className="w-3 h-3" /> Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={cn("border-b border-border/10 last:border-0", i % 2 === 0 ? "bg-transparent" : "bg-muted/10")}>
                <td className="px-4 py-2 text-foreground/80">{row.feature}</td>
                <td className="px-3 py-2 text-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{row.free}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  ) : (
                    <span className="text-primary font-semibold">{row.pro}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   ExpandableDetail — Collapsible sub-section
   ────────────────────────────────────────────── */
export function ExpandableDetail({ title, icon: Icon, children, defaultOpen = false, badge }: {
  title: string;
  icon?: React.ElementType;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const IconComp = Icon || ChevronRight;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden my-3 transition-all duration-200 hover:border-border/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left group"
      >
        <div className="w-7 h-7 rounded-lg bg-primary/6 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
          <IconComp className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[13px] font-semibold text-foreground flex-1">{title}</span>
        {badge && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/8 text-primary">{badge}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground/50 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border/10">
              <div className="pt-3 [&>p]:text-[13px] [&>p]:text-muted-foreground [&>p]:leading-relaxed">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────
   InteractiveMockup — Wrapper with hover states
   ────────────────────────────────────────────── */
export function InteractiveMockup({ children, label, className }: { children: ReactNode; label?: string; className?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-xl border overflow-hidden transition-all duration-300 my-5 group cursor-default",
        hovered ? "border-primary/30 shadow-[0_0_20px_-8px_hsl(var(--primary)/0.15)]" : "border-border/20",
        className
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Interactive badge */}
      <div className={cn(
        "absolute top-2.5 right-2.5 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold transition-all duration-200",
        hovered ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground/40"
      )}>
        <Eye className="w-2.5 h-2.5" />
        Interactive
      </div>
      {/* Top glow on hover */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-px transition-opacity duration-300",
        "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
        hovered ? "opacity-100" : "opacity-0"
      )} />
      {label && (
        <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-b border-border/15 bg-muted/15">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-loss/40" />
            <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]/40" />
            <div className="w-2 h-2 rounded-full bg-profit/40" />
          </div>
          <span className="text-[8px] font-semibold text-muted-foreground/40 ml-1.5 tracking-wide uppercase">{label}</span>
        </div>
      )}
      <div className="p-4 md:p-6 bg-gradient-to-b from-card/80 to-muted/5">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PhaseHeader — Section phase number badge
   ────────────────────────────────────────────── */
export function PhaseHeader({ phase, total = 21 }: { phase: number; total?: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/6 text-primary text-[10px] font-bold tracking-wider">
        Phase {phase}
        <span className="text-primary/35">/ {total}</span>
      </span>
      <div className="flex-1 h-px bg-gradient-to-r from-primary/12 to-transparent" />
    </div>
  );
}

/* ──────────────────────────────────────────────
   QuickNav — Jump links within a section
   ────────────────────────────────────────────── */
export function QuickNav({ items }: { items: { label: string; id: string }[] }) {
  return (
    <div className="my-4 rounded-xl border border-border/15 bg-card/30 p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 mb-2.5">In this section</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "center" })}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted/30 hover:bg-primary/8 text-[11px] font-medium text-muted-foreground hover:text-primary transition-all duration-200"
          >
            <ChevronRight className="w-3 h-3" />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   KeyMetric — Highlighted stat box
   ────────────────────────────────────────────── */
export function KeyMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/15 bg-card/40 p-3 text-center">
      <p className="text-[10px] text-muted-foreground/60 mb-0.5">{label}</p>
      <p className="text-lg font-bold font-mono text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{sub}</p>}
    </div>
  );
}
