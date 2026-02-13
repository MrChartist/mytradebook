import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Plus, Layers, Loader2, ArrowUpRight, ArrowDownRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Trade } from "@/hooks/useTrades";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const strategyTypes = [
  { value: "bull_call_spread", label: "Bull Call Spread" },
  { value: "bear_put_spread", label: "Bear Put Spread" },
  { value: "straddle", label: "Straddle" },
  { value: "strangle", label: "Strangle" },
  { value: "iron_condor", label: "Iron Condor" },
  { value: "butterfly", label: "Butterfly" },
  { value: "collar", label: "Collar" },
  { value: "custom", label: "Custom Strategy" },
];

export function MultiLegStrategyModal({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [strategyType, setStrategyType] = useState("custom");
  const [symbol, setSymbol] = useState("");
  const [notes, setNotes] = useState("");

  const createStrategy = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("strategy_trades" as any)
        .insert({
          user_id: user.id,
          name,
          strategy_type: strategyType,
          symbol,
          notes: notes || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategy-trades"] });
      toast.success("Strategy created! Now add legs from the Trades page.");
      setName("");
      setSymbol("");
      setNotes("");
      setStrategyType("custom");
      onOpenChange(false);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Failed to create strategy");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Create Multi-Leg Strategy
          </DialogTitle>
          <DialogDescription>
            Group multiple option legs into a single strategy for combined P&L tracking.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Strategy Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., NIFTY Iron Condor"
              />
            </div>
            <div className="space-y-2">
              <Label>Strategy Type</Label>
              <Select value={strategyType} onValueChange={setStrategyType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {strategyTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Underlying Symbol *</Label>
            <Input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g., NIFTY, BANKNIFTY"
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Strategy thesis, max profit/loss levels..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>

          <div className="p-3 rounded-lg bg-accent/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">After creation:</p>
            <p>Create individual trades (legs) and link them to this strategy from the Create Trade modal.</p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button
              onClick={() => createStrategy.mutate()}
              disabled={!name.trim() || !symbol.trim() || createStrategy.isPending}
            >
              {createStrategy.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Strategy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for fetching strategies
export function useStrategies() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ["strategy-trades", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("strategy_trades" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  return { strategies, isLoading };
}
