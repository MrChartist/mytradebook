import { useState } from "react";
import { Sparkles, Loader2, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AlertSuggestion {
  symbol: string;
  condition: string;
  reason: string;
}

export function SmartAlertSuggestions({ onCreateAlert }: { onCreateAlert?: (symbol: string, condition: string) => void }) {
  const [suggestions, setSuggestions] = useState<AlertSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const fetchSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-alerts");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setSuggestions(data.suggestions || []);
      setHasLoaded(true);
      if (!data.suggestions?.length) {
        toast.info(data.message || "No suggestions available yet");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to get suggestions");
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasLoaded) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-primary/20 bg-primary/5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold">Smart Alert Suggestions</span>
          </div>
          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">Included</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          AI reviews your most traded symbols and suggests price alerts based on historical entry/exit levels.
        </p>
        <Button size="sm" onClick={fetchSuggestions} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          Get Suggestions
        </Button>
      </div>
    );
  }

  if (!suggestions.length) {
    return (
      <div className="p-3 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
        No suggestions yet. Trade more to get personalized alert recommendations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">AI-Suggested Alerts</span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchSuggestions} disabled={isLoading}>
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Refresh"}
        </Button>
      </div>
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
            <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{s.symbol}</span>
                <Badge variant="outline" className="text-xs">
                  {s.condition === "PRICE_GT" ? "Price Above" : "Price Below"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{s.reason}</p>
            </div>
            {onCreateAlert && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => onCreateAlert(s.symbol, s.condition)}
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
