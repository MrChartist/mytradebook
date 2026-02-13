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
      {/* Decorative icon container with dot pattern */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl inner-panel flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern opacity-30" />
          <Icon className="w-8 h-8 text-primary/50 relative z-10" />
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">{description}</p>
      <div className="flex items-center gap-3">
        {onCreate && createLabel && (
          <Button onClick={onCreate} className="rounded-xl px-5">
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
