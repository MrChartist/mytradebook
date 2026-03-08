import { useState } from "react";
import { PlanGate } from "@/components/PlanGate";
import {
  BarChart3,
  Calendar,
  Download,
  Send,
  Award,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PnlShareModal } from "@/components/sharing/PnlShareModal";
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
      if (!weekMap.has(key)) weekMap.set(key, []);
      weekMap.get(key)!.push(report);
    }
    for (const [key, segments] of weekMap) {
      const [weekStart, weekEnd] = key.split("_");
      const totalPnl = segments.reduce((sum, s) => sum + (s.total_pnl || 0), 0);
      const totalTrades = segments.reduce((sum, s) => sum + (s.total_trades || 0), 0);
      const totalWinning = segments.reduce((sum, s) => sum + (s.winning_trades || 0), 0);
      const overallWinRate = totalTrades > 0 ? (totalWinning / totalTrades) * 100 : 0;
      groupedReports.push({ weekStart, weekEnd, segments, totalPnl, totalTrades, overallWinRate });
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
      toast({ title: "Failed to generate report", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendToTelegram = async (report: GroupedReport) => {
    const key = `${report.weekStart}_${report.weekEnd}`;
    setIsSendingTelegram(key);
    try {
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

      const { error } = await supabase.functions.invoke("telegram-notify", { body: { message, parseMode: "Markdown" } });
      if (error) throw error;
      toast({ title: "Report Sent", description: "Weekly report has been sent to Telegram." });
    } catch (error) {
      console.error("Send to Telegram error:", error);
      toast({ title: "Failed to send", description: error instanceof Error ? error.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsSendingTelegram(null);
    }
  };

  const handleDownloadPdf = (report: GroupedReport) => {
    const segmentRows = report.segments
      .map((seg) => {
        const name = segmentDisplayNames[seg.segment] || seg.segment;
        const pnl = seg.total_pnl || 0;
        return `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${pnl >= 0 ? '#16a34a' : '#dc2626'};font-weight:600">${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString()}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${(seg.win_rate || 0).toFixed(1)}%</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb">${seg.total_trades}</td>
        </tr>`;
      })
      .join("");

    const htmlContent = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>TradeBook Weekly Report</title>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:40px;color:#1f2937;background:#fff}
  .header{text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px solid #f97316}
  .header h1{font-size:24px;margin:0 0 4px;color:#f97316}
  .header p{font-size:14px;color:#6b7280;margin:0}
  .summary{display:flex;justify-content:center;gap:48px;margin:24px 0 32px}
  .stat{text-align:center}
  .stat .value{font-size:28px;font-weight:700}
  .stat .label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-top:4px}
  table{width:100%;border-collapse:collapse;margin-top:16px}
  th{text-align:left;padding:8px 12px;background:#f9fafb;border-bottom:2px solid #e5e7eb;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280}
  .footer{margin-top:40px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px}
  @media print{body{padding:20px}}
</style></head><body>
  <div class="header">
    <h1>📊 TradeBook Weekly Report</h1>
    <p>${formatDate(report.weekStart)} — ${formatDate(report.weekEnd)}</p>
  </div>
  <div class="summary">
    <div class="stat">
      <div class="value" style="color:${report.totalPnl >= 0 ? '#16a34a' : '#dc2626'}">${report.totalPnl >= 0 ? '+' : ''}₹${report.totalPnl.toLocaleString()}</div>
      <div class="label">Net P&L</div>
    </div>
    <div class="stat">
      <div class="value">${report.overallWinRate.toFixed(1)}%</div>
      <div class="label">Win Rate</div>
    </div>
    <div class="stat">
      <div class="value">${report.totalTrades}</div>
      <div class="label">Total Trades</div>
    </div>
  </div>
  <h2 style="font-size:16px;margin-bottom:8px">Segment Breakdown</h2>
  <table>
    <thead><tr><th>Segment</th><th>P&L</th><th>Win Rate</th><th>Trades</th></tr></thead>
    <tbody>${segmentRows}</tbody>
  </table>
  <div class="footer">
    Generated by TradeBook · ${new Date().toLocaleString("en-IN")} · Not SEBI registered
  </div>
</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 500);
    }

    toast({ title: "Print dialog opened", description: "Choose 'Save as PDF' to download your report." });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <PageHeader title="Weekly Reports" subtitle="Auto-generated performance summaries">
          <Skeleton className="h-10 w-40" />
        </PageHeader>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PlanGate plan="pro" feature="weeklyReports" message="Upgrade to Pro to access weekly performance reports.">
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Weekly Reports" subtitle="Auto-generated performance summaries">
        <PnlShareModal
          defaultPeriod="this_week"
          trigger={
            <Button variant="outline" className="border-border">
              <Share2 className="w-4 h-4 mr-2" />
              Share Card
            </Button>
          }
        />
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
      </PageHeader>

      {/* Reports List */}
      {groupedReports.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No reports yet"
          description="Weekly reports are generated automatically every Monday at 6 AM IST. You can also generate one manually."
          createLabel="Generate Now"
          onCreate={handleGenerateReport}
          steps={["Trade during the week", "Generate or wait for Monday", "Review & share"]}
          hint="Reports break down performance by segment with top setups and common mistakes"
        />
      ) : (
        <div className="space-y-4">
          {groupedReports.map((report) => {
            const reportKey = `${report.weekStart}_${report.weekEnd}`;
            return (
              <div key={reportKey} className="premium-card-hover !p-0 overflow-hidden">
                {/* Report Header */}
                <div className="p-4 border-b border-border/15 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-semibold">
                      Week: {formatDate(report.weekStart)} – {formatDate(report.weekEnd)}
                    </h3>
                    <p className="text-[11px] text-muted-foreground/50">{report.totalTrades} trades executed</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Net P&L</p>
                      <p className={cn("text-lg font-bold font-mono", report.totalPnl >= 0 ? "text-profit" : "text-loss")}>
                        {report.totalPnl >= 0 ? "+" : ""}₹{report.totalPnl.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground/50 uppercase tracking-wider font-medium">Win Rate</p>
                      <p className={cn("text-lg font-bold font-mono", report.overallWinRate >= 50 ? "text-profit" : "text-loss")}>
                        {report.overallWinRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Segments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/15">
                  {report.segments.map((segment) => {
                    const topSetups = (segment.top_setups as { name: string; count: number }[] | null) || [];
                    const commonMistakes = (segment.common_mistakes as { name: string; count: number }[] | null) || [];
                    return (
                      <div key={segment.segment} className="p-4">
                        <h4 className="font-medium text-[11px] text-muted-foreground/60 uppercase tracking-wider mb-2.5">
                          {segmentDisplayNames[segment.segment] || segment.segment}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-muted-foreground/50">P&L</span>
                            <span className={cn("font-semibold font-mono text-[13px]", (segment.total_pnl || 0) >= 0 ? "text-profit" : "text-loss")}>
                              {(segment.total_pnl || 0) >= 0 ? "+" : ""}₹{(segment.total_pnl || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-muted-foreground/50">Win Rate</span>
                            <span className={cn("font-semibold font-mono text-[13px]", (segment.win_rate || 0) >= 50 ? "text-profit" : "text-loss")}>
                              {(segment.win_rate || 0).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-muted-foreground/50">Trades</span>
                            <span className="font-semibold font-mono text-[13px]">{segment.total_trades}</span>
                          </div>
                          <div className="pt-2 border-t border-border/15">
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
                                <span className="font-medium text-loss">{commonMistakes[0]?.name || "None"}</span>
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
                  <Button variant="outline" size="sm" className="border-border" onClick={() => handleDownloadPdf(report)}>
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
    </PlanGate>
  );
}
