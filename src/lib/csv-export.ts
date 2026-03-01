import type { Trade } from "@/hooks/useTrades";
import { format } from "date-fns";

const TRADE_CSV_HEADERS = [
  "Symbol",
  "Segment",
  "Type",
  "Status",
  "Entry Price",
  "Current Price",
  "Quantity",
  "Stop Loss",
  "P&L",
  "P&L %",
  "Entry Time",
  "Closed At",
  "Closure Reason",
  "Timeframe",
  "Holding Period",
  "Confidence",
  "Rating",
  "Notes",
];

function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function tradesToCSV(trades: Trade[]): string {
  const rows = trades.map((t) => [
    escapeCSV(t.symbol),
    escapeCSV(t.segment),
    escapeCSV(t.trade_type),
    escapeCSV(t.status),
    t.entry_price ?? "",
    t.current_price ?? "",
    t.quantity,
    t.stop_loss ?? "",
    t.pnl ?? "",
    t.pnl_percent ? Number(t.pnl_percent).toFixed(2) : "",
    t.entry_time ? format(new Date(t.entry_time), "yyyy-MM-dd HH:mm") : "",
    t.closed_at ? format(new Date(t.closed_at), "yyyy-MM-dd HH:mm") : "",
    escapeCSV(t.closure_reason),
    escapeCSV(t.timeframe),
    escapeCSV(t.holding_period),
    t.confidence_score ?? "",
    t.rating ?? "",
    escapeCSV(t.notes),
  ]);

  return [TRADE_CSV_HEADERS.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
