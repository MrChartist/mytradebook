import { useState, useMemo } from "react";
import { Brain, Loader2, AlertTriangle, Info, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Trade } from "@/hooks/useTrades";
import { format, getHours, getDay } from "date-fns";

interface PatternInsight {
  pattern: string;
  detail: string;
  severity: "info" | "warning" | "critical";
  suggestion: string;
}

interface Props {
  trades: Trade[];
}

export function AIPatternDetection({ trades }: Props) {
  const [insights, setInsights] = useState<PatternInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const closed = useMemo(() => trades.filter((t) => t.status === "CLOSED"), [trades]);

  // Build aggregated stats for the AI
  const tradeStats = useMemo(() => {
    if (closed.length < 5) return null;

    const hourBuckets: Record<number, { wins: number; losses: number; totalPnl: number }> = {};
    const dayBuckets: Record<number, { wins: number; losses: number; totalPnl: number }> = {};
    const segmentBuckets: Record<string, { wins: number; losses: number; totalPnl: number; count: number }> = {};
    const emotionBuckets: Record<string, { wins: number; losses: number; totalPnl: number }> = {};

    let currentStreak = 0;
    let afterWinStreakPnl: number[] = [];
    let afterLossStreakPnl: number[] = [];

    const sorted = [...closed].sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime());

    sorted.forEach((t, i) => {
      const d = new Date(t.entry_time);
      const hour = getHours(d);
      const day = getDay(d);
      const pnl = t.pnl || 0;
      const isWin = pnl > 0;

      // Hour
      if (!hourBuckets[hour]) hourBuckets[hour] = { wins: 0, losses: 0, totalPnl: 0 };
      hourBuckets[hour][isWin ? "wins" : "losses"]++;
      hourBuckets[hour].totalPnl += pnl;

      // Day
      if (!dayBuckets[day]) dayBuckets[day] = { wins: 0, losses: 0, totalPnl: 0 };
      dayBuckets[day][isWin ? "wins" : "losses"]++;
      dayBuckets[day].totalPnl += pnl;

      // Segment
      if (!segmentBuckets[t.segment]) segmentBuckets[t.segment] = { wins: 0, losses: 0, totalPnl: 0, count: 0 };
      segmentBuckets[t.segment][isWin ? "wins" : "losses"]++;
      segmentBuckets[t.segment].totalPnl += pnl;
      segmentBuckets[t.segment].count++;

      // Emotion
      if (t.emotion_tag) {
        if (!emotionBuckets[t.emotion_tag]) emotionBuckets[t.emotion_tag] = { wins: 0, losses: 0, totalPnl: 0 };
        emotionBuckets[t.emotion_tag][isWin ? "wins" : "losses"]++;
        emotionBuckets[t.emotion_tag].totalPnl += pnl;
      }

      // Streak effects
      if (i > 0) {
        const prevPnl = sorted[i - 1].pnl || 0;
        if (prevPnl > 0) {
          currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
          if (currentStreak >= 2) afterWinStreakPnl.push(pnl);
        } else {
          currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
          if (currentStreak <= -2) afterLossStreakPnl.push(pnl);
        }
      }
    });

    return {
      totalTrades: closed.length,
      totalPnl: closed.reduce((a, t) => a + (t.pnl || 0), 0),
      winRate: (closed.filter((t) => (t.pnl || 0) > 0).length / closed.length * 100).toFixed(1),
      hourlyPerformance: hourBuckets,
      dayOfWeekPerformance: dayBuckets,
      segmentPerformance: segmentBuckets,
      emotionPerformance: Object.keys(emotionBuckets).length > 0 ? emotionBuckets : undefined,
      streakEffects: {
        avgPnlAfterWinStreak: afterWinStreakPnl.length > 0
          ? (afterWinStreakPnl.reduce((a, b) => a + b, 0) / afterWinStreakPnl.length).toFixed(0)
          : "N/A",
        avgPnlAfterLossStreak: afterLossStreakPnl.length > 0
          ? (afterLossStreakPnl.reduce((a, b) => a + b, 0) / afterLossStreakPnl.length).toFixed(0)
          : "N/A",
      },
    };
  }, [closed]);

  const handleDetect = async () => {
    if (!tradeStats) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("pattern-detection", {
        body: { tradeStats },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setInsights(data.insights || []);
      setHasRun(true);
    } catch (e: any) {
      toast.error(e.message || "Failed to detect patterns");
    } finally {
      setLoading(false);
    }
  };

  const severityIcon = (s: string) => {
    switch (s) {
      case "critical": return <AlertCircle className="w-4 h-4 text-loss" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-warning" />;
      default: return <Info className="w-4 h-4 text-primary" />;
    }
  };

  const severityBg = (s: string) => {
    switch (s) {
      case "critical": return "border-loss/20 bg-loss/5";
      case "warning": return "border-warning/20 bg-warning/5";
      default: return "border-primary/20 bg-primary/5";
    }
  };

  if (closed.length < 5) return null;

  return (
    <div className="premium-card space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="icon-badge bg-primary/10">
            <Brain className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Pattern Detection</h3>
            <p className="text-xs text-muted-foreground">Time, day, segment & streak patterns from {closed.length} trades</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Included</span>
          <Button size="sm" onClick={handleDetect} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            {hasRun ? "Re-analyze" : "Detect Patterns"}
          </Button>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={cn("rounded-xl border p-4 space-y-1.5", severityBg(insight.severity))}
            >
              <div className="flex items-center gap-2">
                {severityIcon(insight.severity)}
                <span className="text-sm font-semibold">{insight.pattern}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{insight.detail}</p>
              <p className="text-xs font-medium text-primary">💡 {insight.suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {hasRun && insights.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No significant patterns detected. Keep trading and check back!
        </p>
      )}
    </div>
  );
}
