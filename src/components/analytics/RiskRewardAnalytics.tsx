import { useMemo } from "react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
} from "recharts";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Target, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

interface Props {
  trades: Trade[];
}

interface TradeRR {
  symbol: string;
  plannedRR: number;
  actualRR: number | null;
  deviation: number | null;
  pnl: number;
  segment: string;
}

function calcRR(entry: number, sl: number, target: number, tradeType: string): number {
  const isBuy = tradeType === "BUY";
  const risk = isBuy ? entry - sl : sl - entry;
  const reward = isBuy ? target - entry : entry - target;
  return risk > 0 ? reward / risk : 0;
}

export function RiskRewardAnalytics({ trades }: Props) {
  const analysis = useMemo(() => {
    const tradesWithRR: TradeRR[] = [];

    for (const t of trades) {
      if (!t.entry_price || !t.stop_loss) continue;
      const targets = (t.targets as number[]) || [];
      const firstTarget = targets[0];
      if (!firstTarget) continue;

      const planned = calcRR(t.entry_price, t.stop_loss, firstTarget, t.trade_type);
      let actual: number | null = null;

      if (t.status === "CLOSED" && t.current_price) {
        actual = calcRR(t.entry_price, t.stop_loss, t.current_price, t.trade_type);
      }

      tradesWithRR.push({
        symbol: t.symbol,
        plannedRR: planned,
        actualRR: actual,
        deviation: actual != null ? actual - planned : null,
        pnl: t.pnl || 0,
        segment: t.segment,
      });
    }

    // Segment-wise avg R:R
    const segments: Record<string, { planned: number[]; actual: number[] }> = {};
    for (const t of tradesWithRR) {
      if (!segments[t.segment]) segments[t.segment] = { planned: [], actual: [] };
      segments[t.segment].planned.push(t.plannedRR);
      if (t.actualRR != null) segments[t.segment].actual.push(t.actualRR);
    }

    const segmentData = Object.entries(segments).map(([seg, data]) => ({
      segment: seg.replace("_", " "),
      avgPlanned: data.planned.length ? data.planned.reduce((a, b) => a + b, 0) / data.planned.length : 0,
      avgActual: data.actual.length ? data.actual.reduce((a, b) => a + b, 0) / data.actual.length : 0,
      count: data.planned.length,
    }));

    const avgPlanned = tradesWithRR.length
      ? tradesWithRR.reduce((a, t) => a + t.plannedRR, 0) / tradesWithRR.length
      : 0;
    const closedWithActual = tradesWithRR.filter((t) => t.actualRR != null);
    const avgActual = closedWithActual.length
      ? closedWithActual.reduce((a, t) => a + t.actualRR!, 0) / closedWithActual.length
      : 0;

    const deviators = tradesWithRR
      .filter((t) => t.deviation != null && Math.abs(t.deviation) > 0.5)
      .sort((a, b) => Math.abs(b.deviation!) - Math.abs(a.deviation!))
      .slice(0, 5);

    // Distribution buckets
    const buckets = [
      { label: "<1R", min: 0, max: 1, count: 0 },
      { label: "1-2R", min: 1, max: 2, count: 0 },
      { label: "2-3R", min: 2, max: 3, count: 0 },
      { label: "3-5R", min: 3, max: 5, count: 0 },
      { label: "5R+", min: 5, max: 999, count: 0 },
    ];
    for (const t of tradesWithRR) {
      const b = buckets.find((b) => t.plannedRR >= b.min && t.plannedRR < b.max);
      if (b) b.count++;
    }

    return { tradesWithRR, segmentData, avgPlanned, avgActual, deviators, buckets, total: tradesWithRR.length };
  }, [trades]);

  if (analysis.total === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <Target className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No R:R Data</h3>
        <p className="text-sm text-muted-foreground">Add entry, stop-loss, and at least one target to see R:R analytics.</p>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 space-y-5">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Risk-Reward Analytics
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{analysis.total} trades with R:R data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-xs text-muted-foreground">Avg Planned R:R</p>
          <p className="text-xl font-bold text-primary">1:{analysis.avgPlanned.toFixed(1)}</p>
        </div>
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Avg Actual R:R</p>
          <p className={cn("text-xl font-bold", analysis.avgActual >= analysis.avgPlanned ? "text-profit" : "text-loss")}>
            1:{analysis.avgActual.toFixed(1)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Deviation</p>
          <p className={cn("text-xl font-bold",
            analysis.avgActual >= analysis.avgPlanned ? "text-profit" : "text-loss"
          )}>
            {analysis.avgActual >= analysis.avgPlanned ? "+" : ""}{(analysis.avgActual - analysis.avgPlanned).toFixed(2)}R
          </p>
        </div>
      </div>

      {/* R:R Distribution */}
      <div>
        <h4 className="text-sm font-medium mb-2">R:R Distribution</h4>
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.buckets} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {analysis.buckets.map((_, i) => (
                  <Cell key={i} fill={i < 1 ? "hsl(var(--loss))" : i < 2 ? "hsl(var(--warning))" : "hsl(var(--profit))"} opacity={0.7} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Segment Breakdown */}
      {analysis.segmentData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">R:R by Segment</h4>
          <div className="space-y-2">
            {analysis.segmentData.map((seg) => (
              <div key={seg.segment} className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{seg.segment}</span>
                  <span className="text-xs text-muted-foreground">({seg.count})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Planned: <strong className="text-primary">1:{seg.avgPlanned.toFixed(1)}</strong></span>
                  {seg.avgActual > 0 && (
                    <span className="text-xs text-muted-foreground">Actual: <strong className={cn(seg.avgActual >= seg.avgPlanned ? "text-profit" : "text-loss")}>1:{seg.avgActual.toFixed(1)}</strong></span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Deviators */}
      {analysis.deviators.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-warning" />
            Largest R:R Deviations
          </h4>
          <div className="space-y-1.5">
            {analysis.deviators.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/10">
                <span className="text-sm font-medium">{t.symbol}</span>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">Planned: 1:{t.plannedRR.toFixed(1)}</span>
                  <span className={cn(t.deviation! > 0 ? "text-profit" : "text-loss")}>
                    Actual: 1:{t.actualRR?.toFixed(1)}
                  </span>
                  <span className={cn("font-medium", t.deviation! > 0 ? "text-profit" : "text-loss")}>
                    {t.deviation! > 0 ? "+" : ""}{t.deviation!.toFixed(2)}R
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
