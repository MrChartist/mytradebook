import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface SyncUserResult {
  imported: number;
  closed: number;
  priceUpdates: number;
  importedTrades: Array<{ symbol: string; action: string; entryPrice: number; orderId: string }>;
  updatedTrades: Array<{ symbol: string; action: string; exitPrice: number; pnl: number; orderId: string }>;
}

interface SyncResult {
  success: boolean;
  message: string;
  results: SyncUserResult[];
}

interface MonitorResult {
  success: boolean;
  results: {
    monitored: number;
    slHits: string[];
    targetHits: string[];
    priceUpdates: number;
  };
}

interface ExecuteOrderParams {
  tradeId: string;
  symbol: string;
  quantity: number;
  transactionType: "BUY" | "SELL";
  orderType?: "MARKET" | "LIMIT";
  price?: number;
  reason: string;
  securityId?: string;
  exchangeSegment?: string;
  productType?: string;
}

export function useDhanIntegration() {
  // Sync portfolio & orders from Dhan
  const syncPortfolio = useMutation({
    mutationFn: async (): Promise<SyncResult> => {
      const { data, error } = await supabase.functions.invoke("dhan-sync", {
        body: {},
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const results = data?.results?.[0];
      if (results) {
        const parts: string[] = [];
        if (results.imported > 0) parts.push(`${results.imported} imported`);
        if (results.closed > 0) parts.push(`${results.closed} closed`);
        if (results.priceUpdates > 0) parts.push(`${results.priceUpdates} prices updated`);
        if (parts.length > 0) {
          toast.success(`Dhan sync: ${parts.join(", ")}`);
        } else {
          toast.info("No new orders to sync from Dhan");
        }
      } else {
        toast.info("Sync completed");
      }
    },
    onError: (error: Error) => {
      toast.error(`Sync failed: ${error.message}`);
    },
  });

  // Execute trade via Dhan
  const executeOrder = useMutation({
    mutationFn: async (params: ExecuteOrderParams): Promise<{ success: boolean; orderId: string }> => {
      const { data, error } = await supabase.functions.invoke("dhan-execute", {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Order executed! ID: ${data.orderId}`);
    },
    onError: (error: Error) => {
      toast.error(`Order failed: ${error.message}`);
    },
  });

  // Monitor trades (check SL/targets)
  const monitorTrades = useMutation({
    mutationFn: async (): Promise<MonitorResult> => {
      const { data, error } = await supabase.functions.invoke("trade-monitor", {
        method: "POST",
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const { results } = data;
      if (results.slHits.length > 0 || results.targetHits.length > 0) {
        toast.warning(
          `Alerts: ${results.slHits.length} SL hits, ${results.targetHits.length} targets hit`
        );
      }
    },
    onError: (error: Error) => {
      console.error("Monitor failed:", error);
    },
  });

  // Evaluate price alerts
  const evaluateAlerts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("evaluate-alerts", {
        method: "POST",
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.triggered > 0) {
        toast.info(`${data.triggered} alert(s) triggered!`);
      }
    },
    onError: (error: Error) => {
      console.error("Alert evaluation failed:", error);
    },
  });

  return {
    syncPortfolio,
    executeOrder,
    monitorTrades,
    evaluateAlerts,
    isSyncing: syncPortfolio.isPending,
    isExecuting: executeOrder.isPending,
  };
}
