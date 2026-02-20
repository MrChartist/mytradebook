import { useMemo } from "react";
import { Shield, AlertTriangle, TrendingUp, PieChart } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";

export function RiskDashboardWidget() {
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const startingCapital = (settings as any)?.starting_capital ?? 500000;

  const openTrades = useMemo(() => trades.filter((t) => t.status === "OPEN"), [trades]);
  const closedTrades = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);

  // Total exposure
  const totalExposure = useMemo(
    () => openTrades.reduce((sum, t) => sum + (t.entry_price || 0) * t.quantity, 0),
    [openTrades]
  );

  // Total risk (SL-based)
  const totalRisk = useMemo(
    () => openTrades.reduce((sum, t) => {
      if (!t.entry_price || !t.stop_loss) return sum;
      return sum + Math.abs(t.entry_price - t.stop_loss) * t.quantity;
    }, 0),
    [openTrades]
  );

  // Segment concentration
  const segmentExposure = useMemo(() => {
    const map: Record<string, number> = {};
    openTrades.forEach((t) => {
      const seg = t.segment.replace("_", " ");
      map[seg] = (map[seg] || 0) + (t.entry_price || 0) * t.quantity;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([seg, val]) => ({ segment: seg, exposure: val, pct: totalExposure > 0 ? (val / totalExposure) * 100 : 0 }));
  }, [openTrades, totalExposure]);

  // Max drawdown from equity curve
  const maxDrawdown = useMemo(() => {
    if (closedTrades.length === 0) return 0;
    const sorted = [...closedTrades]
      .filter((t) => t.closed_at)
      .sort((a, b) => new Date(a.closed_at!).getTime() - new Date(b.closed_at!).getTime());

    let cumPnl = 0;
    let peak = 0;
    let maxDD = 0;
    sorted.forEach((t) => {
      cumPnl += t.pnl || 0;
      if (cumPnl > peak) peak = cumPnl;
      const dd = peak - cumPnl;
      if (dd > maxDD) maxDD = dd;
    });
    return maxDD;
  }, [closedTrades]);

  // Today's realized P&L
  const todayPnl = useMemo(() => {
    return closedTrades
      .filter((t) => t.closed_at && new Date(t.closed_at).toDateString() === new Date().toDateString())
      .reduce((sum, t) => sum + (t.pnl || 0), 0);
  }, [closedTrades]);

  const riskPct = startingCapital > 0 ? (totalRisk / startingCapital) * 100 : 0;
  const exposurePct = startingCapital > 0 ? (totalExposure / startingCapital) * 100 : 0;
  const ddPct = startingCapital > 0 ? (maxDrawdown / startingCapital) * 100 : 0;

  const riskColor = riskPct > 5 ? "text-loss" : riskPct > 2 ? "text-warning" : "text-profit";
  const ddColor = ddPct > 10 ? "text-loss" : ddPct > 5 ? "text-warning" : "text-profit";

  return (
    <div className="glass-card p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        Risk Overview
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Total Exposure</p>
          <p className="text-lg font-bold font-mono">₹{totalExposure.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          <p className="text-[10px] text-muted-foreground">{exposurePct.toFixed(1)}% of capital</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">₹ At Risk (SL)</p>
          <p className={cn("text-lg font-bold font-mono", riskColor)}>
            ₹{totalRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className={cn("text-[10px]", riskColor)}>{riskPct.toFixed(2)}% of capital</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Max Drawdown</p>
          <p className={cn("text-lg font-bold font-mono", ddColor)}>
            ₹{maxDrawdown.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </p>
          <p className={cn("text-[10px]", ddColor)}>{ddPct.toFixed(2)}% of capital</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Today P&L</p>
          <p className={cn("text-lg font-bold font-mono", todayPnl >= 0 ? "text-profit" : "text-loss")}>
            {todayPnl >= 0 ? "+" : ""}₹{todayPnl.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Segment concentration */}
      {segmentExposure.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <PieChart className="w-3 h-3" /> Segment Concentration
          </h4>
          <div className="space-y-2">
            {segmentExposure.map((s) => (
              <div key={s.segment} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{s.segment}</span>
                  <span className="font-mono text-muted-foreground">{s.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", s.pct > 50 ? "bg-warning" : "bg-primary/60")}
                    style={{ width: `${Math.min(100, s.pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk warnings */}
      {(riskPct > 5 || ddPct > 10) && (
        <div className="mt-3 p-2 rounded-lg bg-loss/5 border border-loss/10 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-loss shrink-0 mt-0.5" />
          <div className="text-xs text-loss">
            {riskPct > 5 && <p>⚠️ Risk exceeds 5% of capital. Consider reducing position sizes.</p>}
            {ddPct > 10 && <p>⚠️ Max drawdown exceeds 10%. Review your trading strategy.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
