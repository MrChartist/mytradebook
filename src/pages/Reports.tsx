import {
  BarChart3,
  Calendar,
  Download,
  Send,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  segments: {
    name: string;
    trades: number;
    pnl: number;
    winRate: number;
    bestSetup: string;
    commonMistake: string;
  }[];
  totalPnl: number;
  totalTrades: number;
  overallWinRate: number;
}

const reports: WeeklyReport[] = [
  {
    id: "1",
    weekStart: "2025-01-27",
    weekEnd: "2025-02-02",
    segments: [
      {
        name: "Equity Intraday",
        trades: 15,
        pnl: 18500,
        winRate: 60,
        bestSetup: "Cup & Handle",
        commonMistake: "FOMO Entry",
      },
      {
        name: "Equity Positional",
        trades: 5,
        pnl: 32000,
        winRate: 80,
        bestSetup: "Breakout",
        commonMistake: "None",
      },
      {
        name: "Futures",
        trades: 8,
        pnl: -5000,
        winRate: 37.5,
        bestSetup: "Pullback",
        commonMistake: "Oversize",
      },
      {
        name: "Options",
        trades: 12,
        pnl: 25000,
        winRate: 58,
        bestSetup: "Gap & Go",
        commonMistake: "Early Exit",
      },
    ],
    totalPnl: 70500,
    totalTrades: 40,
    overallWinRate: 62.5,
  },
  {
    id: "2",
    weekStart: "2025-01-20",
    weekEnd: "2025-01-26",
    segments: [
      {
        name: "Equity Intraday",
        trades: 12,
        pnl: 8500,
        winRate: 58,
        bestSetup: "Double Bottom",
        commonMistake: "Moved SL",
      },
      {
        name: "Equity Positional",
        trades: 3,
        pnl: 15000,
        winRate: 66.7,
        bestSetup: "Cup & Handle",
        commonMistake: "None",
      },
      {
        name: "Futures",
        trades: 6,
        pnl: -12000,
        winRate: 33,
        bestSetup: "Breakout",
        commonMistake: "FOMO Entry",
      },
      {
        name: "Options",
        trades: 10,
        pnl: 18000,
        winRate: 50,
        bestSetup: "Pullback",
        commonMistake: "No Plan",
      },
    ],
    totalPnl: 29500,
    totalTrades: 31,
    overallWinRate: 54.8,
  },
];

export default function Reports() {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Weekly Reports</h1>
          <p className="text-muted-foreground">
            Auto-generated performance summaries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <BarChart3 className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-6">
        {reports.map((report) => (
          <div key={report.id} className="glass-card overflow-hidden">
            {/* Report Header */}
            <div className="p-5 border-b border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">
                  Week: {formatDate(report.weekStart)} -{" "}
                  {formatDate(report.weekEnd)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {report.totalTrades} trades executed
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net P&L</p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      report.totalPnl >= 0 ? "text-profit" : "text-loss"
                    )}
                  >
                    {report.totalPnl >= 0 ? "+" : ""}₹
                    {report.totalPnl.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p
                    className={cn(
                      "text-xl font-bold",
                      report.overallWinRate >= 50 ? "text-profit" : "text-loss"
                    )}
                  >
                    {report.overallWinRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Segments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
              {report.segments.map((segment) => (
                <div key={segment.name} className="p-5">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">
                    {segment.name}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">P&L</span>
                      <span
                        className={cn(
                          "font-semibold",
                          segment.pnl >= 0 ? "text-profit" : "text-loss"
                        )}
                      >
                        {segment.pnl >= 0 ? "+" : ""}₹
                        {segment.pnl.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Win Rate</span>
                      <span
                        className={cn(
                          "font-semibold",
                          segment.winRate >= 50 ? "text-profit" : "text-loss"
                        )}
                      >
                        {segment.winRate}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Trades</span>
                      <span className="font-semibold">{segment.trades}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs">
                        <Award className="w-3 h-3 text-warning" />
                        <span className="text-muted-foreground">Best:</span>
                        <span className="font-medium">{segment.bestSetup}</span>
                      </div>
                      {segment.commonMistake !== "None" && (
                        <div className="flex items-center gap-1 text-xs mt-1">
                          <AlertTriangle className="w-3 h-3 text-loss" />
                          <span className="text-muted-foreground">
                            Mistake:
                          </span>
                          <span className="font-medium text-loss">
                            {segment.commonMistake}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Report Actions */}
            <div className="p-4 bg-accent/30 flex justify-end gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <Send className="w-4 h-4 mr-2" />
                Send to Telegram
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
