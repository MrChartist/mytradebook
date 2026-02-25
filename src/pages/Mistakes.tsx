import { AlertTriangle } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";

export default function Mistakes() {
  const { trades } = useTrades();
  const closedTrades = trades.filter((t) => t.status === "CLOSED");

  const lowSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -500 && (t.pnl || 0) < 0);
  const medSeverity = closedTrades.filter((t) => (t.pnl || 0) >= -2000 && (t.pnl || 0) < -500);
  const highSeverity = closedTrades.filter((t) => (t.pnl || 0) < -2000);

  const columns = [
    { label: "Low Severity", trades: lowSeverity, color: "text-warning" },
    { label: "Medium Severity", trades: medSeverity, color: "text-loss" },
    { label: "High Severity", trades: highSeverity, color: "text-loss" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Mistakes Review</h1>
        <p className="text-muted-foreground text-sm">Identify patterns in your losing trades and avoid repeating them.</p>
      </div>

      {closedTrades.length === 0 ? (
        <div className="surface-card p-12 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No mistakes to review</h3>
          <p className="text-muted-foreground text-sm">Once you close trades with losses, they'll appear here for review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div key={col.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
                <span className="text-xs text-muted-foreground">{col.trades.length} trades</span>
              </div>
              <div className="space-y-2">
                {col.trades.length === 0 ? (
                  <div className="surface-card p-4 text-center text-sm text-muted-foreground">None</div>
                ) : (
                  col.trades.slice(0, 10).map((t) => (
                    <div key={t.id} className="surface-card p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{t.symbol}</span>
                        <span className="text-loss text-sm font-mono">₹{(t.pnl || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.segment.replace("_", " ")}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
