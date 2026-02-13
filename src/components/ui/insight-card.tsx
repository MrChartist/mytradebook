import { ReactNode } from "react";
import {
  ArrowUpRight, ArrowDownRight, Eye, Bell, Plus,
  MoreHorizontal, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/ui/sparkline";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
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
  symbol: string;
  direction?: "BUY" | "SELL";
  ltp?: number;
  dayChangePercent?: number;
  typeLabel: string;
  typeColor?: string;
  status: string;
  statusColor?: string;
  levels?: InsightCardLevel[];
  potentialPercent?: number;
  riskReward?: string;
  pnl?: number;
  pnlPercent?: number;
  sparklineData?: number[];
  sparklineMarkers?: { value: number; color: string; label?: string }[];
  subtitle?: string;
  timestamp?: string;
  tags?: string[];
  notes?: string;
  onView?: () => void;
  onCreateAlert?: () => void;
  onCreateTrade?: () => void;
  menuActions?: InsightCardAction[];
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
        "group transition-all duration-300 cursor-pointer",
        isGrid
          ? "premium-card-hover !p-5"
          : "premium-card-hover !p-3 !rounded-xl flex items-center gap-4",
        className
      )}
      onClick={onView}
    >
      {isGrid ? (
        /* ── Grid Layout ──────────────────────────── */
        <div className="space-y-3.5 relative">
          {/* Decorative corner dot pattern */}
          <div className="absolute -top-5 -right-5 w-20 h-20 dot-pattern opacity-30 rounded-bl-2xl" />

          {/* Top Row: Direction + Symbol + LTP | Type + Status */}
          <div className="inner-panel !p-3 relative overflow-hidden">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                {direction && (
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    direction === "BUY" ? "bg-profit/12" : "bg-loss/12"
                  )}>
                    {direction === "BUY" ? (
                      <ArrowUpRight className="w-4 h-4 text-profit" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-loss" />
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm truncate">{symbol}</span>
                    {ltp != null && (
                      <span className="text-xs font-mono text-muted-foreground font-medium">
                        ₹{ltp.toLocaleString()}
                      </span>
                    )}
                    {dayChangePercent != null && (
                      <span className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        dayChangePercent >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                      )}>
                        {dayChangePercent >= 0 ? "+" : ""}{dayChangePercent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  {subtitle && (
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className={cn("text-[10px] h-5 px-2 rounded-full border-0 font-medium", typeColor)}>
                  {typeLabel}
                </Badge>
                <Badge variant="outline" className={cn("text-[10px] h-5 px-2 rounded-full border-0 font-medium", statusColor)}>
                  {status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Middle Row: Sparkline + Levels */}
          <div className="flex items-center gap-3">
            {sparklineData && sparklineData.length >= 2 && (
              <div className="inner-panel !p-2 shrink-0">
                <Sparkline
                  data={sparklineData}
                  markers={sparklineMarkers}
                  width={100}
                  height={40}
                  fill
                />
              </div>
            )}
            <div className="flex-1 grid grid-cols-3 gap-2">
              {levels.slice(0, 3).map((level, i) => (
                <div key={i} className="inner-panel !p-2 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{level.label}</p>
                  <p className={cn("text-xs font-mono font-bold mt-0.5", level.color)}>
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
                  "px-2 py-1 rounded-full font-semibold",
                  potentialPercent >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                )}>
                  {potentialPercent >= 0 ? "+" : ""}{potentialPercent.toFixed(1)}%
                </span>
              )}
              {riskReward && (
                <span className="text-muted-foreground font-mono">
                  R:R {riskReward}
                </span>
              )}
              {pnl != null && (
                <span className={cn(
                  "font-bold font-mono",
                  pnl >= 0 ? "text-profit" : "text-loss"
                )}>
                  {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString()}
                </span>
              )}
              {pnlPercent != null && (
                <span className={cn(
                  "text-[10px] font-medium",
                  pnlPercent >= 0 ? "text-profit" : "text-loss"
                )}>
                  ({pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground font-medium">
                  {tag}
                </span>
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground font-medium">+{tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Notes preview */}
          {notes && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 italic">
              {notes}
            </p>
          )}

          {/* Timestamp */}
          {timestamp && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
              <Clock className="w-3 h-3" />
              {timestamp}
            </div>
          )}

          {/* Bottom Row: Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-xs rounded-lg"
              onClick={(e) => { e.stopPropagation(); onView?.(); }}
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              View
            </Button>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {onCreateAlert && (
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); onCreateAlert(); }}>
                  <Bell className="w-3.5 h-3.5" />
                </Button>
              )}
              {onCreateTrade && (
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); onCreateTrade(); }}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              )}
              {menuActions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => e.stopPropagation()}>
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
          {/* Direction accent bar */}
          {direction && (
            <div className={cn(
              "w-1 h-12 rounded-full shrink-0",
              direction === "BUY" ? "bg-profit" : "bg-loss"
            )} />
          )}

          {/* Direction icon */}
          {direction && (
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
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
              <span className="font-bold text-sm">{symbol}</span>
              {ltp != null && (
                <span className="text-[10px] font-mono text-muted-foreground font-medium">₹{ltp.toLocaleString()}</span>
              )}
            </div>
            {subtitle && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{subtitle}</p>}
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
                <p className="text-[9px] uppercase text-muted-foreground font-semibold tracking-wider">{level.label}</p>
                <p className={cn("text-xs font-mono font-bold", level.color)}>
                  {typeof level.value === "number" ? `₹${level.value.toLocaleString()}` : level.value}
                </p>
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-2 shrink-0">
            {pnl != null && (
              <span className={cn("text-sm font-bold font-mono", pnl >= 0 ? "text-profit" : "text-loss")}>
                {pnl >= 0 ? "+" : ""}₹{Math.abs(pnl).toLocaleString()}
              </span>
            )}
            {potentialPercent != null && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-semibold",
                potentialPercent >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
              )}>
                {potentialPercent >= 0 ? "+" : ""}{potentialPercent.toFixed(1)}%
              </span>
            )}
          </div>

          {/* Type + Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant="outline" className={cn("text-[10px] h-5 rounded-full border-0 font-medium", typeColor)}>{typeLabel}</Badge>
            <Badge variant="outline" className={cn("text-[10px] h-5 rounded-full border-0 font-medium", statusColor)}>{status}</Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => { e.stopPropagation(); onView?.(); }}>
              <Eye className="w-3.5 h-3.5" />
            </Button>
            {menuActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={(e) => e.stopPropagation()}>
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
