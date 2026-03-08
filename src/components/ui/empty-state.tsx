import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  createLabel?: string;
  onCreate?: () => void;
  className?: string;
  children?: ReactNode;
  /** Optional secondary hint shown below the CTA */
  hint?: string;
  /** Optional steps shown as a mini-guide */
  steps?: string[];
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  createLabel,
  onCreate,
  className,
  children,
  hint,
  steps,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "premium-card p-8 sm:p-12 text-center flex flex-col items-center",
      className
    )}>
      {/* Illustrated icon with decorative rings */}
      <div className="relative mb-7">
        <div className="absolute -inset-3 rounded-full border border-dashed border-primary/10 animate-[spin_40s_linear_infinite]" />
        <div className="absolute -inset-6 rounded-full border border-dashed border-primary/5 animate-[spin_60s_linear_infinite_reverse]" />
        <div className="w-14 h-14 rounded-xl bg-muted/40 border border-border/50 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <Icon className="w-6 h-6 text-primary/60 relative z-10" />
        </div>
      </div>

      <h3 className="font-heading font-semibold text-lg mb-1.5 tracking-tight">{title}</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs mb-6 leading-relaxed">{description}</p>

      {/* Optional mini-guide steps */}
      {steps && steps.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 text-[11px] text-muted-foreground">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/8 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
              {i < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/30 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {onCreate && createLabel && (
          <Button onClick={onCreate} className="rounded-xl px-5 h-10 gap-2 font-medium">
            <Plus className="w-4 h-4" />
            {createLabel}
          </Button>
        )}
        {children}
      </div>

      {hint && (
        <p className="text-[10px] text-muted-foreground/50 mt-5">{hint}</p>
      )}
    </div>
  );
}
