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
const CARD_BORDER = "border-[hsl(var(--docs-border-subtle,215_25%_18%))]";
const CARD_RADIUS = "rounded-xl";
const CARD_SPACING = "my-7";
const BODY_TEXT = "docs-body";

/* ──────────────────────────────────────────────
   ProTip — Callout box with trading advice
   ────────────────────────────────────────────── */
export function ProTip({ children, variant = "tip" }: { children: ReactNode; variant?: "tip" | "warning" | "info" | "best-practice" }) {
  const styles = {
    tip: {
      border: "border-[hsl(24_88%_58%/0.2)]",
      bg: "bg-[hsl(24_88%_58%/0.05)]",
      accent: "bg-[hsl(24_88%_58%)]",
      iconColor: "text-[hsl(24_88%_58%)]",
      icon: Lightbulb,
      label: "Pro Tip",
    },
    warning: {
      border: "border-[hsl(38_92%_50%/0.2)]",
      bg: "bg-[hsl(38_92%_50%/0.04)]",
      accent: "bg-[hsl(38_92%_50%)]",
      iconColor: "text-[hsl(38_92%_50%)]",
      icon: AlertTriangle,
      label: "Watch Out",
    },
    info: {
      border: "border-[hsl(217_91%_68%/0.2)]",
      bg: "bg-[hsl(217_91%_68%/0.04)]",
      accent: "bg-[hsl(217_91%_68%)]",
      iconColor: "text-[hsl(217_91%_68%)]",
      icon: Info,
      label: "Note",
    },
    "best-practice": {
      border: "border-[hsl(142_71%_45%/0.2)]",
      bg: "bg-[hsl(142_71%_45%/0.04)]",
      accent: "bg-[hsl(142_71%_45%)]",
      iconColor: "text-[hsl(142_71%_45%)]",
      icon: Star,
      label: "Best Practice",
    },
  };
  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div className={cn(CARD_RADIUS, "border relative overflow-hidden", CARD_SPACING, s.border, s.bg, "docs-callout")}>
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-[3px]", s.accent)} />
      <div className="flex items-start gap-3.5 px-6 py-5 pl-7">
        <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", s.iconColor)} />
        <div className="flex-1 min-w-0">
          <p className={cn("text-[11px] font-bold uppercase tracking-wider mb-2", s.iconColor)}>{s.label}</p>
          <div className="docs-note [&>p]:mb-0">{children}</div>
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
      {title && <p className="docs-subtopic-heading mb-5" style={{ fontSize: '1rem', fontWeight: 600 }}>{title}</p>}
      <div className="relative pl-1">
        <div className="absolute left-[14px] top-6 bottom-6 w-px" style={{ background: 'hsl(var(--docs-border-subtle))' }} />
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 relative" style={{ background: 'hsl(var(--docs-surface))', border: '1px solid hsl(var(--docs-border-subtle))' }}>
                <span className="text-[11px] font-bold" style={{ color: 'hsl(var(--docs-text-muted))' }}>{i + 1}</span>
              </div>
              <div className="flex-1 pt-0.5 min-w-0">
                <p className="docs-card-title leading-snug" style={{ fontSize: '1rem' }}>{step.title}</p>
                <p className="docs-body mt-2" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{step.description}</p>
                {step.detail && (
                  <p className="docs-helper mt-2 italic">{step.detail}</p>
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
    <div className={cn(CARD_RADIUS, CARD_SPACING, "overflow-hidden")} style={{ border: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%))' }}>
      {title && (
        <div className="px-6 py-3.5" style={{ background: 'hsl(var(--docs-elevated, 222 40% 10%) / 0.5)', borderBottom: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)' }}>
          <p className="docs-card-title flex items-center gap-2" style={{ fontSize: '0.9375rem' }}>
            <Crown className="w-3.5 h-3.5" style={{ color: 'hsl(var(--docs-accent, 24 88% 58%))' }} />
            {title}
          </p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full docs-body" style={{ fontSize: '0.9375rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)' }}>
              <th className="text-left px-6 py-3 font-medium w-[55%]" style={{ color: 'hsl(var(--docs-text-muted, 217 12% 44%))' }}>Feature</th>
              <th className="text-center px-3 py-3 font-medium w-[22.5%]" style={{ color: 'hsl(var(--docs-text-muted, 217 12% 44%))' }}>
                <span className="flex items-center justify-center gap-1"><Unlock className="w-3 h-3" /> Free</span>
              </th>
              <th className="text-center px-3 py-3 font-medium w-[22.5%]">
                <span className="flex items-center justify-center gap-1" style={{ color: 'hsl(var(--docs-accent, 24 88% 58%))' }}><Crown className="w-3 h-3" /> Pro</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.3)' : 'none' }}>
                <td className="px-6 py-3" style={{ color: 'hsl(var(--docs-text-primary, 213 20% 78%))' }}>{row.feature}</td>
                <td className="px-3 py-3 text-center">
                  {typeof row.free === "boolean" ? (
                    row.free ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 mx-auto" style={{ color: 'hsl(var(--docs-text-muted, 217 12% 44%) / 0.3)' }} />
                  ) : (
                    <span style={{ color: 'hsl(var(--docs-text-secondary, 215 16% 62%))' }}>{row.free}</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {typeof row.pro === "boolean" ? (
                    row.pro ? <Check className="w-4 h-4 text-profit mx-auto" /> : <X className="w-4 h-4 mx-auto" style={{ color: 'hsl(var(--docs-text-muted, 217 12% 44%) / 0.3)' }} />
                  ) : (
                    <span className="font-semibold" style={{ color: 'hsl(var(--docs-accent, 24 88% 58%))' }}>{row.pro}</span>
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
    <div className={cn(CARD_RADIUS, "border overflow-hidden", CARD_SPACING)} style={{ borderColor: 'hsl(var(--docs-border-subtle))' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-6 py-4 text-left transition-colors duration-150"
        style={{ color: 'hsl(var(--docs-text-secondary))' }}
      >
        <IconComp className="w-4 h-4 shrink-0" style={{ color: 'hsl(var(--docs-text-muted))' }} />
        <span className="docs-card-title flex-1" style={{ fontSize: '1rem' }}>{title}</span>
        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-md" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)', color: 'hsl(var(--docs-accent))' }}>{badge}</span>
        )}
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", open && "rotate-180")} style={{ color: 'hsl(var(--docs-text-muted))' }} />
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
            <div className="px-6 pb-6 pt-0" style={{ borderTop: '1px solid hsl(var(--docs-border-subtle) / 0.5)' }}>
              <div className="pt-5 docs-body">{children}</div>
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
    <div className={cn(CARD_RADIUS, "overflow-hidden", CARD_SPACING, className)} style={{ border: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%))', background: 'hsl(var(--docs-surface, 222 44% 6%))' }}>
      {label && (
        <div className="flex items-center gap-2 px-5 py-2.5" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)', background: 'hsl(var(--docs-elevated, 222 40% 10%) / 0.3)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted, 217 12% 44%) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted, 217 12% 44%) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted, 217 12% 44%) / 0.2)' }} />
          </div>
          <span className="docs-caption ml-1 tracking-wide uppercase">{label}</span>
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
export function PhaseHeader({ phase, total = 26 }: { phase: number; total?: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-bold ring-1 ring-[hsl(var(--docs-accent-soft)/0.2)]" style={{ background: 'hsl(var(--docs-accent-soft) / 0.1)', color: 'hsl(var(--docs-accent))' }}>
        {phase}
      </span>
      <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsl(var(--docs-border-subtle)), transparent 60%)' }} />
      <span className="text-[10px] font-mono" style={{ color: 'hsl(var(--docs-text-muted) / 0.5)' }}>{phase}/{total}</span>
    </div>
  );
}

/* ──────────────────────────────────────────────
   QuickNav — Jump links within a section
   ────────────────────────────────────────────── */
export function QuickNav({ items }: { items: { label: string; id: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-8 mt-2">
      <span className="text-[10px] font-semibold uppercase tracking-wider mr-1" style={{ color: 'hsl(var(--docs-text-muted) / 0.6)' }}>Jump to</span>
      {items.map((item, i) => (
        <button
          key={item.id}
          onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150"
          style={{
            background: 'hsl(var(--docs-elevated))',
            border: '1px solid hsl(var(--docs-border-subtle))',
            color: 'hsl(var(--docs-text-secondary))',
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   KeyMetric — Highlighted stat box
   ────────────────────────────────────────────── */
export function KeyMetric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={cn(CARD_RADIUS, "p-5 text-center")} style={{ border: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%))', background: 'hsl(var(--docs-surface, 222 44% 6%))' }}>
      <p className="docs-caption mb-1.5 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-bold font-mono" style={{ color: 'hsl(var(--docs-text-strong, 210 40% 97%))' }}>{value}</p>
      {sub && <p className="docs-helper mt-1.5">{sub}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────
   SubTopic — Visual sub-heading within a section
   ────────────────────────────────────────────── */
export function SubTopic({ title, description, id }: { title: string; description?: string; id?: string }) {
  return (
    <div id={id} className={cn("mt-12 mb-6 first:mt-4", id && "scroll-mt-28")}>
      <h3 className="docs-subtopic-heading">{title}</h3>
      {description && (
        <p className="docs-body mt-2" style={{ color: 'hsl(var(--docs-text-secondary, 215 16% 62%))' }}>{description}</p>
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
    <div className={cn(CARD_RADIUS, "overflow-hidden", CARD_SPACING, "docs-code-block", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%))' }}>
      {/* Header bar with tabs and copy */}
      <div className="flex items-center justify-between px-1" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)', background: 'hsl(var(--docs-elevated, 222 40% 10%) / 0.3)' }}>
        <div className="flex items-center gap-0">
          {title && (
            <span className="docs-caption px-3 py-2.5 shrink-0">{title}</span>
          )}
          {tabs.length > 1 ? (
            <div className="flex items-center">
              {title && <div className="w-px h-4 mr-0.5" style={{ background: 'hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)' }} />}
              {tabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveTab(i)}
                  className={cn(
                    "px-3 py-2.5 text-[12px] font-medium transition-colors duration-150 relative"
                  )}
                  style={{ color: i === activeTab ? 'hsl(var(--docs-text-strong, 210 40% 97%))' : 'hsl(var(--docs-text-muted, 217 12% 44%))' }}
                >
                  {tab.label}
                  {i === activeTab && (
                    <motion.div
                      layoutId="code-tab-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{ background: 'hsl(var(--docs-accent, 24 88% 58%))' }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          ) : (
            !title && tabs[0]?.language && (
              <span className="docs-caption px-3 py-2.5 flex items-center gap-1.5">
                <FileCode className="w-3 h-3" />
                {tabs[0].language}
              </span>
            )
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium transition-colors duration-150 mr-1"
          style={{ color: copied ? 'hsl(142 71% 45%)' : 'hsl(var(--docs-text-muted, 217 12% 44%))' }}
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
        <pre className="px-5 py-4 docs-code font-mono whitespace-pre" style={{ color: 'hsl(var(--docs-text-primary, 213 20% 78%) / 0.9)' }}>
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
    <div className={cn(CARD_RADIUS, "overflow-hidden", CARD_SPACING, "docs-output-block", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.5)' }}>
      <div className="flex items-center gap-1.5 px-5 py-2.5" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle, 215 25% 18%) / 0.3)', background: 'hsl(var(--docs-elevated, 222 40% 10%) / 0.2)' }}>
        <Terminal className="w-3 h-3" style={{ color: 'hsl(var(--docs-text-muted, 217 12% 44%))' }} />
        <span className="docs-caption tracking-wide uppercase">{label}</span>
      </div>
      <div className="overflow-x-auto">
        <pre className="px-5 py-4 docs-code font-mono whitespace-pre" style={{ color: 'hsl(var(--docs-text-secondary, 215 16% 62%))' }}>
          <code>{children}</code>
        </pre>
      </div>
    </div>
  );
}
