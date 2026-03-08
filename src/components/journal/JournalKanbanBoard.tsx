import { useMemo } from "react";
import { AlertTriangle, ArrowUpRight, ArrowDownRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Mistake {
  id: string;
  name: string;
  severity: string | null;
}

interface TradeWithMistakes {
  id: string;
  symbol: string;
  trade_type: string;
  pnl: number | null;
  mistakes: Mistake[];
  highestSeverity: "low" | "medium" | "high" | null;
}

interface JournalKanbanBoardProps {
  tradesWithMistakes: TradeWithMistakes[];
  isLoading: boolean;
  onTradeClick: (trade: TradeWithMistakes) => void;
}

const columns: { id: "low" | "medium" | "high"; title: string; color: string }[] = [
  { id: "low", title: "Low Severity", color: "border-t-warning" },
  { id: "medium", title: "Medium Severity", color: "border-t-orange-500" },
  { id: "high", title: "High Severity", color: "border-t-loss" },
];

export function JournalKanbanBoard({
  tradesWithMistakes,
  isLoading,
  onTradeClick,
}: JournalKanbanBoardProps) {
  const groupedTrades = useMemo(() => {
    const groups: Record<string, TradeWithMistakes[]> = {
      low: [],
      medium: [],
      high: [],
    };

    tradesWithMistakes.forEach((trade) => {
      if (trade.highestSeverity) {
        groups[trade.highestSeverity].push(trade);
      }
    });

    return groups;
  }, [tradesWithMistakes]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {columns.map((col) => (
          <div key={col.id} className="surface-card p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
      {columns.map((column) => {
        const columnTrades = groupedTrades[column.id] || [];
        const totalLoss = columnTrades.reduce(
          (acc, t) => acc + Math.min(0, t.pnl || 0),
          0
        );

        return (
          <div
            key={column.id}
            className={cn("glass-card border-t-4", column.color)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{column.title}</h4>
                <span className="text-sm text-muted-foreground">
                  {columnTrades.length} trades
                </span>
              </div>
              {totalLoss < 0 && (
                <p className="text-sm text-loss mt-1">
                  Impact: ₹{Math.abs(totalLoss).toLocaleString()}
                </p>
              )}
            </div>

            {/* Column Content */}
            <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
              {columnTrades.length > 0 ? (
                columnTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                  >
                    {/* Trade Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-6 h-6 rounded flex items-center justify-center",
                            trade.trade_type === "BUY"
                              ? "bg-profit/10"
                              : "bg-loss/10"
                          )}
                        >
                          {trade.trade_type === "BUY" ? (
                            <ArrowUpRight className="w-3 h-3 text-profit" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3 text-loss" />
                          )}
                        </div>
                        <span className="font-medium text-sm">
                          {trade.symbol}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => onTradeClick(trade)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* P&L */}
                    <p
                      className={cn(
                        "font-semibold text-sm mb-2",
                        (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      P&L: {(trade.pnl || 0) >= 0 ? "+" : ""}₹
                      {Math.abs(trade.pnl || 0).toLocaleString()}
                    </p>

                    {/* Mistakes */}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Mistakes:</p>
                      <div className="flex flex-wrap gap-1">
                        {trade.mistakes.map((mistake) => (
                          <span
                            key={mistake.id}
                            className="px-2 py-0.5 text-xs rounded bg-loss/10 text-loss border border-loss/20"
                          >
                            {mistake.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No trades in this category</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
