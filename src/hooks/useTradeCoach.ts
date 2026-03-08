import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Trade } from "@/hooks/useTrades";
import { useTrades } from "@/hooks/useTrades";
import { toast } from "sonner";

export function useTradeCoach() {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { updateTrade } = useTrades();

  const getCoaching = useCallback(async (trade: Trade) => {
    // If already cached in DB
    if ((trade as any).coaching_feedback) {
      setFeedback((trade as any).coaching_feedback);
      return (trade as any).coaching_feedback;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("trade-coach", {
        body: { trade },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const coachFeedback = data.feedback;
      setFeedback(coachFeedback);

      // Save to DB for caching
      await updateTrade.mutateAsync({
        id: trade.id,
        coaching_feedback: coachFeedback,
      } as any);

      return coachFeedback;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to get coaching";
      toast.error(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [updateTrade]);

  return { getCoaching, feedback, isLoading, setFeedback };
}
