import { useState } from "react";
import {
  TrendingUp,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTrades, type TradeFilters } from "@/hooks/useTrades";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { TradeDetailModal } from "@/components/modals/TradeDetailModal";
import type { Trade } from "@/hooks/useTrades";

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Equity Intraday",
  Equity_Positional: "Equity Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

export default function Trades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [segmentFilter, setSegmentFilter] = useState<string>("ALL");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const filters: TradeFilters = {
    ...(statusFilter !== "ALL" && { status: statusFilter }),
    ...(segmentFilter !== "ALL" && { segment: segmentFilter as TradeFilters["segment"] }),
    ...(searchQuery && { symbol: searchQuery }),
  };

  const { trades, isLoading, summary } = useTrades(filters);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Trades</h1>
          <p className="text-muted-foreground">
            Track and manage your positions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            Sync with Dhan
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <p
              className={cn(
                "text-2xl font-bold",
                summary.totalPnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {summary.totalPnl >= 0 ? "+" : ""}₹{summary.totalPnl.toLocaleString()}
            </p>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Open Positions</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{summary.openPositions}</p>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Trades Today</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold">{summary.closedToday}</p>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Win Rate</p>
          {isLoading ? (
            <Skeleton className="h-8 w-20 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-warning">
              {summary.winRate.toFixed(1)}%
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "OPEN", "CLOSED"] as const).map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={cn(
                "border-border",
                statusFilter === status &&
                  "bg-primary/10 border-primary/20 text-primary"
              )}
            >
              {status === "ALL" ? "All" : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[160px] border-border">
              <SelectValue placeholder="Segment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Segments</SelectItem>
              {Object.entries(segmentLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trades Table */}
      {isLoading ? (
        <div className="glass-card p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : trades.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Symbol
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Qty
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Entry
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Current
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Rating
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    P&L
                  </th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const targets = (trade.targets as number[]) || [];
                  const entryDate = new Date(trade.entry_time);
                  return (
                    <tr
                      key={trade.id}
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTrade(trade)}
                    >
                      {/* Date */}
                      <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                        {entryDate.toLocaleDateString("en-IN", { 
                          day: "2-digit", 
                          month: "short" 
                        })}
                      </td>
                      {/* Symbol */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              trade.trade_type === "BUY"
                                ? "bg-profit/10"
                                : "bg-loss/10"
                            )}
                          >
                            {trade.trade_type === "BUY" ? (
                              <ArrowUpRight className="w-4 h-4 text-profit" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-loss" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{trade.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {segmentLabels[trade.segment] || trade.segment}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Type */}
                      <td className="p-4">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-md text-xs font-medium",
                            trade.trade_type === "BUY"
                              ? "bg-profit/10 text-profit"
                              : "bg-loss/10 text-loss"
                          )}
                        >
                          {trade.trade_type}
                        </span>
                      </td>
                      {/* Qty */}
                      <td className="p-4 font-mono text-sm">
                        {trade.quantity}
                      </td>
                      {/* Entry */}
                      <td className="p-4 font-mono text-sm">
                        ₹{trade.entry_price.toLocaleString()}
                      </td>
                      {/* Current */}
                      <td className="p-4 font-mono text-sm">
                        ₹{(trade.current_price || trade.entry_price).toLocaleString()}
                      </td>
                      {/* Rating */}
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="font-medium">{trade.rating || "—"}/10</span>
                        </div>
                      </td>
                      {/* P&L */}
                      <td className="p-4 text-right">
                        <div>
                          <p
                            className={cn(
                              "font-semibold",
                              (trade.pnl || 0) >= 0 ? "text-profit" : "text-loss"
                            )}
                          >
                            {(trade.pnl || 0) >= 0 ? "+" : ""}₹
                            {Math.abs(trade.pnl || 0).toLocaleString()}
                          </p>
                          <p
                            className={cn(
                              "text-xs",
                              (trade.pnl_percent || 0) >= 0 ? "text-profit" : "text-loss"
                            )}
                          >
                            {(trade.pnl_percent || 0) >= 0 ? "+" : ""}
                            {(trade.pnl_percent || 0).toFixed(2)}%
                          </p>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1",
                            trade.status === "OPEN"
                              ? "bg-profit/10 text-profit"
                              : trade.status === "CLOSED"
                              ? "bg-muted text-muted-foreground"
                              : "bg-warning/10 text-warning"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              trade.status === "OPEN"
                                ? "bg-profit"
                                : trade.status === "CLOSED"
                                ? "bg-muted-foreground"
                                : "bg-warning"
                            )}
                          />
                          {trade.status}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTrade(trade);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No trades found</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your trades to build your journal
          </p>
          <Button 
            className="bg-gradient-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateTradeModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}
