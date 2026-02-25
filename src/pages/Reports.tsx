import { useState } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Send,
  Award,
  AlertTriangle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type WeeklyReport = Database["public"]["Tables"]["weekly_reports"]["Row"];

const segmentDisplayNames: Record<string, string> = {
  Equity_Intraday: "Equity Intraday",
  Equity_Positional: "Equity Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

interface GroupedReport {
  weekStart: string;
  weekEnd: string;
  segments: WeeklyReport[];
  totalPnl: number;
  totalTrades: number;
  overallWinRate: number;
}

export default function Reports() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingTelegram, setIsSendingTelegram] = useState<string | null>(null);

  const { data: reports, isLoading } = useQuery({
    queryKey: ["weekly-reports", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("week_start", { ascending: false });

      if (error) throw error;
      return data as WeeklyReport[];
    },
    enabled: !!user,
  });

  // Group reports by week
  const groupedReports: GroupedReport[] = [];
  if (reports) {
    const weekMap = new Map<string, WeeklyReport[]>();
    
    for (const report of reports) {
      const key = `${report.week_start}_${report.week_end}`;
      if (!weekMap.has(key)) {
        weekMap.set(key, []);
      }
      weekMap.get(key)!.push(report);
    }

    for (const [key, segments] of weekMap) {
      const [weekStart, weekEnd] = key.split("_");
      const totalPnl = segments.reduce((sum, s) => sum + (s.total_pnl || 0), 0);
      const totalTrades = segments.reduce((sum, s) => sum + (s.total_trades || 0), 0);
      const totalWinning = segments.reduce((sum, s) => sum + (s.winning_trades || 0), 0);
      const overallWinRate = totalTrades > 0 ? (totalWinning / totalTrades) * 100 : 0;

      groupedReports.push({
        weekStart,
        weekEnd,
        segments,
        totalPnl,
        totalTrades,
        overallWinRate,
      });
    }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-weekly-report");
      
      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Report Generated",
          description: data.reportsCreated?.length > 0 
            ? `Created reports for: ${data.reportsCreated.join(", ")}`
            : "No trades found for this week",
        });
        queryClient.invalidateQueries({ queryKey: ["weekly-reports"] });
      }
    } catch (error) {
      console.error("Generate report error:", error);
      toast({
        title: "Failed to generate report",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToTelegram = async (report: GroupedReport) => {
    const key = `${report.weekStart}_${report.weekEnd}`;
    setIsSendingTelegram(key);
    try {
      // Build message
      const segmentBreakdown = report.segments
        .map((seg) => {
          const emoji = (seg.total_pnl || 0) >= 0 ? "📈" : "📉";
          const name = segmentDisplayNames[seg.segment] || seg.segment;
          return `${emoji} *${name}*: ${(seg.total_pnl || 0) >= 0 ? "+" : ""}₹${(seg.total_pnl || 0).toLocaleString()} (${seg.total_trades} trades)`;
        })
        .join("\n");

      const overallEmoji = report.totalPnl >= 0 ? "🎉" : "📊";
      const message = `${overallEmoji} *Weekly Report*\n` +
        `📅 ${report.weekStart} to ${report.weekEnd}\n\n` +
        `*Overall Performance*\n` +
        `💰 Net P&L: ${report.totalPnl >= 0 ? "+" : ""}₹${report.totalPnl.toLocaleString()}\n` +
        `📊 Win Rate: ${report.overallWinRate.toFixed(1)}%\n` +
        `📈 Total Trades: ${report.totalTrades}\n\n` +
        `*Segment Breakdown*\n${segmentBreakdown}`;

      const { error } = await supabase.functions.invoke("telegram-notify", {
        body: { message, parseMode: "Markdown" },
      });

      if (error) throw error;

      toast({
        title: "Report Sent",
        description: "Weekly report has been sent to Telegram.",
      });
    } catch (error) {
      console.error("Send to Telegram error:", error);
      toast({
        title: "Failed to send",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSendingTelegram(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Weekly Reports</h1>
            <p className="text-muted-foreground">Auto-generated performance summaries</p>
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

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
          <Button
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Reports List */}
      {groupedReports.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
          <p className="text-muted-foreground mb-4">
            Weekly reports are generated automatically every Monday at 6 AM IST.
            You can also generate one manually.
          </p>
          <Button
            className="bg-gradient-primary"
            onClick={handleGenerateReport}
            disabled={isGenerating}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Now
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedReports.map((report) => {
            const reportKey = `${report.weekStart}_${report.weekEnd}`;
            return (
              <div key={reportKey} className="glass-card overflow-hidden">
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
                        {report.overallWinRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Segments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
                  {report.segments.map((segment) => {
                    const topSetups = (segment.top_setups as { name: string; count: number }[] | null) || [];
                    const commonMistakes = (segment.common_mistakes as { name: string; count: number }[] | null) || [];
                    
                    return (
                      <div key={segment.segment} className="p-5">
                        <h4 className="font-medium text-sm text-muted-foreground mb-3">
                          {segmentDisplayNames[segment.segment] || segment.segment}
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">P&L</span>
                            <span
                              className={cn(
                                "font-semibold",
                                (segment.total_pnl || 0) >= 0 ? "text-profit" : "text-loss"
                              )}
                            >
                              {(segment.total_pnl || 0) >= 0 ? "+" : ""}₹
                              {(segment.total_pnl || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Win Rate</span>
                            <span
                              className={cn(
                                "font-semibold",
                                (segment.win_rate || 0) >= 50 ? "text-profit" : "text-loss"
                              )}
                            >
                              {(segment.win_rate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Trades</span>
                            <span className="font-semibold">{segment.total_trades}</span>
                          </div>
                          <div className="pt-2 border-t border-border/50">
                            {topSetups.length > 0 && (
                              <div className="flex items-center gap-1 text-xs">
                                <Award className="w-3 h-3 text-warning" />
                                <span className="text-muted-foreground">Best:</span>
                                <span className="font-medium">{topSetups[0]?.name || "N/A"}</span>
                              </div>
                            )}
                            {commonMistakes.length > 0 && (
                              <div className="flex items-center gap-1 text-xs mt-1">
                                <AlertTriangle className="w-3 h-3 text-loss" />
                                <span className="text-muted-foreground">Mistake:</span>
                                <span className="font-medium text-loss">
                                  {commonMistakes[0]?.name || "None"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Report Actions */}
                <div className="p-4 bg-accent/30 flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="border-border">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border"
                    onClick={() => handleSendToTelegram(report)}
                    disabled={isSendingTelegram === reportKey}
                  >
                    {isSendingTelegram === reportKey ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send to Telegram
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
