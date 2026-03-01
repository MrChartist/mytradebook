import { useState, useRef } from "react";
import { format } from "date-fns";
import { Download, Share2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Trade } from "@/hooks/useTrades";

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Intraday",
  Equity_Positional: "Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "MCX",
};

interface ShareableTradeCardProps {
  trade: Trade;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareableTradeCard({ trade, open, onOpenChange }: ShareableTradeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const pnl = trade.pnl || 0;
  const pnlPct = trade.pnl_percent || 0;
  const isProfit = pnl >= 0;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      // Use html2canvas-like approach via canvas
      const card = cardRef.current;
      const canvas = document.createElement("canvas");
      const scale = 2;
      canvas.width = card.offsetWidth * scale;
      canvas.height = card.offsetHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (isProfit) {
        gradient.addColorStop(0, "#0a1a10");
        gradient.addColorStop(1, "#0d2818");
      } else {
        gradient.addColorStop(0, "#1a0a0a");
        gradient.addColorStop(1, "#280d0d");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw content
      ctx.scale(scale, scale);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("TradeBook", 24, 32);

      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(format(new Date(trade.entry_time), "MMM d, yyyy"), 24, 50);

      // Symbol
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(trade.symbol, 24, 90);

      // Segment badge
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      const segText = segmentLabels[trade.segment] || trade.segment;
      const segWidth = ctx.measureText(segText).width + 16;
      ctx.fillRect(24, 100, segWidth, 22);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(segText, 32, 115);

      // P&L
      ctx.fillStyle = isProfit ? "#4ade80" : "#f87171";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, sans-serif";
      const pnlText = `${isProfit ? "+" : ""}₹${Math.abs(pnl).toLocaleString("en-IN")}`;
      ctx.fillText(pnlText, 24, 165);

      // P&L percent
      ctx.font = "18px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(`${isProfit ? "+" : ""}${pnlPct.toFixed(2)}%`, 24, 190);

      // Details
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, sans-serif";
      const details = [
        `${trade.trade_type} @ ₹${trade.entry_price?.toLocaleString("en-IN") || "–"}`,
        `Qty: ${trade.quantity}`,
        trade.stop_loss ? `SL: ₹${trade.stop_loss.toLocaleString("en-IN")}` : "",
      ].filter(Boolean);
      details.forEach((d, i) => ctx.fillText(d, 24, 220 + i * 16));

      // Watermark
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.font = "10px -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText("mytradebook.lovable.app", 24, canvas.height / scale - 16);

      // Download
      const link = document.createElement("a");
      link.download = `trade-${trade.symbol}-${format(new Date(trade.entry_time), "yyyyMMdd")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    const text = `${isProfit ? "🟢" : "🔴"} ${trade.symbol} | ${trade.trade_type}\n${isProfit ? "+" : ""}₹${Math.abs(pnl).toLocaleString("en-IN")} (${isProfit ? "+" : ""}${pnlPct.toFixed(2)}%)\n\nTracked with TradeBook`;

    if (navigator.share) {
      await navigator.share({ text });
    } else {
      await navigator.clipboard.writeText(text);
      // toast handled by caller
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-base">Share Trade</DialogTitle>
        </DialogHeader>

        {/* Visual Card */}
        <div className="px-4">
          <div
            ref={cardRef}
            className={cn(
              "rounded-xl p-6 text-white relative overflow-hidden",
              isProfit
                ? "bg-gradient-to-br from-[#0a1a10] to-[#0d2818]"
                : "bg-gradient-to-br from-[#1a0a0a] to-[#280d0d]"
            )}
            style={{ minHeight: 280 }}
          >
            {/* Decorative circles */}
            <div className={cn("absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10", isProfit ? "bg-green-400" : "bg-red-400")} />
            <div className={cn("absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-5", isProfit ? "bg-green-400" : "bg-red-400")} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold opacity-70">TradeBook</span>
                <span className="text-[10px] opacity-50">{format(new Date(trade.entry_time), "MMM d, yyyy")}</span>
              </div>

              <h3 className="text-2xl font-bold mt-3">{trade.symbol}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 mt-1 inline-block">
                {segmentLabels[trade.segment] || trade.segment} • {trade.trade_type}
              </span>

              <div className="mt-5">
                <p className={cn("text-3xl font-bold", isProfit ? "text-green-400" : "text-red-400")}>
                  {isProfit ? "+" : ""}₹{Math.abs(pnl).toLocaleString("en-IN")}
                </p>
                <p className={cn("text-lg", isProfit ? "text-green-400/80" : "text-red-400/80")}>
                  {isProfit ? "+" : ""}{pnlPct.toFixed(2)}%
                </p>
              </div>

              <div className="mt-4 flex gap-4 text-[10px] opacity-50">
                <span>Entry: ₹{trade.entry_price?.toLocaleString("en-IN") || "–"}</span>
                <span>Qty: {trade.quantity}</span>
                {trade.stop_loss && <span>SL: ₹{trade.stop_loss.toLocaleString("en-IN")}</span>}
              </div>

              <p className="text-[9px] opacity-20 mt-6">mytradebook.lovable.app</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Copy Text
          </Button>
          <Button className="flex-1" onClick={handleDownload} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
