import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "profit" | "loss" | "neutral";
  icon: LucideIcon;
  subtitle?: string;
  href?: string;
  onClick?: () => void;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, changeType = "neutral", icon: Icon, subtitle, href, onClick }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
      if (onClick) onClick();
      else if (href) navigate(href);
    };

    const isClickable = !!href || !!onClick;

    return (
      <div
        ref={ref}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? `${title}: ${value}` : undefined}
        onClick={isClickable ? handleClick : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } } : undefined}
        className={cn(
          "premium-card-hover p-5 group",
          changeType === "profit" && "card-glow-profit",
          changeType === "loss" && "card-glow-loss",
          changeType === "neutral" && "card-glow-primary",
          isClickable && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] transition-transform duration-150"
        )}
      >
        <div className="flex items-start justify-between relative">
          <div className="space-y-2">
            <p className="kpi-label">{title}</p>
            <p className="kpi-value">{value}</p>
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
              <p className="kpi-sublabel">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              "inner-panel !p-2.5 !rounded-xl",
              changeType === "profit" && "!bg-profit/8 !border-profit/15",
              changeType === "loss" && "!bg-loss/8 !border-loss/15",
              changeType === "neutral" && "!bg-primary/8 !border-primary/15"
            )}
            style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.08)" }}
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
