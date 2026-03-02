import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, LayoutList } from "lucide-react";
import { Link } from "react-router-dom";
import { QuickClosePopover } from "@/components/trade/QuickClosePopover";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import type { Trade } from "@/hooks/useTrades";
import { calculatePnL, calculatePnLPercent } from "@/lib/calculations";
import { formatCurrency } from "@/lib/formatting";

export function DashboardPositionsTable() {
  const { openTrades, prices } = useDashboard();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const positions = useMemo(() => openTrades.map((t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
    const entry = t.entry_price || 0;
    const tradeType = t.trade_type === "BUY" ? "LONG" : "SHORT";
    const pnl = calculatePnL(entry, ltp, t.quantity, tradeType);
    const pnlPct = entry > 0 ? calculatePnLPercent(entry, ltp, tradeType) : 0;
    const slDist = t.stop_loss
      ? t.trade_type === "BUY" ? ((ltp - t.stop_loss) / ltp) * 100 : ((t.stop_loss - ltp) / ltp) * 100
      : null;
    const risk = t.stop_loss && entry
      ? t.trade_type === "BUY" ? (entry - t.stop_loss) * t.quantity : (t.stop_loss - entry) * t.quantity
      : 0;
    return { ...t, ltp, pnl, pnlPct, slDist, risk };
  }), [openTrades, prices]);

  const totalExposure = positions.reduce((a, p) => a + p.ltp * p.quantity, 0);
  const totalRisk = positions.reduce((a, p) => a + Math.max(0, p.risk), 0);
  const totalUnrealized = positions.reduce((a, p) => a + p.pnl, 0);

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-badge-sm bg-primary/10">
            <LayoutList className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Open Positions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{positions.length} positions • Live prices</p>
          </div>
        </div>
        <Link to="/trades?status=OPEN" className="text-xs text-primary hover:underline font-medium">View All →</Link>
      </div>

      {positions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Exposure</p>
            <p className="text-sm font-semibold mt-1">₹{totalExposure.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk (to SL)</p>
            <p className="text-sm font-semibold text-loss mt-1">₹{totalRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Unrealized P&L</p>
            <p className={cn("text-sm font-semibold mt-1", totalUnrealized >= 0 ? "text-profit" : "text-loss")}>{formatCurrency(totalUnrealized)}</p>
          </div>
          <div className="bg-muted/50 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Positions</p>
            <p className="text-sm font-semibold mt-1">{positions.length}</p>
          </div>
        </div>
      )}

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">No open positions</p>
          <Link to="/trades" className="text-xs text-primary hover:underline font-medium">Create a trade →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[11px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left pb-3 font-medium">Symbol</th>
                <th className="text-left pb-3 font-medium hidden md:table-cell">Segment</th>
                <th className="text-center pb-3 font-medium">Side</th>
                <th className="text-right pb-3 font-medium">Qty</th>
                <th className="text-right pb-3 font-medium">Entry</th>
                <th className="text-right pb-3 font-medium">LTP</th>
                <th className="text-right pb-3 font-medium">P&L</th>
                <th className="text-right pb-3 font-medium hidden sm:table-cell">SL</th>
                <th className="text-right pb-3 font-medium hidden sm:table-cell">SL Dist.</th>
                <th className="text-right pb-3 font-medium w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {positions.map((p) => (
                <tr
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${p.symbol} position - click for details`}
                  className="hover:bg-primary/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  onClick={() => setSelectedTrade(p)}
                  onKeyDown={(e) => { if (e.key === "Enter") setSelectedTrade(p); }}
                >
                  <td className="py-2.5 font-medium">{p.symbol}</td>
                  <td className="py-2.5 hidden md:table-cell">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {p.segment.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    {p.trade_type === "BUY" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-profit inline" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-loss inline" />
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono">{p.quantity}</td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground">₹{(p.entry_price || 0).toLocaleString()}</td>
                  <td className="py-2.5 text-right font-mono">₹{p.ltp.toLocaleString()}</td>
                  <td className="py-2.5 text-right">
                    <span className={cn("font-semibold font-mono", p.pnl >= 0 ? "text-profit" : "text-loss")}>
                      {formatCurrency(p.pnl)}
                    </span>
                    <span className={cn("text-[9px] ml-1", p.pnlPct >= 0 ? "text-profit" : "text-loss")}>
                      {p.pnlPct >= 0 ? "+" : ""}{p.pnlPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-muted-foreground hidden sm:table-cell">
                    {p.stop_loss ? `₹${p.stop_loss.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2.5 text-right hidden sm:table-cell">
                    {p.slDist !== null ? (
                      <span className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded-full",
                        p.slDist > 3 ? "bg-profit/10 text-profit" : p.slDist > 1 ? "bg-warning/10 text-warning" : "bg-loss/10 text-loss"
                      )}>
                        {p.slDist.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                  <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <QuickClosePopover
                      tradeId={p.id}
                      symbol={p.symbol}
                      ltp={p.ltp}
                      entryPrice={p.entry_price || 0}
                      tradeType={p.trade_type}
                      quantity={p.quantity}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}
