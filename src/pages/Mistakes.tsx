import { useMemo } from "react";
import { Lightbulb, TrendingDown, Repeat, ArrowDown, BookOpen, Eye, ShieldCheck } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, subMonths, startOfMonth } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { useNavigate } from "react-router-dom";

interface MistakeTag {
  id: string;
  name: string;
  severity: string | null;
}

export default function Mistakes() {
  const { trades } = useTrades();
  const { user } = useAuth();
  const navigate = useNavigate();

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

  // P&L-based severity columns
  const lowSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -500 && (t.pnl || 0) < 0);
  const medSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -2000 && (t.pnl || 0) < -500);
  const highSeverity = closedTrades.filter((t) => (t.pnl || 0) < -2000);

  const columns = [
    { label: "Minor (< ₹500)", trades: lowSeverity, color: "text-warning", emptyHint: "No minor losses — great discipline!" },
    { label: "Moderate (₹500–₹2K)", trades: medSeverity, color: "text-loss", emptyHint: "No moderate losses this period." },
    { label: "Significant (> ₹2K)", trades: highSeverity, color: "text-loss", emptyHint: "No significant losses — well managed!" },
  ];

  // Improvement signal
  const trendImproving = analysis && analysis.monthlyTrend.length >= 2 &&
    analysis.monthlyTrend[analysis.monthlyTrend.length - 1].count < analysis.monthlyTrend[analysis.monthlyTrend.length - 2].count;

  // Show empty state when no closed trades at all
  if (closedTrades.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in">
        <PageHeader title="Learning Review" subtitle="Track behavioral patterns and build better trading habits." />
        <EmptyState
          icon={BookOpen}
          title="No trades to review yet"
          description="Once you close trades, behavioral patterns will appear here. Tag trades with labels to unlock deeper analysis."
          createLabel="Go to Trades"
          onCreate={() => navigate("/trades")}
          steps={["Close some trades", "Tag behavioral patterns", "Review & improve"]}
          hint="Set up tags in Settings → Tags for pattern tracking"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Learning Review" subtitle="Track behavioral patterns and build better trading habits.">
        <Button variant="outline" size="sm" className="border-border" onClick={() => navigate("/settings?tab=tags")}>
          Manage Tags
        </Button>
      </PageHeader>

      {/* Behavioral Pattern Analysis */}
      {analysis && analysis.topMistakes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" />
            Recurring Patterns
          </h2>

          {/* Top patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {analysis.topMistakes.slice(0, 6).map((item) => (
              <div key={item.tag.id} className="premium-card-hover !p-4 space-y-2.5">
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
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/50"
                    style={{
                      width: `${Math.min(100, (item.count / (analysis.topMistakes[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
                {/* Coaching hint */}
                <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                  {item.count >= 5
                    ? "Frequent pattern — consider adding a pre-trade checklist rule for this."
                    : item.count >= 3
                    ? "Developing pattern — stay aware of this tendency."
                    : "Occasional — monitor if this increases over time."}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly trend */}
          <div className="premium-card-hover !p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-muted-foreground/50" />
                Pattern Frequency (6 months)
              </h3>
              {trendImproving && (
                <span className="text-[10px] text-profit font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Improving
                </span>
              )}
            </div>
            <div className="flex items-end gap-2 h-24">
              {analysis.monthlyTrend.map((m, i) => {
                const max = Math.max(...analysis.monthlyTrend.map((x) => x.count), 1);
                const heightPct = (m.count / max) * 100;
                const isCurrent = i === analysis.monthlyTrend.length - 1;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{m.count}</span>
                    <div className="w-full rounded-t bg-muted relative" style={{ height: "100%" }}>
                      <div
                        className={cn(
                          "w-full rounded-t transition-all absolute bottom-0",
                          isCurrent ? "bg-primary" : "bg-muted-foreground/20"
                        )}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className={cn("text-[10px]", isCurrent ? "text-foreground font-medium" : "text-muted-foreground")}>{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* No mistake tags at all — show hint */}
      {analysis && analysis.topMistakes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-primary/20 bg-primary/[0.02]">
          <Lightbulb className="w-8 h-8 mx-auto text-primary/60 mb-3" />
          <h3 className="font-semibold text-sm mb-1">No Patterns Tagged Yet</h3>
          <p className="text-muted-foreground text-xs text-center max-w-sm leading-relaxed">
            Tag your trades with behavioral labels (like "Entered too early" or "Ignored stop-loss") to unlock pattern tracking and actionable insights.
          </p>
          <Button variant="outline" size="sm" className="mt-3 border-border" onClick={() => navigate("/settings?tab=tags")}>
            Set Up Tags
          </Button>
        </div>
      )}

      {/* Loss Impact Review */}
      {(lowSeverity.length > 0 || medSeverity.length > 0 || highSeverity.length > 0) && (
        <div>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-muted-foreground" />
            Loss Impact Review
          </h2>
          <p className="text-[12px] text-muted-foreground/60 mb-3 -mt-1">
            Understanding loss distribution helps refine risk management.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {columns.map((col) => (
              <div key={col.label} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={cn("font-semibold text-sm", col.color)}>{col.label}</h3>
                  <span className="text-xs text-muted-foreground">{col.trades.length} trades</span>
                </div>
                <div className="space-y-2">
                  {col.trades.length === 0 ? (
                    <div className="surface-card p-4 text-center">
                      <ShieldCheck className="w-5 h-5 text-profit/40 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground/60">{col.emptyHint}</p>
                    </div>
                  ) : (
                    col.trades.slice(0, 8).map((t) => (
                      <button
                        key={t.id}
                        className="surface-card p-3 space-y-1 w-full text-left hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/trades`)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{t.symbol}</span>
                          <span className="text-loss text-sm font-mono">
                            ₹{(t.pnl || 0).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-muted-foreground">{t.segment.replace("_", " ")}</p>
                          {t.closed_at && (
                            <p className="text-[10px] text-muted-foreground/50">{format(new Date(t.closed_at), "dd MMM")}</p>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                  {col.trades.length > 8 && (
                    <p className="text-[10px] text-muted-foreground/50 text-center">+{col.trades.length - 8} more</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
