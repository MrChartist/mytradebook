import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, format, eachDayOfInterval, parseISO } from "date-fns";
import type { TradeTargets } from "@/types/trade";

interface TradeWithTags {
  id: string;
  symbol: string;
  trade_type: string;
  quantity: number;
  entry_price: number;
  current_price: number | null;
  pnl: number | null;
  pnl_percent: number | null;
  status: string | null;
  rating: number | null;
  confidence_score: number | null;
  segment: string;
  entry_time: string;
  closed_at: string | null;
  stop_loss: number | null;
  targets: TradeTargets | null;
  notes: string | null;
}

interface PatternPerformance {
  name: string;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

interface MistakeImpact {
  name: string;
  severity: string | null;
  count: number;
  totalLoss: number;
  avgLoss: number;
}

interface RatingPerformance {
  rating: number;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
}

interface ConfidencePerformance {
  confidence: number;
  trades: number;
  wins: number;
  winRate: number;
  totalPnl: number;
}

interface DayData {
  date: Date;
  dateStr: string;
  trades: TradeWithTags[];
  tradeCount: number;
  pnl: number;
}

interface EquityCurvePoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
}

export interface JournalFilters {
  fromDate?: Date;
  toDate?: Date;
  segment?: string;
}

export function useJournalAnalytics(filters?: JournalFilters) {
  const { user } = useAuth();

  // Fetch all closed trades
  const tradesQuery = useQuery({
    queryKey: ["journal-trades", user?.id, filters?.fromDate, filters?.toDate, filters?.segment],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "CLOSED")
        .order("closed_at", { ascending: true });

      if (filters?.fromDate) {
        query = query.gte("closed_at", filters.fromDate.toISOString());
      }
      if (filters?.toDate) {
        query = query.lte("closed_at", filters.toDate.toISOString());
      }
      if (filters?.segment && filters.segment !== "ALL") {
        query = query.eq("segment", filters.segment as "Equity_Intraday" | "Equity_Positional" | "Futures" | "Options" | "Commodities");
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as TradeWithTags[];
    },
    enabled: !!user?.id,
  });

  // Fetch trade patterns with tag info
  const tradePatternsQuery = useQuery({
    queryKey: ["journal-trade-patterns", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("trade_patterns")
        .select(`
          trade_id,
          pattern_tags(id, name, category)
        `);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch trade mistakes with tag info
  const tradeMistakesQuery = useQuery({
    queryKey: ["journal-trade-mistakes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("trade_mistakes")
        .select(`
          trade_id,
          mistake_tags(id, name, severity)
        `);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const trades = tradesQuery.data || [];
  const tradePatterns = tradePatternsQuery.data || [];
  const tradeMistakes = tradeMistakesQuery.data || [];

  // Compute analytics
  const analytics = useMemo(() => {
    if (!trades.length) {
      return {
        totalTrades: 0,
        totalPnl: 0,
        winRate: 0,
        wins: 0,
        losses: 0,
        avgHoldingTimeMinutes: 0,
        performanceByRating: [] as RatingPerformance[],
        performanceByConfidence: [] as ConfidencePerformance[],
        patternPerformance: [] as PatternPerformance[],
        mistakeImpact: [] as MistakeImpact[],
        equityCurve: [] as EquityCurvePoint[],
        calendarData: [] as DayData[],
        bestPattern: null as string | null,
        topMistake: null as string | null,
      };
    }

    // Basic stats
    const wins = trades.filter((t) => (t.pnl || 0) > 0);
    const losses = trades.filter((t) => (t.pnl || 0) <= 0);
    const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
    const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

    // Average holding time
    let totalHoldingTime = 0;
    let countWithClosedAt = 0;
    trades.forEach((t) => {
      if (t.closed_at) {
        const entryTime = new Date(t.entry_time).getTime();
        const closedTime = new Date(t.closed_at).getTime();
        totalHoldingTime += closedTime - entryTime;
        countWithClosedAt++;
      }
    });
    const avgHoldingTimeMinutes = countWithClosedAt > 0 
      ? totalHoldingTime / countWithClosedAt / 1000 / 60 
      : 0;

    // Performance by rating
    const ratingMap = new Map<number, { trades: TradeWithTags[] }>();
    trades.forEach((t) => {
      if (t.rating) {
        if (!ratingMap.has(t.rating)) {
          ratingMap.set(t.rating, { trades: [] });
        }
        ratingMap.get(t.rating)!.trades.push(t);
      }
    });

    const performanceByRating: RatingPerformance[] = Array.from(ratingMap.entries())
      .map(([rating, data]) => {
        const ratingWins = data.trades.filter((t) => (t.pnl || 0) > 0).length;
        const ratingPnl = data.trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return {
          rating,
          trades: data.trades.length,
          wins: ratingWins,
          winRate: data.trades.length > 0 ? (ratingWins / data.trades.length) * 100 : 0,
          totalPnl: ratingPnl,
        };
      })
      .sort((a, b) => a.rating - b.rating);

    // Performance by confidence
    const confidenceMap = new Map<number, { trades: TradeWithTags[] }>();
    trades.forEach((t) => {
      if (t.confidence_score) {
        if (!confidenceMap.has(t.confidence_score)) {
          confidenceMap.set(t.confidence_score, { trades: [] });
        }
        confidenceMap.get(t.confidence_score)!.trades.push(t);
      }
    });

    const performanceByConfidence: ConfidencePerformance[] = Array.from(confidenceMap.entries())
      .map(([confidence, data]) => {
        const confWins = data.trades.filter((t) => (t.pnl || 0) > 0).length;
        const confPnl = data.trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return {
          confidence,
          trades: data.trades.length,
          wins: confWins,
          winRate: data.trades.length > 0 ? (confWins / data.trades.length) * 100 : 0,
          totalPnl: confPnl,
        };
      })
      .sort((a, b) => a.confidence - b.confidence);

    // Pattern performance
    const patternMap = new Map<string, { tradeIds: Set<string>; name: string }>();
    tradePatterns.forEach((tp) => {
      const pattern = tp.pattern_tags as { id: string; name: string; category: string } | null;
      if (pattern) {
        if (!patternMap.has(pattern.name)) {
          patternMap.set(pattern.name, { tradeIds: new Set(), name: pattern.name });
        }
        patternMap.get(pattern.name)!.tradeIds.add(tp.trade_id);
      }
    });

    const patternPerformance: PatternPerformance[] = Array.from(patternMap.entries())
      .map(([name, data]) => {
        const patternTrades = trades.filter((t) => data.tradeIds.has(t.id));
        const patternWins = patternTrades.filter((t) => (t.pnl || 0) > 0).length;
        const patternPnl = patternTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return {
          name,
          trades: patternTrades.length,
          wins: patternWins,
          winRate: patternTrades.length > 0 ? (patternWins / patternTrades.length) * 100 : 0,
          totalPnl: patternPnl,
          avgPnl: patternTrades.length > 0 ? patternPnl / patternTrades.length : 0,
        };
      })
      .filter((p) => p.trades > 0)
      .sort((a, b) => b.totalPnl - a.totalPnl);

    // Mistake impact
    const mistakeMap = new Map<string, { tradeIds: Set<string>; name: string; severity: string | null }>();
    tradeMistakes.forEach((tm) => {
      const mistake = tm.mistake_tags as { id: string; name: string; severity: string | null } | null;
      if (mistake) {
        if (!mistakeMap.has(mistake.name)) {
          mistakeMap.set(mistake.name, { tradeIds: new Set(), name: mistake.name, severity: mistake.severity });
        }
        mistakeMap.get(mistake.name)!.tradeIds.add(tm.trade_id);
      }
    });

    const mistakeImpact: MistakeImpact[] = Array.from(mistakeMap.entries())
      .map(([name, data]) => {
        const mistakeTrades = trades.filter((t) => data.tradeIds.has(t.id) && (t.pnl || 0) < 0);
        const totalLoss = mistakeTrades.reduce((acc, t) => acc + (t.pnl || 0), 0);
        return {
          name,
          severity: data.severity,
          count: data.tradeIds.size,
          totalLoss,
          avgLoss: mistakeTrades.length > 0 ? totalLoss / mistakeTrades.length : 0,
        };
      })
      .filter((m) => m.count > 0)
      .sort((a, b) => a.totalLoss - b.totalLoss); // Most negative first

    // Equity curve
    const equityCurve: EquityCurvePoint[] = [];
    let cumulative = 0;
    const sortedByClose = [...trades].sort(
      (a, b) => new Date(a.closed_at || a.entry_time).getTime() - new Date(b.closed_at || b.entry_time).getTime()
    );
    
    const dailyPnl = new Map<string, number>();
    sortedByClose.forEach((t) => {
      const dateStr = format(new Date(t.closed_at || t.entry_time), "yyyy-MM-dd");
      dailyPnl.set(dateStr, (dailyPnl.get(dateStr) || 0) + (t.pnl || 0));
    });

    Array.from(dailyPnl.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([dateStr, pnl]) => {
        cumulative += pnl;
        equityCurve.push({
          date: dateStr,
          pnl,
          cumulativePnl: cumulative,
        });
      });

    // Calendar data - group trades by date
    const dateMap = new Map<string, TradeWithTags[]>();
    trades.forEach((t) => {
      const dateStr = format(new Date(t.closed_at || t.entry_time), "yyyy-MM-dd");
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, []);
      }
      dateMap.get(dateStr)!.push(t);
    });

    const calendarData: DayData[] = Array.from(dateMap.entries()).map(([dateStr, dayTrades]) => ({
      date: parseISO(dateStr),
      dateStr,
      trades: dayTrades,
      tradeCount: dayTrades.length,
      pnl: dayTrades.reduce((acc, t) => acc + (t.pnl || 0), 0),
    }));

    // Best pattern
    const bestPattern = patternPerformance.length > 0 
      ? patternPerformance.reduce((best, p) => p.winRate > best.winRate ? p : best).name
      : null;

    // Top mistake
    const topMistake = mistakeImpact.length > 0 ? mistakeImpact[0].name : null;

    return {
      totalTrades: trades.length,
      totalPnl,
      winRate,
      wins: wins.length,
      losses: losses.length,
      avgHoldingTimeMinutes,
      performanceByRating,
      performanceByConfidence,
      patternPerformance,
      mistakeImpact,
      equityCurve,
      calendarData,
      bestPattern,
      topMistake,
    };
  }, [trades, tradePatterns, tradeMistakes]);

  return {
    ...analytics,
    trades,
    isLoading: tradesQuery.isLoading || tradePatternsQuery.isLoading || tradeMistakesQuery.isLoading,
    error: tradesQuery.error,
  };
}

export function useTradesWithMistakes() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["trades-with-mistakes", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all trades with their mistakes
      const { data: trades, error: tradesError } = await supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "CLOSED")
        .order("closed_at", { ascending: false });

      if (tradesError) throw tradesError;

      // Get all trade mistakes
      const { data: tradeMistakes, error: mistakesError } = await supabase
        .from("trade_mistakes")
        .select(`
          trade_id,
          mistake_tags(id, name, severity)
        `);

      if (mistakesError) throw mistakesError;

      // Combine trades with their mistakes
      const tradesWithMistakes = trades?.map((trade) => {
        const mistakes = tradeMistakes
          ?.filter((tm) => tm.trade_id === trade.id)
          .map((tm) => tm.mistake_tags as { id: string; name: string; severity: string | null })
          .filter(Boolean) || [];

        // Determine highest severity
        let highestSeverity: "low" | "medium" | "high" | null = null;
        mistakes.forEach((m) => {
          if (m.severity === "high") highestSeverity = "high";
          else if (m.severity === "medium" && highestSeverity !== "high") highestSeverity = "medium";
          else if (m.severity === "low" && !highestSeverity) highestSeverity = "low";
        });

        return {
          ...trade,
          mistakes,
          highestSeverity,
        };
      }) || [];

      return tradesWithMistakes.filter((t) => t.mistakes.length > 0);
    },
    enabled: !!user?.id,
  });
}
