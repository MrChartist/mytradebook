import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, Loader2 } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";

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
  const { closeTrade } = useTrades();

  const exit = Number(exitPrice) || 0;
  const pnl = tradeType === "BUY" ? (exit - entryPrice) * quantity : (entryPrice - exit) * quantity;

  const handleClose = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!exit || exit <= 0) return;
    try {
      await closeTrade.mutateAsync({ id: tradeId, exitPrice: exit, closureReason: "Quick close from dashboard" });
      setOpen(false);
    } catch {}
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
      <PopoverContent className="w-64 p-3" align="end" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-3">
          <p className="text-xs font-medium">Close {symbol}</p>
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
          {exit > 0 && (
            <div className={cn("text-xs font-mono font-semibold text-center p-1.5 rounded", pnl >= 0 ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
              P&L: {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          )}
          <Button
            size="sm"
            className="w-full h-8 text-xs bg-loss hover:bg-loss/90 text-loss-foreground"
            onClick={handleClose}
            disabled={closeTrade.isPending || exit <= 0}
          >
            {closeTrade.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Close Trade
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
