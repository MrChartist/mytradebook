import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Trade } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { Tags, TrendingUp, TrendingDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  trades: Trade[];
}

interface TagPerf {
  name: string;
  type: string;
  count: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

export function SetupTagPerformance({ trades }: Props) {
  const { user } = useAuth();
  const closedIds = useMemo(
    () => trades.filter((t) => t.status === "CLOSED").map((t) => t.id),
    [trades]
  );
  const closedMap = useMemo(() => {
    const m: Record<string, Trade> = {};
    trades.filter((t) => t.status === "CLOSED").forEach((t) => (m[t.id] = t));
    return m;
  }, [trades]);

  // Fetch all tag links for closed trades
  const { data: patternLinks } = useQuery({
    queryKey: ["all-trade-patterns", closedIds],
    queryFn: async () => {
      if (!closedIds.length) return [];
      const { data } = await supabase
        .from("trade_patterns")
        .select("trade_id, pattern_tags(id, name)")
        .in("trade_id", closedIds.slice(0, 100));
      return data || [];
    },
    enabled: closedIds.length > 0,
  });

  const { data: mistakeLinks } = useQuery({
    queryKey: ["all-trade-mistakes", closedIds],
    queryFn: async () => {
      if (!closedIds.length) return [];
      const { data } = await supabase
        .from("trade_mistakes")
        .select("trade_id, mistake_tags(id, name)")
        .in("trade_id", closedIds.slice(0, 100));
      return data || [];
    },
    enabled: closedIds.length > 0,
  });

  const { data: candleLinks } = useQuery({
    queryKey: ["all-trade-candlesticks", closedIds],
    queryFn: async () => {
      if (!closedIds.length) return [];
      const { data } = await supabase
        .from("trade_candlesticks")
        .select("trade_id, candlestick_tags(id, name)")
        .in("trade_id", closedIds.slice(0, 100));
      return data || [];
    },
    enabled: closedIds.length > 0,
  });

  const tagPerf = useMemo(() => {
    const perf: Record<string, TagPerf> = {};

    const processLinks = (links: any[] | undefined, type: string, tagKey: string) => {
      if (!links) return;
      for (const link of links) {
        const tag = link[tagKey];
        if (!tag?.name) continue;
        const trade = closedMap[link.trade_id];
        if (!trade) continue;
        const key = `${type}:${tag.name}`;
        if (!perf[key]) {
          perf[key] = { name: tag.name, type, count: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0, avgPnl: 0 };
        }
        perf[key].count++;
        perf[key].totalPnl += trade.pnl || 0;
        if ((trade.pnl || 0) > 0) perf[key].wins++;
        else perf[key].losses++;
      }
    };

    processLinks(patternLinks, "Pattern", "pattern_tags");
    processLinks(mistakeLinks, "Mistake", "mistake_tags");
    processLinks(candleLinks, "Candle", "candlestick_tags");

    // Calc derived
    Object.values(perf).forEach((p) => {
      p.winRate = p.count ? (p.wins / p.count) * 100 : 0;
      p.avgPnl = p.count ? p.totalPnl / p.count : 0;
    });

    return Object.values(perf).sort((a, b) => b.totalPnl - a.totalPnl);
  }, [patternLinks, mistakeLinks, candleLinks, closedMap]);

  if (tagPerf.length === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <Tags className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="font-semibold mb-1">No Tag Data</h3>
        <p className="text-sm text-muted-foreground">Tag your trades with patterns, setups, and mistakes to see what actually works.</p>
      </div>
    );
  }

  const profitable = tagPerf.filter((t) => t.totalPnl > 0);
  const unprofitable = tagPerf.filter((t) => t.totalPnl <= 0);

  return (
    <div className="surface-card p-5 space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <Tags className="w-4 h-4 text-primary" />
          Setup / Tag Performance Matrix
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">Which setups actually make you money?</p>
      </div>

      {/* Profitable tags */}
      {profitable.length > 0 && (
        <div>
          <p className="text-xs font-medium text-profit flex items-center gap-1 mb-2">
            <TrendingUp className="w-3 h-3" /> Profitable Tags
          </p>
          <div className="space-y-1.5">
            {profitable.slice(0, 8).map((t) => (
              <TagRow key={`${t.type}:${t.name}`} tag={t} />
            ))}
          </div>
        </div>
      )}

      {/* Unprofitable tags */}
      {unprofitable.length > 0 && (
        <div>
          <p className="text-xs font-medium text-loss flex items-center gap-1 mb-2">
            <TrendingDown className="w-3 h-3" /> Unprofitable Tags
          </p>
          <div className="space-y-1.5">
            {unprofitable.slice(0, 8).map((t) => (
              <TagRow key={`${t.type}:${t.name}`} tag={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TagRow({ tag }: { tag: TagPerf }) {
  const isProfit = tag.totalPnl > 0;
  return (
    <div className="flex items-center justify-between p-2.5 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] px-1.5 py-0.5 rounded font-medium",
          tag.type === "Pattern" && "bg-primary/10 text-primary",
          tag.type === "Mistake" && "bg-loss/10 text-loss",
          tag.type === "Candle" && "bg-warning/10 text-warning",
        )}>
          {tag.type}
        </span>
        <span className="text-sm font-medium">{tag.name}</span>
        <span className="text-xs text-muted-foreground">({tag.count})</span>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={cn("font-semibold", tag.winRate >= 50 ? "text-profit" : "text-loss")}>
          {tag.winRate.toFixed(0)}% WR
        </span>
        <span className={cn("font-mono font-semibold", isProfit ? "text-profit" : "text-loss")}>
          {isProfit ? "+" : ""}₹{tag.totalPnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}
