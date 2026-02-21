import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  createLabel?: string;
  onCreate?: () => void;
  className?: string;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  createLabel,
  onCreate,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn(
      "premium-card p-12 text-center flex flex-col items-center",
      className
    )}>
      {/* Decorative icon container with gradient bg */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-3xl bg-gradient-primary opacity-[0.06] blur-2xl scale-150" />
        <div className="w-24 h-24 rounded-2xl inner-panel flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          {/* Decorative chart lines */}
          <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 96 96" fill="none">
            <polyline points="10,70 25,50 40,60 55,30 70,45 85,20" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="10,75 30,65 50,72 70,55 85,40" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
          </svg>
          <Icon className="w-10 h-10 text-primary/50 relative z-10" />
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">{description}</p>
      <div className="flex items-center gap-3">
        {onCreate && createLabel && (
          <Button onClick={onCreate} variant="glow" className="rounded-xl px-5">
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
