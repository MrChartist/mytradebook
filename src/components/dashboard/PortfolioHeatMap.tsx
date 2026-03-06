import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { BarChart3 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function pnlColor(pnlPct: number): string {
  if (pnlPct >= 5) return "hsl(142 71% 35%)";
  if (pnlPct >= 2) return "hsl(142 60% 40%)";
  if (pnlPct >= 0.5) return "hsl(142 45% 48%)";
  if (pnlPct >= 0) return "hsl(142 30% 55%)";
  if (pnlPct >= -0.5) return "hsl(0 30% 55%)";
  if (pnlPct >= -2) return "hsl(0 50% 48%)";
  if (pnlPct >= -5) return "hsl(0 65% 42%)";
  return "hsl(0 75% 35%)";
}

export function PortfolioHeatMap() {
  const { openTrades, prices } = useDashboard();

  const tiles = useMemo(() => {
    if (!openTrades?.length) return [];
    return openTrades.map((t) => {
      const ltp = prices?.[t.symbol]?.ltp ?? t.current_price ?? t.entry_price ?? 0;
      const entryPrice = t.entry_price ?? 0;
      const qty = t.quantity ?? 1;
      const positionValue = Math.abs(qty * ltp);
      const pnl = t.trade_type === "BUY"
        ? (ltp - entryPrice) * qty
        : (entryPrice - ltp) * qty;
      const pnlPct = entryPrice > 0
        ? (t.trade_type === "BUY" ? ((ltp - entryPrice) / entryPrice) * 100 : ((entryPrice - ltp) / entryPrice) * 100)
        : 0;
      return { symbol: t.symbol, segment: t.segment, positionValue, pnl, pnlPct, ltp, qty, entryPrice };
    }).sort((a, b) => b.positionValue - a.positionValue);
  }, [openTrades, prices]);

  const totalValue = useMemo(() => tiles.reduce((s, t) => s + t.positionValue, 0), [tiles]);

  if (!tiles.length) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Portfolio Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
            No open positions to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" /> Portfolio Heat Map
          <span className="ml-auto text-xs font-normal text-muted-foreground">{tiles.length} positions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="flex flex-wrap gap-1.5">
            {tiles.map((tile) => {
              const weight = totalValue > 0 ? Math.max(tile.positionValue / totalValue, 0.08) : 1 / tiles.length;
              const minW = tiles.length <= 4 ? 120 : 80;
              return (
                <Tooltip key={tile.symbol}>
                  <TooltipTrigger asChild>
                    <div
                      className="rounded-lg p-2.5 flex flex-col justify-between cursor-default transition-transform hover:scale-[1.03] min-h-[70px]"
                      style={{
                        backgroundColor: pnlColor(tile.pnlPct),
                        flexGrow: weight * 100,
                        flexBasis: `${minW}px`,
                      }}
                    >
                      <span className="text-xs font-bold text-white truncate">{tile.symbol}</span>
                      <div className="flex items-end justify-between gap-1">
                        <span className="text-[10px] text-white/80 font-medium">
                          {tile.pnlPct >= 0 ? "+" : ""}{tile.pnlPct.toFixed(1)}%
                        </span>
                        <span className="text-[9px] text-white/60 font-mono">
                          ₹{tile.ltp.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs space-y-0.5">
                    <p className="font-semibold">{tile.symbol}</p>
                    <p>Qty: {tile.qty} · Entry: ₹{tile.entryPrice.toLocaleString("en-IN")}</p>
                    <p>LTP: ₹{tile.ltp.toLocaleString("en-IN")} · Value: ₹{tile.positionValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
                    <p className={tile.pnl >= 0 ? "text-profit" : "text-loss"}>
                      P&L: {tile.pnl >= 0 ? "+" : ""}₹{tile.pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({tile.pnlPct >= 0 ? "+" : ""}{tile.pnlPct.toFixed(2)}%)
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
