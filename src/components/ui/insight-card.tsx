import { ReactNode } from "react";
import {
  ArrowUpRight, ArrowDownRight, Eye, Bell, TrendingUp, Plus,
  MoreHorizontal, Share2, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/sparkline";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ViewMode } from "@/components/ui/view-toggle";

export interface InsightCardLevel {
  label: string;
  value: number | string;
  color?: string;
}

export interface InsightCardAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export interface InsightCardProps {
  // Identity
  symbol: string;
  direction?: "BUY" | "SELL";
  ltp?: number;
  dayChangePercent?: number;

  // Type chip
  typeLabel: string;
  typeColor?: string;

  // Status
  status: string;
  statusColor?: string;

  // Levels
  levels?: InsightCardLevel[];

  // Metrics
  potentialPercent?: number;
  riskReward?: string;
  pnl?: number;
  pnlPercent?: number;

  // Sparkline
  sparklineData?: number[];
  sparklineMarkers?: { value: number; color: string; label?: string }[];

  // Metadata
  subtitle?: string;
  timestamp?: string;
  tags?: string[];
  notes?: string;

  // Actions
  onView?: () => void;
  onCreateAlert?: () => void;
  onCreateTrade?: () => void;
  menuActions?: InsightCardAction[];

  // Layout
  viewMode?: ViewMode;
  className?: string;
  children?: ReactNode;
}

export function InsightCard({
  symbol,
  direction,
  ltp,
  dayChangePercent,
  typeLabel,
  typeColor = "bg-muted text-muted-foreground",
  status,
  statusColor = "bg-muted text-muted-foreground",
  levels = [],
  potentialPercent,
  riskReward,
  pnl,
  pnlPercent,
  sparklineData,
  sparklineMarkers,
  subtitle,
  timestamp,
  tags,
  notes,
  onView,
  onCreateAlert,
  onCreateTrade,
  menuActions = [],
  viewMode = "grid",
  className,
  children,
}: InsightCardProps) {
  const isGrid = viewMode === "grid";

  return (
    <div
      className={cn(
        "surface-card group transition-all duration-200 hover:shadow-md hover:border-primary/15 cursor-pointer",
        isGrid ? "p-4" : "p-3 flex items-center gap-4",
        className
      )}
      onClick={onView}
    >
      {isGrid ? (
        /* ── Grid Layout ──────────────────────────── */
        <div className="space-y-3">
          {/* Top Row: Direction + Symbol + LTP | Type + Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {direction && (
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  direction === "BUY" ? "bg-profit/10" : "bg-loss/10"
                )}>
                  {direction === "BUY" ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-profit" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-loss" />
                  )}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm truncate">{symbol}</span>
                  {ltp != null && (
                    <span className="text-xs font-mono text-muted-foreground">
                      ₹{ltp.toLocaleString()}
                    </span>
                  )}
                  {dayChangePercent != null && (
                    <span className={cn(
                      "text-[10px] font-medium",
                      dayChangePercent >= 0 ? "text-profit" : "text-loss"
                    )}>
                      {dayChangePercent >= 0 ? "+" : ""}{dayChangePercent.toFixed(1)}%
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", typeColor)}>
                {typeLabel}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5", statusColor)}>
                {status}
              </Badge>
            </div>
          </div>

          {/* Middle Row: Sparkline + Levels */}
          <div className="flex items-center gap-3">
            {sparklineData && sparklineData.length >= 2 && (
              <Sparkline
                data={sparklineData}
                markers={sparklineMarkers}
                width={100}
                height={40}
                fill
              />
            )}
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {levels.slice(0, 3).map((level, i) => (
                <div key={i} className="text-center">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{level.label}</p>
                  <p className={cn("text-xs font-mono font-medium", level.color)}>
                    {typeof level.value === "number" ? `₹${level.value.toLocaleString()}` : level.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics row */}
          {(potentialPercent != null || riskReward || pnl != null) && (
            <div className="flex items-center gap-3 text-xs">
              {potentialPercent != null && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded font-medium",
                  potentialPercent >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                )}>
                  {potentialPercent >= 0 ? "+" : ""}{potentialPercent.toFixed(1)}%
                </span>
              )}
              {riskReward && (
                <span className="text-muted-foreground">
                  R:R {riskReward}
                </span>
              )}
              {pnl != null && (
                <span className={cn(
                  "font-semibold",
                  pnl >= 0 ? "text-profit" : "text-loss"
                )}>
                  {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString()}
                </span>
              )}
              {pnlPercent != null && (
                <span className={cn(
                  "text-[10px]",
                  pnlPercent >= 0 ? "text-profit" : "text-loss"
                )}>
                  ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[9px] text-muted-foreground">+{tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Notes preview */}
          {notes && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">
              {notes}
            </p>
          )}

          {/* Timestamp */}
          {timestamp && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {timestamp}
            </div>
          )}

          {/* Bottom Row: Actions */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={(e) => { e.stopPropagation(); onView?.(); }}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onCreateAlert && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onCreateAlert(); }}>
                  <Bell className="w-3.5 h-3.5" />
                </Button>
              )}
              {onCreateTrade && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onCreateTrade(); }}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              {menuActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {menuActions.map((action, i) => (
                      <DropdownMenuItem
                        key={i}
                        onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                        className={action.variant === "destructive" ? "text-destructive" : undefined}
                      >
                        {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                        {action.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {children}
        </div>
      ) : (
        /* ── List Layout ──────────────────────────── */
        <>
          {/* Direction icon */}
          {direction && (
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              direction === "BUY" ? "bg-profit/10" : "bg-loss/10"
            )}>
              {direction === "BUY" ? (
                <ArrowUpRight className="w-4 h-4 text-profit" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-loss" />
              )}
            </div>
          )}

          {/* Symbol + subtitle */}
          <div className="min-w-0 w-[140px] shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm">{symbol}</span>
              {ltp != null && (
                <span className="text-[10px] font-mono text-muted-foreground">₹{ltp.toLocaleString()}</span>
              )}
            </div>
            {subtitle && <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>}
          </div>

          {/* Sparkline */}
          {sparklineData && sparklineData.length >= 2 && (
            <Sparkline
              data={sparklineData}
              markers={sparklineMarkers}
              width={80}
              height={28}
              fill
              className="hidden sm:block"
            />
          )}

          {/* Levels */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            {levels.slice(0, 3).map((level, i) => (
              <div key={i}>
                <p className="text-[9px] uppercase text-muted-foreground">{level.label}</p>
                <p className={cn("text-xs font-mono font-medium", level.color)}>
                  {typeof level.value === "number" ? `₹${level.value.toLocaleString()}` : level.value}
                </p>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            {pnl != null && (
              <span className={cn("text-sm font-semibold", pnl >= 0 ? "text-profit" : "text-loss")}>
                {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString()}
              </span>
            )}
            {potentialPercent != null && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                potentialPercent >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
              )}>
                {potentialPercent >= 0 ? "+" : ""}{potentialPercent.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Type + Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={cn("text-[10px] h-5", typeColor)}>{typeLabel}</Badge>
            <Badge variant="outline" className={cn("text-[10px] h-5", statusColor)}>{status}</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); onView?.(); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            {menuActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuActions.map((action, i) => (
                    <DropdownMenuItem
                      key={i}
                      onClick={(e) => { e.stopPropagation(); action.onClick(); }}
                      className={action.variant === "destructive" ? "text-destructive" : undefined}
                    >
                      {action.icon && <action.icon className="w-4 h-4 mr-2" />}
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </>
      )}
    </div>
  );
}
