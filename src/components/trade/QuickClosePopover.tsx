import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Loader2 } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface QuickClosePopoverProps {
  tradeId: string;
  symbol: string;
  ltp: number;
  entryPrice: number;
  tradeType: string;
  quantity: number;
}

export function QuickClosePopover({ tradeId, symbol, ltp, entryPrice, tradeType, quantity }: QuickClosePopoverProps) {
  const [open, setOpen] = useState(false);
  const [exitPrice, setExitPrice] = useState(ltp.toString());
  const [exitQty, setExitQty] = useState(quantity.toString());
  const [isPartial, setIsPartial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { closeTrade } = useTrades();
  const queryClient = useQueryClient();

  const exit = Number(exitPrice) || 0;
  const closeQty = Number(exitQty) || quantity;
  const pnl = tradeType === "BUY"
    ? (exit - entryPrice) * closeQty
    : (entryPrice - exit) * closeQty;

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!exit || exit <= 0) return;

    if (isPartial && closeQty < quantity && closeQty > 0) {
      // Partial exit: record event and update remaining qty
      setIsSubmitting(true);
      try {
        const pnlRealized = tradeType === "BUY"
          ? (exit - entryPrice) * closeQty
          : (entryPrice - exit) * closeQty;

        // Insert partial exit event
        await supabase.from("trade_events").insert({
          trade_id: tradeId,
          event_type: "PARTIAL_EXIT" as const,
          price: exit,
          quantity: closeQty,
          pnl_realized: pnlRealized,
          notes: `Partial exit: ${closeQty}/${quantity} @ ₹${exit}`,
        });

        // Update trade quantity
        const remainingQty = quantity - closeQty;
        await supabase
          .from("trades")
          .update({ quantity: remainingQty })
          .eq("id", tradeId);

        queryClient.invalidateQueries({ queryKey: ["trades"] });
        toast.success(`Partial exit: ${closeQty} qty @ ₹${exit.toLocaleString("en-IN")}`, {
          description: `P&L booked: ${pnlRealized >= 0 ? "+" : ""}₹${pnlRealized.toLocaleString("en-IN")}. Remaining: ${remainingQty} qty.`,
        });
        setOpen(false);
      } catch (err) {
        toast.error("Failed to record partial exit");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Full close
      try {
        await closeTrade.mutateAsync({ id: tradeId, exitPrice: exit, closureReason: "Quick close from dashboard" });
        setOpen(false);
      } catch {}
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-loss hover:bg-loss/10"
          onClick={(e) => e.stopPropagation()}
          title="Quick close"
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Close {symbol}</p>
            <button
              type="button"
              onClick={() => {
                setIsPartial(!isPartial);
                setExitQty(Math.floor(quantity / 2).toString());
              }}
              className={cn(
                "text-[10px] px-2 py-0.5 rounded border transition-colors",
                isPartial
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {isPartial ? "Partial ✓" : "Partial Exit"}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground">Exit Price</label>
            <Input
              type="number"
              step="0.01"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="h-8 text-sm font-mono"
              autoFocus
            />
          </div>

          {isPartial && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-muted-foreground">Exit Quantity</label>
                <span className="text-[10px] text-muted-foreground">of {quantity} total</span>
              </div>
              <Input
                type="number"
                value={exitQty}
                onChange={(e) => setExitQty(e.target.value)}
                className="h-8 text-sm font-mono"
                min={1}
                max={quantity - 1}
              />
              <div className="flex gap-1">
                {[25, 50, 75].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setExitQty(Math.floor(quantity * pct / 100).toString())}
                    className="flex-1 text-[10px] py-0.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          )}

          {exit > 0 && (
            <div className={cn("text-xs font-mono font-semibold text-center p-1.5 rounded", pnl >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
              P&L: {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              {isPartial && <span className="font-normal text-muted-foreground ml-1">({closeQty} qty)</span>}
            </div>
          )}

          <Button
            size="sm"
            className={cn(
              "w-full h-8 text-xs",
              isPartial
                ? "bg-primary hover:bg-primary/90"
                : "bg-loss hover:bg-loss/90 text-loss-foreground"
            )}
            onClick={handleClose}
            disabled={(closeTrade.isPending || isSubmitting) || exit <= 0 || (isPartial && (closeQty <= 0 || closeQty >= quantity))}
          >
            {(closeTrade.isPending || isSubmitting) ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            {isPartial ? `Exit ${closeQty} qty` : "Close Trade"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
