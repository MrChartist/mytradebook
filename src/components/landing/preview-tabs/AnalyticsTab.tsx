import { cn } from "@/lib/utils";
import { Home, ChevronRight, TrendingUp } from "lucide-react";

// Day-of-week × time-of-day heatmap data (values 0–10)
const heatmapData = [
  [3, 7, 8, 5, 2],   // Mon
  [4, 6, 9, 6, 3],   // Tue
  [2, 5, 7, 8, 4],   // Wed
  [5, 8, 6, 4, 1],   // Thu
  [6, 9, 7, 3, 2],   // Fri
];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const times = ["9–10", "10–12", "12–1", "1–2", "2–3:30"];

function heatColor(v: number) {
  if (v >= 8) return "bg-profit/70";
  if (v >= 6) return "bg-profit/40";
  if (v >= 4) return "bg-warning/30";
  if (v >= 2) return "bg-loss/20";
  return "bg-muted/30";
}

// Equity curve points
const equityCurve = [0, 2, 1.5, 4, 3.5, 6, 5.8, 8, 7.2, 10, 9.5, 12, 14, 13.5, 16, 18, 17, 20, 22, 24.8];

export function AnalyticsTab() {
  const max = Math.max(...equityCurve);
  const points = equityCurve.map((v, i) => `${(i / (equityCurve.length - 1)) * 380 + 10},${65 - (v / max) * 55}`).join(" ");
  const areaPoints = points + ` 390,65 10,65`;

  return (
    <div className="min-w-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground mb-2 sm:mb-3">
        <Home className="w-3 h-3" />
        <ChevronRight className="w-2.5 h-2.5 opacity-40" />
        <span className="text-foreground font-medium">Analytics</span>
      </div>

      {/* Top stats strip */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: "Total Trades", value: "142", sub: "This quarter" },
          { label: "Win Rate", value: "67.5%", sub: "+2.1% vs last month" },
          { label: "Profit Factor", value: "2.34", sub: "Above target 2.0" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border/20 bg-card p-2 text-center" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
            <p className="text-[7px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
            <p className="text-sm sm:text-base font-bold font-mono text-foreground mt-0.5">{s.value}</p>
            <p className="text-[7px] text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        {/* Equity Curve */}
        <div className="rounded-xl border border-border/20 bg-card p-2.5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3 h-3 text-profit" />
            <p className="text-[9px] sm:text-[10px] font-semibold">Equity Curve</p>
            <p className="text-[7px] text-muted-foreground ml-auto">+₹24.8K MTD</p>
          </div>
          <svg viewBox="0 0 400 70" className="w-full h-14" preserveAspectRatio="none">
            <defs>
              <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={areaPoints} fill="url(#eq-fill)" />
            <polyline points={points} fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Win Rate Donut */}
        <div className="rounded-xl border border-border/20 bg-card p-2.5" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
          <p className="text-[9px] sm:text-[10px] font-semibold mb-2">Win / Loss Breakdown</p>
          <div className="flex items-center justify-center gap-4">
            <svg viewBox="0 0 36 36" className="w-14 h-14 sm:w-16 sm:h-16">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--loss))" strokeWidth="3" opacity="0.3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--profit))" strokeWidth="3" strokeDasharray="67.5 32.5" strokeDashoffset="25" strokeLinecap="round" />
              <text x="18" y="19" textAnchor="middle" dominantBaseline="central" className="fill-foreground text-[7px] font-bold">67.5%</text>
            </svg>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-profit" />
                <span className="text-[8px] text-foreground font-medium">Wins: 96</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-loss/50" />
                <span className="text-[8px] text-foreground font-medium">Losses: 46</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[8px] text-foreground font-medium">Avg RR: 1:2.3</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-border/20 bg-card p-2.5 mt-2" style={{ boxShadow: "inset 0 1px 0 0 hsl(0 0% 100% / 0.04)" }}>
        <p className="text-[9px] sm:text-[10px] font-semibold mb-2">Performance Heatmap — Day × Time</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[7px] text-muted-foreground font-medium p-0.5 w-8"></th>
                {times.map((t) => <th key={t} className="text-[6px] sm:text-[7px] text-muted-foreground font-medium p-0.5 text-center">{t}</th>)}
              </tr>
            </thead>
            <tbody>
              {heatmapData.map((row, ri) => (
                <tr key={ri}>
                  <td className="text-[7px] text-muted-foreground font-medium p-0.5">{days[ri]}</td>
                  {row.map((v, ci) => (
                    <td key={ci} className="p-0.5">
                      <div className={cn("w-full h-4 sm:h-5 rounded-sm flex items-center justify-center", heatColor(v))}>
                        <span className="text-[6px] font-mono font-bold text-foreground/60">{v}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
