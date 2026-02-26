import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  BarChart3,
  CalendarDays,
  AlertTriangle,
  FileText,
  Download,
  Send,
  Award,
  Loader2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  Repeat,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings } from "@/hooks/useUserSettings";
import { StatCard } from "@/components/dashboard/StatCard";
import { EquityCurveDrawdown } from "@/components/analytics/EquityCurveDrawdown";
import { RiskRewardAnalytics } from "@/components/analytics/RiskRewardAnalytics";
import { SegmentPerformance } from "@/components/analytics/SegmentPerformance";
import { TimeOfDayAnalysis } from "@/components/analytics/TimeOfDayAnalysis";
import { DayOfWeekAnalysis } from "@/components/analytics/DayOfWeekAnalysis";
import { StreakTracker } from "@/components/analytics/StreakTracker";
import { SetupTagPerformance } from "@/components/analytics/SetupTagPerformance";
import { JournalCalendarView } from "@/components/journal/JournalCalendarView";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import { PageHeader } from "@/components/ui/page-header";
import { format, subDays, subMonths, subYears, startOfYear, startOfMonth } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type WeeklyReport = Database["public"]["Tables"]["weekly_reports"]["Row"];
type TabId = "analytics" | "calendar" | "mistakes" | "weekly";
type Period = "1W" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "All";

const tabs: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "mistakes", label: "Mistakes", icon: AlertTriangle },
  { id: "weekly", label: "Weekly Reports", icon: FileText },
];

const periods: { label: string; value: Period }[] = [
  { label: "1W", value: "1W" },
  { label: "1M", value: "1M" },
  { label: "3M", value: "3M" },
  { label: "6M", value: "6M" },
  { label: "YTD", value: "YTD" },
  { label: "1Y", value: "1Y" },
  { label: "All", value: "All" },
];

function getPeriodStartDate(period: Period): Date | null {
  const now = new Date();
  switch (period) {
    case "1W": return subDays(now, 7);
    case "1M": return subMonths(now, 1);
    case "3M": return subMonths(now, 3);
    case "6M": return subMonths(now, 6);
    case "YTD": return startOfYear(now);
    case "1Y": return subYears(now, 1);
    case "All": return null;
  }
}

// ─── Analytics Tab ─────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [period, setPeriod] = useState<Period>("All");
  const { trades } = useTrades();
  const { settings } = useUserSettings();
  const startingCapital = settings?.starting_capital ?? 500000;

  const filteredTrades = useMemo(() => {
    const startDate = getPeriodStartDate(period);
    if (!startDate) return trades;
    return trades.filter((t) => {
      const date = t.closed_at || t.entry_time;
      if (!date) return false;
      return new Date(date) >= startDate;
    });
  }, [trades, period]);

  const closed = useMemo(() => filteredTrades.filter((t) => t.status === "CLOSED"), [filteredTrades]);
  const totalPnl = closed.reduce((a, t) => a + (t.pnl || 0), 0);
  const wins = closed.filter((t) => (t.pnl || 0) > 0);
  const losses = closed.filter((t) => (t.pnl || 0) < 0);
  const winRate = closed.length ? (wins.length / closed.length) * 100 : 0;
  const avgWin = wins.length ? wins.reduce((a, t) => a + (t.pnl || 0), 0) / wins.length : 0;
  const avgLoss = losses.length ? Math.abs(losses.reduce((a, t) => a + (t.pnl || 0), 0) / losses.length) : 0;
  const profitFactor = losses.length === 0 ? Infinity : (avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0);
  const expectancy = closed.length ? totalPnl / closed.length : 0;
  const bestTrade = closed.length ? Math.max(...closed.map((t) => t.pnl || 0)) : 0;
  const worstTrade = closed.length ? Math.min(...closed.map((t) => t.pnl || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Period Filter */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-accent border border-border self-start">
        {periods.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setPeriod(value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150",
              period === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {period !== "All" && (
        <p className="text-xs text-muted-foreground -mt-2">
          Showing <span className="font-medium text-foreground">{closed.length}</span> closed trades in{" "}
          {period === "YTD" ? "year-to-date" : `the last ${period}`}
          {closed.length === 0 && " — no trades in this period"}
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} change={`${closed.length} trades`} changeType={winRate >= 50 ? "profit" : "loss"} icon={Target} subtitle="Closed" />
        <StatCard title="Total P&L" value={`₹${totalPnl.toLocaleString("en-IN")}`} change={`${wins.length}W / ${losses.length}L`} changeType={totalPnl >= 0 ? "profit" : "loss"} icon={BarChart3} subtitle={period === "All" ? "All time" : period} />
        <StatCard title="Avg Win" value={`₹${avgWin.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${wins.length} wins`} changeType="profit" icon={TrendingUp} subtitle="Per trade" />
        <StatCard title="Avg Loss" value={`₹${avgLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change={`${losses.length} losses`} changeType="loss" icon={TrendingDown} subtitle="Per trade" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Expectancy" value={`₹${expectancy.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} change="Per trade" changeType={expectancy >= 0 ? "profit" : "loss"} icon={Activity} subtitle="Expected" />
        <StatCard title="Profit Factor" value={profitFactor === Infinity ? "∞" : profitFactor.toFixed(2)} change={profitFactor === Infinity ? "Perfect" : profitFactor >= 1.5 ? "Strong" : profitFactor >= 1 ? "Positive" : "Weak"} changeType={profitFactor >= 1 ? "profit" : "loss"} icon={BarChart3} subtitle="Ratio" />
        <StatCard title="Best Trade" value={`₹${bestTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="profit" icon={TrendingUp} subtitle="Max profit" />
        <StatCard title="Worst Trade" value={`₹${worstTrade.toLocaleString("en-IN")}`} change="Single trade" changeType="loss" icon={TrendingDown} subtitle="Max loss" />
      </div>

      <EquityCurveDrawdown trades={filteredTrades} startingCapital={startingCapital} />
      <SegmentPerformance trades={filteredTrades} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TimeOfDayAnalysis trades={filteredTrades} />
        <DayOfWeekAnalysis trades={filteredTrades} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakTracker trades={filteredTrades} />
        <SetupTagPerformance trades={filteredTrades} />
      </div>

      <RiskRewardAnalytics trades={filteredTrades} />

      {closed.length === 0 && (
        <div className="surface-card p-12 text-center">
          <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {period === "All" ? "No analytics yet" : "No trades in this period"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {period === "All" ? "Close some trades to see your performance analytics." : 'Try a longer period or select "All".'}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Calendar Tab ───────────────────────────────────────────────────────────
function CalendarTab() {
  const { trades, isLoading } = useTrades();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  const closedTrades = useMemo(() => trades.filter((t) => t.status === "CLOSED" && t.closed_at), [trades]);

  const calendarData = useMemo(() => {
    const map = new Map<string, { date: Date; dateStr: string; trades: any[]; tradeCount: number; pnl: number }>();
    closedTrades.forEach((t) => {
      const d = new Date(t.closed_at!);
      const key = format(d, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, { date: d, dateStr: key, trades: [], tradeCount: 0, pnl: 0 });
      const entry = map.get(key)!;
      entry.trades.push({ id: t.id, symbol: t.symbol, trade_type: t.trade_type, pnl: t.pnl });
      entry.tradeCount += 1;
      entry.pnl += t.pnl || 0;
    });
    return Array.from(map.values());
  }, [closedTrades]);

  const selectedTrade = selectedTradeId ? trades.find((t) => t.id === selectedTradeId) : null;

  return (
    <div className="space-y-6">
      <JournalCalendarView calendarData={calendarData} isLoading={isLoading} onTradeClick={(t) => setSelectedTradeId(t.id)} />
      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          open={!!selectedTradeId}
          onOpenChange={(open) => !open && setSelectedTradeId(null)}
        />
      )}
    </div>
  );
}

// ─── Mistakes Tab ────────────────────────────────────────────────────────────
interface MistakeTagType {
  id: string;
  name: string;
  severity: string | null;
}

function MistakesTab() {
  const { trades } = useTrades();
  const { user } = useAuth();
  const { settings } = useUserSettings();
  const startingCapital = settings?.starting_capital ?? 500000;

  const closedTrades = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);

  const { data: tradeMistakes } = useQuery({
    queryKey: ["trade-mistakes-all", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const tradeIds = closedTrades.map((t) => t.id);
      if (tradeIds.length === 0) return [];
      const { data, error } = await supabase.from("trade_mistakes").select("trade_id, mistake_id").in("trade_id", tradeIds);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && closedTrades.length > 0,
  });

  const { data: mistakeTags } = useQuery({
    queryKey: ["mistake-tags", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("mistake_tags").select("id, name, severity");
      if (error) throw error;
      return data as MistakeTagType[];
    },
    enabled: !!user?.id,
  });

  const analysis = useMemo(() => {
    if (!tradeMistakes || !mistakeTags) return null;
    const tagMap = new Map(mistakeTags.map((t) => [t.id, t]));
    const tagCounts: Record<string, { tag: MistakeTagType; count: number; totalLoss: number; tradeIds: string[] }> = {};

    tradeMistakes.forEach((tm) => {
      const tag = tagMap.get(tm.mistake_id);
      if (!tag) return;
      if (!tagCounts[tag.id]) tagCounts[tag.id] = { tag, count: 0, totalLoss: 0, tradeIds: [] };
      tagCounts[tag.id].count += 1;
      tagCounts[tag.id].tradeIds.push(tm.trade_id);
      const trade = closedTrades.find((t) => t.id === tm.trade_id);
      if (trade && (trade.pnl || 0) < 0) tagCounts[tag.id].totalLoss += Math.abs(trade.pnl || 0);
    });

    const sorted = Object.values(tagCounts).sort((a, b) => b.count - a.count);

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

  const capitalThresholdLow = Math.round(startingCapital * 0.001);   // 0.1% of capital
  const capitalThresholdMed = Math.round(startingCapital * 0.004);   // 0.4% of capital
  const lowSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -capitalThresholdMed && (t.pnl || 0) < 0 && Math.abs(t.pnl || 0) <= capitalThresholdLow);
  const medSeverity = closedTrades.filter((t) => (t.pnl || 0) < 0 && Math.abs(t.pnl || 0) > capitalThresholdLow && Math.abs(t.pnl || 0) <= capitalThresholdMed);
  const highSeverity = closedTrades.filter((t) => (t.pnl || 0) < 0 && Math.abs(t.pnl || 0) > capitalThresholdMed);
  const columns = [
    { label: `Low (< ₹${capitalThresholdLow.toLocaleString("en-IN")})`, trades: lowSeverity, color: "text-warning" },
    { label: `Medium (₹${capitalThresholdLow.toLocaleString("en-IN")}–₹${capitalThresholdMed.toLocaleString("en-IN")})`, trades: medSeverity, color: "text-loss" },
    { label: `High (> ₹${capitalThresholdMed.toLocaleString("en-IN")})`, trades: highSeverity, color: "text-loss" },
  ];

  return (
    <div className="space-y-6">
      {analysis && analysis.topMistakes.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Repeat className="w-4 h-4 text-primary" /> Repeat Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysis.topMistakes.slice(0, 6).map((item) => (
              <div key={item.tag.id} className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.tag.name}</span>
                  <Badge variant="outline" className={cn("text-xs",
                    item.tag.severity === "high" && "border-loss/50 text-loss",
                    item.tag.severity === "medium" && "border-warning/50 text-warning",
                    (!item.tag.severity || item.tag.severity === "low") && "border-muted-foreground/50"
                  )}>
                    {item.tag.severity || "low"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground"><strong className="text-foreground">{item.count}×</strong> occurrences</span>
                  {item.totalLoss > 0 && (
                    <span className="text-loss flex items-center gap-1">
                      <ArrowDown className="w-3 h-3" />₹{item.totalLoss.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-loss/60" style={{ width: `${Math.min(100, (item.count / (analysis.topMistakes[0]?.count || 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" /> Mistake Trend (6 months)
            </h3>
            <div className="flex items-end gap-2 h-24">
              {analysis.monthlyTrend.map((m, i) => {
                const max = Math.max(...analysis.monthlyTrend.map((x) => x.count), 1);
                const heightPct = (m.count / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground font-mono">{m.count}</span>
                    <div className="w-full rounded-t bg-muted" style={{ height: "100%" }}>
                      <div className={cn("w-full rounded-t transition-all", i === analysis.monthlyTrend.length - 1 ? "bg-primary" : "bg-loss/40")}
                        style={{ height: `${heightPct}%`, marginTop: `${100 - heightPct}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {analysis && analysis.topMistakes.length === 0 && closedTrades.length > 0 && (
        <div className="glass-card p-6 text-center border border-dashed border-warning/30">
          <AlertTriangle className="w-8 h-8 mx-auto text-warning mb-2" />
          <h3 className="font-semibold text-sm mb-1">No Mistake Tags Found</h3>
          <p className="text-muted-foreground text-xs">Tag your trades with mistake labels (Settings → Tags) to unlock pattern analysis here.</p>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-loss" /> Loss Severity Breakdown
        </h2>
        {closedTrades.length === 0 ? (
          <div className="surface-card p-12 text-center">
            <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold mb-1">No mistakes to review</h3>
            <p className="text-muted-foreground text-sm">Once you close trades with losses, they'll appear here for review.</p>
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
                          <span className="text-loss text-sm font-mono">₹{(t.pnl || 0).toLocaleString("en-IN")}</span>
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

// ─── Weekly Reports Tab ──────────────────────────────────────────────────────
const segmentDisplayNames: Record<string, string> = {
  Equity_Intraday: "Equity Intraday",
  Equity_Positional: "Equity Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

interface GroupedReport {
  weekStart: string;
  weekEnd: string;
  segments: WeeklyReport[];
  totalPnl: number;
  totalTrades: number;
  overallWinRate: number;
}

function WeeklyReportsTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["weekly-reports", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from("weekly_reports").select("*").eq("user_id", user.id).order("week_start", { ascending: false });
      if (error) throw error;
      return data as WeeklyReport[];
    },
    enabled: !!user,
  });

  const groupedReports: GroupedReport[] = useMemo(() => {
    if (!reports) return [];
    const weekMap = new Map<string, WeeklyReport[]>();
    for (const report of reports) {
      const key = `${report.week_start}_${report.week_end}`;
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(report);
    }
    return Array.from(weekMap.entries()).map(([key, segments]) => {
      const [weekStart, weekEnd] = key.split("_");
      const totalPnl = segments.reduce((sum, s) => sum + (s.total_pnl || 0), 0);
      const totalTrades = segments.reduce((sum, s) => sum + (s.total_trades || 0), 0);
      const totalWinning = segments.reduce((sum, s) => sum + (s.winning_trades || 0), 0);
      const overallWinRate = totalTrades > 0 ? (totalWinning / totalTrades) * 100 : 0;
      return { weekStart, weekEnd, segments, totalPnl, totalTrades, overallWinRate };
    });
  }, [reports]);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-report");
      if (error) throw error;
      if (data?.success) {
        toast({ title: "Report Generated", description: data.reportsCreated?.length > 0 ? `Created reports for: ${data.reportsCreated.join(", ")}` : "No trades found for this week" });
        queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
      }
    } catch (error) {
      toast({ title: "Failed to generate report", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToTelegram = async (report: GroupedReport) => {
    const key = `${report.weekStart}_${report.weekEnd}`;
    setIsSendingTelegram(key);
    try {
      const segmentBreakdown = report.segments.map((seg) => {
        const emoji = (seg.total_pnl || 0) >= 0 ? "📈" : "📉";
        const name = segmentDisplayNames[seg.segment] || seg.segment;
        return `${emoji} *${name}*: ${(seg.total_pnl || 0) >= 0 ? "+" : ""}₹${(seg.total_pnl || 0).toLocaleString()} (${seg.total_trades} trades)`;
      }).join("\n");
      const overallEmoji = report.totalPnl >= 0 ? "🎉" : "📊";
      const message = `${overallEmoji} *Weekly Report*\n📅 ${report.weekStart} to ${report.weekEnd}\n\n*Overall Performance*\n💰 Net P&L: ${report.totalPnl >= 0 ? "+" : ""}₹${report.totalPnl.toLocaleString()}\n📊 Win Rate: ${report.overallWinRate.toFixed(1)}%\n📈 Total Trades: ${report.totalTrades}\n\n*Segment Breakdown*\n${segmentBreakdown}`;
      const { error } = await supabase.functions.invoke("telegram-notify", { body: { message, parseMode: "Markdown" } });
      if (error) throw error;
      toast({ title: "Report Sent", description: "Weekly report has been sent to Telegram." });
    } catch (error) {
      toast({ title: "Failed to send", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsSendingTelegram(null);
    }
  };

  const handleDownloadReport = (report: GroupedReport) => {
    const segmentLines = report.segments.map((seg) => {
      const name = segmentDisplayNames[seg.segment] || seg.segment;
      const pnl = seg.total_pnl || 0;
      return `${name}: ${pnl >= 0 ? "+" : ""}₹${pnl.toLocaleString()}  |  Win Rate: ${(seg.win_rate || 0).toFixed(1)}%  |  Trades: ${seg.total_trades}`;
    }).join("\n");
    const content = ["TRADEBOOK — WEEKLY REPORT", "=".repeat(50), `Week: ${formatDate(report.weekStart)} — ${formatDate(report.weekEnd)}`, "", "OVERALL", `  Net P&L:      ${report.totalPnl >= 0 ? "+" : ""}₹${report.totalPnl.toLocaleString()}`, `  Win Rate:     ${report.overallWinRate.toFixed(1)}%`, `  Total Trades: ${report.totalTrades}`, "", "SEGMENT BREAKDOWN", "-".repeat(50), segmentLines, "", "=".repeat(50), `Generated: ${new Date().toLocaleString("en-IN")}`].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `TradeBook_Report_${report.weekStart}_to_${report.weekEnd}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded", description: "Weekly report saved as text file." });
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2].map((i) => <Skeleton key={i} className="h-64" />)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button className="bg-gradient-primary hover:opacity-90 transition-opacity" onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><BarChart3 className="w-4 h-4 mr-2" />Generate Report</>}
        </Button>
      </div>

      {groupedReports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
          <p className="text-muted-foreground mb-4">Weekly reports are generated automatically every Monday at 6 AM IST. You can also generate one manually.</p>
          <Button className="bg-gradient-primary" onClick={handleGenerateReport} disabled={isGenerating}>
            <RefreshCw className="w-4 h-4 mr-2" />Generate Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedReports.map((report) => {
            const reportKey = `${report.weekStart}_${report.weekEnd}`;
            return (
              <div key={reportKey} className="glass-card overflow-hidden">
                <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Week: {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}</h3>
                    <p className="text-sm text-muted-foreground">{report.totalTrades} trades executed</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Net P&L</p>
                      <p className={cn("text-xl font-bold", report.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                        {report.totalPnl >= 0 ? "+" : ""}₹{report.totalPnl.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Win Rate</p>
                      <p className={cn("text-xl font-bold", report.overallWinRate >= 50 ? "text-profit" : "text-loss")}>
                        {report.overallWinRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
                  {report.segments.map((segment) => {
                    const topSetups = (segment.top_setups as { name: string; count: number }[] | null) || [];
                    const commonMistakes = (segment.common_mistakes as { name: string; count: number }[] | null) || [];
                    return (
                      <div key={segment.segment} className="p-5">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">{segmentDisplayNames[segment.segment] || segment.segment}</h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">P&L</span>
                            <span className={cn("font-semibold", (segment.total_pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                              {(segment.total_pnl || 0) >= 0 ? "+" : ""}₹{(segment.total_pnl || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Win Rate</span>
                            <span className={cn("font-semibold", (segment.win_rate || 0) >= 50 ? "text-profit" : "text-loss")}>
                              {(segment.win_rate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Trades</span>
                            <span className="font-semibold">{segment.total_trades}</span>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            {topSetups.length > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Award className="w-3 h-3 text-warning" />
                                <span className="text-muted-foreground">Best:</span>
                                <span className="font-medium">{topSetups[0]?.name || "N/A"}</span>
                              </div>
                            )}
                            {commonMistakes.length > 0 && (
                              <div className="flex items-center gap-1 text-xs mt-1">
                                <AlertTriangle className="w-3 h-3 text-loss" />
                                <span className="text-muted-foreground">Mistake:</span>
                                <span className="font-medium text-loss">{commonMistakes[0]?.name || "None"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-accent/30 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="border-border" onClick={() => handleDownloadReport(report)}>
                    <Download className="w-4 h-4 mr-2" />Download
                  </Button>
                  <Button variant="outline" size="sm" className="border-border" onClick={() => handleSendToTelegram(report)} disabled={isSendingTelegram === reportKey}>
                    {isSendingTelegram === reportKey ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send to Telegram
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Reports Hub ────────────────────────────────────────────────────────
export default function Reports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTab] = useState<TabId>(tabParam && tabs.find(t => t.id === tabParam) ? tabParam : "analytics");

  // Keep URL in sync when user clicks tabs
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  // If URL param changes externally (redirect from /analytics etc.)
  useEffect(() => {
    if (tabParam && tabs.find(t => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-gradient-primary" />
        <div className="pl-4">
          <h1 className="text-2xl lg:text-3xl font-display tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Analytics, calendar, mistakes & weekly summaries in one place.</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl bg-accent border border-border w-fit overflow-x-auto no-scrollbar"
        role="tablist"
        onKeyDown={(e) => {
          const currentIndex = tabs.findIndex(t => t.id === activeTab);
          if (e.key === "ArrowRight" && currentIndex < tabs.length - 1) {
            handleTabChange(tabs[currentIndex + 1].id);
          } else if (e.key === "ArrowLeft" && currentIndex > 0) {
            handleTabChange(tabs[currentIndex - 1].id);
          }
        }}
      >
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              activeTab === id
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "analytics" && <AnalyticsTab />}
      {activeTab === "calendar" && <CalendarTab />}
      {activeTab === "mistakes" && <MistakesTab />}
      {activeTab === "weekly" && <WeeklyReportsTab />}
    </div>
  );
}
