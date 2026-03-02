import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp, BarChart3, Bell, Eye, Activity, Calendar, Target,
  ArrowRight, CandlestickChart, Send, LayoutDashboard, BookOpen,
  Layers, Keyboard as KeyboardIcon, Settings, Zap, FileText, Upload,
  List, Grid3X3, Sparkles, Smartphone, ArrowUpRight, ArrowDownRight,
  Search, Star
} from "lucide-react";

/* ──────────────────────────────────────────────
   Color Mode Context (Color / B&W)
   ────────────────────────────────────────────── */
export const DocsColorModeContext = createContext<'color' | 'bw'>('color');
export const useDocsColorMode = () => useContext(DocsColorModeContext);

/* ──────────────────────────────────────────────
   Shared wrapper for all mockups
   ────────────────────────────────────────────── */
function MockupFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  const colorMode = useDocsColorMode();
  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-muted/20 dot-pattern p-4 md:p-6 overflow-hidden transition-all duration-300 hover:scale-[1.01]",
      colorMode === 'bw' && 'grayscale',
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

/* ──────────────────────────────────────────────
   18. StudyCardMockup
   ────────────────────────────────────────────── */
export function StudyCardMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            </div>
            <div>
              <p className="text-sm font-bold">TATASTEEL</p>
              <p className="text-[10px] text-muted-foreground">NSE · Technical Analysis</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]">Active</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">Cup & Handle formation on daily chart. Breakout above ₹158 with volume confirmation.</p>
        {/* Status flow */}
        <div className="flex items-center gap-1.5 mb-3 text-[9px]">
          <span className="px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground line-through">Draft</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] font-semibold">Active</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="px-1.5 py-0.5 rounded bg-muted/40 text-muted-foreground">Triggered</span>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {["Double Bottom", "Breakout", "Volume Spike"].map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[9px] bg-profit/10 text-profit font-medium">{t}</span>
          ))}
        </div>
        {/* Live price */}
        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border/30">
          <span className="text-muted-foreground">LTP</span>
          <span className="font-mono font-bold text-profit">₹156.80 <span className="text-[9px]">+2.3%</span></span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   19. StreakDisciplineMockup
   ────────────────────────────────────────────── */
export function StreakDisciplineMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">🏆</span>
          <div>
            <p className="text-xs font-bold">Streak & Discipline</p>
            <p className="text-[10px] text-muted-foreground">Trading consistency</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-lg bg-profit/10 border border-profit/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Streak</p>
            <p className="text-lg font-bold text-profit">5W</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Avg R:R</p>
            <p className="text-lg font-bold">1:1.8</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Best Trade</p>
            <p className="text-sm font-bold text-profit font-mono">+₹8,200</p>
          </div>
          <div className="p-2.5 rounded-lg bg-muted/40">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Worst Trade</p>
            <p className="text-sm font-bold text-loss font-mono">-₹3,400</p>
          </div>
        </div>
        {/* Discipline bar */}
        <div className="p-2.5 rounded-lg bg-muted/40">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">SL Discipline</p>
            <p className="text-[10px] font-semibold">78%</p>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-profit" style={{ width: '78%' }} />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   20. WeeklyReportMockup
   ────────────────────────────────────────────── */
export function WeeklyReportMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold">📊 Weekly Report</p>
            <p className="text-[10px] text-muted-foreground">Feb 17 – 21, 2026</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-profit/10 text-profit">+₹9,200</span>
        </div>
        {/* Segment rows */}
        <div className="space-y-1.5 mb-3">
          {[
            { seg: "Intraday", pnl: "+₹12,400", wr: "68%", color: "text-profit" },
            { seg: "Options", pnl: "-₹3,200", wr: "42%", color: "text-loss" },
          ].map((r) => (
            <div key={r.seg} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-[10px]">
              <span className="font-semibold">{r.seg}</span>
              <div className="flex items-center gap-3">
                <span className={cn("font-mono font-bold", r.color)}>{r.pnl}</span>
                <span className="text-muted-foreground">WR: {r.wr}</span>
              </div>
            </div>
          ))}
        </div>
        {/* Highlights */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
          <div className="rounded-lg bg-profit/5 p-2">
            <p className="text-muted-foreground">Top Setup</p>
            <p className="font-semibold text-profit">Breakout</p>
          </div>
          <div className="rounded-lg bg-loss/5 p-2">
            <p className="text-muted-foreground">Worst Mistake</p>
            <p className="font-semibold text-loss">Revenge Trade</p>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-muted/40 py-1.5 text-center text-[10px] font-semibold text-muted-foreground">📄 PDF</div>
          <div className="flex-1 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] py-1.5 text-center text-[10px] font-semibold text-[hsl(var(--tb-accent))]">📨 Telegram</div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   21. MistakeTrendMockup
   ────────────────────────────────────────────── */
export function MistakeTrendMockup() {
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const values = [18, 14, 11, 9, 6, 4];
  const maxVal = Math.max(...values);
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">6-Month Mistake Trend</p>
      <div className="flex items-end gap-2 h-20 px-2">
        {months.map((m, i) => (
          <div key={m} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm"
              style={{
                height: `${(values[i] / maxVal) * 100}%`,
                backgroundColor: values[i] > 12 ? 'hsl(var(--loss))' : values[i] > 8 ? 'hsl(var(--warning))' : 'hsl(var(--profit))',
                opacity: 0.7,
              }}
            />
            <span className="text-[8px] text-muted-foreground">{m}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-loss/70" /> High</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[hsl(var(--warning)/0.7)]" /> Med</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-profit/70" /> Low</span>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   22. DailyJournalMockup
   ────────────────────────────────────────────── */
export function DailyJournalMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center text-sm">📝</div>
            <div>
              <p className="text-xs font-bold">Tuesday, Feb 18, 2026</p>
              <p className="text-[10px] text-muted-foreground">3 trades closed</p>
            </div>
          </div>
          <span className="text-lg" title="Confident">😊</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.05)] p-2.5 border border-[hsl(var(--tb-accent)/0.1)]">
            <p className="font-semibold text-[hsl(var(--tb-accent))] mb-0.5">Pre-Market Plan</p>
            <p className="text-muted-foreground">Focus on Nifty 22,400 support. Look for breakout in RELIANCE above 2,850. Avoid options until 10:30 AM.</p>
          </div>
          <div className="rounded-lg bg-profit/5 p-2.5 border border-profit/10">
            <p className="font-semibold text-profit mb-0.5">Post-Market Review</p>
            <p className="text-muted-foreground">Stuck to plan. RELIANCE breakout worked perfectly. Avoided revenge trade after INFY SL hit.</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="font-semibold mb-0.5">Lessons</p>
            <p className="text-muted-foreground">Patience on entries pays off. Wait for volume confirmation before going in.</p>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   23. TelegramChannelsMockup
   ────────────────────────────────────────────── */
export function TelegramChannelsMockup() {
  const channels = [
    { label: "Alerts Channel", segments: ["All"], types: "Alert triggers", enabled: true },
    { label: "EOD Reports", segments: ["Intraday", "Options"], types: "EOD, Weekly", enabled: true },
    { label: "Intraday Only", segments: ["Intraday"], types: "Trades, TSL", enabled: false },
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Telegram Channels & Routing</p>
      <div className="space-y-2">
        {channels.map((ch) => (
          <div key={ch.label} className="rounded-lg bg-card border border-border/40 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Send className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
              <div>
                <p className="text-[11px] font-semibold">{ch.label}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {ch.segments.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded text-[8px] bg-muted/60 text-muted-foreground">{s}</span>
                  ))}
                  <span className="text-[8px] text-muted-foreground/60">· {ch.types}</span>
                </div>
              </div>
            </div>
            <div className={cn(
              "w-8 h-4 rounded-full flex items-center p-0.5 transition-colors",
              ch.enabled ? "bg-profit justify-end" : "bg-muted justify-start"
            )}>
              <div className="w-3 h-3 rounded-full bg-white shadow-sm" />
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   24. WidgetCustomizerMockup
   ────────────────────────────────────────────── */
export function WidgetCustomizerMockup() {
  const widgets = [
    { label: "Today's P&L", visible: true },
    { label: "KPI Cards", visible: true },
    { label: "Risk & Goal", visible: true },
    { label: "Equity Curve", visible: true },
    { label: "Positions Table", visible: false },
    { label: "Streak & Calendar", visible: true },
    { label: "AI Insights", visible: false },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-3 max-w-xs mx-auto">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold">Dashboard Widgets</p>
          <span className="text-[9px] text-[hsl(var(--tb-accent))] font-medium cursor-default">↺ Reset</span>
        </div>
        <div className="space-y-1">
          {widgets.map((w, i) => (
            <div key={w.label} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-2">
                <Eye className={cn("w-3 h-3", w.visible ? "text-foreground" : "text-muted-foreground/40")} />
                <span className={cn("text-[10px]", w.visible ? "text-foreground font-medium" : "text-muted-foreground/60 line-through")}>{w.label}</span>
              </div>
              <div className="flex gap-0.5 text-muted-foreground/50">
                <span className={cn("text-[10px] cursor-default", i === 0 && "opacity-30")}>▲</span>
                <span className={cn("text-[10px] cursor-default", i === widgets.length - 1 && "opacity-30")}>▼</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   25. CsvImportMockup
   ────────────────────────────────────────────── */
export function CsvImportMockup() {
  const mappings = [
    { csv: "Symbol", field: "symbol" },
    { csv: "Entry", field: "entry_price" },
    { csv: "Exit", field: "exit_price" },
    { csv: "Qty", field: "quantity" },
    { csv: "Date", field: "entry_time" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-xs mx-auto">
        <p className="text-xs font-bold mb-3 flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" /> CSV Import
        </p>
        {/* File area */}
        <div className="rounded-lg border-2 border-dashed border-border/40 p-3 mb-3 text-center">
          <p className="text-[10px] text-muted-foreground">📄 trades_feb2026.csv</p>
          <p className="text-[9px] text-muted-foreground/60">42 rows detected</p>
        </div>
        {/* Column mapping */}
        <p className="text-[9px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Column Mapping</p>
        <div className="space-y-1">
          {mappings.map((m) => (
            <div key={m.csv} className="flex items-center gap-2 text-[10px]">
              <span className="w-16 text-muted-foreground">{m.csv}</span>
              <ArrowRight className="w-3 h-3 text-[hsl(var(--tb-accent))]" />
              <span className="font-mono font-semibold text-foreground">{m.field}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   26. SegmentPerformanceMockup
   ────────────────────────────────────────────── */
export function SegmentPerformanceMockup() {
  const segments = [
    { seg: "Intraday", wr: "68%", sharpe: "1.4", pf: "2.1", color: "text-profit" },
    { seg: "Positional", wr: "55%", sharpe: "1.1", pf: "1.5", color: "text-foreground" },
    { seg: "Options", wr: "42%", sharpe: "0.8", pf: "0.9", color: "text-loss" },
    { seg: "Futures", wr: "61%", sharpe: "1.3", pf: "1.8", color: "text-profit" },
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Segment Performance Breakdown</p>
      <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
        <div className="grid grid-cols-4 gap-2 px-3 py-2 bg-muted/40 text-[9px] font-semibold text-muted-foreground">
          <span>Segment</span><span className="text-center">Win Rate</span><span className="text-center">Sharpe</span><span className="text-center">PF</span>
        </div>
        {segments.map((s) => (
          <div key={s.seg} className="grid grid-cols-4 gap-2 px-3 py-2 border-t border-border/20 text-[10px]">
            <span className="font-semibold">{s.seg}</span>
            <span className={cn("text-center font-mono font-bold", s.color)}>{s.wr}</span>
            <span className="text-center font-mono">{s.sharpe}</span>
            <span className="text-center font-mono">{s.pf}</span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   27. RiskOfRuinMockup
   ────────────────────────────────────────────── */
export function RiskOfRuinMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-xs mx-auto text-center">
        <p className="text-[10px] font-semibold text-muted-foreground mb-3">Risk of Ruin Calculator</p>
        <svg viewBox="0 0 100 55" className="w-24 h-14 mx-auto mb-2">
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
          <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="hsl(var(--profit))" strokeWidth="6" strokeLinecap="round"
            strokeDasharray="8 118" />
        </svg>
        <p className="text-2xl font-bold text-profit font-mono">2.3%</p>
        <p className="text-[10px] text-muted-foreground mt-1">Probability of account ruin</p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-[9px]">
          <div className="rounded-md bg-muted/30 p-1.5">
            <p className="text-muted-foreground">WR</p>
            <p className="font-bold">62%</p>
          </div>
          <div className="rounded-md bg-muted/30 p-1.5">
            <p className="text-muted-foreground">R:R</p>
            <p className="font-bold">1:1.8</p>
          </div>
          <div className="rounded-md bg-muted/30 p-1.5">
            <p className="text-muted-foreground">Risk%</p>
            <p className="font-bold">1%</p>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   28. TradeViewsMockup — List vs Grid toggle
   ────────────────────────────────────────────── */
export function TradeViewsMockup() {
  const trades = [
    { sym: "RELIANCE", type: "BUY", pnl: "+₹1,540", status: "OPEN", seg: "Intraday" },
    { sym: "NIFTY FUT", type: "SELL", pnl: "-₹820", status: "CLOSED", seg: "Futures" },
    { sym: "HDFCBANK", type: "BUY", pnl: "+₹3,200", status: "CLOSED", seg: "Positional" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-muted-foreground">Trade Book — Views</p>
        <div className="flex gap-1">
          <div className="px-2 py-1 rounded-md bg-[hsl(var(--tb-accent))] text-white text-[9px] font-semibold flex items-center gap-1">
            <List className="w-3 h-3" /> List
          </div>
          <div className="px-2 py-1 rounded-md bg-muted/50 text-muted-foreground text-[9px] font-semibold flex items-center gap-1">
            <Grid3X3 className="w-3 h-3" /> Grid
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-muted/40 text-[9px] font-semibold text-muted-foreground">
          <span>Symbol</span><span className="text-center">Type</span><span className="text-center">Segment</span><span className="text-center">Status</span><span className="text-right">P&L</span>
        </div>
        {trades.map((t) => (
          <div key={t.sym} className="grid grid-cols-5 gap-2 px-3 py-2.5 border-t border-border/20 text-[10px] hover:bg-muted/20 transition-colors items-center">
            <div className="flex items-center gap-1.5">
              {t.type === "BUY" ? <ArrowUpRight className="w-3 h-3 text-profit" /> : <ArrowDownRight className="w-3 h-3 text-loss" />}
              <span className="font-semibold">{t.sym}</span>
            </div>
            <span className={cn("text-center font-semibold", t.type === "BUY" ? "text-profit" : "text-loss")}>{t.type}</span>
            <span className="text-center text-muted-foreground">{t.seg}</span>
            <div className="flex justify-center">
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-[8px] font-semibold",
                t.status === "OPEN" ? "bg-profit/10 text-profit" : "bg-muted/60 text-muted-foreground"
              )}>{t.status}</span>
            </div>
            <span className={cn("text-right font-mono font-bold", t.pnl.startsWith("+") ? "text-profit" : "text-loss")}>{t.pnl}</span>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   29. AIInsightsMockup — AI-powered trade insights
   ────────────────────────────────────────────── */
export function AIInsightsMockup() {
  const insights = [
    { emoji: "🎯", title: "Best Setup: Breakout", desc: "68% win rate across 47 trades. Avg R:R of 1:2.4", type: "positive" },
    { emoji: "⏰", title: "Peak Hours: 9:30–10:30 AM", desc: "73% of your profits come from the first hour", type: "positive" },
    { emoji: "⚠️", title: "Options Weakness", desc: "Win rate drops to 38% in Options. Consider reducing size", type: "warning" },
    { emoji: "📈", title: "Improving Trend", desc: "Your discipline score improved 22% this month", type: "positive" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
        <p className="text-[10px] font-semibold text-muted-foreground">AI Trade Insights</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {insights.map((ins) => (
          <div
            key={ins.title}
            className={cn(
              "rounded-lg border p-3 transition-colors",
              ins.type === "warning"
                ? "border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.04)]"
                : "border-profit/20 bg-profit/[0.03]"
            )}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm mt-0.5">{ins.emoji}</span>
              <div>
                <p className="text-[11px] font-semibold">{ins.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ins.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   30. MobileAppMockup — Mobile responsiveness
   ────────────────────────────────────────────── */
export function MobileAppMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="flex items-center justify-center gap-6">
        {/* Phone frame */}
        <div className="w-[160px] rounded-2xl border-2 border-border/60 bg-card overflow-hidden shadow-lg">
          {/* Status bar */}
          <div className="h-5 bg-muted/50 flex items-center justify-between px-3">
            <span className="text-[7px] font-semibold">9:41</span>
            <div className="flex gap-0.5">
              <div className="w-2.5 h-1.5 rounded-sm bg-foreground/30" />
              <div className="w-2.5 h-1.5 rounded-sm bg-foreground/30" />
              <div className="w-4 h-1.5 rounded-sm bg-profit/60" />
            </div>
          </div>
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/20">
            <p className="text-[8px] font-bold flex items-center gap-1">
              <TrendingUp className="w-2.5 h-2.5 text-[hsl(var(--tb-accent))]" /> TradeBook
            </p>
          </div>
          {/* Mini dashboard */}
          <div className="p-2 space-y-1.5">
            <div className="rounded-md bg-profit/10 p-1.5 text-center">
              <p className="text-[6px] text-muted-foreground">Today's P&L</p>
              <p className="text-[10px] font-bold text-profit font-mono">+₹12,450</p>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded-md bg-muted/30 p-1 text-center">
                <p className="text-[5px] text-muted-foreground">Win Rate</p>
                <p className="text-[8px] font-bold text-profit">62%</p>
              </div>
              <div className="rounded-md bg-muted/30 p-1 text-center">
                <p className="text-[5px] text-muted-foreground">Open</p>
                <p className="text-[8px] font-bold">4</p>
              </div>
            </div>
            {/* Mini chart */}
            <div className="rounded-md bg-muted/20 p-1.5">
              <svg viewBox="0 0 100 25" className="w-full h-4">
                <path d="M0 20 L15 18 L30 15 L45 17 L60 10 L75 8 L100 4" fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
          {/* Bottom nav */}
          <div className="flex items-center justify-around py-1.5 border-t border-border/20 bg-muted/20">
            {[LayoutDashboard, CandlestickChart, Bell, BarChart3, Settings].map((Icon, i) => (
              <Icon key={i} className={cn("w-3 h-3", i === 0 ? "text-[hsl(var(--tb-accent))]" : "text-muted-foreground/50")} />
            ))}
          </div>
        </div>
        {/* Labels */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            <div>
              <p className="text-[11px] font-semibold">Fully Responsive</p>
              <p className="text-[9px] text-muted-foreground">Works on all screen sizes</p>
            </div>
          </div>
          {[
            "Bottom navigation bar",
            "Touch-optimized controls",
            "Swipe-friendly layouts",
            "PWA installable",
          ].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <ArrowRight className="w-3 h-3 text-[hsl(var(--tb-accent))]" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   31. CalendarDayDetailMockup — Day detail with trades
   ────────────────────────────────────────────── */
/* ──────────────────────────────────────────────
   32. TodaysPnlHeroMockup — Detailed hero card
   ────────────────────────────────────────────── */
export function TodaysPnlHeroMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-2xl bg-gradient-to-br from-profit/10 via-profit/5 to-transparent border border-profit/20 p-5 max-w-md mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 dot-pattern opacity-20 rounded-bl-3xl" />
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Today's P&L</span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-profit/15 text-profit animate-pulse">● Live</span>
        </div>
        <p className="text-4xl font-bold text-profit font-mono mb-1">+₹12,450</p>
        <p className="text-xs text-profit/70 mb-4">+1.24% of capital</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-card/60 border border-border/30 p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground">Realized</p>
            <p className="text-sm font-bold font-mono text-profit">+₹8,200</p>
          </div>
          <div className="rounded-lg bg-card/60 border border-border/30 p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground">Unrealized</p>
            <p className="text-sm font-bold font-mono text-profit">+₹4,250</p>
          </div>
          <div className="rounded-lg bg-card/60 border border-border/30 p-2.5 text-center">
            <p className="text-[9px] text-muted-foreground">Trades</p>
            <p className="text-sm font-bold font-mono">5</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
          <span>Last updated: 2:45 PM IST</span>
          <span className="mx-1">•</span>
          <span>W: 4 | L: 1</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   33. KPICardsDetailMockup — 4 detailed KPI cards
   ────────────────────────────────────────────── */
export function KPICardsDetailMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* MTD P&L */}
        <div className="rounded-xl bg-card border border-border/40 p-3.5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 dot-pattern opacity-20 rounded-bl-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">MTD P&L</span>
            <div className="w-7 h-7 rounded-lg bg-profit/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-profit" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono text-profit">+₹28,350</p>
          <div className="flex gap-3 mt-1.5">
            <div><p className="text-[8px] text-muted-foreground">Realized</p><p className="text-[10px] font-mono font-bold text-profit">+₹24,100</p></div>
            <div><p className="text-[8px] text-muted-foreground">Unrealized</p><p className="text-[10px] font-mono font-bold text-profit">+₹4,250</p></div>
          </div>
          <p className="text-[8px] text-muted-foreground mt-1.5">Today: <span className="text-profit font-medium">+₹12,450</span> • Closed: 18 | Open: 4</p>
        </div>
        {/* Open Positions */}
        <div className="rounded-xl bg-card border border-border/40 p-3.5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 dot-pattern opacity-20 rounded-bl-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Open Positions</span>
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
            </div>
          </div>
          <p className="text-xl font-bold font-mono">4</p>
          <p className="text-[9px] text-muted-foreground mt-1">₹6,420 at risk (to SL)</p>
          <p className="text-[8px] text-muted-foreground mt-1">22 total trades this month</p>
        </div>
        {/* Win Rate */}
        <div className="rounded-xl bg-card border border-border/40 p-3.5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 dot-pattern opacity-20 rounded-bl-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Win Rate</span>
            <div className="w-7 h-7 rounded-lg bg-profit/10 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-profit" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold font-mono text-profit">62.5%</p>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-profit/10 text-profit">Exp: +₹842/trade</span>
          </div>
          <p className="text-[8px] text-muted-foreground mt-1.5">Closed: 16 | W: 10 | L: 6</p>
        </div>
        {/* Active Alerts */}
        <div className="rounded-xl bg-card border border-border/40 p-3.5 relative overflow-hidden">
          <div className="absolute -top-3 -right-3 w-12 h-12 dot-pattern opacity-20 rounded-bl-2xl" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Active Alerts</span>
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--warning)/0.1)] flex items-center justify-center">
              <Bell className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold font-mono">7</p>
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]">2 triggered today</span>
          </div>
          <p className="text-[8px] text-muted-foreground mt-1.5">Price: 4 | Technical: 3</p>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   34. RiskGaugeDetailMockup — Full risk & goal widget
   ────────────────────────────────────────────── */
export function RiskGaugeDetailMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="grid md:grid-cols-2 gap-4 max-w-lg mx-auto">
        {/* Risk Gauge */}
        <div className="rounded-xl bg-card border border-border/40 p-4">
          <p className="text-[10px] font-semibold text-muted-foreground mb-3">Capital at Risk</p>
          <div className="flex items-center gap-4">
            <svg width="80" height="48" viewBox="0 0 80 48">
              <path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" />
              <path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="hsl(var(--profit))" strokeWidth="6" strokeLinecap="round"
                strokeDasharray="40 100" />
              <text x="40" y="36" textAnchor="middle" className="text-xs font-bold font-mono" fill="hsl(var(--profit))">0.6%</text>
            </svg>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-profit" />
                <span className="text-muted-foreground">Safe zone (&lt;1%)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]" />
                <span className="text-muted-foreground">Caution (1-1.5%)</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-loss" />
                <span className="text-muted-foreground">High risk (&gt;1.5%)</span>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground mt-2">₹6,420 of ₹10,00,000 capital</p>
        </div>
        {/* Goal Tracker */}
        <div className="rounded-xl bg-card border border-border/40 p-4">
          <p className="text-[10px] font-semibold text-muted-foreground mb-3">Monthly Goal Progress</p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">Daily Target (1%)</span>
                <span className="font-mono font-bold text-profit">124% ✓</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-profit" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-muted-foreground">Monthly Target (5%)</span>
                <span className="font-mono font-bold text-[hsl(var(--tb-accent))]">56.7%</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-[hsl(var(--tb-accent))]" style={{ width: '56.7%' }} />
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground">₹28,350 of ₹50,000 target</p>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   35. EquityCurveWidgetMockup — Dashboard-style widget
   ────────────────────────────────────────────── */
export function EquityCurveWidgetMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold">Equity Curve</p>
            <p className="text-[10px] text-muted-foreground">Feb 2026</p>
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-profit/10 text-profit font-semibold">+₹28,350</span>
            <span className="text-muted-foreground">Peak: ₹10,32,400</span>
          </div>
        </div>
        <svg viewBox="0 0 400 120" className="w-full h-28">
          <defs>
            <linearGradient id="eqWidgetFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[30, 50, 70, 90].map(y => (
            <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4" />
          ))}
          {/* Equity fill */}
          <path d="M0 95 L25 90 L50 85 L75 80 L100 70 L125 65 L150 72 L175 60 L200 55 L225 48 L250 52 L275 42 L300 35 L325 30 L350 25 L375 20 L400 15 L400 110 L0 110 Z" fill="url(#eqWidgetFill)" />
          {/* Equity line */}
          <path d="M0 95 L25 90 L50 85 L75 80 L100 70 L125 65 L150 72 L175 60 L200 55 L225 48 L250 52 L275 42 L300 35 L325 30 L350 25 L375 20 L400 15" fill="none" stroke="hsl(var(--profit))" strokeWidth="2.5" strokeLinejoin="round" />
          {/* Tooltip dot */}
          <circle cx="275" cy="42" r="4" fill="hsl(var(--profit))" stroke="hsl(var(--card))" strokeWidth="2" />
        </svg>
        <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
          <span>1 Feb</span><span>7 Feb</span><span>14 Feb</span><span>21 Feb</span><span>28 Feb</span>
        </div>
        {/* Drawdown indicator */}
        <div className="mt-3 flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-profit rounded" /> Equity</span>
          <span className="text-muted-foreground">Max DD: <span className="text-loss font-mono">-₹4,200</span> (0.42%)</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   36. CalendarHeatmapWidgetMockup — Dashboard compact calendar
   ────────────────────────────────────────────── */
export function CalendarHeatmapWidgetMockup() {
  const days = ["M", "T", "W", "T", "F"];
  const weeks = [
    [2400, -800, 1200, 500, -300],
    [-600, 3100, 800, -200, 1500],
    [400, -1200, 2800, 600, -500],
    [1800, 300, -900, 2200, 1100],
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold">Calendar Heatmap</p>
          <span className="text-[10px] text-muted-foreground">Feb 2026</span>
        </div>
        <div className="space-y-1.5">
          <div className="grid grid-cols-5 gap-1.5">
            {days.map((d, i) => <span key={i} className="text-[9px] text-center text-muted-foreground font-medium">{d}</span>)}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-5 gap-1.5">
              {week.map((v, di) => (
                <div
                  key={di}
                  className="aspect-square rounded-lg flex flex-col items-center justify-center cursor-pointer hover:ring-1 hover:ring-foreground/20 transition-all"
                  style={{
                    backgroundColor: v > 0
                      ? `hsl(var(--profit) / ${Math.min(0.12 + (v / 3500) * 0.55, 0.65)})`
                      : `hsl(var(--loss) / ${Math.min(0.12 + (Math.abs(v) / 1500) * 0.55, 0.65)})`
                  }}
                >
                  <span className="text-[8px] font-mono font-bold" style={{
                    color: v > 0 ? 'hsl(var(--profit))' : 'hsl(var(--loss))'
                  }}>
                    {v > 0 ? `+${(v/1000).toFixed(1)}k` : `${(v/1000).toFixed(1)}k`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-loss/30" /><span>Loss</span>
            <span className="w-3 h-3 rounded bg-muted/40 mx-1" /><span>Break-even</span>
            <span className="w-3 h-3 rounded bg-profit/30" /><span>Profit</span>
          </div>
          <span className="text-[hsl(var(--tb-accent))] font-medium cursor-pointer">View full →</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   37. SegmentFilterMockup — Segment + month filters
   ────────────────────────────────────────────── */
export function SegmentFilterMockup() {
  const segments = [
    { label: "All", active: false },
    { label: "Intraday", active: true },
    { label: "Positional", active: false },
    { label: "Futures", active: false },
    { label: "Options", active: false },
    { label: "Commodities", active: false },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Segment filter bar */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Market Segment</p>
          <div className="flex gap-1.5 flex-wrap">
            {segments.map((s) => (
              <span
                key={s.label}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer",
                  s.active
                    ? "bg-[hsl(var(--tb-accent))] text-white border-[hsl(var(--tb-accent))] shadow-sm"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>
        {/* Month selector */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground mb-2">Quick Month Selector</p>
          <div className="flex gap-1 bg-muted/50 rounded-lg p-0.5 w-fit">
            {["Dec", "Jan", "Feb"].map((m, i) => (
              <span
                key={m}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer",
                  i === 2 ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
        {/* Live status */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-full bg-profit animate-pulse" />
            <span className="text-profit font-semibold">Live</span>
          </span>
          <span className="text-[10px] text-muted-foreground">• 2:45 PM</span>
          <span className="text-[10px] text-muted-foreground">• 4 open positions streaming</span>
        </div>
      </div>
    </MockupFrame>
  );
}

export function CalendarDayDetailMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-profit/10 border border-profit/20 flex flex-col items-center justify-center">
              <span className="text-[8px] font-semibold text-profit leading-none">TUE</span>
              <span className="text-sm font-bold text-profit leading-none mt-0.5">18</span>
            </div>
            <div>
              <p className="text-xs font-bold">Feb 18, 2026</p>
              <p className="text-[10px] text-muted-foreground">3 trades · +₹4,720</p>
            </div>
          </div>
          <span className="text-lg">😊</span>
        </div>
        {/* Trades that day */}
        <div className="space-y-1.5 mb-3">
          {[
            { sym: "RELIANCE", pnl: "+₹2,340", time: "9:32 AM", type: "BUY" },
            { sym: "NIFTY 50", pnl: "+₹3,180", time: "10:15 AM", type: "BUY" },
            { sym: "INFY", pnl: "-₹800", time: "1:45 PM", type: "SELL" },
          ].map((t) => (
            <div key={t.sym} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2">
                {t.type === "BUY" ? <ArrowUpRight className="w-3 h-3 text-profit" /> : <ArrowDownRight className="w-3 h-3 text-loss" />}
                <div>
                  <p className="text-[10px] font-semibold">{t.sym}</p>
                  <p className="text-[8px] text-muted-foreground">{t.time}</p>
                </div>
              </div>
              <span className={cn("text-[10px] font-mono font-bold", t.pnl.startsWith("+") ? "text-profit" : "text-loss")}>{t.pnl}</span>
            </div>
          ))}
        </div>
        {/* Journal snippet */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.05)] border border-[hsl(var(--tb-accent)/0.15)] p-2.5">
          <p className="text-[9px] font-semibold text-[hsl(var(--tb-accent))] mb-1">📝 Journal Note</p>
          <p className="text-[9px] text-muted-foreground leading-relaxed">Good day overall. Followed the pre-market plan. RELIANCE breakout worked as expected. Need to improve INFY exit timing.</p>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   38. CreateTradeMockup — Realistic trade creation form
   ────────────────────────────────────────────── */
export function CreateTradeMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold">Create New Trade</p>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]">Equity Intraday</span>
        </div>
        {/* Instrument search */}
        <div className="mb-3">
          <p className="text-[9px] text-muted-foreground mb-1">Instrument</p>
          <div className="flex items-center gap-2 rounded-lg bg-muted/30 border border-border/40 px-3 py-2">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold">RELIANCE</span>
            <span className="text-[9px] text-muted-foreground ml-auto">NSE · EQ</span>
          </div>
        </div>
        {/* Trade type toggle */}
        <div className="flex gap-2 mb-3">
          <div className="flex-1 rounded-lg bg-profit/15 border border-profit/30 py-1.5 text-center text-[10px] font-bold text-profit">BUY</div>
          <div className="flex-1 rounded-lg bg-muted/30 border border-border/30 py-1.5 text-center text-[10px] font-medium text-muted-foreground">SELL</div>
        </div>
        {/* Price fields */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">Entry Price</p>
            <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-1.5 text-xs font-mono font-bold">₹2,845.50</div>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">Quantity</p>
            <div className="rounded-lg bg-muted/30 border border-border/40 px-3 py-1.5 text-xs font-mono font-bold">50</div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">Stop Loss</p>
            <div className="rounded-lg bg-loss/5 border border-loss/20 px-2 py-1.5 text-xs font-mono font-bold text-loss">₹2,810</div>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">Target 1</p>
            <div className="rounded-lg bg-profit/5 border border-profit/20 px-2 py-1.5 text-xs font-mono font-bold text-profit">₹2,900</div>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">Target 2</p>
            <div className="rounded-lg bg-profit/5 border border-profit/20 px-2 py-1.5 text-xs font-mono font-bold text-profit">₹2,950</div>
          </div>
        </div>
        {/* Risk metrics row */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.05)] border border-[hsl(var(--tb-accent)/0.15)] p-2.5 mb-3">
          <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
            <div><p className="text-muted-foreground">SL %</p><p className="font-bold text-loss">1.25%</p></div>
            <div><p className="text-muted-foreground">Risk ₹</p><p className="font-bold text-loss">₹1,775</p></div>
            <div><p className="text-muted-foreground">R:R</p><p className="font-bold text-[hsl(var(--tb-accent))]">1:1.54</p></div>
          </div>
        </div>
        {/* Tags & confidence */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] font-medium">Breakout</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-muted text-muted-foreground">15m</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-profit/10 text-profit font-medium">Vol Spike</span>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={cn("text-sm", i <= 4 ? "text-[hsl(var(--tb-accent))]" : "text-muted-foreground/30")}>★</span>
            ))}
          </div>
        </div>
        {/* Action */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent))] py-2 text-center text-xs font-bold text-white">
          Create Trade
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   39. TradeStatusLifecycleMockup — Detailed lifecycle
   ────────────────────────────────────────────── */
export function TradeStatusLifecycleMockup() {
  const statuses = [
    { label: "Planned", icon: "📝", desc: "Idea logged, not yet executed", color: "bg-muted/60 border-border/40", textColor: "text-muted-foreground" },
    { label: "Open", icon: "🟢", desc: "Active position in market", color: "bg-[hsl(var(--tb-accent)/0.1)] border-[hsl(var(--tb-accent)/0.3)]", textColor: "text-[hsl(var(--tb-accent))]" },
    { label: "Closed", icon: "✅", desc: "Exited, P&L calculated", color: "bg-profit/10 border-profit/20", textColor: "text-profit" },
    { label: "Cancelled", icon: "❌", desc: "Idea abandoned", color: "bg-loss/5 border-loss/15", textColor: "text-loss" },
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Trade Status Lifecycle</p>
      <div className="flex flex-col md:flex-row items-stretch gap-2">
        {statuses.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1">
            <div className={cn("rounded-xl border p-3 flex-1", s.color)}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{s.icon}</span>
                <span className={cn("text-xs font-bold", s.textColor)}>{s.label}</span>
              </div>
              <p className="text-[9px] text-muted-foreground">{s.desc}</p>
            </div>
            {i < statuses.length - 1 && (
              <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden md:block" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-muted/30 p-2.5 text-[9px] text-muted-foreground">
        <span className="font-semibold text-foreground">Tip:</span> Closing a trade triggers an automatic Post-Trade Review prompt and P&L calculation. Cancelled trades are excluded from all analytics.
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   40. TSLDetailMockup — Trailing Stop Loss visualization
   ────────────────────────────────────────────── */
export function TSLDetailMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
              <Target className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            </div>
            <div>
              <p className="text-xs font-bold">Trailing Stop Loss</p>
              <p className="text-[10px] text-muted-foreground">RELIANCE · BUY @ ₹2,845</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-profit/10 text-profit animate-pulse">TSL Active</span>
        </div>
        {/* TSL visual chart */}
        <svg viewBox="0 0 300 80" className="w-full h-20 mb-3">
          {/* Price line going up */}
          <path d="M0 65 L30 60 L60 55 L90 45 L120 35 L150 30 L180 25 L210 28 L240 20 L270 15 L300 12" fill="none" stroke="hsl(var(--profit))" strokeWidth="2" />
          {/* TSL line stepping up */}
          <path d="M0 70 L90 70 L90 55 L150 55 L150 42 L210 42 L210 38 L270 38 L270 30 L300 30" fill="none" stroke="hsl(var(--warning))" strokeWidth="1.5" strokeDasharray="4 2" />
          {/* Entry marker */}
          <circle cx="0" cy="65" r="3" fill="hsl(var(--tb-accent))" />
          <text x="5" y="75" className="text-[7px]" fill="hsl(var(--muted-foreground))">Entry</text>
          {/* Current price */}
          <circle cx="300" cy="12" r="3" fill="hsl(var(--profit))" />
          {/* SL markers */}
          <circle cx="90" cy="55" r="2.5" fill="hsl(var(--warning))" />
          <circle cx="150" cy="42" r="2.5" fill="hsl(var(--warning))" />
          <circle cx="210" cy="38" r="2.5" fill="hsl(var(--warning))" />
          <circle cx="270" cy="30" r="2.5" fill="hsl(var(--warning))" />
        </svg>
        <div className="flex items-center gap-4 mb-3 text-[9px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-profit rounded" /> Price</span>
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[hsl(var(--warning))] rounded" style={{ borderTop: '1px dashed' }} /> TSL Level</span>
        </div>
        {/* TSL Parameters */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[8px] text-muted-foreground">Activation</p>
            <p className="text-[11px] font-bold font-mono">1.5%</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[8px] text-muted-foreground">Step Size</p>
            <p className="text-[11px] font-bold font-mono">0.5%</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2 text-center">
            <p className="text-[8px] text-muted-foreground">Trail Gap</p>
            <p className="text-[11px] font-bold font-mono">1.0%</p>
          </div>
        </div>
        {/* Current state */}
        <div className="flex items-center justify-between text-[10px] rounded-lg bg-profit/5 border border-profit/15 p-2.5">
          <div>
            <span className="text-muted-foreground">Current SL: </span>
            <span className="font-mono font-bold text-[hsl(var(--warning))]">₹2,880.00</span>
          </div>
          <div>
            <span className="text-muted-foreground">LTP: </span>
            <span className="font-mono font-bold text-profit">₹2,912.50</span>
          </div>
          <div>
            <span className="text-muted-foreground">P&L: </span>
            <span className="font-mono font-bold text-profit">+₹3,375</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   41. MultiLegStrategyDetailMockup
   ────────────────────────────────────────────── */
export function MultiLegStrategyDetailMockup() {
  const legs = [
    { action: "BUY", instrument: "NIFTY 22500 CE", qty: 50, entry: "₹185", ltp: "₹210", pnl: "+₹1,250", color: "text-profit" },
    { action: "SELL", instrument: "NIFTY 22600 CE", qty: 50, entry: "₹120", ltp: "₹95", pnl: "+₹1,250", color: "text-profit" },
    { action: "SELL", instrument: "NIFTY 22300 PE", qty: 50, entry: "₹110", ltp: "₹85", pnl: "+₹1,250", color: "text-profit" },
    { action: "BUY", instrument: "NIFTY 22200 PE", qty: 50, entry: "₹60", ltp: "₹42", pnl: "-₹900", color: "text-loss" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
              <Layers className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            </div>
            <div>
              <p className="text-xs font-bold">Iron Condor</p>
              <p className="text-[10px] text-muted-foreground">NIFTY · 4 legs · Options</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-profit/10 text-profit">OPEN</span>
        </div>
        {/* Legs table */}
        <div className="rounded-lg border border-border/30 overflow-hidden mb-3">
          <div className="grid grid-cols-6 gap-1 px-2.5 py-1.5 bg-muted/40 text-[8px] font-semibold text-muted-foreground">
            <span>Action</span><span className="col-span-2">Instrument</span><span className="text-right">Qty</span><span className="text-right">Entry</span><span className="text-right">P&L</span>
          </div>
          {legs.map((leg, i) => (
            <div key={i} className="grid grid-cols-6 gap-1 px-2.5 py-1.5 border-t border-border/20 text-[9px]">
              <span className={cn("font-bold", leg.action === "BUY" ? "text-profit" : "text-loss")}>{leg.action}</span>
              <span className="col-span-2 font-medium truncate">{leg.instrument}</span>
              <span className="text-right font-mono">{leg.qty}</span>
              <span className="text-right font-mono">{leg.entry}</span>
              <span className={cn("text-right font-mono font-bold", leg.color)}>{leg.pnl}</span>
            </div>
          ))}
        </div>
        {/* Strategy summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-[8px] text-muted-foreground">Net Premium</p>
            <p className="text-xs font-bold font-mono text-profit">+₹55</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-[8px] text-muted-foreground">Combined P&L</p>
            <p className="text-xs font-bold font-mono text-profit">+₹2,850</p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2">
            <p className="text-[8px] text-muted-foreground">Max Risk</p>
            <p className="text-xs font-bold font-mono text-loss">₹4,500</p>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   42. PositionSizingDetailMockup — Full calculator
   ────────────────────────────────────────────── */
export function PositionSizingDetailMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-sm mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
            <Target className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
          </div>
          <p className="text-xs font-bold">Position Sizing Calculator</p>
        </div>
        {/* Inputs */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">Starting Capital</span>
            <span className="font-mono font-bold">₹10,00,000</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">Risk per Trade</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] font-bold">1%</span>
              <span className="font-mono font-bold">₹10,000</span>
            </div>
          </div>
          <div className="h-px bg-border/40" />
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">Entry Price</span>
            <span className="font-mono font-bold">₹2,845.50</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">Stop Loss</span>
            <span className="font-mono font-bold text-loss">₹2,810.00</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-muted-foreground">SL Distance</span>
            <span className="font-mono text-loss">₹35.50 (1.25%)</span>
          </div>
        </div>
        {/* Result */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.08)] border border-[hsl(var(--tb-accent)/0.2)] p-3">
          <div className="flex justify-between items-center text-[10px] mb-2">
            <span className="font-semibold text-[hsl(var(--tb-accent))]">Recommended Quantity</span>
            <span className="text-lg font-bold font-mono text-[hsl(var(--tb-accent))]">281</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[9px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position Value</span>
              <span className="font-mono">₹7,99,585</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Loss</span>
              <span className="font-mono text-loss">₹9,976</span>
            </div>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   43. PostTradeReviewMockup — Review modal
   ────────────────────────────────────────────── */
export function PostTradeReviewMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold">Post-Trade Review</p>
            <p className="text-[10px] text-muted-foreground">RELIANCE · Closed · +₹3,375</p>
          </div>
          <span className="text-xl">🏆</span>
        </div>
        {/* Execution quality */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold mb-1.5">Execution Quality</p>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <div key={i} className={cn(
                "flex-1 h-2 rounded-full",
                i <= 4 ? "bg-[hsl(var(--tb-accent))]" : "bg-muted"
              )} />
            ))}
          </div>
          <p className="text-[9px] text-muted-foreground mt-1">4 out of 5 — Very Good</p>
        </div>
        {/* Rules followed */}
        <div className="mb-3">
          <p className="text-[10px] font-semibold mb-1.5">Rules Followed?</p>
          <div className="flex gap-2">
            <div className="flex-1 rounded-lg bg-profit/10 border border-profit/25 py-1.5 text-center text-[10px] font-bold text-profit">✓ Yes</div>
            <div className="flex-1 rounded-lg bg-muted/30 border border-border/30 py-1.5 text-center text-[10px] font-medium text-muted-foreground">No</div>
          </div>
        </div>
        {/* Text fields */}
        <div className="space-y-2 mb-3">
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">What worked well?</p>
            <div className="rounded-lg bg-profit/5 border border-profit/15 p-2.5 text-[10px] text-muted-foreground">
              Entry was patient — waited for volume confirmation on breakout above 2,845. Trailed SL properly and let the winner run.
            </div>
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground mb-1">What could improve?</p>
            <div className="rounded-lg bg-loss/5 border border-loss/15 p-2.5 text-[10px] text-muted-foreground">
              Could have added to position at first pullback. Exit was slightly early — missed last ₹15 move.
            </div>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="text-[10px] font-semibold mr-1">Trade Rating</p>
            {[1,2,3,4,5,6,7,8].map(i => (
              <span key={i} className={cn("text-xs", i <= 7 ? "text-[hsl(var(--tb-accent))]" : "text-muted-foreground/30")}>★</span>
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-[hsl(var(--tb-accent))]">7/10</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   44. TradeTemplateMockup — Template cards
   ────────────────────────────────────────────── */
export function TradeTemplateMockup() {
  const templates = [
    { name: "Intraday Breakout", segment: "Equity Intraday", type: "BUY", sl: "0.8%", tags: ["Breakout", "Volume"], timeframe: "15m", auto: true, tg: true },
    { name: "Swing Reversal", segment: "Equity Positional", type: "BUY", sl: "2.5%", tags: ["Reversal", "Support"], timeframe: "Daily", auto: false, tg: true },
    { name: "Options Scalp", segment: "Options", type: "BUY", sl: "15%", tags: ["Momentum"], timeframe: "5m", auto: true, tg: false },
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Saved Trade Templates</p>
      <div className="space-y-2">
        {templates.map((t) => (
          <div key={t.name} className="rounded-xl bg-card border border-border/40 p-3 flex items-center justify-between hover:border-[hsl(var(--tb-accent)/0.3)] transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--tb-accent)/0.08)] flex items-center justify-center">
                <Zap className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
              </div>
              <div>
                <p className="text-[11px] font-bold">{t.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">{t.segment}</span>
                  <span className={cn("text-[8px] px-1.5 py-0.5 rounded font-bold", t.type === "BUY" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>{t.type}</span>
                  <span className="text-[8px] text-muted-foreground">SL: {t.sl}</span>
                  <span className="text-[8px] text-muted-foreground">· {t.timeframe}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {t.tags.map(tag => (
                    <span key={tag} className="text-[7px] px-1 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))] font-medium">{tag}</span>
                  ))}
                  {t.auto && <span className="text-[7px] px-1 py-0.5 rounded bg-profit/10 text-profit">Auto-track</span>}
                  {t.tg && <span className="text-[7px] px-1 py-0.5 rounded bg-[#229ED9]/10 text-[#229ED9]">Telegram</span>}
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-[hsl(var(--tb-accent))] px-2.5 py-1 text-[9px] font-bold text-white cursor-pointer">
              Use
            </div>
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   45. AlertConditionTypesMockup
   ────────────────────────────────────────────── */
export function AlertConditionTypesMockup() {
  const conditions = [
    { label: "Price Above", icon: "↑", example: "RELIANCE > ₹2,900", color: "text-profit", bg: "bg-profit/10 border-profit/20" },
    { label: "Price Below", icon: "↓", example: "HDFCBANK < ₹1,650", color: "text-loss", bg: "bg-loss/10 border-loss/20" },
    { label: "Crosses Above", icon: "⤴", example: "NIFTY crosses 22,500", color: "text-profit", bg: "bg-profit/10 border-profit/20" },
    { label: "Crosses Below", icon: "⤵", example: "BANKNIFTY crosses 48,000", color: "text-loss", bg: "bg-loss/10 border-loss/20" },
    { label: "% Change", icon: "%", example: "INFY moves ±3% from prev close", color: "text-[hsl(var(--tb-accent))]", bg: "bg-[hsl(var(--tb-accent)/0.08)] border-[hsl(var(--tb-accent)/0.2)]" },
    { label: "Volume Spike", icon: "📊", example: "TATAMOTORS vol > 2× avg", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.08)] border-[hsl(var(--warning)/0.2)]" },
    { label: "Custom", icon: "⚡", example: "RSI > 70 & Price > VWAP", color: "text-muted-foreground", bg: "bg-muted/40 border-border/40" },
  ];
  return (
    <MockupFrame className="my-6">
      <p className="text-[10px] font-semibold text-muted-foreground mb-3">Alert Condition Types</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {conditions.map((c) => (
          <div key={c.label} className={cn("rounded-xl border p-2.5 transition-all hover:scale-[1.02]", c.bg)}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{c.icon}</span>
              <span className={cn("text-[10px] font-bold", c.color)}>{c.label}</span>
            </div>
            <p className="text-[8px] text-muted-foreground font-mono">{c.example}</p>
          </div>
        ))}
      </div>
      {/* Live distance indicator */}
      <div className="mt-3 rounded-lg bg-card border border-border/40 p-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-[10px] font-bold">RELIANCE</span>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-profit/10 text-profit font-semibold">Above ₹2,900</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">LTP: ₹2,867.30</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-muted/40 overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--tb-accent))]" style={{ width: "88%" }} />
          </div>
          <span className="text-[9px] font-mono font-bold text-[hsl(var(--tb-accent))]">1.1% away</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   46. RecurrenceCooldownMockup
   ────────────────────────────────────────────── */
export function RecurrenceCooldownMockup() {
  const modes = [
    { mode: "Once", desc: "Fire once, then auto-deactivate", icon: "1️⃣", active: true },
    { mode: "Daily", desc: "Reset every trading day", icon: "📅", active: false },
    { mode: "Continuous", desc: "Fire every time condition met", icon: "🔁", active: false },
  ];
  const cooldowns = ["5m", "15m", "30m", "1h", "1D"];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-[10px] font-semibold text-muted-foreground mb-3">Recurrence Mode</p>
        <div className="flex gap-2 mb-4">
          {modes.map((m) => (
            <div key={m.mode} className={cn(
              "flex-1 rounded-xl border p-2.5 text-center transition-all cursor-pointer",
              m.active
                ? "border-[hsl(var(--tb-accent)/0.4)] bg-[hsl(var(--tb-accent)/0.08)]"
                : "border-border/40 hover:border-border"
            )}>
              <span className="text-base block mb-0.5">{m.icon}</span>
              <p className={cn("text-[10px] font-bold", m.active && "text-[hsl(var(--tb-accent))]")}>{m.mode}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{m.desc}</p>
            </div>
          ))}
        </div>
        {/* Cooldown selector */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Trigger Cooldown</p>
        <div className="flex gap-1.5 mb-4">
          {cooldowns.map((cd, i) => (
            <div key={cd} className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer",
              i === 2
                ? "border-[hsl(var(--tb-accent)/0.4)] bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]"
                : "border-border/30 text-muted-foreground hover:border-border"
            )}>
              {cd}
            </div>
          ))}
        </div>
        {/* Market hours & expiry */}
        <div className="flex items-center justify-between text-[10px] mb-2">
          <span className="text-muted-foreground">Market Hours Only</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-muted-foreground">9:15 AM – 3:30 PM</span>
            <div className="w-8 h-4 rounded-full bg-[hsl(var(--tb-accent))] relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Expires At</span>
          <span className="font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/40">28 Mar 2026</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   47. DeliveryChannelsMockup
   ────────────────────────────────────────────── */
export function DeliveryChannelsMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-[10px] font-semibold text-muted-foreground mb-3">Delivery Channels</p>
        {/* In-app */}
        <div className="rounded-lg border border-border/40 p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
              </div>
              <div>
                <p className="text-[10px] font-bold">In-App Notifications</p>
                <p className="text-[8px] text-muted-foreground">Dashboard panel + badge count</p>
              </div>
            </div>
            <div className="w-8 h-4 rounded-full bg-[hsl(var(--tb-accent))] relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
            </div>
          </div>
          {/* Mini notification preview */}
          <div className="rounded-md bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] p-2 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-profit shrink-0" />
            <div className="flex-1">
              <p className="text-[9px] font-semibold">RELIANCE triggered — Above ₹2,900</p>
              <p className="text-[8px] text-muted-foreground">LTP: ₹2,912.50 · 2 min ago · ×3</p>
            </div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-profit/10 text-profit font-bold">Active</span>
          </div>
        </div>
        {/* Telegram */}
        <div className="rounded-lg border border-border/40 p-3 mb-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#229ED9]/10 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-[#229ED9]" />
              </div>
              <div>
                <p className="text-[10px] font-bold">Telegram</p>
                <p className="text-[8px] text-muted-foreground">Instant message to linked chats</p>
              </div>
            </div>
            <div className="w-8 h-4 rounded-full bg-[#229ED9] relative">
              <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white" />
            </div>
          </div>
          {/* Telegram preview */}
          <div className="rounded-md bg-[#229ED9]/5 border border-[#229ED9]/15 p-2">
            <p className="text-[9px] font-mono">🔔 <span className="font-bold">Alert Triggered</span></p>
            <p className="text-[8px] font-mono text-muted-foreground mt-0.5">RELIANCE · Above ₹2,900</p>
            <p className="text-[8px] font-mono text-muted-foreground">LTP: ₹2,912.50 · Trigger #3</p>
            <p className="text-[8px] font-mono text-muted-foreground">⏰ 02 Mar 2026, 11:42 AM</p>
          </div>
        </div>
        {/* Snooze */}
        <div className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5 text-[10px]">
          <span className="text-muted-foreground">Quick actions:</span>
          <div className="flex gap-1.5">
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium cursor-pointer hover:bg-muted/80">Snooze 1h</span>
            <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium cursor-pointer hover:bg-muted/80">Snooze today</span>
            <span className="px-2 py-0.5 rounded bg-loss/10 text-loss font-medium cursor-pointer">Pause all</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   48. AlertManagementMockup
   ────────────────────────────────────────────── */
export function AlertManagementMockup() {
  const alerts = [
    { symbol: "RELIANCE", condition: "Above ₹2,900", status: "Active", triggered: "3", last: "2m ago", color: "text-profit", statusBg: "bg-profit/10 text-profit" },
    { symbol: "HDFCBANK", condition: "Below ₹1,650", status: "Active", triggered: "1", last: "1h ago", color: "text-loss", statusBg: "bg-profit/10 text-profit" },
    { symbol: "NIFTY", condition: "Crosses 22,500", status: "Snoozed", triggered: "5", last: "Today", color: "text-[hsl(var(--tb-accent))]", statusBg: "bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))]" },
    { symbol: "INFY", condition: "% Change ±3%", status: "Paused", triggered: "0", last: "—", color: "text-muted-foreground", statusBg: "bg-muted text-muted-foreground" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[hsl(var(--warning))]" />
            <p className="text-xs font-bold">My Alerts</p>
            <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground">4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg bg-muted/40 px-2 py-1">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Search alerts…</span>
            </div>
            <div className="flex gap-0.5 rounded-lg border border-border/40 p-0.5">
              <div className="px-1.5 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.1)]"><Grid3X3 className="w-3 h-3 text-[hsl(var(--tb-accent))]" /></div>
              <div className="px-1.5 py-0.5 rounded"><List className="w-3 h-3 text-muted-foreground" /></div>
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-1.5 mb-3">
          {["All", "Active", "Snoozed", "Paused"].map((f, i) => (
            <span key={f} className={cn(
              "px-2 py-0.5 rounded-lg text-[9px] font-semibold border cursor-pointer transition-all",
              i === 0
                ? "border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))]"
                : "border-border/30 text-muted-foreground hover:border-border"
            )}>{f}</span>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[9px] text-muted-foreground">
            <span>Sort:</span>
            <span className="font-semibold text-foreground">Last triggered ↓</span>
          </div>
        </div>
        {/* Alert rows */}
        <div className="space-y-1.5">
          {alerts.map((a) => (
            <div key={a.symbol} className="rounded-lg border border-border/40 p-2.5 flex items-center justify-between hover:border-[hsl(var(--tb-accent)/0.2)] transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                  <span className="text-[11px] font-bold">{a.symbol}</span>
                </div>
                <span className={cn("text-[9px] font-mono", a.color)}>{a.condition}</span>
              </div>
              <div className="flex items-center gap-3 text-[9px]">
                <span className="text-muted-foreground">×{a.triggered}</span>
                <span className="text-muted-foreground">{a.last}</span>
                <span className={cn("px-1.5 py-0.5 rounded font-semibold text-[8px]", a.statusBg)}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   49. StudyCategoryWorkflowMockup
   ────────────────────────────────────────────── */
export function StudyCategoryWorkflowMockup() {
  const categories = [
    { label: "Technical", icon: "📈", count: 12, active: true },
    { label: "Fundamental", icon: "📊", count: 5, active: false },
    { label: "News", icon: "📰", count: 3, active: false },
    { label: "Sentiment", icon: "🧠", count: 2, active: false },
    { label: "Other", icon: "📝", count: 1, active: false },
  ];
  const statuses = [
    { label: "Draft", color: "bg-muted/60 border-border/40", text: "text-muted-foreground", count: 4, icon: "✏️" },
    { label: "Active", color: "bg-[hsl(var(--tb-accent)/0.1)] border-[hsl(var(--tb-accent)/0.3)]", text: "text-[hsl(var(--tb-accent))]", count: 8, icon: "🔍" },
    { label: "Triggered", color: "bg-profit/10 border-profit/20", text: "text-profit", count: 6, icon: "✅" },
    { label: "Invalidated", color: "bg-loss/5 border-loss/15", text: "text-loss", count: 2, icon: "❌" },
    { label: "Archived", color: "bg-muted/30 border-border/20", text: "text-muted-foreground", count: 3, icon: "📦" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        {/* Categories */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Study Categories</p>
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {categories.map((c) => (
            <div key={c.label} className={cn(
              "px-2.5 py-1.5 rounded-xl border text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer transition-all",
              c.active
                ? "border-[hsl(var(--tb-accent)/0.4)] bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))]"
                : "border-border/30 text-muted-foreground hover:border-border"
            )}>
              <span>{c.icon}</span>
              <span>{c.label}</span>
              <span className="text-[8px] bg-muted/60 px-1 py-0.5 rounded-full">{c.count}</span>
            </div>
          ))}
        </div>
        {/* Status workflow */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Status Workflow</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className={cn("rounded-xl border px-3 py-2", s.color)}>
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs">{s.icon}</span>
                  <span className={cn("text-[10px] font-bold", s.text)}>{s.label}</span>
                </div>
                <p className="text-[8px] text-muted-foreground">{s.count} studies</p>
              </div>
              {i < statuses.length - 1 && (
                <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
              )}
            </div>
          ))}
        </div>
        {/* Example study card */}
        <div className="mt-4 rounded-lg border border-border/40 p-3 bg-muted/10">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold">RELIANCE — Cup & Handle</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] font-semibold">Active</span>
            </div>
            <span className="text-[8px] text-muted-foreground">Created 28 Feb</span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
            <span className="px-1 py-0.5 rounded bg-muted/60">📈 Technical</span>
            <span>·</span>
            <span>LTP: ₹2,867</span>
            <span>·</span>
            <span>Target: ₹3,100</span>
            <span>·</span>
            <span className="text-[hsl(var(--tb-accent))] font-semibold">8.1% upside</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   50. PatternTaggingMockup
   ────────────────────────────────────────────── */
export function PatternTaggingMockup() {
  const classicPatterns = [
    { name: "Double Top", icon: "⛰️" }, { name: "Head & Shoulders", icon: "🏔️" },
    { name: "Cup & Handle", icon: "☕" }, { name: "Ascending Triangle", icon: "📐" },
    { name: "Falling Wedge", icon: "🔻" }, { name: "Channel Up", icon: "📈" },
  ];
  const candlestickPatterns = [
    { name: "Bullish Engulfing", bullish: true }, { name: "Pin Bar", bullish: true },
    { name: "Morning Star", bullish: true }, { name: "Doji", bullish: false },
    { name: "Shooting Star", bullish: false }, { name: "Evening Star", bullish: false },
  ];
  const setupTags = ["Breakout", "Retest", "Gap Up", "Gap Down", "Pullback", "Reversal", "Volume Spike"];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        {/* Classic patterns */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Chart Patterns</p>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {classicPatterns.map((p) => (
            <div key={p.name} className="px-2 py-1 rounded-lg border border-border/40 text-[9px] font-medium flex items-center gap-1 hover:border-[hsl(var(--tb-accent)/0.3)] cursor-pointer transition-all">
              <span className="text-xs">{p.icon}</span>
              <span>{p.name}</span>
            </div>
          ))}
        </div>
        {/* Candlestick patterns */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Candlestick Patterns</p>
        <div className="flex gap-1.5 flex-wrap mb-4">
          {candlestickPatterns.map((p) => (
            <div key={p.name} className={cn(
              "px-2 py-1 rounded-lg border text-[9px] font-medium cursor-pointer transition-all",
              p.bullish
                ? "border-profit/20 bg-profit/5 text-profit hover:border-profit/40"
                : "border-loss/20 bg-loss/5 text-loss hover:border-loss/40"
            )}>
              {p.bullish ? "▲" : "▼"} {p.name}
            </div>
          ))}
        </div>
        {/* Setup tags */}
        <p className="text-[10px] font-semibold text-muted-foreground mb-2">Setup Tags</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {setupTags.map((t, i) => (
            <div key={t} className={cn(
              "px-2 py-1 rounded-lg text-[9px] font-semibold border cursor-pointer transition-all",
              i < 3
                ? "border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))]"
                : "border-border/30 text-muted-foreground hover:border-border"
            )}>
              {t}
            </div>
          ))}
        </div>
        {/* Custom tags hint */}
        <div className="rounded-lg bg-muted/30 p-2.5 flex items-center gap-2 text-[9px] text-muted-foreground">
          <span className="text-base">🏷️</span>
          <span>Create your own custom tags in <span className="font-semibold text-foreground">Settings → Tags</span>. Custom tags appear alongside presets in trade & study forms.</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   51. StudyAdditionalFeaturesMockup
   ────────────────────────────────────────────── */
export function StudyAdditionalFeaturesMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-[10px] font-semibold text-muted-foreground mb-3">Study Detail View</p>
        {/* Study header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-bold">TATAMOTORS — Ascending Triangle</p>
            <p className="text-[9px] text-muted-foreground">Technical · Created 25 Feb 2026</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[8px] font-semibold bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]">Active</span>
        </div>
        {/* Live price */}
        <div className="rounded-lg bg-profit/5 border border-profit/15 p-2.5 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span className="text-[10px] font-semibold">Live Price</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="font-bold">₹745.20</span>
            <span className="text-profit font-bold">+1.8%</span>
          </div>
        </div>
        {/* Duration tracking */}
        <div className="rounded-lg bg-muted/30 p-2.5 mb-3">
          <p className="text-[9px] font-semibold mb-1.5">Duration Tracking</p>
          <div className="flex gap-1.5">
            {["< 6M", "6M–2Y", "2–5Y", "> 5Y"].map((d, i) => (
              <span key={d} className={cn(
                "px-2 py-0.5 rounded text-[8px] font-semibold border",
                i === 0
                  ? "border-[hsl(var(--tb-accent)/0.3)] bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))]"
                  : "border-border/30 text-muted-foreground"
              )}>{d}</span>
            ))}
          </div>
        </div>
        {/* Attachments & links */}
        <div className="space-y-1.5 mb-3">
          <p className="text-[9px] font-semibold">Attachments & Links</p>
          <div className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/30 p-2">
            <FileText className="w-3.5 h-3.5 text-[hsl(var(--tb-accent))]" />
            <span className="text-[9px]">chart-screenshot-tata.png</span>
            <span className="text-[8px] text-muted-foreground ml-auto">245 KB</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/20 border border-border/30 p-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-[#229ED9]" />
            <span className="text-[9px] text-[#229ED9] underline">tradingview.com/chart/TATAM...</span>
          </div>
        </div>
        {/* Linked alert */}
        <div className="rounded-lg bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.15)] p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[hsl(var(--warning))]" />
            <div>
              <p className="text-[9px] font-semibold">Linked Alert</p>
              <p className="text-[8px] text-muted-foreground">Crosses Above ₹760 · Active</p>
            </div>
          </div>
          <span className="text-[8px] font-mono text-[hsl(var(--tb-accent))]">2.0% away</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52a. DailyJournalWorkflowMockup
   ────────────────────────────────────────────── */
export function DailyJournalWorkflowMockup() {
  const trades = [
    { symbol: "RELIANCE", type: "BUY", pnl: "+₹2,450", color: "text-profit" },
    { symbol: "NIFTY FUT", type: "SELL", pnl: "−₹800", color: "text-loss" },
    { symbol: "HDFCBANK", type: "BUY", pnl: "+₹1,120", color: "text-profit" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            <p className="text-xs font-bold">Daily Journal — 26 Feb 2026</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base">😊</span>
            <span className="text-[9px] font-semibold text-profit">Confident</span>
          </div>
        </div>

        {/* Calendar mini strip */}
        <div className="flex gap-1 mb-4">
          {["24", "25", "26", "27", "28"].map((d, i) => (
            <div key={d} className={cn(
              "flex-1 rounded-lg py-1.5 text-center cursor-pointer transition-all",
              d === "26"
                ? "bg-[hsl(var(--tb-accent))] text-white shadow-sm"
                : i === 0 || i === 3
                ? "bg-profit/10"
                : i === 1
                ? "bg-loss/10"
                : "bg-muted/30"
            )}>
              <p className="text-[8px] text-inherit opacity-70">{["Mon", "Tue", "Wed", "Thu", "Fri"][i]}</p>
              <p className="text-[10px] font-bold">{d}</p>
            </div>
          ))}
        </div>

        {/* Pre-market plan */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.04)] border border-[hsl(var(--tb-accent)/0.12)] p-3 mb-3">
          <p className="text-[9px] font-bold text-[hsl(var(--tb-accent))] mb-1.5">📋 Pre-Market Plan</p>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            Watch RELIANCE for breakout above 2850 zone. NIFTY support at 22,300 — avoid shorts below. HDFCBANK retest of trendline expected, plan partial entry.
          </p>
        </div>

        {/* Market outlook */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <p className="text-[9px] font-bold mb-1.5">🌐 Market Outlook</p>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            Global cues positive. FII data shows net buying. Expecting range-bound action with upside bias. Key event: RBI policy at 10 AM.
          </p>
        </div>

        {/* Trades closed today */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold">📊 Trades Closed Today</p>
            <span className="text-[8px] font-mono font-bold text-profit">Net: +₹2,770</span>
          </div>
          <div className="space-y-1">
            {trades.map((t) => (
              <div key={t.symbol} className="flex items-center justify-between rounded bg-card border border-border/20 px-2 py-1">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "px-1 py-0.5 rounded text-[7px] font-bold",
                    t.type === "BUY" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}>{t.type}</span>
                  <span className="text-[9px] font-semibold">{t.symbol}</span>
                </div>
                <span className={cn("text-[9px] font-mono font-bold", t.color)}>{t.pnl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Post-market review */}
        <div className="rounded-lg bg-profit/5 border border-profit/15 p-3 mb-3">
          <p className="text-[9px] font-bold text-profit mb-1.5">✅ Post-Market Review</p>
          <p className="text-[9px] text-muted-foreground leading-relaxed">
            Followed plan well on RELIANCE — entered on breakout and trailed SL. NIFTY short was against thesis, should have skipped. HDFCBANK entry was textbook retest.
          </p>
        </div>

        {/* Lessons learned */}
        <div className="rounded-lg bg-[hsl(var(--warning)/0.06)] border border-[hsl(var(--warning)/0.15)] p-3">
          <p className="text-[9px] font-bold text-[hsl(var(--warning))] mb-1.5">💡 Lessons Learned</p>
          <ul className="space-y-1">
            {[
              "Stick to plan — the NIFTY counter-trend trade cost me",
              "Trailing SL works better than fixed targets on trending days",
              "RBI events create volatility — reduce size next time"
            ].map((l, i) => (
              <li key={i} className="text-[9px] text-muted-foreground flex items-start gap-1.5">
                <span className="text-[hsl(var(--warning))] mt-0.5">•</span>
                {l}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52c. MistakeAnalysisToolsMockup
   ────────────────────────────────────────────── */
export function MistakeAnalysisToolsMockup() {
  const mistakeRows = [
    { tag: "Early Exit", count: 14, totalLoss: "−₹6,400", trend: "↓", trendColor: "text-profit", bar: 70 },
    { tag: "No Stop-Loss", count: 9, totalLoss: "−₹8,200", trend: "↓", trendColor: "text-profit", bar: 82 },
    { tag: "Oversize Position", count: 7, totalLoss: "−₹5,100", trend: "→", trendColor: "text-muted-foreground", bar: 51 },
    { tag: "Revenge Trade", count: 5, totalLoss: "−₹4,800", trend: "↑", trendColor: "text-loss", bar: 48 },
    { tag: "Entered Too Early", count: 4, totalLoss: "−₹1,900", trend: "↓", trendColor: "text-profit", bar: 19 },
  ];
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  const trendValues = [12, 10, 8, 9, 6, 4];
  const maxVal = Math.max(...trendValues);
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-loss" />
          <p className="text-xs font-bold">Mistake Analysis</p>
          <span className="text-[8px] text-muted-foreground ml-auto">Last 6 months · 39 tagged mistakes</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Left: Repeat pattern table */}
          <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden">
            <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20">
              <p className="text-[9px] font-bold">Repeat Pattern Analysis</p>
            </div>
            <div className="grid grid-cols-12 gap-1 px-3 py-1 text-[7px] font-semibold text-muted-foreground border-b border-border/10">
              <span className="col-span-4">Mistake</span>
              <span className="col-span-1 text-right">#</span>
              <span className="col-span-3 text-right">Total Loss</span>
              <span className="col-span-3">Impact</span>
              <span className="col-span-1 text-center">Δ</span>
            </div>
            {mistakeRows.map((m) => (
              <div key={m.tag} className="grid grid-cols-12 gap-1 px-3 py-1.5 text-[9px] border-b border-border/10 last:border-0 items-center">
                <span className="col-span-4 font-semibold truncate">{m.tag}</span>
                <span className="col-span-1 text-right font-mono">{m.count}</span>
                <span className="col-span-3 text-right font-mono font-bold text-loss">{m.totalLoss}</span>
                <div className="col-span-3">
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-loss/60" style={{ width: `${m.bar}%` }} />
                  </div>
                </div>
                <span className={cn("col-span-1 text-center font-bold", m.trendColor)}>{m.trend}</span>
              </div>
            ))}
          </div>

          {/* Right: 6-month trend + severity */}
          <div className="space-y-3">
            {/* Trend chart */}
            <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <p className="text-[9px] font-bold mb-2">6-Month Mistake Trend</p>
              <div className="flex items-end gap-2 h-16">
                {trendValues.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full relative">
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all",
                          i === trendValues.length - 1 ? "bg-profit/60" : "bg-loss/40"
                        )}
                        style={{ height: `${(v / maxVal) * 48}px` }}
                      />
                    </div>
                    <span className="text-[7px] text-muted-foreground">{months[i]}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[8px] text-profit">
                <ArrowDownRight className="w-3 h-3" />
                <span className="font-semibold">67% fewer mistakes vs 6 months ago</span>
              </div>
            </div>

            {/* Severity breakdown */}
            <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <p className="text-[9px] font-bold mb-2">Severity Breakdown</p>
              <div className="space-y-2">
                {[
                  { level: "High", count: 7, loss: "−₹16,200", pct: 62, color: "bg-loss", textColor: "text-loss" },
                  { level: "Medium", count: 16, loss: "−₹8,400", pct: 32, color: "bg-[hsl(var(--warning))]", textColor: "text-[hsl(var(--warning))]" },
                  { level: "Low", count: 16, loss: "−₹1,800", pct: 6, color: "bg-muted-foreground", textColor: "text-muted-foreground" },
                ].map((s) => (
                  <div key={s.level}>
                    <div className="flex items-center justify-between text-[8px] mb-0.5">
                      <span className={cn("font-semibold", s.textColor)}>{s.level} <span className="text-muted-foreground font-normal">({s.count})</span></span>
                      <span className="font-mono font-bold text-loss">{s.loss}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most common vs most costly */}
            <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <p className="text-[9px] font-bold mb-2">Common vs Costly</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded bg-muted/30 p-2 text-center">
                  <p className="text-[7px] text-muted-foreground">Most Common</p>
                  <p className="text-[10px] font-bold mt-0.5">Early Exit</p>
                  <p className="text-[8px] text-muted-foreground">14 times</p>
                </div>
                <div className="rounded bg-loss/5 border border-loss/10 p-2 text-center">
                  <p className="text-[7px] text-muted-foreground">Most Costly</p>
                  <p className="text-[10px] font-bold text-loss mt-0.5">No Stop-Loss</p>
                  <p className="text-[8px] text-loss">−₹8,200 total</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52e. DhanIntegrationDetailMockup
   ────────────────────────────────────────────── */
export function DhanIntegrationDetailMockup() {
  const apiKeys = [
    { name: "Primary Key", status: "Connected", expiry: "12 Mar 2027", priority: 1, active: true },
    { name: "Backup Key", status: "Connected", expiry: "05 Aug 2026", priority: 2, active: false },
  ];
  const syncItems = [
    { label: "Portfolio Sync", detail: "Every 5 min during market hours", status: "Active", statusColor: "text-profit" },
    { label: "Live Prices", detail: "Real-time LTP for open positions", status: "Streaming", statusColor: "text-profit" },
    { label: "Instrument Master", detail: "Last synced: 26 Feb, 6:00 AM", status: "Up to date", statusColor: "text-muted-foreground" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            </div>
            <div>
              <p className="text-xs font-bold">Dhan Broker</p>
              <p className="text-[8px] text-muted-foreground">OAuth 2.0 · Secure Connection</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold bg-profit/10 text-profit">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            Connected
          </span>
        </div>

        {/* Auth flow diagram */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Authentication Flow</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { label: "TradeBook", sub: "Initiate OAuth" },
              { label: "Dhan Login", sub: "Authorize access" },
              { label: "Token Issued", sub: "12-month validity" },
              { label: "Auto Sync", sub: "Portfolio + Prices" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-8 h-8 rounded-full bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center text-[9px] font-bold text-[hsl(var(--tb-accent))]">
                    {i + 1}
                  </div>
                  <span className="text-[8px] font-semibold">{step.label}</span>
                  <span className="text-[7px] text-muted-foreground">{step.sub}</span>
                </div>
                {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 -mt-3" />}
              </div>
            ))}
          </div>
        </div>

        {/* API Keys table */}
        <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden mb-3">
          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20 flex items-center justify-between">
            <p className="text-[9px] font-bold">API Keys</p>
            <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">+ Add Key</span>
          </div>
          {apiKeys.map((k) => (
            <div key={k.name} className="flex items-center justify-between px-3 py-2 border-b border-border/10 last:border-0">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold",
                  k.active ? "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]" : "bg-muted text-muted-foreground"
                )}>P{k.priority}</span>
                <div>
                  <p className="text-[9px] font-semibold">{k.name}</p>
                  <p className="text-[7px] text-muted-foreground">Expires: {k.expiry}</p>
                </div>
              </div>
              <span className="text-[8px] font-semibold text-profit">{k.status}</span>
            </div>
          ))}
        </div>

        {/* Live sync status */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Sync Status</p>
          <div className="space-y-2">
            {syncItems.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-semibold">{s.label}</p>
                  <p className="text-[7px] text-muted-foreground">{s.detail}</p>
                </div>
                <span className={cn("text-[8px] font-semibold", s.statusColor)}>{s.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Execution preview */}
        <div className="rounded-lg bg-profit/5 border border-profit/15 p-3">
          <p className="text-[9px] font-bold text-profit mb-1.5">⚡ One-Click Execution</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded bg-card border border-border/20 p-2 text-center">
              <p className="text-[8px] text-muted-foreground">BUY RELIANCE</p>
              <p className="text-[10px] font-bold font-mono">₹2,845 × 10</p>
            </div>
            <ArrowRight className="w-3 h-3 text-profit shrink-0" />
            <div className="flex-1 rounded bg-profit/10 border border-profit/20 p-2 text-center">
              <p className="text-[8px] text-profit font-semibold">Order Placed ✓</p>
              <p className="text-[7px] text-muted-foreground">via Dhan API</p>
            </div>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52f. TelegramIntegrationDetailMockup
   ────────────────────────────────────────────── */
export function TelegramIntegrationDetailMockup() {
  const channels = [
    { label: "Personal", chatId: "123456789", types: ["Trades", "Alerts"], segments: ["All"], status: "Verified", icon: "👤" },
    { label: "Options Group", chatId: "-100198...", types: ["Alerts", "TSL"], segments: ["Options"], status: "Verified", icon: "👥" },
    { label: "Daily Reports", chatId: "-100245...", types: ["EOD", "Weekly"], segments: ["All"], status: "Verified", icon: "📢" },
  ];
  const deliveryLog = [
    { type: "Alert", symbol: "NIFTY", time: "10:34 AM", status: "✓ Delivered", color: "text-profit" },
    { type: "TSL Update", symbol: "RELIANCE", time: "11:12 AM", status: "✓ Delivered", color: "text-profit" },
    { type: "EOD Report", symbol: "—", time: "3:45 PM", status: "⏳ Pending", color: "text-[hsl(var(--warning))]" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#229ED9]/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-[#229ED9]" />
            </div>
            <div>
              <p className="text-xs font-bold">Telegram</p>
              <p className="text-[8px] text-muted-foreground">@MyTradeBot · Custom Bot</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-semibold bg-profit/10 text-profit">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            3 Active Channels
          </span>
        </div>

        {/* Bot setup flow */}
        <div className="rounded-lg bg-[#229ED9]/5 border border-[#229ED9]/15 p-3 mb-3">
          <p className="text-[9px] font-bold mb-2">Setup Flow</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { step: "1", label: "Create Bot", sub: "@BotFather" },
              { step: "2", label: "Paste Token", sub: "Bot API key" },
              { step: "3", label: "Verify", sub: "Send /start" },
              { step: "4", label: "Add Channels", sub: "Route notifications" },
            ].map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-7 h-7 rounded-full bg-[#229ED9]/15 flex items-center justify-center text-[9px] font-bold text-[#229ED9]">
                    {s.step}
                  </div>
                  <span className="text-[8px] font-semibold">{s.label}</span>
                  <span className="text-[7px] text-muted-foreground">{s.sub}</span>
                </div>
                {i < 3 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 -mt-3" />}
              </div>
            ))}
          </div>
        </div>

        {/* Channel routing */}
        <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden mb-3">
          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20 flex items-center justify-between">
            <p className="text-[9px] font-bold">Channel Routing</p>
            <span className="text-[7px] text-[#229ED9] font-semibold cursor-pointer">+ Add Channel</span>
          </div>
          {channels.map((ch) => (
            <div key={ch.label} className="px-3 py-2 border-b border-border/10 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{ch.icon}</span>
                  <span className="text-[9px] font-bold">{ch.label}</span>
                  <span className="text-[7px] text-muted-foreground font-mono">{ch.chatId}</span>
                </div>
                <span className="text-[7px] font-semibold text-profit">{ch.status}</span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {ch.types.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded text-[7px] font-semibold bg-[#229ED9]/8 text-[#229ED9]">{t}</span>
                ))}
                <span className="text-[7px] text-muted-foreground mx-1">·</span>
                {ch.segments.map((s) => (
                  <span key={s} className="px-1.5 py-0.5 rounded text-[7px] font-semibold bg-muted/50 text-muted-foreground">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Notification preview */}
        <div className="rounded-lg overflow-hidden mb-3">
          <div className="bg-[#1a2733] p-3 text-white space-y-1.5">
            <p className="text-[10px] font-bold text-[#229ED9]">🔔 Alert Triggered</p>
            <p className="text-[9px] opacity-90">NIFTY 50 crossed above <span className="font-mono font-bold">₹22,500</span></p>
            <p className="text-[8px] opacity-60">LTP: ₹22,512.30 · Time: 10:34 AM IST</p>
            <div className="border-t border-white/10 pt-1.5 mt-1">
              <p className="text-[8px] opacity-50">via TradeBook · @MyTradeBot</p>
            </div>
          </div>
        </div>

        {/* Delivery log */}
        <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden">
          <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20">
            <p className="text-[9px] font-bold">Recent Deliveries</p>
          </div>
          {deliveryLog.map((d, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-1.5 border-b border-border/10 last:border-0 text-[8px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{d.type}</span>
                {d.symbol !== "—" && <span className="text-muted-foreground font-mono">{d.symbol}</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{d.time}</span>
                <span className={cn("font-semibold", d.color)}>{d.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52h. KeyboardShortcutsDetailMockup
   ────────────────────────────────────────────── */
export function KeyboardShortcutsDetailMockup() {
  const quickActions = [
    { keys: ["N"], desc: "New Trade", icon: "📊" },
    { keys: ["A"], desc: "New Alert", icon: "🔔" },
    { keys: ["S"], desc: "New Study", icon: "📖" },
  ];
  const navigation = [
    { keys: ["1"], desc: "Dashboard" },
    { keys: ["2"], desc: "Trades" },
    { keys: ["3"], desc: "Alerts" },
    { keys: ["4"], desc: "Studies" },
    { keys: ["5"], desc: "Watchlist" },
    { keys: ["6"], desc: "Analytics" },
  ];
  const commandResults = [
    { type: "Action", label: "Create new trade", icon: "⚡" },
    { type: "Page", label: "Go to Analytics", icon: "📊" },
    { type: "Trade", label: "RELIANCE — BUY · +₹2,450", icon: "📈" },
    { type: "Trade", label: "NIFTY FUT — SELL · −₹800", icon: "📉" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <KeyboardIcon className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
          <p className="text-xs font-bold">Keyboard Shortcuts & Command Palette</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Quick actions */}
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
            <p className="text-[9px] font-bold mb-2.5">⚡ Quick Actions</p>
            <div className="space-y-2">
              {quickActions.map((a) => (
                <div key={a.desc} className="flex items-center gap-2.5">
                  <kbd className="min-w-[28px] h-7 rounded-md bg-muted border border-border/60 flex items-center justify-center text-[10px] font-mono font-bold shadow-sm">
                    {a.keys[0]}
                  </kbd>
                  <span className="text-sm">{a.icon}</span>
                  <span className="text-[10px] font-medium">{a.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation grid */}
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
            <p className="text-[9px] font-bold mb-2.5">🧭 Navigation</p>
            <div className="grid grid-cols-2 gap-1.5">
              {navigation.map((n) => (
                <div key={n.desc} className="flex items-center gap-2 rounded-md bg-card border border-border/20 px-2 py-1.5">
                  <kbd className="w-6 h-6 rounded bg-muted border border-border/60 flex items-center justify-center text-[9px] font-mono font-bold">
                    {n.keys[0]}
                  </kbd>
                  <span className="text-[9px] font-medium">{n.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Command Palette mockup */}
        <div className="rounded-xl bg-background border border-border shadow-lg overflow-hidden max-w-md mx-auto">
          {/* Search bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">reli</span>
            <div className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[8px] font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[8px] font-mono">K</kbd>
            </div>
          </div>
          {/* Results */}
          <div className="py-1">
            {commandResults.map((r, i) => (
              <div
                key={r.label}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 text-[11px] cursor-pointer transition-colors",
                  i === 2 ? "bg-[hsl(var(--tb-accent)/0.08)]" : "hover:bg-muted/30"
                )}
              >
                <span className="text-sm">{r.icon}</span>
                <div className="flex-1">
                  <span className={cn("font-medium", i === 2 && "text-[hsl(var(--tb-accent))]")}>{r.label}</span>
                </div>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-semibold">{r.type}</span>
              </div>
            ))}
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border/20 text-[8px] text-muted-foreground bg-muted/20">
            <div className="flex items-center gap-2">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            <span>4 results</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52j. SettingsProfileBillingMockup
   ────────────────────────────────────────────── */
export function SettingsProfileBillingMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--tb-accent)/0.1)] flex items-center justify-center text-sm font-bold text-[hsl(var(--tb-accent))]">RK</div>
          <div className="flex-1">
            <p className="text-xs font-bold">Rahul Kumar</p>
            <p className="text-[8px] text-muted-foreground">rahul@example.com · +91 98765 43210</p>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]">Pro</span>
        </div>
        {/* Subscription card */}
        <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.04)] border border-[hsl(var(--tb-accent)/0.12)] p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold">Current Plan</p>
            <span className="text-[8px] text-profit font-semibold">Active</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { plan: "Free", price: "₹0", features: "50 trades/mo", active: false },
              { plan: "Pro", price: "₹499", features: "Unlimited", active: true },
              { plan: "Team", price: "₹1,499", features: "Multi-user", active: false },
            ].map((p) => (
              <div key={p.plan} className={cn(
                "rounded-lg p-2 text-center border transition-all",
                p.active
                  ? "border-[hsl(var(--tb-accent))] bg-[hsl(var(--tb-accent)/0.08)]"
                  : "border-border/30 bg-muted/20"
              )}>
                <p className={cn("text-[9px] font-bold", p.active && "text-[hsl(var(--tb-accent))]")}>{p.plan}</p>
                <p className="text-[10px] font-mono font-bold mt-0.5">{p.price}</p>
                <p className="text-[7px] text-muted-foreground">{p.features}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[8px] text-muted-foreground">
            <span>Trial ends: <span className="font-semibold text-foreground">12 Mar 2026</span></span>
            <span className="text-muted-foreground/40">·</span>
            <span>12 days left</span>
          </div>
        </div>
        {/* Usage meter */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-2.5">
          <div className="flex items-center justify-between text-[8px] mb-1">
            <span className="font-semibold">Monthly Usage</span>
            <span className="font-mono">38 / ∞ trades</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-[hsl(var(--tb-accent))]" style={{ width: "38%" }} />
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52k. SettingsPreferencesMockup
   ────────────────────────────────────────────── */
export function SettingsPreferencesMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-xs font-bold mb-3">Preferences</p>
        <div className="space-y-3">
          {/* Theme toggle */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/30 p-2.5">
            <div>
              <p className="text-[9px] font-semibold">Theme</p>
              <p className="text-[7px] text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
              <span className="px-2 py-1 rounded-md text-[8px] font-semibold text-muted-foreground">☀️</span>
              <span className="px-2 py-1 rounded-md text-[8px] font-semibold bg-background shadow-sm">🌙</span>
            </div>
          </div>
          {/* Starting capital */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/30 p-2.5">
            <div>
              <p className="text-[9px] font-semibold">Starting Capital</p>
              <p className="text-[7px] text-muted-foreground">Base amount for risk calculations</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-muted/40 border border-border/30 rounded px-2 py-1">₹10,00,000</span>
          </div>
          {/* Default SL */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/30 p-2.5">
            <div>
              <p className="text-[9px] font-semibold">Default Stop Loss</p>
              <p className="text-[7px] text-muted-foreground">Auto-filled in new trade forms</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-muted/40 border border-border/30 rounded px-2 py-1">1.5%</span>
          </div>
          {/* Timezone */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/30 p-2.5">
            <div>
              <p className="text-[9px] font-semibold">Timezone</p>
              <p className="text-[7px] text-muted-foreground">Used for journal dates and alerts</p>
            </div>
            <span className="text-[9px] font-semibold bg-muted/40 border border-border/30 rounded px-2 py-1">Asia/Kolkata</span>
          </div>
          {/* Alert frequency */}
          <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/30 p-2.5">
            <div>
              <p className="text-[9px] font-semibold">Alert Check Frequency</p>
              <p className="text-[7px] text-muted-foreground">How often alerts are evaluated</p>
            </div>
            <span className="text-[9px] font-semibold bg-muted/40 border border-border/30 rounded px-2 py-1">Every 5 min</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52l. SettingsTagManagementMockup
   ────────────────────────────────────────────── */
export function SettingsTagManagementMockup() {
  const setupTags = ["Breakout", "Retest", "Gap Up", "Pullback", "Reversal"];
  const mistakeTags = [
    { name: "Early Exit", severity: "Medium", color: "text-[hsl(var(--warning))]" },
    { name: "No Stop-Loss", severity: "High", color: "text-loss" },
    { name: "Oversize", severity: "High", color: "text-loss" },
    { name: "FOMO Entry", severity: "Medium", color: "text-[hsl(var(--warning))]" },
    { name: "Late Entry", severity: "Low", color: "text-muted-foreground" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-xs font-bold mb-3">Tag Management</p>
        {/* Setup tags */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold">🏷️ Setup Tags</p>
            <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">+ Add</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {setupTags.map((t) => (
              <div key={t} className="flex items-center gap-1 px-2 py-1 rounded-lg border border-[hsl(var(--tb-accent)/0.2)] bg-[hsl(var(--tb-accent)/0.06)] text-[9px] font-semibold text-[hsl(var(--tb-accent))]">
                {t}
                <span className="text-[7px] opacity-50 cursor-pointer hover:opacity-100">×</span>
              </div>
            ))}
          </div>
        </div>
        {/* Mistake tags with severity */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold">⚠️ Mistake Tags</p>
            <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">+ Add</span>
          </div>
          <div className="space-y-1">
            {mistakeTags.map((t) => (
              <div key={t.name} className="flex items-center justify-between rounded bg-card border border-border/20 px-2 py-1.5">
                <span className="text-[9px] font-semibold">{t.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className={cn("text-[7px] font-bold", t.color)}>{t.severity}</span>
                  <span className="text-[7px] text-muted-foreground/40 cursor-pointer hover:text-loss">×</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Pattern tags */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-bold">📊 Pattern Tags</p>
            <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">+ Add</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["Double Bottom", "Cup & Handle", "Head & Shoulders", "Ascending Triangle", "Bull Flag"].map((t) => (
              <span key={t} className="px-2 py-1 rounded-lg border border-border/30 bg-muted/30 text-[9px] font-semibold text-muted-foreground">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52m. SettingsSecurityMockup
   ────────────────────────────────────────────── */
export function SettingsSecurityMockup() {
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-xs font-bold mb-3">Security</p>
        <div className="space-y-3">
          {/* Password */}
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[9px] font-bold">🔒 Password</p>
              <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">Change</span>
            </div>
            <p className="text-[8px] text-muted-foreground">Last changed: 14 Feb 2026</p>
          </div>
          {/* Session */}
          <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
            <p className="text-[9px] font-bold mb-1.5">📱 Active Sessions</p>
            <div className="space-y-1.5">
              {[
                { device: "Chrome · MacOS", location: "Mumbai, IN", current: true },
                { device: "Safari · iPhone", location: "Mumbai, IN", current: false },
              ].map((s) => (
                <div key={s.device} className="flex items-center justify-between rounded bg-card border border-border/20 px-2 py-1.5">
                  <div>
                    <p className="text-[8px] font-semibold">{s.device}</p>
                    <p className="text-[7px] text-muted-foreground">{s.location}</p>
                  </div>
                  {s.current ? (
                    <span className="text-[7px] font-bold text-profit">Current</span>
                  ) : (
                    <span className="text-[7px] text-loss font-semibold cursor-pointer">Revoke</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Encryption status */}
          <div className="rounded-lg bg-profit/5 border border-profit/15 p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm">🛡️</span>
              <div>
                <p className="text-[9px] font-bold text-profit">Data Protection Active</p>
                <p className="text-[7px] text-muted-foreground">TLS encryption · API secrets masked · JWT 24h expiry</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52n. SettingsIntegrationsMockup
   ────────────────────────────────────────────── */
export function SettingsIntegrationsMockup() {
  const integrations = [
    { name: "Dhan Broker", icon: "📈", status: "Connected", statusColor: "text-profit", detail: "2 API keys · Last sync: 5 min ago" },
    { name: "Telegram Bot", icon: "📲", status: "3 Channels", statusColor: "text-profit", detail: "@MyTradeBot · Verified" },
    { name: "TrueData", icon: "📊", status: "Not Connected", statusColor: "text-muted-foreground", detail: "Secondary market data source" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <p className="text-xs font-bold mb-3">Integrations</p>
        <div className="space-y-2">
          {integrations.map((intg) => (
            <div key={intg.name} className="rounded-lg bg-muted/20 border border-border/30 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{intg.icon}</span>
                  <p className="text-[10px] font-bold">{intg.name}</p>
                </div>
                <span className={cn("text-[8px] font-semibold", intg.statusColor)}>{intg.status}</span>
              </div>
              <p className="text-[8px] text-muted-foreground ml-6">{intg.detail}</p>
            </div>
          ))}
        </div>
        {/* Notification routing summary */}
        <div className="mt-3 rounded-lg bg-[#229ED9]/5 border border-[#229ED9]/15 p-3">
          <p className="text-[9px] font-bold mb-2">Notification Routing</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { type: "Trade Updates", dest: "Personal" },
              { type: "Alert Triggers", dest: "Personal + Group" },
              { type: "EOD Reports", dest: "Reports Channel" },
              { type: "TSL Updates", dest: "Options Group" },
            ].map((r) => (
              <div key={r.type} className="flex items-center justify-between rounded bg-card border border-border/20 px-2 py-1">
                <span className="text-[8px] font-semibold">{r.type}</span>
                <span className="text-[7px] text-[#229ED9] font-semibold">{r.dest}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52o. CapitalManagementMockup
   ────────────────────────────────────────────── */
export function CapitalManagementMockup() {
  const transactions = [
    { date: "01 Feb", type: "Deposit", amount: "+₹2,00,000", color: "text-profit", balance: "₹12,00,000" },
    { date: "10 Feb", type: "Withdrawal", amount: "−₹50,000", color: "text-loss", balance: "₹11,50,000" },
    { date: "20 Feb", type: "Deposit", amount: "+₹1,00,000", color: "text-profit", balance: "₹12,50,000" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold">Capital Management</p>
          <span className="text-[7px] text-[hsl(var(--tb-accent))] font-semibold cursor-pointer">+ Add Transaction</span>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="rounded-lg bg-muted/30 border border-border/30 p-2.5 text-center">
            <p className="text-[7px] text-muted-foreground">Starting Capital</p>
            <p className="text-[10px] font-bold font-mono">₹10,00,000</p>
          </div>
          <div className="rounded-lg bg-profit/5 border border-profit/15 p-2.5 text-center">
            <p className="text-[7px] text-muted-foreground">Net Deposits</p>
            <p className="text-[10px] font-bold font-mono text-profit">+₹2,50,000</p>
          </div>
          <div className="rounded-lg bg-[hsl(var(--tb-accent)/0.04)] border border-[hsl(var(--tb-accent)/0.12)] p-2.5 text-center">
            <p className="text-[7px] text-muted-foreground">Current Capital</p>
            <p className="text-[10px] font-bold font-mono text-[hsl(var(--tb-accent))]">₹12,50,000</p>
          </div>
        </div>
        {/* Transaction log */}
        <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden mb-3">
          <div className="grid grid-cols-4 gap-1 px-3 py-1.5 text-[7px] font-semibold text-muted-foreground border-b border-border/20">
            <span>Date</span><span>Type</span><span className="text-right">Amount</span><span className="text-right">Balance</span>
          </div>
          {transactions.map((t) => (
            <div key={t.date} className="grid grid-cols-4 gap-1 px-3 py-1.5 text-[9px] border-b border-border/10 last:border-0">
              <span className="text-muted-foreground">{t.date}</span>
              <span className="font-semibold">{t.type}</span>
              <span className={cn("text-right font-mono font-bold", t.color)}>{t.amount}</span>
              <span className="text-right font-mono">{t.balance}</span>
            </div>
          ))}
        </div>
        {/* Note */}
        <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
          <span className="text-base">💡</span>
          <span>Capital transactions are <span className="font-semibold text-foreground">separate from P&L</span> — they track actual money in/out and adjust risk calculations without distorting trading performance.</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   52p. JournalDashboardTabMockup
   ────────────────────────────────────────────── */
export function JournalDashboardTabMockup() {
  const summaryCards = [
    { label: "Total P&L", value: "+₹42,850", color: "text-profit", sub: "62 trades" },
    { label: "Win Rate", value: "64.5%", color: "text-profit", sub: "40W / 22L" },
    { label: "Avg Hold", value: "2.4 hrs", color: "text-foreground", sub: "Intraday dominant" },
    { label: "Best Pattern", value: "Breakout", color: "text-[hsl(var(--tb-accent))]", sub: "+₹18,200" },
    { label: "Top Mistake", value: "Early Exit", color: "text-loss", sub: "−₹6,400" },
  ];
  const ratingRows = [
    { rating: "8–10", trades: 12, winRate: "83%", pnl: "+₹22,400", color: "text-profit" },
    { rating: "5–7", trades: 28, winRate: "64%", pnl: "+₹18,100", color: "text-profit" },
    { rating: "1–4", trades: 22, winRate: "45%", pnl: "+₹2,350", color: "text-profit" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
          <p className="text-xs font-bold">Journal — Dashboard Tab</p>
        </div>
        {/* Summary cards */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {summaryCards.map((c) => (
            <div key={c.label} className="rounded-lg bg-muted/30 border border-border/30 p-2.5 text-center">
              <p className="text-[8px] text-muted-foreground mb-0.5">{c.label}</p>
              <p className={cn("text-sm font-bold font-mono", c.color)}>{c.value}</p>
              <p className="text-[7px] text-muted-foreground mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
        {/* Mini equity curve */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold text-muted-foreground">Equity Curve</p>
            <div className="flex gap-1">
              {["30D", "60D", "90D"].map((r, i) => (
                <span key={r} className={cn(
                  "px-1.5 py-0.5 rounded text-[7px] font-semibold",
                  i === 0 ? "bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))]" : "text-muted-foreground"
                )}>{r}</span>
              ))}
            </div>
          </div>
          <svg viewBox="0 0 300 50" className="w-full h-10">
            <defs>
              <linearGradient id="journalEqFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--profit))" stopOpacity="0.15" />
                <stop offset="100%" stopColor="hsl(var(--profit))" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 40 L30 38 L60 35 L90 32 L120 28 L150 30 L180 22 L210 18 L240 15 L270 12 L300 8" fill="none" stroke="hsl(var(--profit))" strokeWidth="1.5" />
            <path d="M0 40 L30 38 L60 35 L90 32 L120 28 L150 30 L180 22 L210 18 L240 15 L270 12 L300 8 L300 50 L0 50 Z" fill="url(#journalEqFill)" />
          </svg>
        </div>
        {/* Performance by rating table */}
        <div className="rounded-lg bg-muted/20 border border-border/30 overflow-hidden">
          <div className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[8px] font-semibold text-muted-foreground border-b border-border/20">
            <span>Rating</span><span className="text-right">Trades</span><span className="text-right">Win Rate</span><span className="text-right">P&L</span>
          </div>
          {ratingRows.map((r) => (
            <div key={r.rating} className="grid grid-cols-4 gap-2 px-3 py-1.5 text-[9px] border-b border-border/10 last:border-0">
              <span className="font-semibold flex items-center gap-1">
                <Star className="w-3 h-3 text-[hsl(var(--warning))]" />
                {r.rating}
              </span>
              <span className="text-right font-mono">{r.trades}</span>
              <span className="text-right font-mono font-semibold">{r.winRate}</span>
              <span className={cn("text-right font-mono font-bold", r.color)}>{r.pnl}</span>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   53. JournalCalendarTabMockup
   ────────────────────────────────────────────── */
export function JournalCalendarTabMockup() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const weeks = [
    [{ pnl: 3200, trades: 3 }, { pnl: -850, trades: 2 }, { pnl: 1400, trades: 4 }, { pnl: 0, trades: 0 }, { pnl: 2100, trades: 2 }],
    [{ pnl: -1200, trades: 3 }, { pnl: 4500, trades: 5 }, { pnl: 600, trades: 1 }, { pnl: -300, trades: 2 }, { pnl: 1800, trades: 3 }],
    [{ pnl: 900, trades: 2 }, { pnl: -2100, trades: 4 }, { pnl: 5200, trades: 6 }, { pnl: 350, trades: 1 }, { pnl: -600, trades: 2 }],
    [{ pnl: 1500, trades: 3 }, { pnl: 200, trades: 1 }, { pnl: -1400, trades: 3 }, { pnl: 2800, trades: 4 }, { pnl: 1100, trades: 2 }],
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
            <p className="text-xs font-bold">Journal — Calendar Tab</p>
          </div>
          <p className="text-[10px] font-semibold text-muted-foreground">February 2026</p>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-5 gap-1.5 mb-1.5">
          {days.map((d) => <span key={d} className="text-[8px] font-semibold text-center text-muted-foreground">{d}</span>)}
        </div>
        {/* Calendar grid */}
        <div className="space-y-1.5">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-5 gap-1.5">
              {week.map((day, di) => {
                const dateNum = wi * 5 + di + 3;
                return (
                  <div
                    key={di}
                    className={cn(
                      "rounded-lg p-2 text-center cursor-pointer transition-all hover:ring-1 hover:ring-[hsl(var(--tb-accent)/0.3)]",
                      day.trades === 0
                        ? "bg-muted/20"
                        : day.pnl > 2000
                        ? "bg-profit/20 border border-profit/20"
                        : day.pnl > 0
                        ? "bg-profit/10"
                        : day.pnl < -1000
                        ? "bg-loss/20 border border-loss/20"
                        : "bg-loss/10"
                    )}
                  >
                    <p className="text-[8px] text-muted-foreground">{dateNum}</p>
                    {day.trades > 0 ? (
                      <>
                        <p className={cn("text-[10px] font-bold font-mono", day.pnl >= 0 ? "text-profit" : "text-loss")}>
                          {day.pnl >= 0 ? "+" : ""}₹{Math.abs(day.pnl).toLocaleString()}
                        </p>
                        <p className="text-[7px] text-muted-foreground">{day.trades} trades</p>
                      </>
                    ) : (
                      <p className="text-[8px] text-muted-foreground/50 mt-1">No trades</p>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[8px] text-muted-foreground">
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-profit/20 border border-profit/20" /> Big Win</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-profit/10" /> Small Win</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-loss/10" /> Small Loss</div>
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-loss/20 border border-loss/20" /> Big Loss</div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   54. JournalMistakesTabMockup — Kanban board
   ────────────────────────────────────────────── */
export function JournalMistakesTabMockup() {
  const columns = [
    {
      severity: "Low", color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning)/0.06)]", border: "border-[hsl(var(--warning)/0.15)]",
      cards: [
        { mistake: "Late Entry", symbol: "INFY", loss: "−₹180", detail: "Missed 1st candle close" },
        { mistake: "No SL Set", symbol: "SBIN", loss: "−₹320", detail: "Forgot to place SL order" },
      ]
    },
    {
      severity: "Medium", color: "text-[hsl(var(--tb-accent))]", bg: "bg-[hsl(var(--tb-accent)/0.04)]", border: "border-[hsl(var(--tb-accent)/0.15)]",
      cards: [
        { mistake: "Oversize Position", symbol: "RELIANCE", loss: "−₹1,200", detail: "2x normal size" },
        { mistake: "Early Exit", symbol: "TCS", loss: "−₹850", detail: "Exited before T1 hit" },
        { mistake: "Revenge Trade", symbol: "NIFTY FUT", loss: "−₹1,600", detail: "Re-entered after SL" },
      ]
    },
    {
      severity: "High", color: "text-loss", bg: "bg-loss/5", border: "border-loss/15",
      cards: [
        { mistake: "No Plan", symbol: "BANKNIFTY", loss: "−₹3,400", detail: "Impulsive entry" },
        { mistake: "Held Overnight", symbol: "TATAMOTORS", loss: "−₹2,800", detail: "Intraday → positional" },
      ]
    },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-4 h-4 text-loss" />
          <p className="text-xs font-bold">Journal — Mistakes Review Tab</p>
          <span className="text-[8px] text-muted-foreground ml-auto">Drag cards between columns to reassess severity</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {columns.map((col) => (
            <div key={col.severity} className={cn("rounded-lg p-2.5 border", col.bg, col.border)}>
              <div className="flex items-center justify-between mb-2.5">
                <span className={cn("text-[10px] font-bold", col.color)}>{col.severity}</span>
                <span className="text-[8px] bg-muted/40 px-1.5 py-0.5 rounded-full font-semibold">{col.cards.length}</span>
              </div>
              <div className="space-y-1.5">
                {col.cards.map((card, i) => (
                  <div key={i} className="rounded-lg bg-card border border-border/30 p-2 cursor-grab hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold">{card.mistake}</span>
                      <span className="text-[8px] font-mono font-bold text-loss">{card.loss}</span>
                    </div>
                    <p className="text-[8px] text-muted-foreground">{card.symbol} · {card.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   55. JournalFiltersSegmentationMockup
   ────────────────────────────────────────────── */
export function JournalFiltersSegmentationMockup() {
  const segments = [
    { label: "All", active: true, count: 62 },
    { label: "Intraday", active: false, count: 34 },
    { label: "Positional", active: false, count: 12 },
    { label: "Futures", active: false, count: 8 },
    { label: "Options", active: false, count: 6 },
    { label: "Commodities", active: false, count: 2 },
  ];
  const datePresets = [
    { label: "30 Days", active: true },
    { label: "60 Days", active: false },
    { label: "90 Days", active: false },
    { label: "Custom", active: false },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-[hsl(var(--tb-accent))]" />
          <p className="text-xs font-bold">Journal — Filters & Segmentation</p>
        </div>
        {/* Segment pills */}
        <div className="mb-4">
          <p className="text-[9px] font-semibold text-muted-foreground mb-2">Segment Filter</p>
          <div className="flex gap-1.5 flex-wrap">
            {segments.map((s) => (
              <div key={s.label} className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all",
                s.active
                  ? "bg-[hsl(var(--tb-accent))] text-white border-[hsl(var(--tb-accent))]"
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}>
                {s.label}
                <span className={cn(
                  "text-[7px] px-1 py-0.5 rounded-full font-bold",
                  s.active ? "bg-white/20" : "bg-muted/60"
                )}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Date range presets */}
        <div className="mb-4">
          <p className="text-[9px] font-semibold text-muted-foreground mb-2">Date Range</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-muted/30 rounded-lg p-0.5">
              {datePresets.map((d) => (
                <span key={d.label} className={cn(
                  "px-2.5 py-1 rounded-md text-[9px] font-semibold transition-all cursor-pointer",
                  d.active
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}>{d.label}</span>
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground border border-border/30 rounded-lg px-2.5 py-1">
              <Calendar className="w-3 h-3" />
              <span>Feb 01 – Feb 28, 2026</span>
            </div>
          </div>
        </div>
        {/* Preview of filtered stats */}
        <div className="rounded-lg bg-muted/20 border border-border/30 p-3">
          <p className="text-[8px] font-semibold text-muted-foreground mb-2">Filtered Results Preview</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Trades", value: "62", icon: "📊" },
              { label: "Net P&L", value: "+₹42,850", color: "text-profit", icon: "💰" },
              { label: "Win Rate", value: "64.5%", color: "text-profit", icon: "🎯" },
              { label: "Avg R:R", value: "1:2.3", icon: "⚖️" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <span className="text-base">{s.icon}</span>
                <p className={cn("text-[10px] font-bold font-mono mt-0.5", s.color || "text-foreground")}>{s.value}</p>
                <p className="text-[7px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Note about tab sync */}
        <div className="mt-3 flex items-center gap-2 text-[8px] text-muted-foreground">
          <span className="text-base">🔄</span>
          <span>Filters apply across <span className="font-semibold text-foreground">all tabs</span> — Dashboard, Calendar, and Mistakes update in sync.</span>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   56. WatchlistDetailMockup — Full watchlist capabilities
   ────────────────────────────────────────────── */
export function WatchlistDetailMockup() {
  const watchlists = [
    { name: "Nifty 50 Picks", color: "bg-[hsl(var(--tb-accent))]", count: 8, active: true },
    { name: "Bank Stocks", color: "bg-[#229ED9]", count: 5, active: false },
    { name: "Momentum", color: "bg-profit", count: 3, active: false },
  ];
  const items = [
    { symbol: "RELIANCE", ltp: "₹2,867.30", change: "+1.42%", vol: "12.4M", high: "₹2,890", low: "₹2,835", changeColor: "text-profit", bgColor: "bg-profit/5" },
    { symbol: "HDFCBANK", ltp: "₹1,678.50", change: "-0.65%", vol: "8.7M", high: "₹1,695", low: "₹1,670", changeColor: "text-loss", bgColor: "bg-loss/5" },
    { symbol: "TCS", ltp: "₹3,542.00", change: "+0.88%", vol: "3.2M", high: "₹3,560", low: "₹3,510", changeColor: "text-profit", bgColor: "bg-profit/5" },
    { symbol: "INFY", ltp: "₹1,456.75", change: "+2.15%", vol: "6.1M", high: "₹1,462", low: "₹1,425", changeColor: "text-profit", bgColor: "bg-profit/5" },
    { symbol: "TATAMOTORS", ltp: "₹745.20", change: "-1.20%", vol: "15.8M", high: "₹758", low: "₹740", changeColor: "text-loss", bgColor: "bg-loss/5" },
  ];
  return (
    <MockupFrame className="my-6">
      <div className="rounded-xl bg-card border border-border/40 p-4">
        {/* Watchlist tabs */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5">
            {watchlists.map((w) => (
              <div key={w.name} className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border cursor-pointer transition-all",
                w.active
                  ? "border-[hsl(var(--tb-accent)/0.4)] bg-[hsl(var(--tb-accent)/0.08)] text-[hsl(var(--tb-accent))]"
                  : "border-border/30 text-muted-foreground hover:border-border"
              )}>
                <span className={cn("w-2 h-2 rounded-full", w.color)} />
                <span>{w.name}</span>
                <span className="text-[8px] bg-muted/60 px-1 py-0.5 rounded-full">{w.count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-lg bg-muted/40 px-2 py-1">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Add symbol…</span>
            </div>
            <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <span>Sort:</span>
              <span className="font-semibold text-foreground">% Change ↓</span>
            </div>
          </div>
        </div>
        {/* Table header */}
        <div className="grid grid-cols-7 gap-2 px-3 py-1.5 text-[8px] font-semibold text-muted-foreground border-b border-border/30">
          <span className="col-span-2">Symbol</span>
          <span className="text-right">LTP</span>
          <span className="text-right">Change</span>
          <span className="text-right">Volume</span>
          <span className="text-right">High / Low</span>
          <span className="text-right">Actions</span>
        </div>
        {/* Items */}
        <div className="divide-y divide-border/20">
          {items.map((item) => (
            <div key={item.symbol} className={cn("grid grid-cols-7 gap-2 px-3 py-2 items-center hover:bg-muted/20 transition-colors cursor-grab", item.bgColor)}>
              <div className="col-span-2 flex items-center gap-2">
                <span className="text-muted-foreground/30 text-[10px] cursor-grab">⠿</span>
                <span className="w-1.5 h-1.5 rounded-full bg-profit" />
                <span className="text-[11px] font-bold">{item.symbol}</span>
              </div>
              <span className="text-right text-[10px] font-mono font-bold">{item.ltp}</span>
              <span className={cn("text-right text-[10px] font-mono font-bold", item.changeColor)}>{item.change}</span>
              <span className="text-right text-[9px] font-mono text-muted-foreground">{item.vol}</span>
              <span className="text-right text-[8px] font-mono text-muted-foreground">{item.high} / {item.low}</span>
              <div className="flex items-center justify-end gap-1">
                <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-[hsl(var(--warning)/0.1)] text-[hsl(var(--warning))] cursor-pointer hover:bg-[hsl(var(--warning)/0.2)]">Alert</span>
                <span className="px-1.5 py-0.5 rounded text-[7px] font-bold bg-[hsl(var(--tb-accent)/0.1)] text-[hsl(var(--tb-accent))] cursor-pointer hover:bg-[hsl(var(--tb-accent)/0.2)]">Trade</span>
              </div>
            </div>
          ))}
        </div>
        {/* Market status */}
        <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/20 p-2 text-[9px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
            <span>Market Open · NSE</span>
          </div>
          <span>Last updated: 11:42 AM IST</span>
        </div>
      </div>
    </MockupFrame>
  );
}
