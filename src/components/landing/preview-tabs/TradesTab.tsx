import { cn } from "@/lib/utils";
import { Home, ChevronRight, Filter, Download, Plus } from "lucide-react";

const trades = [
  { symbol: "RELIANCE", type: "Long", segment: "Equity", entry: "₹2,890", exit: "₹2,945", qty: 50, pnl: "+₹2,750", pnlPercent: "+1.9%", status: "Closed", up: true },
  { symbol: "NIFTY 24500 CE", type: "Long", segment: "Options", entry: "₹185", exit: "—", qty: 100, pnl: "+₹1,200", pnlPercent: "+6.5%", status: "Open", up: true },
  { symbol: "BANKNIFTY FUT", type: "Short", segment: "Futures", entry: "₹51,800", exit: "₹51,440", qty: 15, pnl: "+₹5,400", pnlPercent: "+0.7%", status: "Closed", up: true },
  { symbol: "HDFCBANK", type: "Long", segment: "Equity", entry: "₹1,650", exit: "₹1,620", qty: 30, pnl: "-₹900", pnlPercent: "-1.8%", status: "Closed", up: false },
  { symbol: "TATASTEEL", type: "Long", segment: "Equity", entry: "₹142", exit: "—", qty: 200, pnl: "+₹640", pnlPercent: "+2.3%", status: "Open", up: true },
  { symbol: "GOLD APR FUT", type: "Long", segment: "Commodity", entry: "₹71,200", exit: "₹71,850", qty: 1, pnl: "+₹650", pnlPercent: "+0.9%", status: "Closed", up: true },
];

export function TradesTab() {
  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground mb-2 sm:mb-3">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-foreground font-medium">Trades</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
            <Filter className="w-2.5 h-2.5" />
            <span className="text-[8px]">Filter</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
            <Download className="w-2.5 h-2.5" />
            <span className="text-[8px]">Export</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
            <Plus className="w-2.5 h-2.5" />
            <span className="text-[8px] font-medium">New Trade</span>
          </div>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-3">
        {["All (18)", "Open (3)", "Closed (15)"].map((f, i) => (
          <span key={f} className={cn("px-2.5 py-1 text-[8px] sm:text-[9px] font-medium rounded-full border transition-colors", i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground")}>{f}</span>
        ))}
      </div>

      {/* Trade table */}
      <div className="rounded-xl border border-border/20 bg-card overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1.5fr_0.7fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-1 px-3 py-2 bg-muted/30 border-b border-border/15">
          {["Symbol", "Segment", "Entry", "Exit", "P&L", "Status"].map((h) => (
            <p key={h} className="text-[7px] uppercase tracking-wider text-muted-foreground font-semibold">{h}</p>
          ))}
        </div>
        {/* Rows */}
        {trades.map((t, i) => (
          <div key={i} className={cn(
            "grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_0.7fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-1 px-3 py-2 border-b border-border/10 last:border-0 hover:bg-muted/20 transition-colors items-center"
          )}>
            {/* Mobile: stacked symbol+segment */}
            <div className="sm:contents">
              <div>
                <p className="text-[9px] sm:text-[10px] font-semibold">{t.symbol}</p>
                <p className="text-[7px] text-muted-foreground sm:hidden">{t.segment} · {t.type}</p>
              </div>
              <p className="hidden sm:block text-[8px] text-muted-foreground">{t.segment}</p>
              <p className="hidden sm:block text-[8px] font-mono text-foreground/80">{t.entry}</p>
              <p className="hidden sm:block text-[8px] font-mono text-foreground/80">{t.exit}</p>
            </div>
            <div className="text-right sm:text-left">
              <p className={cn("text-[9px] sm:text-[10px] font-bold font-mono", t.up ? "text-profit" : "text-loss")}>{t.pnl}</p>
              <p className={cn("text-[7px] font-mono", t.up ? "text-profit/70" : "text-loss/70")}>{t.pnlPercent}</p>
            </div>
            <div className="hidden sm:block">
              <span className={cn(
                "text-[7px] px-1.5 py-0.5 rounded-full font-medium",
                t.status === "Open" ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
              )}>{t.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-2 flex items-center justify-between px-1">
        <p className="text-[8px] text-muted-foreground">Showing 6 of 18 trades</p>
        <div className="flex gap-1">
          <span className="text-[8px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">← Prev</span>
          <span className="text-[8px] px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">1</span>
          <span className="text-[8px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">2</span>
          <span className="text-[8px] px-2 py-0.5 rounded bg-muted/40 text-muted-foreground">Next →</span>
        </div>
      </div>
    </div>
  );
}
