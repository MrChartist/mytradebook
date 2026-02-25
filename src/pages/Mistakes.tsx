import { useMemo } from "react";
import { AlertTriangle, TrendingDown, Repeat, ArrowDown } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { format, subMonths, startOfMonth } from "date-fns";

interface MistakeTag {
  id: string;
  name: string;
  severity: string | null;
}

export default function Mistakes() {
  const { trades } = useTrades();
  const { user } = useAuth();

  const closedTrades = useMemo(
    () => trades.filter((t) => t.status === "CLOSED"),
    [trades]
  );

  // Fetch trade_mistakes join data
  const { data: tradeMistakes } = useQuery({
    queryKey: ["trade-mistakes-all", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const tradeIds = closedTrades.map((t) => t.id);
      if (tradeIds.length === 0) return [];
      const { data, error } = await supabase
        .from("trade_mistakes")
        .select("trade_id, mistake_id")
        .in("trade_id", tradeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && closedTrades.length > 0,
  });

  // Fetch mistake tags
  const { data: mistakeTags } = useQuery({
    queryKey: ["mistake-tags", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mistake_tags")
        .select("id, name, severity");
      if (error) throw error;
      return data as MistakeTag[];
    },
    enabled: !!user?.id,
  });

  // Analyze mistake patterns
  const analysis = useMemo(() => {
    if (!tradeMistakes || !mistakeTags) return null;

    const tagMap = new Map(mistakeTags.map((t) => [t.id, t]));
    const tagCounts: Record<string, { tag: MistakeTag; count: number; totalLoss: number; tradeIds: string[] }> = {};

    tradeMistakes.forEach((tm) => {
      const tag = tagMap.get(tm.mistake_id);
      if (!tag) return;
      if (!tagCounts[tag.id]) {
        tagCounts[tag.id] = { tag, count: 0, totalLoss: 0, tradeIds: [] };
      }
      tagCounts[tag.id].count += 1;
      tagCounts[tag.id].tradeIds.push(tm.trade_id);
      const trade = closedTrades.find((t) => t.id === tm.trade_id);
      if (trade && (trade.pnl || 0) < 0) {
        tagCounts[tag.id].totalLoss += Math.abs(trade.pnl || 0);
      }
    });

    const sorted = Object.values(tagCounts).sort((a, b) => b.count - a.count);

    // Monthly trend: count mistakes per month for last 6 months
    const now = new Date();
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = i === 0 ? now : startOfMonth(subMonths(now, i - 1));
      const label = format(monthDate, "MMM");

      const tradesInMonth = closedTrades.filter((t) => {
        const d = new Date(t.closed_at || t.entry_time);
        return d >= monthStart && d < monthEnd;
      });
      const tradeIdsInMonth = new Set(tradesInMonth.map((t) => t.id));
      const mistakesInMonth = tradeMistakes.filter((tm) => tradeIdsInMonth.has(tm.trade_id));
      months.push({ label, count: mistakesInMonth.length });
    }

    return { topMistakes: sorted, monthlyTrend: months };
  }, [tradeMistakes, mistakeTags, closedTrades]);

  // Also show P&L-based severity columns as before
  const lowSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -500 && (t.pnl || 0) < 0);
  const medSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -2000 && (t.pnl || 0) < -500);
  const highSeverity = closedTrades.filter((t) => (t.pnl || 0) < -2000);

  const columns = [
    { label: "Low (< ₹500)", trades: lowSeverity, color: "text-warning" },
    { label: "Medium (₹500–₹2K)", trades: medSeverity, color: "text-loss" },
    { label: "High (> ₹2K)", trades: highSeverity, color: "text-loss" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mistakes Review</h1>
        <p className="text-muted-foreground text-sm">
          Identify patterns in your losing trades and track improvement over time.
        </p>
      </div>

      {/* Mistake Tag Analysis */}
      {analysis && analysis.topMistakes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            Repeat Patterns
          </h2>

          {/* Top mistakes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.topMistakes.slice(0, 6).map((item) => (
              <div key={item.tag.id} className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.tag.name}</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      item.tag.severity === "high" && "border-loss/50 text-loss",
                      item.tag.severity === "medium" && "border-warning/50 text-warning",
                      (!item.tag.severity || item.tag.severity === "low") && "border-muted-foreground/50"
                    )}
                  >
                    {item.tag.severity || "low"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{item.count}×</strong> occurrences
                  </span>
                  {item.totalLoss > 0 && (
                    <span className="text-loss flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" />
                      ₹{item.totalLoss.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                {/* Simple bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-loss/60"
                    style={{
                      width: `${Math.min(100, (item.count / (analysis.topMistakes[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              Mistake Trend (6 months)
            </h3>
            <div className="flex items-end gap-2 h-24">
              {analysis.monthlyTrend.map((m, i) => {
                const max = Math.max(...analysis.monthlyTrend.map((x) => x.count), 1);
                const heightPct = (m.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{m.count}</span>
                    <div className="w-full rounded-t bg-muted" style={{ height: "100%" }}>
                      <div
                        className={cn(
                          "w-full rounded-t transition-all",
                          i === analysis.monthlyTrend.length - 1 ? "bg-primary" : "bg-loss/40"
                        )}
                        style={{ height: `${heightPct}%`, marginTop: `${100 - heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No mistake tags at all — show hint */}
      {analysis && analysis.topMistakes.length === 0 && closedTrades.length > 0 && (
        <div className="glass-card p-6 text-center border border-dashed border-warning/30">
          <AlertTriangle className="w-8 h-8 mx-auto text-warning mb-2" />
          <h3 className="font-semibold text-sm mb-1">No Mistake Tags Found</h3>
          <p className="text-muted-foreground text-xs">
            Tag your trades with mistake labels (Settings → Tags) to unlock pattern analysis here.
          </p>
        </div>
      )}

      {/* P&L Severity Breakdown */}
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-loss" />
          Loss Severity Breakdown
        </h2>

        {closedTrades.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No mistakes to review</h3>
            <p className="text-muted-foreground text-sm">
              Once you close trades with losses, they'll appear here for review.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
                  <span className="text-xs text-muted-foreground">{col.trades.length} trades</span>
                </div>
                <div className="space-y-2">
                  {col.trades.length === 0 ? (
                    <div className="surface-card p-4 text-center text-sm text-muted-foreground">None</div>
                  ) : (
                    col.trades.slice(0, 10).map((t) => (
                      <div key={t.id} className="surface-card p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{t.symbol}</span>
                          <span className="text-loss text-sm font-mono">
                            ₹{(t.pnl || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.segment.replace("_", " ")}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
