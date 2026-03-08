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
      border: "border-primary/15",
      bg: "bg-primary/[0.03]",
      iconColor: "text-primary",
      icon: Lightbulb,
      label: "Pro Tip",
    },
    warning: {
      border: "border-[hsl(var(--warning))]/15",
      bg: "bg-[hsl(var(--warning))]/[0.03]",
      iconColor: "text-[hsl(var(--warning))]",
      icon: AlertTriangle,
      label: "Watch Out",
    },
    info: {
      border: "border-[hsl(var(--tb-accent))]/15",
      bg: "bg-[hsl(var(--tb-accent))]/[0.03]",
      iconColor: "text-[hsl(var(--tb-accent))]",
      icon: Info,
      label: "Note",
    },
    "best-practice": {
      border: "border-profit/15",
      bg: "bg-profit/[0.03]",
      iconColor: "text-profit",
      icon: Star,
      label: "Best Practice",
    },
  };
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div className={cn("rounded-xl border p-4 my-6", s.border, s.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", s.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-[11px] font-semibold uppercase tracking-wider mb-1", s.iconColor)}>{s.label}</p>
          <div className="text-[15px] text-muted-foreground/80 leading-[1.75] [&>p]:mb-0">{children}</div>
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
    <div className="my-6">
      {title && <p className="text-[15px] font-semibold text-foreground mb-4">{title}</p>}
      <div className="relative">
        <div className="absolute left-[13px] top-4 bottom-4 w-px bg-border/40" />
        <div className="space-y-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3.5 relative">
              <div className="w-[26px] h-[26px] rounded-full bg-muted border border-border/50 flex items-center justify-center shrink-0 z-10 relative">
                <span className="text-[12px] font-semibold text-muted-foreground">{i + 1}</span>
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[15px] font-medium text-foreground leading-tight">{step.title}</p>
                <p className="text-[14px] text-muted-foreground/75 mt-1 leading-relaxed">{step.description}</p>
                {step.detail && (
                  <p className="text-[13px] text-muted-foreground/60 mt-1.5 leading-relaxed">{step.detail}</p>
                )}
              </div>
            </div>
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
    <div className="my-6 rounded-xl border border-border/40 overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border/30">
          <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-primary" />
            {title}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-[55%]">Feature</th>
              <th className="text-center px-3 py-2.5 font-medium text-muted-foreground w-[22.5%]">
                <span className="flex items-center justify-center gap-1"><Unlock className="w-3 h-3" /> Free</span>
              </th>
              <th className="text-center px-3 py-2.5 font-medium w-[22.5%]">
                <span className="flex items-center justify-center gap-1 text-primary"><Crown className="w-3 h-3" /> Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/15 last:border-0">
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
    <div className="rounded-xl border border-border/40 overflow-hidden my-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
      >
        <IconComp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-[15px] font-medium text-foreground flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/8 text-primary">{badge}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground/40 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-border/20">
              <div className="pt-3 [&>p]:text-[15px] [&>p]:text-muted-foreground/80 [&>p]:leading-[1.75]">{children}</div>
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
  return (
    <div className={cn("rounded-xl border border-border/30 overflow-hidden my-6", className)}>
      {label && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/20 bg-muted/10">
          <div className="flex items-center gap-1">
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/12" />
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/12" />
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/12" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground/45 ml-1.5 tracking-wide uppercase">{label}</span>
        </div>
      )}
      <div className="p-5 md:p-6 bg-muted/[0.03]">
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   PhaseHeader — Section phase number badge
   ────────────────────────────────────────────── */
export function PhaseHeader({ phase, total = 21 }: { phase: number; total?: number }) {
  return null;
}

/* ──────────────────────────────────────────────
   QuickNav — Jump links within a section
   ────────────────────────────────────────────── */
export function QuickNav({ items }: { items: { label: string; id: string }[] }) {
  return null;
}

/* ──────────────────────────────────────────────
   KeyMetric — Highlighted stat box
   ────────────────────────────────────────────── */
export function KeyMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-center">
      <p className="text-[12px] text-muted-foreground/60 mb-0.5">{label}</p>
      <p className="text-lg font-bold font-mono text-foreground">{value}</p>
      {sub && <p className="text-[12px] text-muted-foreground/50 mt-0.5">{sub}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SubTopic — Visual sub-heading within a section
   ────────────────────────────────────────────── */
export function SubTopic({ title, description, id }: { title: string; description?: string; id?: string }) {
  return (
    <div id={id} className={cn("mt-8 mb-4 first:mt-4", id && "scroll-mt-24")}>
      <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="text-[15px] text-muted-foreground/70 leading-relaxed mt-1">{description}</p>
      )}
    </div>
  );
}
