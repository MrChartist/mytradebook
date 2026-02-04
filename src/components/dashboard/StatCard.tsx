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
      <div ref={ref} className="glass-card-hover p-5 group">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm font-semibold flex items-center gap-1",
                  changeType === "profit" && "text-profit",
                  changeType === "loss" && "text-loss",
                  changeType === "neutral" && "text-muted-foreground"
                )}
              >
                {change}
              </p>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              changeType === "profit" && "bg-profit/10 group-hover:bg-profit/20",
              changeType === "loss" && "bg-loss/10 group-hover:bg-loss/20",
              changeType === "neutral" && "bg-primary/10 group-hover:bg-primary/20"
            )}
          >
            <Icon
              className={cn(
                "w-6 h-6",
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
