import { Clock, Calendar, ExternalLink, Star, AlertTriangle, Target, TrendingUp, Edit, Check, X, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { Trade } from "@/hooks/useTrades";

const timeframeLabels: Record<string, string> = {
  "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
  "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
};

interface Props {
  trade: Trade;
  onUpdateSL: (newSL: number) => Promise<void>;
  isUpdating: boolean;
}

export function TradeDetailMetrics({ trade, onUpdateSL, isUpdating }: Props) {
  const [editingSL, setEditingSL] = useState(false);
  const [newSL, setNewSL] = useState("");

  const pnl = trade.pnl || 0;
  const pnlPercent = trade.pnl_percent || 0;
  const targets = (trade.targets as number[]) || [];
  const timeframe = (trade as any).timeframe;
  const holdingPeriod = (trade as any).holding_period;
  const chartLink = (trade as any).chart_link;
  const trailingSlEnabled = (trade as any).trailing_sl_enabled;
  const trailingSlActive = (trade as any).trailing_sl_active;
  const trailingSlCurrent = (trade as any).trailing_sl_current;
  const trailingSlPercent = (trade as any).trailing_sl_percent;
  const trailingSlPoints = (trade as any).trailing_sl_points;
  const trailingSlTriggerPrice = (trade as any).trailing_sl_trigger_price;

  const handleUpdateSL = async () => {
    if (!newSL) return;
    await onUpdateSL(parseFloat(newSL));
    setEditingSL(false);
    setNewSL("");
  };

  return (
    <>
      {/* Trade Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-accent/50">
        <div>
          <p className="text-sm text-muted-foreground">Entry Price</p>
          <p className="text-lg font-semibold font-mono">₹{trade.entry_price?.toLocaleString() ?? "—"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Current Price</p>
          <p className="text-lg font-semibold font-mono">₹{(trade.current_price || trade.entry_price || 0).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">P&L</p>
          <p className={cn("text-lg font-semibold", pnl >= 0 ? "text-profit" : "text-loss")}>
            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">P&L %</p>
          <p className={cn("text-lg font-semibold", pnlPercent >= 0 ? "text-profit" : "text-loss")}>
            {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Timeframe & Holding Period */}
      {(timeframe || holdingPeriod) && (
        <div className="flex items-center gap-4 text-sm">
          {timeframe && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Timeframe: <strong>{timeframeLabels[timeframe] || timeframe}</strong></span>
            </div>
          )}
          {holdingPeriod && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>Hold: <strong>{holdingPeriod}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Chart Link */}
      {chartLink && (
        <a
          href={chartLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary hover:underline p-2 rounded-lg bg-primary/5 border border-primary/20"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="truncate">{chartLink}</span>
        </a>
      )}

      {/* Rating & Confidence */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="text-sm">Rating: <strong>{trade.rating || "N/A"}/10</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Confidence: <strong>{trade.confidence_score || "N/A"}/5</strong></span>
        </div>
      </div>

      {/* Price Levels */}
      <div className="space-y-3">
        <h4 className="font-medium">Price Levels</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Stop Loss */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-loss/5 border border-loss/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-loss" />
              <span className="text-sm font-medium">Stop Loss</span>
            </div>
            {editingSL ? (
              <div className="flex items-center gap-2">
                <Input value={newSL} onChange={(e) => setNewSL(e.target.value)} type="number" step="0.01" className="w-24 h-8 text-right" placeholder={trade.stop_loss?.toString()} />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleUpdateSL} disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 text-profit" />}
                </Button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingSL(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-mono text-loss">₹{trade.stop_loss?.toLocaleString() || "Not set"}</span>
                {trade.status === "OPEN" && (
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditingSL(true); setNewSL(trade.stop_loss?.toString() || ""); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Trailing Stop Loss */}
          {trailingSlEnabled && (
            <div className={cn("flex items-center justify-between p-3 rounded-lg border", trailingSlActive ? "bg-profit/5 border-profit/20" : "bg-warning/5 border-warning/20")}>
              <div className="flex items-center gap-2">
                <TrendingUp className={cn("w-4 h-4", trailingSlActive ? "text-profit" : "text-warning")} />
                <div>
                  <span className="text-sm font-medium">Trailing SL</span>
                  <p className="text-xs text-muted-foreground">
                    {trailingSlActive ? "Active" : `Activates at ₹${trailingSlTriggerPrice?.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {trailingSlCurrent ? (
                  <span className="font-mono text-profit">₹{trailingSlCurrent.toLocaleString()}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {trailingSlPercent ? `${trailingSlPercent}%` : `${trailingSlPoints} pts`}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Targets */}
          {targets.map((target, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-profit/5 border border-profit/20">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-profit" />
                <span className="text-sm font-medium">Target {index + 1}</span>
              </div>
              <span className="font-mono text-profit">₹{target.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
