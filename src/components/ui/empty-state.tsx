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
      "premium-card p-10 sm:p-12 text-center flex flex-col items-center",
      className
    )}>
      {/* Illustrated icon with decorative rings */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full border border-dashed border-primary/10 animate-[spin_30s_linear_infinite]" />
        <div className="absolute -inset-8 rounded-full border border-dashed border-primary/5 animate-[spin_45s_linear_infinite_reverse]" />
        <div className="w-20 h-20 rounded-2xl inner-panel flex items-center justify-center relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <Icon className="w-8 h-8 text-primary/60 relative z-10" />
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>

      {/* Optional mini-guide steps */}
      {steps && steps.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-6 text-xs text-muted-foreground">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{step}</span>
              {i < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        {onCreate && createLabel && (
          <Button onClick={onCreate} className="rounded-xl px-5 shimmer-cta">
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        )}
        {children}
      </div>

      {hint && (
        <p className="text-[11px] text-muted-foreground/60 mt-4">{hint}</p>
      )}
    </div>
  );
}
