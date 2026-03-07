import { ArrowUpRight, ArrowDownRight, Edit, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Trade } from "@/hooks/useTrades";

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Equity Intraday",
  Equity_Positional: "Equity Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

interface Props {
  trade: Trade;
  isEditing: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
}

export function TradeDetailHeader({ trade, isEditing, onStartEditing, onCancelEditing }: Props) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center",
          trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10"
        )}
      >
        {trade.trade_type === "BUY" ? (
          <ArrowUpRight className="w-5 h-5 text-profit" />
        ) : (
          <ArrowDownRight className="w-5 h-5 text-loss" />
        )}
      </div>
      <div>
        <span className="text-xl">{trade.symbol}</span>
        <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
          <Badge variant="outline" className="text-xs">{trade.trade_type}</Badge>
          <span>{segmentLabels[trade.segment] || trade.segment}</span>
          <span>•</span>
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              trade.status === "OPEN" ? "border-profit/50 text-profit" : "border-muted-foreground text-muted-foreground"
            )}
          >
            {trade.status}
          </Badge>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="ml-auto h-8 w-8"
        onClick={isEditing ? onCancelEditing : onStartEditing}
      >
        {isEditing ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
      </Button>
    </div>
  );
}
