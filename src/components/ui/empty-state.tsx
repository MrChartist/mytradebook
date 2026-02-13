import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Download, Sparkles } from "lucide-react";
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
      "surface-card p-10 text-center flex flex-col items-center",
      className
    )}>
      <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-primary/50" />
      </div>
      <h3 className="font-semibold text-lg mb-1.5">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      <div className="flex items-center gap-3">
        {onCreate && createLabel && (
          <Button onClick={onCreate}>
            <Plus className="w-4 h-4 mr-2" />
            {createLabel}
          </Button>
        )}
        {children}
      </div>
    </div>
  );
}
