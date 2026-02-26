/**
 * Utility to export trade data to CSV format.
 */

export interface ExportableTrade {
    symbol: string;
    segment: string;
    trade_type: string;
    status: string;
    entry_price: number | null;
    exit_price: number | null;
    stop_loss: number | null;
    quantity: number;
    pnl: number | null;
    pnl_percent: number | null;
    entry_time: string;
    exit_time: string | null;
    notes: string | null;
    tags: string[] | null;
}

const CSV_HEADERS = [
    "Symbol",
    "Segment",
    "Direction",
    "Status",
    "Entry Price",
    "Exit Price",
    "Stop Loss",
    "Quantity",
    "P&L (₹)",
    "P&L (%)",
    "Entry Date",
    "Exit Date",
    "Notes",
    "Tags",
];

function escapeCSV(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export function tradesToCSV(trades: ExportableTrade[]): string {
    const rows = trades.map((t) => [
        t.symbol,
        t.segment,
        t.trade_type,
        t.status,
        t.entry_price,
        t.exit_price,
        t.stop_loss,
        t.quantity,
        t.pnl,
        t.pnl_percent ? Number(t.pnl_percent).toFixed(2) : "",
        t.entry_time ? new Date(t.entry_time).toLocaleDateString("en-IN") : "",
        t.exit_time ? new Date(t.exit_time).toLocaleDateString("en-IN") : "",
        t.notes,
        t.tags?.join("; ") ?? "",
    ]);

    const header = CSV_HEADERS.map(escapeCSV).join(",");
    const body = rows.map((row) => row.map(escapeCSV).join(",")).join("\n");
    return `${header}\n${body}`;
}

export function downloadCSV(csv: string, filename: string) {
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
