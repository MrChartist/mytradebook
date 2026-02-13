import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "profit" | "loss" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, changeType = "neutral", icon: Icon, subtitle }, ref) => {
    return (
      <div ref={ref} className="surface-card-hover p-5 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-xs font-medium",
                  changeType === "profit" && "text-profit",
                  changeType === "loss" && "text-loss",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
            {subtitle && (
              <p className="text-[11px] text-muted-foreground/70">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              changeType === "profit" && "bg-profit/8",
              changeType === "loss" && "bg-loss/8",
              changeType === "neutral" && "bg-primary/8"
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5",
                changeType === "profit" && "text-profit",
                changeType === "loss" && "text-loss",
                changeType === "neutral" && "text-primary"
              )}
            />
          </div>
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
