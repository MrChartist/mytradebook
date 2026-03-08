import { cn } from "@/lib/utils";
import { Home, ChevronRight, Search } from "lucide-react";

const stocks = [
  { name: "Reliance Industries", ticker: "RELIANCE", price: "₹2,945", pe: "28.4", mcap: "₹19.9L Cr", high: 3024, low: 2220, current: 2945, sector: "Energy" },
  { name: "HDFC Bank", ticker: "HDFCBANK", price: "₹1,620", pe: "19.2", mcap: "₹12.3L Cr", high: 1794, low: 1363, current: 1620, sector: "Banking" },
  { name: "TCS", ticker: "TCS", price: "₹3,780", pe: "32.1", mcap: "₹13.7L Cr", high: 4258, low: 3311, current: 3780, sector: "IT" },
  { name: "Infosys", ticker: "INFY", price: "₹1,540", pe: "26.8", mcap: "₹6.4L Cr", high: 1953, low: 1358, current: 1540, sector: "IT" },
  { name: "Tata Steel", ticker: "TATASTEEL", price: "₹145", pe: "8.2", mcap: "₹1.8L Cr", high: 184, low: 118, current: 145, sector: "Metals" },
];

function RangeBar({ high, low, current }: { high: number; low: number; current: number }) {
  const pct = ((current - low) / (high - low)) * 100;
  return (
    <div className="w-full">
      <div className="h-1.5 rounded-full bg-muted/60 relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-loss/40 via-warning/40 to-profit/40" style={{ width: "100%" }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary border border-primary-foreground shadow-sm" style={{ left: `calc(${pct}% - 4px)` }} />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[6px] text-muted-foreground">₹{low}</span>
        <span className="text-[6px] text-muted-foreground">₹{high}</span>
      </div>
    </div>
  );
}

export function FundamentalsTab() {
  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground mb-2 sm:mb-3">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-foreground font-medium">Fundamentals</span>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/30 bg-muted/20">
          <Search className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Search stocks by name, sector…</span>
        </div>
        <div className="flex gap-1">
          {["NSE", "BSE"].map((e, i) => (
            <span key={e} className={cn("px-2 py-1 text-[8px] font-medium rounded-md border", i === 0 ? "bg-primary/10 text-primary border-primary/20" : "border-border/30 text-muted-foreground")}>{e}</span>
          ))}
        </div>
      </div>

      {/* Screener table */}
      <div className="rounded-xl border border-border/20 bg-card overflow-hidden" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1.5fr_0.7fr_0.5fr_0.7fr_1.2fr_0.6fr] gap-1 px-3 py-2 bg-muted/30 border-b border-border/15">
          {["Company", "Price", "P/E", "Market Cap", "52W Range", "Sector"].map((h) => (
            <p key={h} className="text-[7px] uppercase tracking-wider text-muted-foreground font-semibold">{h}</p>
          ))}
        </div>
        {/* Rows */}
        {stocks.map((s, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_0.7fr_0.5fr_0.7fr_1.2fr_0.6fr] gap-1 px-3 py-2 border-b border-border/10 last:border-0 hover:bg-muted/20 transition-colors items-center">
            <div>
              <p className="text-[9px] sm:text-[10px] font-semibold">{s.ticker}</p>
              <p className="text-[7px] text-muted-foreground truncate">{s.name}</p>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold font-mono text-right sm:text-left">{s.price}</p>
            <p className="hidden sm:block text-[8px] font-mono text-foreground/80">{s.pe}</p>
            <p className="hidden sm:block text-[8px] font-mono text-foreground/80">{s.mcap}</p>
            <div className="hidden sm:block">
              <RangeBar high={s.high} low={s.low} current={s.current} />
            </div>
            <div className="hidden sm:block">
              <span className="text-[7px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{s.sector}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
