import { useState, useEffect } from "react";
import { Brain, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Trade } from "@/hooks/useTrades";
import { useTradeCoach } from "@/hooks/useTradeCoach";
import ReactMarkdown from "react-markdown";

interface Props {
  trade: Trade;
}

export function TradeCoachPanel({ trade }: Props) {
  const { getCoaching, feedback, isLoading, setFeedback } = useTradeCoach();
  const [autoTriggered, setAutoTriggered] = useState(false);

  // Auto-trigger on mount if trade is freshly closed (within last 5 minutes) and no cached feedback
  useEffect(() => {
    if (autoTriggered) return;
    const cachedFeedback = (trade as any).coaching_feedback;
    if (cachedFeedback) {
      setFeedback(cachedFeedback);
      setAutoTriggered(true);
      return;
    }
    if (trade.closed_at) {
      const closedAgo = Date.now() - new Date(trade.closed_at).getTime();
      if (closedAgo < 5 * 60 * 1000) {
        setAutoTriggered(true);
        getCoaching(trade);
      }
    }
  }, [trade.id]);

  if (!feedback && !isLoading) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">AI Trade Coach</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Get AI-powered coaching feedback on this trade
        </p>
        <Button size="sm" onClick={() => getCoaching(trade)} disabled={isLoading}>
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Get Coaching
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold">AI Trade Coach</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            setFeedback(null);
            getCoaching({ ...trade, coaching_feedback: null } as any);
          }}
          disabled={isLoading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your trade...
        </div>
      ) : feedback ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed [&_strong]:text-foreground [&_li]:text-muted-foreground">
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>
      ) : null}
    </div>
  );
}
