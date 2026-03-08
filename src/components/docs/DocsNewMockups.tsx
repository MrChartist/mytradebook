import { cn } from "@/lib/utils";
import {
  Share2, Award, Calculator, ClipboardCheck, MessageSquare,
  Trophy, Target, Shield, Star, TrendingUp, Zap, Crown,
  CheckCircle2, ArrowRight, Heart, Users, Download, Lock
} from "lucide-react";

/* ──────────────────────────────────────────────
   Shared wrapper
   ────────────────────────────────────────────── */
function MockupFrame({ children, className, label }: { children: React.ReactNode; className?: string; label?: string }) {
  return (
    <div className={cn("rounded-xl border border-border/20 bg-card/50 overflow-hidden hover:border-border/30 transition-all duration-200", className)}>
      <div className="flex items-center gap-1.5 px-3.5 py-1.5 border-b border-border/15 bg-muted/15">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-loss/40" />
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--warning))]/40" />
          <div className="w-2 h-2 rounded-full bg-profit/40" />
        </div>
        {label && <span className="text-[8px] font-semibold text-muted-foreground/40 ml-1.5 tracking-wide uppercase">{label}</span>}
      </div>
      <div className="p-4 md:p-6 bg-gradient-to-b from-card/80 to-muted/5">{children}</div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   1. ShareCardsMockup — P&L and Trade Share Cards
   ────────────────────────────────────────────── */
export function ShareCardsMockup() {
  return (
    <MockupFrame className="my-6" label="Share Cards">
      <div className="grid md:grid-cols-2 gap-4">
        {/* P&L Share Card */}
        <div className="rounded-xl bg-gradient-to-br from-profit/10 to-profit/5 border border-profit/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-profit" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-profit">P&L Share Card</span>
          </div>
          <div className="text-center py-4">
            <p className="text-[10px] text-muted-foreground mb-1">Today's P&L</p>
            <p className="text-3xl font-bold font-mono text-profit">+₹12,450</p>
            <p className="text-[10px] text-profit/70 mt-1">+1.24% of capital</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-card/50 p-2">
              <p className="text-[9px] text-muted-foreground">Win Rate</p>
              <p className="text-xs font-bold font-mono">68%</p>
            </div>
            <div className="rounded-lg bg-card/50 p-2">
              <p className="text-[9px] text-muted-foreground">Trades</p>
              <p className="text-xs font-bold font-mono">12</p>
            </div>
            <div className="rounded-lg bg-card/50 p-2">
              <p className="text-[9px] text-muted-foreground">Streak</p>
              <p className="text-xs font-bold font-mono text-profit">5 🔥</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-profit/10 flex items-center justify-between text-[9px] text-muted-foreground/50">
            <span>via TradeBook</span>
            <span>March 2026</span>
          </div>
        </div>

        {/* Trade Share Card */}
        <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Trade Share Card</span>
          </div>
          <div className="text-center py-3">
            <p className="text-sm font-bold">RELIANCE</p>
            <p className="text-[10px] text-muted-foreground">NSE · Equity Intraday</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center mb-3">
            <div className="rounded-lg bg-card/50 p-2">
              <p className="text-[9px] text-muted-foreground">Entry</p>
              <p className="text-xs font-mono font-bold">₹2,845.50</p>
            </div>
            <div className="rounded-lg bg-card/50 p-2">
              <p className="text-[9px] text-muted-foreground">Exit</p>
              <p className="text-xs font-mono font-bold">₹2,890.00</p>
            </div>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold font-mono text-profit">+₹4,450</p>
            <p className="text-[10px] text-profit/70">+1.56% return</p>
          </div>
          <div className="mt-3 pt-2 border-t border-primary/10 flex items-center justify-between text-[9px] text-muted-foreground/50">
            <span>Breakout Setup · 15m</span>
            <span>via TradeBook</span>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   2. AchievementsMockup — Badge grid
   ────────────────────────────────────────────── */
export function AchievementsMockup() {
  const badges = [
    { icon: "🎯", title: "First Blood", desc: "Close your first trade", unlocked: true },
    { icon: "🔥", title: "Hot Streak", desc: "5 consecutive wins", unlocked: true },
    { icon: "📊", title: "Data Nerd", desc: "Log 50 trades", unlocked: true },
    { icon: "🛡️", title: "Risk Master", desc: "Never exceed 2% risk", unlocked: false },
    { icon: "⚡", title: "Speed Demon", desc: "Close 10 intraday trades", unlocked: false },
    { icon: "👑", title: "Century Club", desc: "100 trades logged", unlocked: false },
  ];
  return (
    <MockupFrame className="my-6" label="Achievements">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {badges.map((b) => (
          <div key={b.title} className={cn(
            "rounded-xl border p-3 text-center transition-all duration-200",
            b.unlocked
              ? "border-primary/20 bg-primary/[0.04] hover:border-primary/30 hover:scale-105"
              : "border-border/15 bg-muted/10 opacity-50 grayscale"
          )}>
            <div className="text-2xl mb-1.5">{b.icon}</div>
            <p className="text-[10px] font-bold text-foreground leading-tight">{b.title}</p>
            <p className="text-[8px] text-muted-foreground mt-0.5">{b.desc}</p>
            {b.unlocked && <CheckCircle2 className="w-3 h-3 text-profit mx-auto mt-1.5" />}
          </div>
        ))}
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   3. PositionSizingMockup — Calculator
   ────────────────────────────────────────────── */
export function PositionSizingCalcMockup() {
  return (
    <MockupFrame className="my-6" label="Position Sizing Calculator">
      <div className="max-w-md mx-auto">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border/30 p-3">
              <p className="text-[9px] text-muted-foreground mb-1">Capital</p>
              <p className="text-sm font-mono font-bold">₹10,00,000</p>
            </div>
            <div className="rounded-lg bg-card border border-border/30 p-3">
              <p className="text-[9px] text-muted-foreground mb-1">Risk %</p>
              <p className="text-sm font-mono font-bold text-[hsl(var(--warning))]">1.5%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-card border border-border/30 p-3">
              <p className="text-[9px] text-muted-foreground mb-1">Entry Price</p>
              <p className="text-sm font-mono font-bold">₹2,845.50</p>
            </div>
            <div className="rounded-lg bg-card border border-border/30 p-3">
              <p className="text-[9px] text-muted-foreground mb-1">Stop Loss</p>
              <p className="text-sm font-mono font-bold text-loss">₹2,810.00</p>
            </div>
          </div>
          <div className="h-px bg-border/20" />
          <div className="rounded-xl bg-primary/[0.06] border border-primary/20 p-4 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">Recommended Position Size</p>
            <p className="text-2xl font-bold font-mono text-primary">422 shares</p>
            <p className="text-[10px] text-muted-foreground mt-1">Max loss: ₹15,000 · Risk: ₹35.50/share</p>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   4. TradingRulesMockup — Pre-trade checklist
   ────────────────────────────────────────────── */
export function TradingRulesMockup() {
  const rules = [
    { text: "Check trend on higher timeframe", checked: true },
    { text: "Confirm volume supports the move", checked: true },
    { text: "Risk is within 1.5% of capital", checked: true },
    { text: "Not revenge trading after a loss", checked: false },
    { text: "Market sentiment aligns with trade", checked: false },
  ];
  return (
    <MockupFrame className="my-6" label="Trading Rules Checklist">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          <p className="text-sm font-bold">Pre-Trade Checklist</p>
          <span className="ml-auto text-[10px] font-mono text-muted-foreground">3/5 checked</span>
        </div>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.text} className={cn(
              "flex items-center gap-3 rounded-lg border p-3 transition-all duration-200",
              rule.checked ? "border-profit/20 bg-profit/[0.03]" : "border-border/20 bg-card/30"
            )}>
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                rule.checked ? "bg-profit border-profit" : "border-border/40"
              )}>
                {rule.checked && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={cn("text-[12px]", rule.checked ? "text-foreground" : "text-muted-foreground")}>{rule.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-[hsl(var(--warning))]/[0.06] border border-[hsl(var(--warning))]/20 text-center">
          <p className="text-[11px] text-[hsl(var(--warning))] font-semibold">⚠️ Complete all rules before submitting your trade</p>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   5. TradeCoachMockup — AI coaching feedback
   ────────────────────────────────────────────── */
export function TradeCoachMockup() {
  return (
    <MockupFrame className="my-6" label="AI Trade Coach">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">AI Trade Coach</p>
            <p className="text-[10px] text-muted-foreground">Feedback for RELIANCE BUY trade</p>
          </div>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-profit/10 text-profit text-[10px] font-semibold">+₹4,450</span>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-profit/[0.04] border border-profit/15 p-3">
            <p className="text-[10px] font-bold text-profit mb-1.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> What Went Well
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              Excellent entry timing — you caught the breakout candle within the first 5 minutes. Your 1.2% stop loss was well-positioned below the support zone.
            </p>
          </div>

          <div className="rounded-lg bg-[hsl(var(--warning))]/[0.04] border border-[hsl(var(--warning))]/15 p-3">
            <p className="text-[10px] font-bold text-[hsl(var(--warning))] mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> Room for Improvement
            </p>
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              You exited at Target 1 but the stock continued +2.3% higher. Consider trailing your stop loss to lock in gains while letting winners run.
            </p>
          </div>

          <div className="rounded-lg bg-primary/[0.04] border border-primary/15 p-3">
            <p className="text-[10px] font-bold text-primary mb-1.5 flex items-center gap-1">
              <Star className="w-3 h-3" /> Overall Rating
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
              <Star className="w-4 h-4 text-muted-foreground/20" />
              <span className="text-[12px] font-mono font-bold ml-2">4/5</span>
            </div>
          </div>
        </div>
      </div>
    </MockupFrame>
  );
}

/* ──────────────────────────────────────────────
   6. StreakShareMockup — Streak share card
   ────────────────────────────────────────────── */
export function StreakShareMockup() {
  return (
    <MockupFrame className="my-6" label="Streak Share Card">
      <div className="max-w-sm mx-auto rounded-xl bg-gradient-to-br from-[hsl(var(--tb-accent))]/10 to-primary/5 border border-primary/15 p-6 text-center">
        <div className="text-4xl mb-2">🔥</div>
        <p className="text-2xl font-bold font-mono">7 Day Streak</p>
        <p className="text-[11px] text-muted-foreground mt-1">7 consecutive profitable days</p>
        <div className="grid grid-cols-7 gap-1 mt-4">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Mon", "Tue"].map((d, i) => (
            <div key={i} className="rounded-md bg-profit/20 p-1.5 text-center">
              <p className="text-[8px] text-muted-foreground">{d}</p>
              <CheckCircle2 className="w-3 h-3 text-profit mx-auto mt-0.5" />
            </div>
          ))}
        </div>
        <p className="text-[9px] text-muted-foreground/50 mt-4">via TradeBook · March 2026</p>
      </div>
    </MockupFrame>
  );
}
