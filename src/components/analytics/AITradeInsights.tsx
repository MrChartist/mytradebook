import { useState } from "react";
import { Brain, Clock, Shield, Target, TrendingUp, Sparkles, RefreshCw, ChevronDown, Settings, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTradeInsights, type TradeInsight } from "@/hooks/useTradeInsights";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const CATEGORY_CONFIG: Record<string, { icon: typeof Brain; label: string }> = {
  behavioral: { icon: Brain, label: "Behavioral" },
  timing: { icon: Clock, label: "Timing" },
  risk: { icon: Shield, label: "Risk" },
  pattern: { icon: Target, label: "Pattern" },
  strength: { icon: TrendingUp, label: "Strength" },
  info: { icon: Sparkles, label: "Info" },
};

const SEVERITY_STYLES: Record<string, string> = {
  success: "bg-profit/10 text-profit border-profit/20",
  warning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

const PERIODS = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
  { label: "All Time", value: "all" },
];

function InsightCard({ insight }: { insight: TradeInsight }) {
  const config = CATEGORY_CONFIG[insight.category] || CATEGORY_CONFIG.info;
  const Icon = config.icon;
  const severityClass = SEVERITY_STYLES[insight.severity] || SEVERITY_STYLES.info;

  return (
    <div className={cn("rounded-lg border p-4 space-y-2 transition-colors", severityClass)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold">{insight.title}</h4>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
              {config.label}
            </Badge>
          </div>
          <p className="text-xs mt-1 opacity-90 leading-relaxed">{insight.description}</p>
        </div>
      </div>
    </div>
  );
}

interface AITradeInsightsProps {
  compact?: boolean;
  maxInsights?: number;
}

export function AITradeInsights({ compact = false, maxInsights }: AITradeInsightsProps) {
  const { insights, isLoading, lastFetched, fetchInsights } = useTradeInsights();
  const { settings } = useUserSettings();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const [showAll, setShowAll] = useState(false);

  const hasAiKey = !!settings?.ai_provider;
  const providerLabel = settings?.ai_provider === "gemini" ? "Gemini" : settings?.ai_provider === "openai" ? "OpenAI" : null;

  const displayInsights = maxInsights && !showAll ? insights.slice(0, maxInsights) : insights;
  const hasMore = maxInsights ? insights.length > maxInsights : false;

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Insights
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => fetchInsights(period)}
              disabled={isLoading}
            >
              {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {insights.length === 0 ? "Get Insights" : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {isLoading && insights.length === 0 ? (
            <>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </>
          ) : !hasAiKey ? (
            <div className="text-center py-4 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/30 mb-1" />
              <p className="text-xs font-medium">Bring Your Own AI Key</p>
              <p className="text-[10px] text-muted-foreground/50 leading-relaxed max-w-[260px] mx-auto">
                Connect a free Gemini API key to get personalized insights on timing, risk, and behavioral patterns.
              </p>
              <Button variant="outline" size="sm" className="text-[11px] h-7" onClick={() => navigate("/settings?tab=integrations")}>
                <ExternalLink className="w-3 h-3 mr-1" /> Setup in Settings
              </Button>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-4">
              <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">Click "Get Insights" to analyze your trades with AI</p>
            </div>
          ) : (
            <>
              {displayInsights.map((insight, i) => (
                <InsightCard key={i} insight={insight} />
              ))}
              {hasMore && !showAll && (
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setShowAll(true)}>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  Show {insights.length - (maxInsights || 0)} more
                </Button>
              )}
            </>
          )}
          {lastFetched && (
            <p className="text-[10px] text-muted-foreground text-right">
              Updated {format(lastFetched, "h:mm a")}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Trade Insights
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                    period === p.value
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <Button
              onClick={() => fetchInsights(period)}
              disabled={isLoading}
              size="sm"
              className="gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {insights.length === 0 ? "Analyze My Trades" : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && insights.length === 0 ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : !hasAiKey ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/8 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1">Bring Your Own AI Key</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Connect a <strong>free</strong> Google Gemini key to unlock AI-powered analysis of your trading patterns, timing, risk management, and behavioral insights.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button onClick={() => navigate("/settings?tab=integrations")}>
                <ExternalLink className="w-4 h-4 mr-2" /> Setup AI Key
              </Button>
              <p className="text-[10px] text-muted-foreground/40">
                Your key is stored securely and only used server-side. No data leaves your account.
              </p>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <h3 className="text-base font-semibold mb-1">Get AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Click "Analyze My Trades" to let AI review your trading patterns, timing, and risk management to suggest improvements.
            </p>
          </div>
        ) : (
          <>
            {insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
            {lastFetched && (
              <div className="flex items-center justify-between pt-1">
                {providerLabel && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                    Powered by {providerLabel}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground text-right">
                  Analyzed at {format(lastFetched, "h:mm a, MMM d")} • {period === "all" ? "All time" : `Last ${period}`}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
