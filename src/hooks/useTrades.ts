import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { notifyNewTrade, notifyTradeClosed, notifySLModified } from "@/lib/telegram";
import { fireProfitConfetti } from "@/lib/confetti";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Trade = Tables<"trades">;
export type TradeInsert = TablesInsert<"trades">;
export type TradeUpdate = TablesUpdate<"trades">;

export interface TradeFilters {
  status?: "PENDING" | "OPEN" | "CLOSED" | "CANCELLED";
  segment?: "Equity_Intraday" | "Equity_Positional" | "Futures" | "Options" | "Commodities";
  symbol?: string;
  fromDate?: string;
  toDate?: string;
}

export function useTrades(filters?: TradeFilters) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const tradesQuery = useQuery({
    queryKey: ["trades", user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500); // Safety cap to prevent unbounded queries

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.segment) {
        query = query.eq("segment", filters.segment);
      }
      if (filters?.symbol) {
        query = query.ilike("symbol", `%${filters.symbol}%`);
      }
      if (filters?.fromDate) {
        query = query.gte("entry_time", filters.fromDate);
      }
      if (filters?.toDate) {
        query = query.lte("entry_time", filters.toDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Trade[];
    },
    enabled: !!user?.id,
  });

  const createTrade = useMutation({
    mutationFn: async (trade: Omit<TradeInsert, "user_id">) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("trades")
        .insert({ ...trade, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Trade created",
        description: "Your trade has been logged successfully.",
      });

      // Send Telegram notification (fire and forget)
      // Only send if telegram posting is enabled for this trade
      if (data.telegram_post_enabled) {
        notifyNewTrade(data.id).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTrade = useMutation({
    mutationFn: async ({ id, ...updates }: TradeUpdate & { id: string }) => {
      // Fetch current trade to compare SL changes
      const { data: currentTrade } = await supabase
        .from("trades")
        .select("stop_loss")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("trades")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Return both the updated trade and old SL for notification
      return {
        trade: data,
        oldSL: currentTrade?.stop_loss,
        newSL: updates.stop_loss
      };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Trade updated",
        description: "Trade has been updated successfully.",
      });

      // Send notification if SL was modified
      if (result.oldSL !== undefined && result.newSL !== undefined && result.oldSL !== result.newSL) {
        notifySLModified(result.trade.id, result.oldSL, result.newSL).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const closeTrade = useMutation({
    mutationFn: async ({
      id,
      exitPrice,
      closureReason,
    }: {
      id: string;
      exitPrice: number;
      closureReason?: string;
    }) => {
      // Get the trade first
      const { data: trade } = await supabase
        .from("trades")
        .select("*")
        .eq("id", id)
        .single();

      if (!trade) throw new Error("Trade not found");

      const pnl =
        trade.trade_type === "BUY"
          ? (exitPrice - trade.entry_price) * trade.quantity
          : (trade.entry_price - exitPrice) * trade.quantity;

      const pnlPercent =
        trade.trade_type === "BUY"
          ? ((exitPrice - trade.entry_price) / trade.entry_price) * 100
          : ((trade.entry_price - exitPrice) / trade.entry_price) * 100;

      const { data, error } = await supabase
        .from("trades")
        .update({
          status: "CLOSED",
          current_price: exitPrice,
          pnl,
          pnl_percent: pnlPercent,
          closed_at: new Date().toISOString(),
          closure_reason: closureReason,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      const pnlText = data.pnl && data.pnl >= 0 ? `+₹${data.pnl.toLocaleString()}` : `-₹${Math.abs(data.pnl || 0).toLocaleString()}`;
      toast({
        title: "Trade closed",
        description: `Trade closed with P&L: ${pnlText}`,
      });

      // 🎉 Confetti on profitable close
      if (data.pnl && data.pnl > 0) {
        fireProfitConfetti();
      }

      // Send Telegram notification (fire and forget)
      // Only send if telegram posting was enabled for this trade
      if (data.telegram_post_enabled) {
        notifyTradeClosed(data.id).catch(console.error);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTrade = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("trades").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast({
        title: "Trade deleted",
        description: "Trade has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Compute summary stats
  const trades = tradesQuery.data || [];
  const openTrades = trades.filter((t) => t.status === "OPEN");
  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const totalPnl = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

  return {
    trades,
    isLoading: tradesQuery.isLoading,
    error: tradesQuery.error,
    refetch: tradesQuery.refetch,
    createTrade,
    updateTrade,
    closeTrade,
    deleteTrade,
    summary: {
      totalPnl,
      openPositions: openTrades.length,
      closedToday: closedTrades.filter(
        (t) => t.closed_at && new Date(t.closed_at).toDateString() === new Date().toDateString()
      ).length,
      winRate,
    },
  };
}
