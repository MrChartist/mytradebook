import { useState } from "react";
import {
  TrendingUp,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Target,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Trade {
  id: string;
  symbol: string;
  segment: "Equity_Intraday" | "Equity_Positional" | "Futures" | "Options";
  tradeType: "BUY" | "SELL";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  targets: number[];
  status: "OPEN" | "CLOSED";
  rating: number;
  confidenceScore: number;
  pnl: number;
  createdAt: string;
}

const trades: Trade[] = [
  {
    id: "1",
    symbol: "RELIANCE",
    segment: "Equity_Positional",
    tradeType: "BUY",
    quantity: 100,
    entryPrice: 2400,
    currentPrice: 2485,
    stopLoss: 2350,
    targets: [2500, 2600],
    status: "OPEN",
    rating: 9,
    confidenceScore: 4,
    pnl: 8500,
    createdAt: "2025-02-01",
  },
  {
    id: "2",
    symbol: "NIFTY 24JAN 22000CE",
    segment: "Options",
    tradeType: "BUY",
    quantity: 50,
    entryPrice: 180,
    currentPrice: 245,
    stopLoss: 130,
    targets: [280, 350],
    status: "OPEN",
    rating: 8,
    confidenceScore: 3,
    pnl: 3250,
    createdAt: "2025-02-02",
  },
  {
    id: "3",
    symbol: "BANKNIFTY FUT",
    segment: "Futures",
    tradeType: "BUY",
    quantity: 25,
    entryPrice: 48200,
    currentPrice: 48650,
    stopLoss: 47800,
    targets: [49000, 49500],
    status: "OPEN",
    rating: 9,
    confidenceScore: 5,
    pnl: 11250,
    createdAt: "2025-02-03",
  },
  {
    id: "4",
    symbol: "TATASTEEL",
    segment: "Equity_Intraday",
    tradeType: "SELL",
    quantity: 500,
    entryPrice: 135,
    currentPrice: 132,
    stopLoss: 140,
    targets: [128, 125],
    status: "CLOSED",
    rating: 8,
    confidenceScore: 4,
    pnl: 1500,
    createdAt: "2025-02-01",
  },
  {
    id: "5",
    symbol: "INFY",
    segment: "Equity_Positional",
    tradeType: "BUY",
    quantity: 150,
    entryPrice: 1580,
    currentPrice: 1545,
    stopLoss: 1520,
    targets: [1650, 1720],
    status: "OPEN",
    rating: 8,
    confidenceScore: 3,
    pnl: -5250,
    createdAt: "2025-01-28",
  },
];

const segmentColors: Record<string, string> = {
  Equity_Intraday: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Equity_Positional: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Futures: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Options: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function Trades() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">(
    "ALL"
  );

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.symbol
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || trade.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPnl = filteredTrades.reduce((acc, t) => acc + t.pnl, 0);
  const openTrades = filteredTrades.filter((t) => t.status === "OPEN");

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
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4 mr-2" />
            New Trade
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total P&L</p>
          <p
            className={cn(
              "text-2xl font-bold",
              totalPnl >= 0 ? "text-profit" : "text-loss"
            )}
          >
            {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toLocaleString()}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Open Positions</p>
          <p className="text-2xl font-bold">{openTrades.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Capital at Risk</p>
          <p className="text-2xl font-bold">₹2,85,000</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Avg Rating</p>
          <p className="text-2xl font-bold text-warning">8.4/10</p>
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
          <Button variant="outline" size="sm" className="border-border">
            <Filter className="w-4 h-4 mr-1" />
            Segment
          </Button>
        </div>
      </div>

      {/* Trades Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Symbol
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Segment
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Entry
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Current
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  SL / Targets
                </th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                  Rating
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                  P&L
                </th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-border/50 hover:bg-accent/50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          trade.tradeType === "BUY"
                            ? "bg-profit/10"
                            : "bg-loss/10"
                        )}
                      >
                        {trade.tradeType === "BUY" ? (
                          <ArrowUpRight className="w-4 h-4 text-profit" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-loss" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{trade.symbol}</p>
                        <p className="text-xs text-muted-foreground">
                          {trade.quantity} qty
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cn(
                        "px-2 py-1 rounded-md text-xs font-medium border",
                        segmentColors[trade.segment]
                      )}
                    >
                      {trade.segment.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 font-mono">
                    ₹{trade.entryPrice.toLocaleString()}
                  </td>
                  <td className="p-4 font-mono">
                    ₹{trade.currentPrice.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-loss flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {trade.stopLoss}
                      </span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-profit flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {trade.targets[0]}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="font-medium">{trade.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        / {trade.confidenceScore}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <p
                      className={cn(
                        "font-semibold",
                        trade.pnl >= 0 ? "text-profit" : "text-loss"
                      )}
                    >
                      {trade.pnl >= 0 ? "+" : ""}₹{trade.pnl.toLocaleString()}
                    </p>
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTrades.length === 0 && (
        <div className="glass-card p-12 text-center">
          <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No trades found</h3>
          <p className="text-muted-foreground mb-4">
            Start tracking your trades to build your journal
          </p>
          <Button className="bg-gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Trade
          </Button>
        </div>
      )}
    </div>
  );
}
