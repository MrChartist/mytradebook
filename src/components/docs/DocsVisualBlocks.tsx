import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { Eye, ArrowRight, Hash, Info, Lightbulb, AlertTriangle, CheckCircle2, Zap, Target, Clock, ArrowUpRight } from "lucide-react";

/* ──────────────────────────────────────────────
   AnnotatedMockup — Mockup with side/bottom caption explaining what to look at
   ────────────────────────────────────────────── */
interface AnnotatedMockupProps {
  children: ReactNode;
  label?: string;
  caption: string;
  highlights?: string[];
  layout?: "bottom" | "side";
  className?: string;
}

export function AnnotatedMockup({ children, label, caption, highlights, layout = "bottom", className }: AnnotatedMockupProps) {
  return (
    <div className={cn("my-7 rounded-xl overflow-hidden", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle))', background: 'hsl(var(--docs-surface))' }}>
      {/* macOS chrome bar */}
      {label && (
        <div className="flex items-center gap-2 px-5 py-2.5" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle) / 0.5)', background: 'hsl(var(--docs-elevated) / 0.3)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
          </div>
          <span className="docs-caption ml-1 tracking-wide uppercase">{label}</span>
        </div>
      )}

      <div className={cn(layout === "side" ? "lg:flex" : "")}>
        {/* Mockup area */}
        <div className={cn("p-5 md:p-6", layout === "side" && "lg:flex-1 lg:min-w-0")}>
          {children}
        </div>

        {/* Caption / explanation panel */}
        <div
          className={cn(
            "px-5 py-4 md:px-6",
            layout === "side" ? "lg:w-[280px] lg:shrink-0 lg:border-l" : "border-t"
          )}
          style={{
            borderColor: 'hsl(var(--docs-border-subtle) / 0.5)',
            background: 'hsl(var(--docs-elevated) / 0.2)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'hsl(var(--docs-accent))' }} />
            <div className="min-w-0">
              <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{caption}</p>
              {highlights && highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      style={{
                        background: 'hsl(var(--docs-accent) / 0.08)',
                        color: 'hsl(var(--docs-accent))',
                        border: '1px solid hsl(var(--docs-accent) / 0.12)',
                      }}
                    >
                      <Hash className="w-2.5 h-2.5" />
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   MockupCaption — Standalone caption block below any visual
   ────────────────────────────────────────────── */
export function MockupCaption({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 px-1 mt-3 mb-6", className)}>
      <Info className="w-3 h-3 shrink-0 mt-[3px]" style={{ color: 'hsl(var(--docs-text-muted))' }} />
      <p className="text-[12px] leading-relaxed italic" style={{ color: 'hsl(var(--docs-text-muted))' }}>{children}</p>
    </div>
  );
}

/* ──────────────────────────────────────────────
   FeatureZoneGrid — Grid of feature highlights with numbered zones
   ────────────────────────────────────────────── */
interface FeatureZone {
  zone: string;
  title: string;
  description: string;
}

export function FeatureZoneGrid({ zones, className }: { zones: FeatureZone[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3 my-6", className)}>
      {zones.map((z, i) => (
        <div
          key={i}
          className="flex items-start gap-3 p-4 rounded-lg"
          style={{
            background: 'hsl(var(--docs-elevated) / 0.5)',
            border: '1px solid hsl(var(--docs-border-subtle) / 0.6)',
          }}
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold shrink-0 font-mono"
            style={{
              background: 'hsl(var(--docs-accent) / 0.1)',
              color: 'hsl(var(--docs-accent))',
              border: '1px solid hsl(var(--docs-accent) / 0.15)',
            }}
          >
            {z.zone}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-snug" style={{ color: 'hsl(var(--docs-text-strong))' }}>{z.title}</p>
            <p className="text-[12px] mt-1 leading-relaxed" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{z.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   VisualWalkthrough — Step-by-step with mockup + numbered annotations
   ────────────────────────────────────────────── */
interface WalkthroughStep {
  marker: string;
  label: string;
  detail: string;
}

export function VisualWalkthrough({ children, steps, title, className }: {
  children: ReactNode;
  steps: WalkthroughStep[];
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("my-7 rounded-xl overflow-hidden", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle))', background: 'hsl(var(--docs-surface))' }}>
      {title && (
        <div className="flex items-center gap-2 px-5 py-2.5" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle) / 0.5)', background: 'hsl(var(--docs-elevated) / 0.3)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
            <div className="w-[7px] h-[7px] rounded-full" style={{ background: 'hsl(var(--docs-text-muted) / 0.2)' }} />
          </div>
          <span className="docs-caption ml-1 tracking-wide uppercase">{title}</span>
        </div>
      )}

      {/* Mockup */}
      <div className="p-5 md:p-6">{children}</div>

      {/* Annotation steps */}
      <div className="px-5 pb-5 md:px-6 md:pb-6" style={{ borderTop: '1px solid hsl(var(--docs-border-subtle) / 0.4)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 font-mono"
                style={{
                  background: 'hsl(var(--docs-accent) / 0.12)',
                  color: 'hsl(var(--docs-accent))',
                }}
              >
                {step.marker}
              </span>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold leading-snug" style={{ color: 'hsl(var(--docs-text-strong))' }}>{step.label}</p>
                <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'hsl(var(--docs-text-muted))' }}>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   VisualSummaryRow — Mockup + text side by side
   ────────────────────────────────────────────── */
export function VisualSummaryRow({ children, title, description, flip = false, className }: {
  children: ReactNode;
  title: string;
  description: string;
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(
      "my-7 rounded-xl overflow-hidden lg:flex",
      flip && "lg:flex-row-reverse",
      className
    )} style={{ border: '1px solid hsl(var(--docs-border-subtle))', background: 'hsl(var(--docs-surface))' }}>
      {/* Mockup */}
      <div className="lg:flex-1 lg:min-w-0 p-5 md:p-6">{children}</div>
      {/* Text */}
      <div
        className={cn(
          "lg:w-[280px] lg:shrink-0 p-5 md:p-6 flex flex-col justify-center",
          flip ? "lg:border-r border-t lg:border-t-0" : "lg:border-l border-t lg:border-t-0"
        )}
        style={{
          borderColor: 'hsl(var(--docs-border-subtle) / 0.5)',
          background: 'hsl(var(--docs-elevated) / 0.15)',
        }}
      >
        <p className="text-[15px] font-semibold leading-snug" style={{ color: 'hsl(var(--docs-text-strong))' }}>{title}</p>
        <p className="text-[13px] mt-2 leading-relaxed" style={{ color: 'hsl(var(--docs-text-secondary))' }}>{description}</p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   WhatThisDoes — Quick "what / why / when" visual block
   ────────────────────────────────────────────── */
interface WhatWhyWhen {
  what: string;
  why: string;
  when: string;
}

export function WhatWhyWhenBlock({ data, className }: { data: WhatWhyWhen; className?: string }) {
  const items = [
    { icon: Lightbulb, label: "What it does", text: data.what, color: 'hsl(var(--docs-accent))' },
    { icon: Target, label: "Why it matters", text: data.why, color: 'hsl(152 62% 42%)' },
    { icon: Clock, label: "When to use", text: data.when, color: 'hsl(217 91% 60%)' },
  ];
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-3 my-7", className)}>
      {items.map((item, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl p-4 pb-5"
          style={{
            background: 'hsl(var(--docs-surface))',
            border: '1px solid hsl(var(--docs-border-subtle))',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: item.color }} />
          <div className="flex items-center gap-2 mb-2.5 mt-1">
            <item.icon className="w-3.5 h-3.5 shrink-0" style={{ color: item.color }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: item.color }}>{item.label}</span>
          </div>
          <p className="text-[12.5px] leading-relaxed" style={{ color: 'hsl(var(--docs-text-primary))' }}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   UseCaseCards — Compact use-case examples
   ────────────────────────────────────────────── */
interface UseCase {
  emoji: string;
  title: string;
  description: string;
}

export function UseCaseCards({ cases, title, className }: { cases: UseCase[]; title?: string; className?: string }) {
  return (
    <div className={cn("my-7", className)}>
      {title && <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--docs-text-muted) / 0.6)' }}>{title}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {cases.map((c, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3.5 rounded-lg"
            style={{
              background: 'hsl(var(--docs-elevated) / 0.4)',
              border: '1px solid hsl(var(--docs-border-subtle) / 0.5)',
            }}
          >
            <span className="text-base shrink-0 mt-0.5">{c.emoji}</span>
            <div className="min-w-0">
              <p className="text-[12px] font-semibold leading-snug" style={{ color: 'hsl(var(--docs-text-strong))' }}>{c.title}</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'hsl(var(--docs-text-muted))' }}>{c.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   CommonMistakesPanel — Visual mistake/fix pairs
   ────────────────────────────────────────────── */
interface MistakeFix {
  mistake: string;
  fix: string;
}

export function CommonMistakesPanel({ items, title, className }: { items: MistakeFix[]; title?: string; className?: string }) {
  return (
    <div className={cn("my-7 rounded-xl overflow-hidden", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle))', background: 'hsl(var(--docs-surface))' }}>
      {title && (
        <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle) / 0.5)', background: 'hsl(0 72% 52% / 0.04)' }}>
          <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'hsl(38 92% 50%)' }} />
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'hsl(38 92% 50%)' }}>{title || "Common Mistakes"}</span>
        </div>
      )}
      <div className="divide-y" style={{ borderColor: 'hsl(var(--docs-border-subtle) / 0.4)' }}>
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-0">
            <div className="px-5 py-3.5 flex items-start gap-2.5" style={{ background: 'hsl(0 72% 52% / 0.02)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: 'hsl(0 72% 52% / 0.08)', color: 'hsl(0 72% 52%)' }}>✗</span>
              <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--docs-text-primary))' }}>{item.mistake}</p>
            </div>
            <div className="px-5 py-3.5 flex items-start gap-2.5" style={{ background: 'hsl(152 62% 42% / 0.02)', borderLeft: '1px solid hsl(var(--docs-border-subtle) / 0.4)' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 mt-0.5" style={{ background: 'hsl(152 62% 42% / 0.08)', color: 'hsl(152 62% 42%)' }}>✓</span>
              <p className="text-[12px] leading-relaxed" style={{ color: 'hsl(var(--docs-text-primary))' }}>{item.fix}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   NextStepBlock — Visual call-to-action for related sections
   ────────────────────────────────────────────── */
interface NextStep {
  label: string;
  description: string;
  targetId: string;
}

export function NextStepBlock({ steps, className }: { steps: NextStep[]; className?: string }) {
  return (
    <div className={cn("my-7 rounded-xl overflow-hidden", className)} style={{ border: '1px solid hsl(var(--docs-border-subtle))', background: 'hsl(var(--docs-surface))' }}>
      <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid hsl(var(--docs-border-subtle) / 0.5)', background: 'hsl(var(--docs-elevated) / 0.3)' }}>
        <ArrowUpRight className="w-3.5 h-3.5" style={{ color: 'hsl(var(--docs-accent))' }} />
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--docs-accent))' }}>Next Steps</span>
      </div>
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {steps.map((step, i) => (
          <button
            key={i}
            onClick={() => document.getElementById(step.targetId)?.scrollIntoView({ behavior: "smooth" })}
            className="text-left p-3 rounded-lg transition-colors duration-150 group"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--docs-elevated) / 0.5)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <p className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: 'hsl(var(--docs-text-strong))' }}>
              {step.label}
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" style={{ color: 'hsl(var(--docs-accent))' }} />
            </p>
            <p className="text-[11px] mt-1 leading-relaxed" style={{ color: 'hsl(var(--docs-text-muted))' }}>{step.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   QuickOverviewStrip — Horizontal stat strip for section intros
   ────────────────────────────────────────────── */
interface OverviewStat {
  label: string;
  value: string;
}

export function QuickOverviewStrip({ stats, className }: { stats: OverviewStat[]; className?: string }) {
  return (
    <div
      className={cn("my-6 flex flex-wrap gap-4 px-5 py-4 rounded-xl", className)}
      style={{
        background: 'hsl(var(--docs-elevated) / 0.4)',
        border: '1px solid hsl(var(--docs-border-subtle) / 0.6)',
      }}
    >
      {stats.map((s, i) => (
        <div key={i} className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold font-mono" style={{ color: 'hsl(var(--docs-text-strong))' }}>{s.value}</span>
          <span className="text-[11px]" style={{ color: 'hsl(var(--docs-text-muted))' }}>{s.label}</span>
          {i < stats.length - 1 && <span className="ml-2 w-px h-4 self-center" style={{ background: 'hsl(var(--docs-border-subtle))' }} />}
        </div>
      ))}
    </div>
  );
}
