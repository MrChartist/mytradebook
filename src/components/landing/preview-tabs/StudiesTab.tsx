import { cn } from "@/lib/utils";
import { Home, ChevronRight, Plus, BookOpen, TrendingUp, Eye } from "lucide-react";

const studies = [
  {
    title: "NIFTY Rising Wedge Breakdown",
    symbol: "NIFTY 50",
    date: "5 Mar 2026",
    status: "Active",
    category: "Chart Pattern",
    notes: "Bearish wedge forming on daily TF. Key support at 24,100. Watching for volume confirmation…",
    color: "text-loss",
  },
  {
    title: "RELIANCE Cup & Handle",
    symbol: "RELIANCE",
    date: "3 Mar 2026",
    status: "Validated",
    category: "Chart Pattern",
    notes: "Handle forming near ₹2,950 resistance. Breakout target ₹3,120. Vol is building up on 4H…",
    color: "text-profit",
  },
  {
    title: "BANKNIFTY Expiry Day Analysis",
    symbol: "BANKNIFTY",
    date: "28 Feb 2026",
    status: "Completed",
    category: "Research",
    notes: "Studied last 12 weekly expiries. Mean range 450pts. OTM straddle writers profitable 75%…",
    color: "text-primary",
  },
  {
    title: "Gold Seasonal Pattern",
    symbol: "GOLD",
    date: "25 Feb 2026",
    status: "Active",
    category: "Seasonal",
    notes: "March historically bullish for Gold. Avg gain +2.8% over last 10 years. Currently at key…",
    color: "text-warning",
  },
];

const miniChart = (up: boolean) => {
  const points = up
    ? "0,20 8,18 16,15 24,16 32,12 40,14 48,8 56,10 64,5 72,3"
    : "0,5 8,8 16,10 24,7 32,12 40,15 48,13 56,18 64,17 72,20";
  return (
    <svg viewBox="0 0 72 24" className="w-full h-6" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={up ? "hsl(var(--profit))" : "hsl(var(--loss))"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export function StudiesTab() {
  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground mb-2 sm:mb-3">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-foreground font-medium">Studies</span>
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
          <Plus className="w-2.5 h-2.5" />
          <span className="text-[8px] font-medium">New Study</span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-3">
        {["All (12)", "Active (4)", "Validated (3)", "Research (5)"].map((f, i) => (
          <span key={f} className={cn("px-2 py-0.5 text-[8px] sm:text-[9px] font-medium rounded-full border transition-colors", i === 0 ? "bg-primary text-primary-foreground border-primary" : "border-border/40 text-muted-foreground")}>{f}</span>
        ))}
      </div>

      {/* Studies grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {studies.map((s, i) => (
          <div key={i} className="rounded-xl border border-border/20 bg-card p-2.5 hover:border-border/40 transition-all hover:scale-[1.01] group" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
            <div className="flex items-start justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-2.5 h-2.5 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] sm:text-[10px] font-semibold leading-tight">{s.title}</p>
                  <p className="text-[7px] text-muted-foreground">{s.symbol} · {s.date}</p>
                </div>
              </div>
              <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-medium", s.status === "Active" ? "bg-primary/10 text-primary" : s.status === "Validated" ? "bg-profit/10 text-profit" : "bg-muted/50 text-muted-foreground")}>{s.status}</span>
            </div>
            {/* Mini chart */}
            <div className="mb-1.5 px-1">
              {miniChart(i % 2 === 1)}
            </div>
            <p className="text-[7px] sm:text-[8px] text-muted-foreground leading-relaxed line-clamp-2">{s.notes}</p>
            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border/10">
              <span className="text-[7px] px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">{s.category}</span>
              <div className="flex items-center gap-0.5 text-muted-foreground/50 group-hover:text-primary transition-colors">
                <Eye className="w-2.5 h-2.5" />
                <span className="text-[7px]">View</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
