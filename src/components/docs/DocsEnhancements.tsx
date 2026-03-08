import { cn } from "@/lib/utils";
import { ReactNode, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb, ChevronDown, ChevronRight, Check, X, Crown,
  Zap, Star, ArrowRight, Lock, Unlock, Info, AlertTriangle,
  Sparkles, Target, Shield, BookOpen, Eye, Copy, CheckCircle2,
  Terminal, FileCode, ArrowDownRight
} from "lucide-react";

/* ──────────────────────────────────────────────
   Shared constants for visual unity
   ────────────────────────────────────────────── */
const CARD_BORDER = "border-border/30";
const CARD_RADIUS = "rounded-xl";
const CARD_SPACING = "my-6";
const BODY_TEXT = "text-[15px] text-muted-foreground/80 leading-[1.75]";

/* ──────────────────────────────────────────────
   ProTip — Callout box with trading advice
   ────────────────────────────────────────────── */
export function ProTip({ children, variant = "tip" }: { children: ReactNode; variant?: "tip" | "warning" | "info" | "best-practice" }) {
  const styles = {
    tip: {
      border: "border-primary/20",
      bg: "bg-primary/[0.04]",
      accent: "bg-primary",
      iconColor: "text-primary",
      icon: Lightbulb,
      label: "Pro Tip",
    },
    warning: {
      border: "border-[hsl(var(--warning))]/20",
      bg: "bg-[hsl(var(--warning))]/[0.04]",
      accent: "bg-[hsl(var(--warning))]",
      iconColor: "text-[hsl(var(--warning))]",
      icon: AlertTriangle,
      label: "Watch Out",
    },
    info: {
      border: "border-[hsl(var(--tb-accent))]/20",
      bg: "bg-[hsl(var(--tb-accent))]/[0.04]",
      accent: "bg-[hsl(var(--tb-accent))]",
      iconColor: "text-[hsl(var(--tb-accent))]",
      icon: Info,
      label: "Note",
    },
    "best-practice": {
      border: "border-profit/20",
      bg: "bg-profit/[0.04]",
      accent: "bg-profit",
      iconColor: "text-profit",
      icon: Star,
      label: "Best Practice",
    },
  };
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div className={cn(CARD_RADIUS, "border relative overflow-hidden", CARD_SPACING, s.border, s.bg)}>
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", s.accent)} />
      <div className="flex items-start gap-3 px-5 py-4 pl-6">
        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", s.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-1.5", s.iconColor)}>{s.label}</p>
          <div className={cn(BODY_TEXT, "[&>p]:mb-0")}>{children}</div>
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
    <div className={CARD_SPACING}>
      {title && <p className="text-[15px] font-semibold text-foreground mb-4">{title}</p>}
      <div className="relative pl-1">
        <div className="absolute left-[13px] top-5 bottom-5 w-px bg-border/30" />
        <div className="space-y-5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <div className="w-[26px] h-[26px] rounded-full bg-card border border-border/40 flex items-center justify-center shrink-0 z-10 relative shadow-sm">
                <span className="text-[11px] font-bold text-muted-foreground/70">{i + 1}</span>
              </div>
              <div className="flex-1 pt-0.5 min-w-0">
                <p className="text-[15px] font-medium text-foreground leading-snug">{step.title}</p>
                <p className="text-[14px] text-muted-foreground/75 mt-1.5 leading-relaxed">{step.description}</p>
                {step.detail && (
                  <p className="text-[13px] text-muted-foreground/55 mt-1.5 leading-relaxed italic">{step.detail}</p>
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
    <div className={cn(CARD_RADIUS, "border", CARD_BORDER, CARD_SPACING, "overflow-hidden")}>
      {title && (
        <div className="px-5 py-3 bg-muted/20 border-b border-border/20">
          <p className="text-[14px] font-semibold text-foreground flex items-center gap-2">
            <Crown className="w-3.5 h-3.5 text-primary" />
            {title}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-border/20">
              <th className="text-left px-5 py-3 font-medium text-muted-foreground/70 w-[55%]">Feature</th>
              <th className="text-center px-3 py-3 font-medium text-muted-foreground/70 w-[22.5%]">
                <span className="flex items-center justify-center gap-1"><Unlock className="w-3 h-3" /> Free</span>
              </th>
              <th className="text-center px-3 py-3 font-medium w-[22.5%]">
                <span className="flex items-center justify-center gap-1 text-primary"><Crown className="w-3 h-3" /> Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border/10 last:border-0">
                <td className="px-5 py-2.5 text-foreground/80">{row.feature}</td>
                <td className="px-3 py-2.5 text-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/25 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground/70">{row.free}</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/25 mx-auto" />
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
    <div className={cn(CARD_RADIUS, "border", CARD_BORDER, "overflow-hidden", CARD_SPACING)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/15 transition-colors duration-150"
      >
        <IconComp className="w-4 h-4 text-muted-foreground/60 shrink-0" />
        <span className="text-[15px] font-medium text-foreground flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-primary/8 text-primary">{badge}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-muted-foreground/35 transition-transform duration-200", open && "rotate-180")} />
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
            <div className="px-5 pb-5 pt-0 border-t border-border/15">
              <div className={cn("pt-4", `[&>p]:${BODY_TEXT.split(' ').join('] [&>p]:')}`)}>
                <div className="[&>p]:text-[15px] [&>p]:text-muted-foreground/80 [&>p]:leading-[1.75]">{children}</div>
              </div>
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
    <div className={cn(CARD_RADIUS, "border", CARD_BORDER, "overflow-hidden", CARD_SPACING, className)}>
      {label && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/15 bg-muted/8">
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/15" />
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/15" />
            <div className="w-[7px] h-[7px] rounded-full bg-muted-foreground/15" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground/45 ml-1 tracking-wide uppercase">{label}</span>
        </div>
      )}
      <div className="p-5 md:p-6">
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
    <div className={cn(CARD_RADIUS, "border", CARD_BORDER, "bg-muted/15 p-4 text-center")}>
      <p className="text-[12px] text-muted-foreground/65 mb-1 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-lg font-bold font-mono text-foreground">{value}</p>
      {sub && <p className="text-[12px] text-muted-foreground/55 mt-1">{sub}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SubTopic — Visual sub-heading within a section
   ────────────────────────────────────────────── */
export function SubTopic({ title, description, id }: { title: string; description?: string; id?: string }) {
  return (
    <div id={id} className={cn("mt-10 mb-5 first:mt-4", id && "scroll-mt-24")}>
      <h3 className="text-[17px] font-semibold tracking-tight text-foreground">{title}</h3>
      {description && (
        <p className="text-[15px] text-muted-foreground/70 leading-relaxed mt-1.5">{description}</p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   CodeBlock — Premium code display with tabs and copy
   ────────────────────────────────────────────── */
interface CodeTab {
  label: string;
  language?: string;
  code: string;
}

export function CodeBlock({ tabs, title, className }: {
  tabs: CodeTab[];
  title?: string;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(tabs[activeTab].code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab, tabs]);

  return (
    <div className={cn(CARD_RADIUS, "border", CARD_BORDER, "overflow-hidden", CARD_SPACING, "docs-code-block", className)}>
      {/* Header bar with tabs and copy */}
      <div className="flex items-center justify-between border-b border-border/15 bg-muted/10 px-1">
        <div className="flex items-center gap-0">
          {title && (
            <span className="text-[11px] font-medium text-muted-foreground/50 px-3 py-2.5 shrink-0">{title}</span>
          )}
          {tabs.length > 1 ? (
            <div className="flex items-center">
              {title && <div className="w-px h-4 bg-border/20 mr-0.5" />}
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "px-3 py-2.5 text-[12px] font-medium transition-colors duration-150 relative",
                    i === activeTab
                      ? "text-foreground"
                      : "text-muted-foreground/45 hover:text-muted-foreground/70"
                  )}
                >
                  {tab.label}
                  {i === activeTab && (
                    <motion.div
                      layoutId="code-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          ) : (
            !title && tabs[0]?.language && (
              <span className="text-[11px] font-medium text-muted-foreground/45 px-3 py-2.5 flex items-center gap-1.5">
                <FileCode className="w-3 h-3" />
                {tabs[0].language}
              </span>
            )
          )}
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors duration-150 mr-1",
            copied ? "text-profit" : "text-muted-foreground/40 hover:text-muted-foreground/70"
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="px-5 py-4 text-[13px] leading-[1.8] font-mono text-foreground/85 whitespace-pre">
          <code>{tabs[activeTab].code}</code>
        </pre>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   OutputBlock — Response / terminal output display
   ────────────────────────────────────────────── */
export function OutputBlock({ children, label = "Response", className }: {
  children: string;
  label?: string;
  className?: string;
}) {
  return (
    <div className={cn(CARD_RADIUS, "border border-border/20 overflow-hidden", CARD_SPACING, "docs-output-block", className)}>
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/10 bg-muted/6">
        <Terminal className="w-3 h-3 text-muted-foreground/40" />
        <span className="text-[11px] font-medium text-muted-foreground/40 tracking-wide uppercase">{label}</span>
      </div>
      <div className="overflow-x-auto">
        <pre className="px-5 py-4 text-[13px] leading-[1.8] font-mono text-muted-foreground/70 whitespace-pre">
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
