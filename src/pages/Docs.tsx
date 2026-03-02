import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, BookOpen, BarChart3, Bell, Target, LineChart, Shield,
  Layers, Keyboard, HelpCircle, ArrowLeft, ChevronRight, CheckCircle2,
  Zap, Clock, Activity, Globe, Smartphone, Send, CandlestickChart,
  PieChart, Calendar, MousePointerClick, Eye, Play, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sections = [
  { id: "getting-started", label: "Getting Started", icon: Play },
  { id: "trade-journal", label: "Trade Journaling", icon: BookOpen },
  { id: "segments", label: "Market Segments", icon: Layers },
  { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
  { id: "alerts", label: "Alerts & Automation", icon: Bell },
  { id: "broker", label: "Broker Integration", icon: LineChart },
  { id: "rules", label: "Rules Engine", icon: Shield },
  { id: "shortcuts", label: "Keyboard Shortcuts", icon: Keyboard },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

function SideNav({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <nav className="space-y-1">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => onSelect(s.id)}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left",
            active === s.id
              ? "bg-[hsl(24_90%_55%/0.08)] text-[hsl(24_90%_55%)]"
              : "text-[hsl(20_8%_46%)] hover:bg-black/[0.03] hover:text-[hsl(20_15%_10%)]"
          )}
        >
          <s.icon className="w-4 h-4 shrink-0" />
          {s.label}
        </button>
      ))}
    </nav>
  );
}

function DocSection({ id, title, icon: Icon, children }: { id: string; title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'hsl(24 90% 55% / 0.08)' }}>
          <Icon className="w-5 h-5" style={{ color: 'hsl(24 90% 55%)' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'hsl(20 15% 10%)' }}>{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed space-y-4" style={{ color: 'hsl(20 8% 30%)' }}>
        {children}
      </div>
    </section>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5 my-4">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'hsl(24 90% 55%)' }} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function InfoCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border p-5" style={{ borderColor: 'hsl(30 12% 92%)', background: '#fff' }}>
      <h4 className="font-semibold mb-1.5" style={{ color: 'hsl(20 15% 10%)' }}>{title}</h4>
      <p className="text-sm" style={{ color: 'hsl(20 8% 46%)' }}>{description}</p>
    </div>
  );
}

export default function Docs() {
  const navigate = useNavigate();
  const [active, setActive] = useState("getting-started");

  const scrollTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="light min-h-screen font-sans" style={{ background: '#fafaf8', color: 'hsl(20 15% 10%)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ borderColor: 'hsl(30 12% 92%)', background: 'rgba(250,250,248,0.8)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/landing")} className="gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <div className="h-5 w-px" style={{ background: 'hsl(30 12% 92%)' }} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'hsl(24 90% 55%)' }}>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">TradeBook Docs</span>
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/login")} className="rounded-full px-5" style={{ background: 'hsl(24 90% 55%)', color: '#fff' }}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b" style={{ borderColor: 'hsl(30 12% 92%)', background: 'linear-gradient(135deg, hsl(24 90% 97%) 0%, #fafaf8 60%, hsl(280 50% 98%) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-extrabold mb-4"
          >
            Documentation
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg max-w-xl mx-auto"
            style={{ color: 'hsl(20 8% 46%)' }}
          >
            Everything you need to know about TradeBook — from getting started to advanced analytics.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <SideNav active={active} onSelect={scrollTo} />
          </div>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden mb-8 overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border",
                  active === s.id ? "border-[hsl(24_90%_55%/0.3)] bg-[hsl(24_90%_55%/0.08)] text-[hsl(24_90%_55%)]" : "border-[hsl(30_12%_92%)]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <DocSection id="getting-started" title="Getting Started" icon={Play}>
            <p>
              TradeBook is a professional trading journal built specifically for Indian markets. Whether you trade Equities, F&O, or Commodities — TradeBook helps you track, analyze, and improve your trading performance.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 my-6">
              <InfoCard title="1. Create Account" description="Sign up with your email. Get 14 days of Pro features free — no credit card required." />
              <InfoCard title="2. Log Your First Trade" description="Add trades manually or connect your Dhan broker for automatic sync." />
              <InfoCard title="3. Analyze & Improve" description="Use segment-level analytics, equity curves, and pattern recognition to find your edge." />
            </div>
            <p>
              Every new account starts with a 14-day Pro trial. After the trial, you can continue on the Free plan (up to 50 trades/month) or upgrade to Pro for unlimited access.
            </p>
          </DocSection>

          <DocSection id="trade-journal" title="Trade Journaling" icon={BookOpen}>
            <p>
              The heart of TradeBook is the trade journal. Every trade you log captures critical data that powers your analytics and helps you identify patterns.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>What you can track</h3>
            <FeatureList items={[
              "Symbol, entry/exit price, quantity, and P&L",
              "Setup tags (e.g., Breakout, Pullback, Gap-up)",
              "Mistake tags to identify recurring errors",
              "Chart images and annotations for visual review",
              "Pattern recognition tags (candlestick, volume patterns)",
              "Confidence score and emotion tagging",
              "Post-trade review with execution quality rating",
              "Notes and rationale for each trade",
            ]} />
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Trade Templates</h3>
            <p>
              Create reusable templates for your common setups. Templates pre-fill segment, trade type, default stop loss, tags, and even notes — saving you time on every trade entry.
            </p>
          </DocSection>

          <DocSection id="segments" title="Market Segments" icon={Layers}>
            <p>
              Unlike generic journals, TradeBook understands that different market segments require different analysis. Your Equity Intraday trades should be analyzed separately from your Options trades.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 my-6">
              <InfoCard title="Equity Intraday" description="Day trades in NSE/BSE equities. Analyzed by time of entry, win rate, and average holding period." />
              <InfoCard title="Equity Positional" description="Swing and positional trades. Track entry/exit timing, sector performance, and conviction scores." />
              <InfoCard title="Futures" description="NSE F&O futures with lot-size aware P&L, contract expiry tracking, and rollover analysis." />
              <InfoCard title="Options" description="Options trades with strike selection analysis, premium decay tracking, and strategy grouping." />
            </div>
            <InfoCard title="Commodities" description="MCX commodity trades including Gold, Silver, Crude — with segment-specific analytics and P&L tracking." />
            <p className="mt-4">
              Each segment has its own equity curve, win rate, average gain/loss, and performance metrics — giving you a complete picture of where your edge lies.
            </p>
          </DocSection>

          <DocSection id="analytics" title="Analytics & Reports" icon={BarChart3}>
            <p>
              TradeBook provides 50+ analytics metrics across segments to help you understand your trading performance at a granular level.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Key Analytics</h3>
            <FeatureList items={[
              "Equity curve with drawdown analysis and max drawdown tracking",
              "Win rate, profit factor, and expectancy by segment",
              "Day-of-week and time-of-day performance heatmaps",
              "Setup tag performance — see which setups actually work",
              "Streak tracking — winning and losing streaks with alerts",
              "Risk-reward ratio analysis for each trade and segment",
              "Risk of Ruin calculator based on your actual trading data",
              "AI-powered trade insights that surface actionable patterns",
            ]} />
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Weekly Reports</h3>
            <p>
              Every week, TradeBook generates a comprehensive report summarizing your trades, P&L, top setups, common mistakes, and key metrics — delivered straight to your dashboard and optionally via Telegram.
            </p>
          </DocSection>

          <DocSection id="alerts" title="Alerts & Automation" icon={Bell}>
            <p>
              Stay on top of the market with real-time price alerts, scanner-based triggers, and instant notifications.
            </p>
            <FeatureList items={[
              "Price alerts: Above, Below, Cross Above, Cross Below",
              "Percentage change alerts for breakout detection",
              "Volume spike detection for unusual activity",
              "Alert chaining — trigger follow-up alerts automatically",
              "Telegram notifications for instant delivery",
              "Alert cooldown and recurrence settings (Once, Daily, Continuous)",
              "Active-hours-only mode to avoid noise outside market hours",
              "Batch alerts for watchlist-wide monitoring",
            ]} />
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Trailing Stop Loss Engine</h3>
            <p>
              TradeBook's built-in TSL engine monitors your open positions and automatically tracks the stop loss as price moves in your favor. Configure activation price, step size, gap, and cooldown — all per-segment.
            </p>
          </DocSection>

          <DocSection id="broker" title="Broker Integration" icon={LineChart}>
            <p>
              Connect your Dhan broker account for a seamless trading experience. More brokers (Zerodha, Angel One) are on the roadmap.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Dhan Integration Features</h3>
            <FeatureList items={[
              "Live market prices on your dashboard and watchlists",
              "Portfolio auto-sync — import your trades automatically",
              "One-click order execution from trade entries",
              "Real-time P&L tracking for open positions",
              "Secure OAuth-based authentication (your credentials are never stored)",
            ]} />
            <div className="rounded-xl border p-5 mt-4" style={{ borderColor: 'hsl(24 90% 55% / 0.2)', background: 'hsl(24 90% 55% / 0.04)' }}>
              <p className="text-sm font-medium" style={{ color: 'hsl(24 90% 55%)' }}>
                <Zap className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                To connect Dhan, go to Settings → Integrations → Dhan and follow the authorization flow.
              </p>
            </div>
          </DocSection>

          <DocSection id="rules" title="Rules Engine" icon={Shield}>
            <p>
              Discipline is the foundation of consistent trading. TradeBook's Rules Engine helps you enforce your trading rules before every trade.
            </p>
            <FeatureList items={[
              "Create custom pre-trade checklists",
              "Enforce rules before trade entry (optional)",
              "Tag mistakes on losing trades for pattern identification",
              "Track discipline score over time",
              "Mistake frequency analysis in weekly reports",
              "Common mistake detection with AI-powered insights",
            ]} />
            <p>
              Combined with setup tags and post-trade reviews, the Rules Engine gives you a complete feedback loop for continuous improvement.
            </p>
          </DocSection>

          <DocSection id="shortcuts" title="Keyboard Shortcuts" icon={Keyboard}>
            <p>
              Power users love keyboard shortcuts. TradeBook supports a command palette and quick actions accessible from anywhere.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 my-6">
              {[
                { keys: "⌘ + K", action: "Open Command Palette" },
                { keys: "⌘ + N", action: "New Trade" },
                { keys: "⌘ + J", action: "Open Journal" },
                { keys: "⌘ + A", action: "Go to Analytics" },
                { keys: "⌘ + S", action: "Go to Studies" },
                { keys: "⌘ + W", action: "Go to Watchlist" },
                { keys: "⌘ + ,", action: "Open Settings" },
                { keys: "Esc", action: "Close Modal/Palette" },
              ].map((s) => (
                <div key={s.keys} className="flex items-center justify-between rounded-lg border px-4 py-3" style={{ borderColor: 'hsl(30 12% 92%)', background: '#fff' }}>
                  <span className="text-sm">{s.action}</span>
                  <kbd className="px-2 py-1 rounded-md text-xs font-mono font-semibold" style={{ background: 'hsl(30 15% 95%)', color: 'hsl(20 8% 46%)' }}>{s.keys}</kbd>
                </div>
              ))}
            </div>
          </DocSection>

          <DocSection id="faq" title="Frequently Asked Questions" icon={HelpCircle}>
            <div className="space-y-6">
              {[
                { q: "Is TradeBook free to use?", a: "Yes! The Free plan includes up to 50 trades/month, basic analytics, and 1 watchlist — forever free. Upgrade to Pro for unlimited trades, Telegram notifications, broker integration, and advanced analytics." },
                { q: "Which brokers are supported?", a: "Currently we support Dhan for live prices, portfolio auto-sync, and one-click order execution. More brokers (Zerodha, Angel One) are on the roadmap." },
                { q: "Is my trading data safe?", a: "Absolutely. All data is encrypted at rest and in transit. Your data is yours — we never share, sell, or use it for any purpose other than powering your dashboard." },
                { q: "Can I use TradeBook for Commodities and F&O?", a: "Yes! TradeBook supports 5 market segments: Equity Intraday, Equity Positional, Futures, Options, and Commodities. Each segment has its own analytics and reporting." },
                { q: "How does the 14-day Pro trial work?", a: "Every new signup gets full Pro access for 14 days — no credit card required. After the trial, you can continue on the Free plan or upgrade to keep Pro features." },
                { q: "Can I export my data?", a: "Yes, you can export all your trades as CSV from the Trades page. We believe your data should always be portable." },
                { q: "Do you support multi-leg option strategies?", a: "Yes! You can create multi-leg strategies (spreads, straddles, strangles) and track combined P&L across all legs." },
              ].map((item) => (
                <div key={item.q}>
                  <h4 className="font-semibold mb-2" style={{ color: 'hsl(20 15% 10%)' }}>{item.q}</h4>
                  <p style={{ color: 'hsl(20 8% 36%)' }}>{item.a}</p>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Bottom CTA */}
          <div className="rounded-2xl p-10 text-center mt-8" style={{ background: 'linear-gradient(135deg, hsl(24 90% 96%) 0%, hsl(340 60% 97%) 100%)' }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'hsl(20 15% 10%)' }}>Ready to find your edge?</h3>
            <p className="mb-6" style={{ color: 'hsl(20 8% 46%)' }}>Join 1,200+ traders who journal, analyze, and compound their edge daily.</p>
            <Button size="lg" onClick={() => navigate("/login")} className="rounded-full px-8 gap-2" style={{ background: 'hsl(24 90% 55%)', color: '#fff' }}>
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t py-8 text-center" style={{ borderColor: 'hsl(30 12% 92%)' }}>
        <p className="text-xs" style={{ color: 'hsl(20 8% 46% / 0.6)' }}>
          © {new Date().getFullYear()} TradeBook. All rights reserved. Not SEBI registered. For educational purposes only.
        </p>
      </footer>
    </div>
  );
}
