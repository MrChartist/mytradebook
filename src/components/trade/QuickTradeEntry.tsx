import { useState } from "react";
import { Zap, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
import { useTrades } from "@/hooks/useTrades";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface QuickTradeEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SEGMENTS = [
  { value: "Equity_Intraday", label: "Intraday" },
  { value: "Equity_Positional", label: "Delivery" },
  { value: "Futures", label: "Futures" },
  { value: "Options", label: "Options" },
];

export function QuickTradeEntry({ open, onOpenChange }: QuickTradeEntryProps) {
  const { createTrade } = useTrades();
  const [segment, setSegment] = useState("Equity_Intraday");
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [symbol, setSymbol] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleInstrumentSelect = (inst: SelectedInstrument) => {
    setSymbol(inst.symbol);
  };

  const handleSubmit = async () => {
    if (!symbol || !entryPrice || !quantity) {
      toast.error("Fill in symbol, price, and quantity");
      return;
    }
    setSubmitting(true);
    try {
      await createTrade.mutateAsync({
        symbol,
        segment: segment as any,
        trade_type: tradeType,
        entry_price: Number(entryPrice),
        quantity: Number(quantity),
        stop_loss: stopLoss ? Number(stopLoss) : null,
        status: "OPEN",
        entry_time: new Date().toISOString(),
      });
      // Reset
      setSymbol("");
      setEntryPrice("");
      setQuantity("");
      setStopLoss("");
      onOpenChange(false);
    } catch (err) {
      // Error handled by useTrades
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border/40 shadow-2xl rounded-t-2xl p-4 animate-in slide-in-from-bottom-4 duration-300 safe-area-pb">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold">Quick Trade</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onOpenChange(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Trade type + Segment row */}
      <div className="flex gap-2 mb-3">
        <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5 flex-1">
          {(["BUY", "SELL"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTradeType(t)}
              className={cn(
                "flex-1 py-1.5 text-xs font-semibold rounded-md transition-all",
                tradeType === t
                  ? t === "BUY" ? "bg-profit text-profit-foreground" : "bg-loss text-loss-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="h-9 text-xs rounded-lg border border-border bg-card px-2 text-foreground flex-1"
        >
          {SEGMENTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Symbol */}
      <div className="mb-3">
        <InstrumentPicker
          value={symbol}
          onSelect={handleInstrumentSelect}
          segment={segment}
          placeholder="Search symbol..."
        />
      </div>

      {/* Price, Qty, SL in a row */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <Label className="text-[9px] text-muted-foreground uppercase">Price</Label>
          <Input
            type="number"
            placeholder="Entry"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="h-9 text-xs mt-0.5"
          />
        </div>
        <div>
          <Label className="text-[9px] text-muted-foreground uppercase">Qty</Label>
          <Input
            type="number"
            placeholder="Qty"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="h-9 text-xs mt-0.5"
          />
        </div>
        <div>
          <Label className="text-[9px] text-muted-foreground uppercase">Stop Loss</Label>
          <Input
            type="number"
            placeholder="Optional"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="h-9 text-xs mt-0.5"
          />
        </div>
      </div>

      <Button
        className="w-full h-10"
        onClick={handleSubmit}
        disabled={submitting || !symbol || !entryPrice || !quantity}
      >
        {submitting ? "Logging..." : `Log ${tradeType} Trade`}
      </Button>
    </div>
  );
}
