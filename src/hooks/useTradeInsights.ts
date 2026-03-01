import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TradeInsight {
  title: string;
  description: string;
  category: "behavioral" | "timing" | "risk" | "pattern" | "strength" | "info";
  severity: "success" | "warning" | "info";
}

export function useTradeInsights() {
  const [insights, setInsights] = useState<TradeInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchInsights = async (period: string = "30d") => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("trade-insights", {
        body: { period },
      });

      if (error) {
        const msg = typeof error === "object" && "message" in error ? error.message : String(error);
        throw new Error(msg);
      }

      if (data?.error) {
        toast({
          title: "AI Insights",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      setInsights(data?.insights || []);
      setLastFetched(new Date());
    } catch (err: any) {
      console.error("Failed to fetch insights:", err);
      toast({
        title: "Failed to get insights",
        description: err.message || "Something went wrong. Try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { insights, isLoading, lastFetched, fetchInsights };
}
