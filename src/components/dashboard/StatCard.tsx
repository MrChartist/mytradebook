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
  /** Navigation path when clicked */
  href?: string;
  /** Click handler (alternative to href) */
  onClick?: () => void;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, change, changeType = "neutral", icon: Icon, subtitle, href, onClick }, ref) => {
    const navigate = useNavigate();

    const handleClick = () => {
      if (onClick) {
        onClick();
      } else if (href) {
        navigate(href);
      }
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
          "surface-card-hover p-5 group transition-all duration-200",
          isClickable && "cursor-pointer hover:border-primary/20 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
        )}
      >
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
