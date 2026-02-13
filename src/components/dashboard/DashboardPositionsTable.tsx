import { useDashboard } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fmt = (v: number) =>
  `${v >= 0 ? "+" : ""}₹${Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export function DashboardPositionsTable() {
  const { openTrades, prices } = useDashboard();

  const positions = useMemo(() => openTrades.map((t) => {
    const ltp = prices[t.symbol]?.ltp || t.current_price || t.entry_price || 0;
    const entry = t.entry_price || 0;
    const pnl = t.trade_type === "BUY" ? (ltp - entry) * t.quantity : (entry - ltp) * t.quantity;
    const pnlPct = entry > 0 ? (pnl / (entry * t.quantity)) * 100 : 0;
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
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">Open Positions</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{positions.length} positions • Live prices</p>
        </div>
        <Link to="/trades" className="text-xs text-primary hover:underline font-medium">View All →</Link>
      </div>

      {/* Summary strip */}
      {positions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Exposure</p>
            <p className="text-sm font-semibold">₹{totalExposure.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Risk (to SL)</p>
            <p className="text-sm font-semibold text-loss">₹{totalRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Unrealized P&L</p>
            <p className={cn("text-sm font-semibold", totalUnrealized >= 0 ? "text-profit" : "text-loss")}>{fmt(totalUnrealized)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2.5">
            <p className="text-[10px] text-muted-foreground">Positions</p>
            <p className="text-sm font-semibold">{positions.length}</p>
          </div>
        </div>
      )}

      {positions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-3">No open positions</p>
          <div className="flex gap-2 justify-center">
            <Link to="/trades">
              <Button size="sm" variant="outline" className="text-xs h-8">Create a trade</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="text-left pb-2 font-medium">Symbol</th>
                <th className="text-left pb-2 font-medium hidden md:table-cell">Segment</th>
                <th className="text-center pb-2 font-medium">Side</th>
                <th className="text-right pb-2 font-medium">Qty</th>
                <th className="text-right pb-2 font-medium">Entry</th>
                <th className="text-right pb-2 font-medium">LTP</th>
                <th className="text-right pb-2 font-medium">P&L</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">SL</th>
                <th className="text-right pb-2 font-medium hidden sm:table-cell">SL Dist.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {positions.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2 font-medium">{p.symbol}</td>
                  <td className="py-2 hidden md:table-cell">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {p.segment.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    {p.trade_type === "BUY" ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-profit inline" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5 text-loss inline" />
                    )}
                  </td>
                  <td className="py-2 text-right font-mono">{p.quantity}</td>
                  <td className="py-2 text-right font-mono text-muted-foreground">₹{(p.entry_price || 0).toLocaleString()}</td>
                  <td className="py-2 text-right font-mono">₹{p.ltp.toLocaleString()}</td>
                  <td className="py-2 text-right">
                    <span className={cn("font-semibold font-mono", p.pnl >= 0 ? "text-profit" : "text-loss")}>
                      {fmt(p.pnl)}
                    </span>
                    <span className={cn("text-[9px] ml-1", p.pnlPct >= 0 ? "text-profit" : "text-loss")}>
                      {p.pnlPct >= 0 ? "+" : ""}{p.pnlPct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2 text-right font-mono text-muted-foreground hidden sm:table-cell">
                    {p.stop_loss ? `₹${p.stop_loss.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2 text-right hidden sm:table-cell">
                    {p.slDist !== null ? (
                      <span className={cn(
                        "text-[9px] font-mono px-1.5 py-0.5 rounded",
                        p.slDist > 3 ? "bg-profit/10 text-profit" : p.slDist > 1 ? "bg-warning/10 text-warning" : "bg-loss/10 text-loss"
                      )}>
                        {p.slDist.toFixed(1)}%
                      </span>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
