import { useMemo, useState } from "react";
import { Calculator, ChevronDown, ChevronUp, IndianRupee } from "lucide-react";
import { calculateCharges, getBrokerOptions, type BrokerType, type TradeSegment, type ChargesBreakdown } from "@/lib/brokerage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BrokerageCalculatorPanelProps {
  segment: TradeSegment;
  tradeType: "BUY" | "SELL";
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  className?: string;
  compact?: boolean;
}

export function BrokerageCalculatorPanel({
  segment,
  tradeType,
  entryPrice,
  exitPrice,
  quantity,
  className,
  compact = false,
}: BrokerageCalculatorPanelProps) {
  const [broker, setBroker] = useState<BrokerType>("flat20");
  const [expanded, setExpanded] = useState(false);

  const charges = useMemo<ChargesBreakdown | null>(() => {
    if (!entryPrice || !quantity || entryPrice <= 0 || quantity <= 0) return null;
    const exit = exitPrice && exitPrice > 0 ? exitPrice : entryPrice;
    return calculateCharges({ segment, tradeType, entryPrice, exitPrice: exit, quantity, broker });
  }, [segment, tradeType, entryPrice, exitPrice, quantity, broker]);

  if (!charges) return null;

  const items = [
    { label: "Brokerage", value: charges.brokerage, color: "text-foreground" },
    { label: "STT/CTT", value: charges.stt, color: "text-foreground" },
    { label: "Exchange Txn", value: charges.exchangeCharges, color: "text-foreground" },
    { label: "GST (18%)", value: charges.gst, color: "text-foreground" },
    { label: "SEBI Charges", value: charges.sebiCharges, color: "text-foreground" },
    { label: "Stamp Duty", value: charges.stampDuty, color: "text-foreground" },
  ];

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 text-[10px]", className)}>
        <Calculator className="w-3 h-3 text-muted-foreground" />
        <span className="text-muted-foreground">Charges:</span>
        <span className="font-mono font-medium text-loss">₹{charges.totalCharges.toFixed(0)}</span>
        {exitPrice && exitPrice > 0 && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Net:</span>
            <span className={cn("font-mono font-medium", charges.netPnl >= 0 ? "text-profit" : "text-loss")}>
              ₹{charges.netPnl.toFixed(0)}
            </span>
          </>
        )}
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">BE: ₹{charges.breakeven.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border/40 bg-card/50", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium">Charges & Taxes</span>
          <Badge variant="outline" className="text-[9px] h-4 px-1.5 font-mono">
            ₹{charges.totalCharges.toFixed(0)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {exitPrice && exitPrice > 0 && (
            <span className={cn("text-[10px] font-mono font-medium", charges.netPnl >= 0 ? "text-profit" : "text-loss")}>
              Net: ₹{charges.netPnl.toFixed(0)}
            </span>
          )}
          {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2.5 border-t border-border/30">
          {/* Broker selector */}
          <div className="flex items-center gap-1.5 pt-2">
            <span className="text-[10px] text-muted-foreground">Broker:</span>
            <div className="flex gap-0.5">
              {getBrokerOptions().map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBroker(b.value)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-medium rounded transition-colors",
                    broker === b.value
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground border border-transparent"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Charges breakdown */}
          <div className="space-y-1">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
                <span className="text-[10px] font-mono">₹{item.value.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border/30 pt-1 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold">Total Charges</span>
                <span className="text-[10px] font-mono font-semibold text-loss">₹{charges.totalCharges.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Summary metrics */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="text-center p-1.5 rounded bg-muted/30">
              <p className="text-[9px] text-muted-foreground">Breakeven</p>
              <p className="text-[10px] font-mono font-semibold">₹{charges.breakeven.toFixed(2)}</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/30">
              <p className="text-[9px] text-muted-foreground">Charges %</p>
              <p className="text-[10px] font-mono font-semibold">{charges.chargesPercentOfTurnover.toFixed(3)}%</p>
            </div>
            <div className="text-center p-1.5 rounded bg-muted/30">
              <p className="text-[9px] text-muted-foreground">Turnover</p>
              <p className="text-[10px] font-mono font-semibold">₹{(charges.turnover / 100000).toFixed(1)}L</p>
            </div>
          </div>

          {exitPrice && exitPrice > 0 && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20">
              <div className="flex items-center gap-1.5">
                <IndianRupee className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Gross P&L</span>
              </div>
              <span className={cn("text-xs font-mono font-semibold", charges.grossPnl >= 0 ? "text-profit" : "text-loss")}>
                ₹{charges.grossPnl.toFixed(0)}
              </span>
              <span className="text-[10px] text-muted-foreground">→</span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground">Net</span>
                <span className={cn("text-xs font-mono font-bold", charges.netPnl >= 0 ? "text-profit" : "text-loss")}>
                  ₹{charges.netPnl.toFixed(0)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
