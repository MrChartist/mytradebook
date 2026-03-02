import { cn } from "@/lib/utils";
import {
  TrendingUp, BarChart3, Bell, Eye, Activity, Calendar, Target,
  ArrowRight, CandlestickChart, Send, LayoutDashboard, BookOpen,
  Layers, Keyboard as KeyboardIcon, Settings, Zap, FileText
} from "lucide-react";

/* ──────────────────────────────────────────────
   Shared wrapper for all mockups
   ────────────────────────────────────────────── */
function MockupFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-muted/20 dot-pattern p-4 md:p-6 overflow-hidden transition-transform duration-300 hover:scale-[1.01]",
      className
    )}>
      {children}
    </div>
  );
}

/* ──────────────────────────────────────────────
   1. BentoFeatureGrid — Hero overview
   ────────────────────────────────────────────── */
const bentoItems = [
  { icon: LayoutDashboard, label: "Dashboard", color: "hsl(var(--tb-accent))" },
  { icon: CandlestickChart, label: "Trades", color: "hsl(var(--profit))" },
  { icon: Bell, label: "Alerts", color: "hsl(var(--warning))" },
  { icon: BarChart3, label: "Analytics", color: "hsl(var(--primary))" },
  { icon: FileText, label: "Journal", color: "hsl(var(--profit))" },
  { icon: Layers, label: "Integrations", color: "hsl(var(--muted-foreground))" },
];

export function BentoFeatureGrid() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-8">
      {bentoItems.map((item) => (
        <div
          key={item.label}
          className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 bg-card/60 hover:border-[hsl(var(--tb-accent)/0.4)] hover:shadow-md transition-all cursor-default"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}15` }}>
            <item.icon className="w-5 h-5" style={{ color: item.color }} />
          </div>
          <span className="text-xs font-semibold text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   2. OnboardingFlowMockup — 3-step visual
   ────────────────────────────────────────────── */
const onboardingSteps = [
  { num: 1, label: "Sign Up", sub: "Email + password" },
  { num: 2, label: "Set Capital", sub: "Starting amount" },
  { num: 3, label: "Start Trading", sub: "Log your first trade" },
];

export function OnboardingFlowMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        {onboardingSteps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent))] text-white flex items-center justify-center font-bold text-sm shadow-glow">
                {step.num}
              </div>
              <span className="text-xs font-semibold">{step.label}</span>
              <span className="text-[10px] text-muted-foreground">{step.sub}</span>
            </div>
            {i < onboardingSteps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-[hsl(var(--tb-accent))] shrink-0 -mt-4" />
            )}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   3. DashboardMockup — Full mini wireframe
   ────────────────────────────────────────────── */
export function DashboardMockup() {
  const kpiData = [
    { label: "MTD P&L", value: "+₹28,350", color: "text-profit" },
    { label: "Open Pos.", value: "4", color: "text-foreground" },
    { label: "Win Rate", value: "62%", color: "text-profit" },
    { label: "Alerts", value: "7", color: "text-[hsl(var(--warning))]" },
  ];

  return (
    <MockupFrame className="my-6">
      {/* Today's P&L hero */}
      <div className="rounded-xl bg-profit/10 border border-profit/20 p-4 mb-4 text-center">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Today's P&L</p>
        <p className="text-2xl md:text-3xl font-bold text-profit font-mono">+₹12,450</p>
        <p className="text-[10px] text-profit/70 mt-1">+1.24% of capital</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {kpiData.map((k) => (
          <div key={k.label} className="rounded-lg bg-card border border-border/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-base font-bold font-mono", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {/* Mini equity curve */}
        <div className="rounded-lg bg-card border border-border/40 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Equity Curve</p>
          <svg viewBox="0 0 200 60" className="w-full h-12">
            <defs>
              <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 50 L20 45 L40 48 L60 35 L80 30 L100 32 L120 22 L140 18 L160 20 L180 12 L200 8" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" />
            <path d="M0 50 L20 45 L40 48 L60 35 L80 30 L100 32 L120 22 L140 18 L160 20 L180 12 L200 8 L200 60 L0 60 Z" fill="url(#eqFill)" />
          </svg>
        </div>

        {/* Mini calendar heatmap */}
        <div className="rounded-lg bg-card border border-border/40 p-3">
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Calendar Heatmap</p>
          <MiniCalendarHeatmap />
        </div>
      </div>

      {/* Risk gauge */}
      <div className="mt-3 rounded-lg bg-card border border-border/40 p-3 flex items-center gap-4">
        <RiskGaugeMini value={0.6} />
        <div>
          <p className="text-[10px] font-semibold">Daily Risk: 0.6%</p>
          <p className="text-[10px] text-muted-foreground">Target: Stay under 1%</p>
        </div>
      </div>
    </MockupFrame>
  );
}

function MiniCalendarHeatmap() {
  const cells = [
    1,0.5,0,-0.3,0.8,
    0.2,-0.5,0.9,0.3,-0.8,
    0.6,0,0.4,-0.2,0.7,
    -0.1,0.8,0.5,-0.4,0.3,
    0.2,-0.6,0.1,0.9,0,
  ];
  return (
    <div className="grid grid-cols-5 gap-1">
      {cells.map((v, i) => (
        <div
          key={i}
          className="w-full aspect-square rounded-sm"
          style={{
            backgroundColor: v > 0
              ? `hsl(var(--profit) / ${Math.min(v * 0.8, 0.8)})`
              : v < 0
              ? `hsl(var(--loss) / ${Math.min(Math.abs(v) * 0.8, 0.8)})`
              : `hsl(var(--muted) / 0.5)`
          }}
        />
      ))}
    </div>
  );
}

function RiskGaugeMini({ value }: { value: number }) {
  const angle = -90 + (value / 1.5) * 180;
  const color = value < 0.7 ? "hsl(var(--profit))" : value < 1 ? "hsl(var(--warning))" : "hsl(var(--loss))";
  return (
    <svg width="48" height="28" viewBox="0 0 48 28">
      <path d="M4 24 A20 20 0 0 1 44 24" fill="none" stroke="hsl(var(--border))" strokeWidth="4" strokeLinecap="round" />
      <path d="M4 24 A20 20 0 0 1 44 24" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${(value / 1.5) * 63} 63`} />
      <circle cx={24 + 18 * Math.cos((angle * Math.PI) / 180)} cy={24 + 18 * Math.sin((angle * Math.PI) / 180)} r="3" fill={color} />
    </svg>
  );
}

/* ──────────────────────────────────────────────
   4. TradeCardMockup
   ────────────────────────────────────────────── */
export function TradeCardMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-profit/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-profit" />
            </div>
            <div>
              <p className="text-sm font-bold">RELIANCE</p>
              <p className="text-[10px] text-muted-foreground">NSE · Equity Intraday</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-profit/10 text-profit">OPEN</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[9px] text-muted-foreground">Entry</p>
            <p className="text-xs font-mono font-bold">₹2,845.50</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[9px] text-muted-foreground">SL</p>
            <p className="text-xs font-mono font-bold text-loss">₹2,810.00</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[9px] text-muted-foreground">Target 1</p>
            <p className="text-xs font-mono font-bold text-profit">₹2,900.00</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]">Breakout</span>
            <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">15m</span>
          </div>
          <p className="font-mono font-bold text-profit">P&L: +₹1,540</p>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   5. TradeLifecycleFlow
   ────────────────────────────────────────────── */
export function TradeLifecycleFlow() {
  const stages = [
    { label: "Planned", color: "bg-muted text-muted-foreground" },
    { label: "Open", color: "bg-[hsl(var(--tb-accent)/0.15)] text-[hsl(var(--tb-accent))]" },
    { label: "Closed", color: "bg-profit/15 text-profit" },
  ];
  return (
    <MockupFrame className="my-4">
      <div className="flex items-center justify-center gap-2 md:gap-4 flex-wrap">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 md:gap-4">
            <span className={cn("px-3 py-1.5 rounded-full text-xs font-semibold", s.color)}>{s.label}</span>
            {i < stages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   6. AlertCardMockup
   ────────────────────────────────────────────── */
export function AlertCardMockup() {
  const progress = 87;
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[hsl(var(--warning))]" />
            <p className="text-sm font-bold">NIFTY 50</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-profit/10 text-profit animate-pulse">ACTIVE</span>
        </div>
        <p className="text-xs text-muted-foreground mb-2">Price Above · <span className="font-mono font-bold text-foreground">22,500.00</span></p>
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>LTP: ₹22,387.50</span>
            <span>{progress}% to trigger</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--warning))]" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="px-1.5 py-0.5 rounded bg-muted">Once</span>
          <span>Cooldown: 15m</span>
          <Send className="w-3 h-3 ml-auto text-[hsl(var(--tb-accent))]" />
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   7. TelegramNotifMockup
   ────────────────────────────────────────────── */
export function TelegramNotifMockup() {
  return (
    <MockupFrame className="my-4">
      <div className="max-w-xs mx-auto">
        <div className="bg-[#1a2733] rounded-2xl p-4 text-white text-xs space-y-1 font-mono">
          <p className="text-[hsl(var(--tb-accent))] font-bold text-sm">🔔 Alert Triggered</p>
          <p className="opacity-90">NIFTY 50 crossed above ₹22,500</p>
          <p className="opacity-60">LTP: ₹22,512.30</p>
          <p className="opacity-60">Time: 10:34 AM IST</p>
          <p className="text-[10px] opacity-40 pt-1">via TradeBook Alerts</p>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   8. WatchlistMockup
   ────────────────────────────────────────────── */
export function WatchlistMockup() {
  const items = [
    { sym: "RELIANCE", ltp: "2,867.45", chg: "+1.23%", vol: "12.4M", up: true },
    { sym: "TCS", ltp: "3,542.10", chg: "-0.45%", vol: "5.2M", up: false },
    { sym: "HDFCBANK", ltp: "1,678.90", chg: "+2.10%", vol: "8.7M", up: true },
    { sym: "INFY", ltp: "1,456.25", chg: "+0.78%", vol: "6.1M", up: true },
    { sym: "TATAMOTORS", ltp: "945.60", chg: "-1.85%", vol: "18.3M", up: false },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/40 text-[10px] font-semibold text-muted-foreground">
          <span>Symbol</span><span className="text-right">LTP</span><span className="text-right">Chg%</span><span className="text-right">Volume</span>
        </div>
        {items.map((item) => (
          <div key={item.sym} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-border/20 text-xs hover:bg-muted/20 transition-colors">
            <span className="font-semibold">{item.sym}</span>
            <span className="text-right font-mono">₹{item.ltp}</span>
            <span className={cn("text-right font-mono font-semibold", item.up ? "text-profit" : "text-loss")}>{item.chg}</span>
            <span className="text-right text-muted-foreground">{item.vol}</span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   9. CalendarHeatmapMockup — Full month
   ────────────────────────────────────────────── */
export function CalendarHeatmapMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeks = [
    [1200, -300, 500, 0, 800],
    [-600, 1500, 200, -100, 900],
    [400, -800, 1800, 300, -200],
    [700, 100, -500, 1100, 600],
    [-300, 400, 900, -700, 200],
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">February 2026 — P&L Heatmap</p>
      <div className="space-y-1">
        <div className="grid grid-cols-5 gap-1 mb-1">
          {days.map((d) => <span key={d} className="text-[9px] text-center text-muted-foreground">{d}</span>)}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-5 gap-1">
            {week.map((v, di) => (
              <div
                key={di}
                className="aspect-square rounded-md flex items-center justify-center text-[8px] font-mono font-bold"
                style={{
                  backgroundColor: v > 0
                    ? `hsl(var(--profit) / ${Math.min(0.15 + (v / 2000) * 0.6, 0.75)})`
                    : v < 0
                    ? `hsl(var(--loss) / ${Math.min(0.15 + (Math.abs(v) / 1000) * 0.6, 0.75)})`
                    : 'hsl(var(--muted) / 0.3)',
                  color: Math.abs(v) > 500 ? (v > 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))') : 'hsl(var(--muted-foreground))'
                }}
              >
                {v > 0 ? `+${v}` : v || '—'}
              </div>
            ))}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   10. KanbanBoardMockup
   ────────────────────────────────────────────── */
export function KanbanBoardMockup() {
  const columns = [
    { title: "Low", color: "text-[hsl(var(--warning))]", border: "border-[hsl(var(--warning)/0.3)]", cards: [
      { tag: "Early Exit", loss: "₹320", trade: "INFY" },
      { tag: "No SL Set", loss: "₹180", trade: "TCS" },
    ]},
    { title: "Medium", color: "text-[hsl(var(--tb-accent))]", border: "border-[hsl(var(--tb-accent)/0.3)]", cards: [
      { tag: "Oversize Position", loss: "₹1,200", trade: "RELIANCE" },
    ]},
    { title: "High", color: "text-loss", border: "border-loss/30", cards: [
      { tag: "Revenge Trade", loss: "₹3,500", trade: "BANKNIFTY" },
      { tag: "Ignored SL", loss: "₹4,200", trade: "NIFTY FUT" },
    ]},
  ];
  return (
    <MockupFrame className="my-6">
      <div className="grid grid-cols-3 gap-2">
        {columns.map((col) => (
          <div key={col.title} className={cn("rounded-lg border p-2 bg-card/50", col.border)}>
            <p className={cn("text-[10px] font-bold mb-2 text-center", col.color)}>{col.title}</p>
            <div className="space-y-1.5">
              {col.cards.map((card) => (
                <div key={card.tag} className="rounded-md bg-muted/40 p-2">
                  <p className="text-[10px] font-semibold">{card.tag}</p>
                  <p className="text-[9px] text-muted-foreground">{card.trade} · <span className="text-loss">{card.loss}</span></p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   11. EquityCurveMockup — with drawdown
   ────────────────────────────────────────────── */
export function EquityCurveMockup() {
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-2">Equity Curve + Drawdown</p>
      <svg viewBox="0 0 300 100" className="w-full h-24">
        <defs>
          <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--loss))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--loss))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Drawdown area */}
        <path d="M80 40 L100 50 L120 55 L140 48 L140 65 L120 65 L100 65 L80 65 Z" fill="url(#ddGrad)" />
        {/* Equity fill */}
        <path d="M0 80 L30 72 L60 68 L80 40 L100 50 L120 55 L140 48 L170 35 L200 28 L230 22 L260 18 L300 12 L300 100 L0 100 Z" fill="url(#eqGrad)" />
        {/* Equity line */}
        <path d="M0 80 L30 72 L60 68 L80 40 L100 50 L120 55 L140 48 L170 35 L200 28 L230 22 L260 18 L300 12" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" />
        {/* Drawdown line */}
        <path d="M80 40 L100 50 L120 55 L140 48" fill="none" stroke="hsl(var(--loss))" strokeWidth="1.5" strokeDasharray="4 2" />
      </svg>
      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-profit rounded" /> Equity</span>
        <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-loss rounded border-dashed" /> Drawdown</span>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   12. AnalyticsHeatmapMockup — time of day
   ────────────────────────────────────────────── */
export function AnalyticsHeatmapMockup() {
  const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const data = [
    [0.8, 0.6, 0.3, -0.2, 0.5, -0.1, 0.4],
    [0.4, 0.9, -0.3, 0.2, -0.5, 0.7, 0.1],
    [-0.2, 0.5, 0.8, 0.4, 0.1, -0.3, 0.6],
    [0.6, -0.4, 0.2, 0.7, 0.3, 0.9, -0.1],
    [0.3, 0.1, -0.6, 0.5, 0.8, 0.2, 0.7],
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Time of Day Performance</p>
      <div className="space-y-1">
        <div className="grid gap-1" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
          <span />
          {hours.map((h) => <span key={h} className="text-[8px] text-center text-muted-foreground">{h}</span>)}
        </div>
        {days.map((day, di) => (
          <div key={day} className="grid gap-1" style={{ gridTemplateColumns: '40px repeat(7, 1fr)' }}>
            <span className="text-[9px] text-muted-foreground flex items-center">{day}</span>
            {data[di].map((v, hi) => (
              <div
                key={hi}
                className="aspect-square rounded-sm"
                title={`${day} ${hours[hi]}: ${v > 0 ? '+' : ''}${(v * 100).toFixed(0)}%`}
                style={{
                  backgroundColor: v > 0
                    ? `hsl(var(--profit) / ${Math.min(v * 0.8, 0.7)})`
                    : v < 0
                    ? `hsl(var(--loss) / ${Math.min(Math.abs(v) * 0.8, 0.7)})`
                    : 'hsl(var(--muted) / 0.3)'
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   13. AnalyticsMetricCards
   ────────────────────────────────────────────── */
export function AnalyticsMetricCards() {
  const metrics = [
    { label: "Win Rate", value: "62%", color: "text-profit" },
    { label: "Profit Factor", value: "1.8", color: "text-profit" },
    { label: "Sharpe Ratio", value: "1.4", color: "text-foreground" },
    { label: "Expectancy", value: "+₹842", color: "text-profit" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-4">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-border/40 bg-card/60 p-3 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">{m.label}</p>
          <p className={cn("text-lg font-bold font-mono", m.color)}>{m.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   14. ShortcutKeyboardMockup
   ────────────────────────────────────────────── */
export function ShortcutKeyboardMockup() {
  const keys = [
    { key: "/", action: "Search", row: 0 },
    { key: "N", action: "New Trade", row: 1 },
    { key: "A", action: "New Alert", row: 1 },
    { key: "S", action: "New Study", row: 1 },
    { key: "1", action: "Dashboard", row: 2 },
    { key: "2", action: "Trades", row: 2 },
    { key: "3", action: "Alerts", row: 2 },
    { key: "4", action: "Studies", row: 2 },
    { key: "5", action: "Watchlist", row: 2 },
    { key: "6", action: "Analytics", row: 2 },
  ];

  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Keyboard Shortcuts</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {keys.map((k) => (
          <div key={k.key} className="group relative">
            <div className="w-11 h-11 rounded-lg bg-card border-2 border-border/60 flex items-center justify-center font-mono font-bold text-sm
              hover:border-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent)/0.08)] hover:text-[hsl(var(--tb-accent))] transition-all cursor-default shadow-sm">
              {k.key}
            </div>
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              {k.action}
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   15. DhanFlowDiagram
   ────────────────────────────────────────────── */
export function DhanFlowDiagram() {
  const steps = [
    { label: "Connect", sub: "OAuth login" },
    { label: "Sync", sub: "Portfolio data" },
    { label: "Live Prices", sub: "Real-time LTP" },
    { label: "Execute", sub: "One-click trade" },
  ];
  return (
    <MockupFrame className="my-4">
      <div className="flex items-center justify-center gap-1 md:gap-3 flex-wrap">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1 md:gap-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center mx-auto mb-1">
                <span className="text-sm font-bold text-[hsl(var(--tb-accent))]">{i + 1}</span>
              </div>
              <p className="text-[10px] font-semibold">{s.label}</p>
              <p className="text-[8px] text-muted-foreground">{s.sub}</p>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   16. SettingsPanelMockup
   ────────────────────────────────────────────── */
export function SettingsPanelMockup() {
  const tabs = ["Profile", "Billing", "Preferences", "Security", "Integrations", "Tags", "Capital"];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
        <div className="flex gap-1 overflow-x-auto p-2 bg-muted/30 border-b border-border/20">
          {tabs.map((t, i) => (
            <span key={t} className={cn(
              "px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors",
              i === 0 ? "bg-[hsl(var(--tb-accent))] text-white" : "text-muted-foreground hover:bg-muted/50"
            )}>{t}</span>
          ))}
        </div>
        <div className="p-4 space-y-3">
          {["Display Name", "Email Address", "Phone Number"].map((f) => (
            <div key={f}>
              <p className="text-[10px] text-muted-foreground mb-1">{f}</p>
              <div className="h-8 rounded-lg bg-muted/30 border border-border/30" />
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   17. PositionSizingMockup
   ────────────────────────────────────────────── */
export function PositionSizingMockup() {
  return (
    <MockupFrame className="my-4">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-xs mx-auto">
        <p className="text-xs font-bold mb-3 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" /> Position Sizing Calculator
        </p>
        <div className="space-y-2 text-[10px]">
          <div className="flex justify-between"><span className="text-muted-foreground">Capital</span><span className="font-mono font-bold">₹10,00,000</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Risk per trade (1%)</span><span className="font-mono font-bold">₹10,000</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Entry Price</span><span className="font-mono">₹2,845.50</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Stop Loss</span><span className="font-mono text-loss">₹2,810.00</span></div>
          <div className="h-px bg-border/40 my-1" />
          <div className="flex justify-between font-semibold"><span>Recommended Qty</span><span className="font-mono text-[hsl(var(--tb-accent))]">281 shares</span></div>
        </div>
      </div>
    </MockupFrame>
  );
}
