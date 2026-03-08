import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, TrendingUp, Bell, BookOpen, CalendarDays, AlertTriangle,
  BarChart3, FileText, Settings, Eye, Sparkles, Plus, Clock, Zap,
} from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RECENT_ITEMS_KEY = "tradebook-recent-items";
const MAX_RECENT = 5;

interface RecentItem {
  type: "trade" | "page";
  label: string;
  path: string;
  timestamp: number;
  meta?: string;
}

function getRecentItems(): RecentItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_ITEMS_KEY) || "[]");
  } catch { return []; }
}

export function addRecentItem(item: Omit<RecentItem, "timestamp">) {
  const items = getRecentItems().filter((i) => i.path !== item.path);
  items.unshift({ ...item, timestamp: Date.now() });
  localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { label: "Trades", path: "/trades", icon: TrendingUp, group: "Navigate" },
  { label: "Alerts", path: "/alerts", icon: Bell, group: "Navigate" },
  { label: "Journal", path: "/journal", icon: BookOpen, group: "Navigate" },
  { label: "Studies", path: "/studies", icon: Sparkles, group: "Navigate" },
  { label: "Watchlist", path: "/watchlist", icon: Eye, group: "Navigate" },
  { label: "Calendar", path: "/calendar", icon: CalendarDays, group: "Navigate" },
  { label: "Mistakes", path: "/mistakes", icon: AlertTriangle, group: "Navigate" },
  { label: "Analytics", path: "/analytics", icon: BarChart3, group: "Navigate" },
  { label: "Reports", path: "/reports", icon: FileText, group: "Navigate" },
  { label: "Settings", path: "/settings", icon: Settings, group: "Navigate" },
];

const ACTIONS = [
  { label: "New Trade", action: "new-trade", icon: Plus, group: "Actions" },
  { label: "New Alert", action: "new-alert", icon: Bell, group: "Actions" },
  { label: "New Study", action: "new-study", icon: Sparkles, group: "Actions" },
];

// Quick trade entry steps
type QuickTradeStep = "idle" | "symbol" | "type" | "price" | "qty" | "confirm";

const TRADE_TYPES = [
  { label: "BUY (Long)", value: "BUY" },
  { label: "SELL (Short)", value: "SELL" },
];

const SEGMENTS = [
  { label: "Equity Intraday", value: "Equity_Intraday" },
  { label: "Equity Positional", value: "Equity_Positional" },
  { label: "Futures", value: "Futures" },
  { label: "Options", value: "Options" },
];

interface CommandPaletteProps {
  onAction?: (action: string) => void;
}

export function CommandPalette({ onAction }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [quickTradeStep, setQuickTradeStep] = useState<QuickTradeStep>("idle");
  const [quickTrade, setQuickTrade] = useState({ symbol: "", type: "BUY", segment: "Equity_Intraday", price: "", qty: "" });
  const navigate = useNavigate();

  const { trades } = useTrades();
  const { alerts } = useAlerts();
  const { entries: journalEntries } = useDailyJournal();

  const recentItems = useMemo(() => open ? getRecentItems() : [], [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName))) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setQuickTradeStep("idle");
      setQuickTrade({ symbol: "", type: "BUY", segment: "Equity_Intraday", price: "", qty: "" });
    }
  }, [open]);

  const q = query.toLowerCase().trim();
  const showDynamic = q.length >= 2;

  const filteredTrades = useMemo(() => {
    if (!showDynamic || quickTradeStep !== "idle") return [];
    return trades.filter((t) => t.symbol.toLowerCase().includes(q)).slice(0, 5);
  }, [trades, q, showDynamic, quickTradeStep]);

  const filteredAlerts = useMemo(() => {
    if (!showDynamic || quickTradeStep !== "idle") return [];
    return alerts.filter((a) => a.symbol.toLowerCase().includes(q)).slice(0, 5);
  }, [alerts, q, showDynamic, quickTradeStep]);

  const filteredJournal = useMemo(() => {
    if (!showDynamic || quickTradeStep !== "idle") return [];
    return journalEntries
      .filter((j) => {
        const searchable = [j.pre_market_plan, j.post_market_review, j.lessons_learned, j.market_outlook].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, 3);
  }, [journalEntries, q, showDynamic, quickTradeStep]);

  // Unique symbols from user's trade history
  const knownSymbols = useMemo(() => {
    const syms = new Set(trades.map((t) => t.symbol));
    return Array.from(syms).slice(0, 20);
  }, [trades]);

  const handleSelect = useCallback((value: string) => {
    // Quick trade flow
    if (value === "quick-trade") {
      setQuickTradeStep("symbol");
      setQuery("");
      return;
    }

    if (quickTradeStep === "symbol") {
      setQuickTrade((prev) => ({ ...prev, symbol: value.toUpperCase() }));
      setQuickTradeStep("type");
      setQuery("");
      return;
    }

    if (quickTradeStep === "type") {
      const [type, segment] = value.split("|");
      setQuickTrade((prev) => ({ ...prev, type, segment }));
      setQuickTradeStep("price");
      setQuery("");
      return;
    }

    if (quickTradeStep === "price") {
      setQuickTrade((prev) => ({ ...prev, price: value }));
      setQuickTradeStep("qty");
      setQuery("");
      return;
    }

    if (quickTradeStep === "qty") {
      setQuickTrade((prev) => ({ ...prev, qty: value }));
      setQuickTradeStep("confirm");
      setQuery("");
      return;
    }

    if (value === "confirm-quick-trade") {
      setOpen(false);
      // Navigate to trades with pre-filled params
      const params = new URLSearchParams({
        quick: "1",
        symbol: quickTrade.symbol,
        type: quickTrade.type,
        segment: quickTrade.segment,
        price: quickTrade.price,
        qty: quickTrade.qty,
      });
      navigate(`/trades?${params.toString()}`);
      return;
    }

    setOpen(false);
    const navItem = NAV_ITEMS.find((n) => n.label.toLowerCase() === value);
    if (navItem) {
      addRecentItem({ type: "page", label: navItem.label, path: navItem.path });
      navigate(navItem.path);
      return;
    }
    const actionItem = ACTIONS.find((a) => a.label.toLowerCase() === value);
    if (actionItem) { onAction?.(actionItem.action); return; }

    if (value.startsWith("trade:")) {
      const symbol = value.replace("trade:", "");
      addRecentItem({ type: "trade", label: symbol, path: `/trades?search=${encodeURIComponent(symbol)}`, meta: "Trade" });
      navigate(`/trades?search=${encodeURIComponent(symbol)}`);
      return;
    }
    if (value.startsWith("alert:")) { navigate("/alerts"); return; }
    if (value.startsWith("journal:")) { navigate("/journal"); return; }
    if (value.startsWith("recent:")) {
      const path = value.replace("recent:", "");
      navigate(path);
      return;
    }

    navigate(`/trades?search=${encodeURIComponent(value)}`);
  }, [navigate, onAction, quickTradeStep, quickTrade]);

  const getPlaceholder = () => {
    switch (quickTradeStep) {
      case "symbol": return "Type symbol name (e.g. RELIANCE, NIFTY)…";
      case "type": return "Select trade type…";
      case "price": return "Enter entry price…";
      case "qty": return "Enter quantity…";
      case "confirm": return "Confirm trade details…";
      default: return "Search pages, trades, alerts… (⌘K)";
    }
  };

  // Handle Enter for free-text steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      if (quickTradeStep === "symbol") {
        handleSelect(query.trim());
        e.preventDefault();
      } else if (quickTradeStep === "price") {
        handleSelect(query.trim());
        e.preventDefault();
      } else if (quickTradeStep === "qty") {
        handleSelect(query.trim());
        e.preventDefault();
      }
    }
    if (e.key === "Escape" && quickTradeStep !== "idle") {
      setQuickTradeStep("idle");
      setQuery("");
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <div onKeyDown={handleKeyDown}>
        <CommandInput placeholder={getPlaceholder()} value={query} onValueChange={setQuery} />
      </div>
      <CommandList>
        <CommandEmpty>
          {quickTradeStep === "symbol" && query ? (
            <button
              className="w-full text-left px-2 py-1.5 text-sm text-primary"
              onClick={() => handleSelect(query.trim())}
            >
              Use "{query.toUpperCase()}" →
            </button>
          ) : quickTradeStep === "price" && query ? (
            <button
              className="w-full text-left px-2 py-1.5 text-sm text-primary"
              onClick={() => handleSelect(query.trim())}
            >
              Set price ₹{query} →
            </button>
          ) : quickTradeStep === "qty" && query ? (
            <button
              className="w-full text-left px-2 py-1.5 text-sm text-primary"
              onClick={() => handleSelect(query.trim())}
            >
              Set quantity {query} →
            </button>
          ) : (
            "No results found."
          )}
        </CommandEmpty>

        {/* Quick Trade Flow */}
        {quickTradeStep === "idle" && (
          <>
            {!showDynamic && recentItems.length > 0 && (
              <>
                <CommandGroup heading="Recent">
                  {recentItems.map((item) => (
                    <CommandItem key={item.path} value={`recent:${item.path}`} onSelect={handleSelect}>
                      <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      {item.meta && <span className="text-xs text-muted-foreground ml-2">{item.meta}</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </>
            )}

            <CommandGroup heading="Navigate">
              {NAV_ITEMS.map((item) => (
                <CommandItem key={item.path} value={item.label} onSelect={handleSelect}>
                  <item.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandSeparator />

            <CommandGroup heading="Quick Actions">
              <CommandItem value="quick-trade" onSelect={handleSelect}>
                <Zap className="w-4 h-4 mr-2 text-warning" />
                <span className="font-medium">Quick Trade Entry</span>
                <Badge variant="outline" className="ml-auto text-[10px] border-warning/30 text-warning">⚡ Keyboard</Badge>
              </CommandItem>
              {ACTIONS.map((item) => (
                <CommandItem key={item.action} value={item.label} onSelect={handleSelect}>
                  <item.icon className="w-4 h-4 mr-2 text-primary" />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {quickTradeStep === "symbol" && (
          <CommandGroup heading="🔍 Select Symbol">
            {knownSymbols
              .filter((s) => !q || s.toLowerCase().includes(q))
              .slice(0, 8)
              .map((sym) => (
                <CommandItem key={sym} value={sym} onSelect={handleSelect}>
                  <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                  {sym}
                </CommandItem>
              ))}
          </CommandGroup>
        )}

        {quickTradeStep === "type" && (
          <CommandGroup heading={`📊 ${quickTrade.symbol} — Select Type & Segment`}>
            {TRADE_TYPES.map((tt) =>
              SEGMENTS.map((seg) => (
                <CommandItem
                  key={`${tt.value}|${seg.value}`}
                  value={`${tt.value}|${seg.value}`}
                  onSelect={handleSelect}
                >
                  <span className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    tt.value === "BUY" ? "bg-profit" : "bg-loss"
                  )} />
                  {tt.label} — {seg.label}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        )}

        {quickTradeStep === "price" && (
          <CommandGroup heading={`💰 ${quickTrade.symbol} ${quickTrade.type} — Entry Price`}>
            <CommandItem disabled>
              <span className="text-xs text-muted-foreground">Type price and press Enter</span>
            </CommandItem>
          </CommandGroup>
        )}

        {quickTradeStep === "qty" && (
          <CommandGroup heading={`📦 ${quickTrade.symbol} @ ₹${quickTrade.price} — Quantity`}>
            {[1, 10, 25, 50, 100].map((qty) => (
              <CommandItem key={qty} value={String(qty)} onSelect={handleSelect}>
                {qty} shares
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {quickTradeStep === "confirm" && (
          <CommandGroup heading="✅ Confirm Quick Trade">
            <CommandItem value="confirm-quick-trade" onSelect={handleSelect}>
              <Zap className="w-4 h-4 mr-2 text-profit" />
              <div className="flex-1">
                <p className="font-medium">{quickTrade.type} {quickTrade.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {quickTrade.qty} qty @ ₹{quickTrade.price} • {quickTrade.segment.replace("_", " ")}
                </p>
              </div>
              <Badge className="bg-profit/10 text-profit border-profit/20">Create →</Badge>
            </CommandItem>
          </CommandGroup>
        )}

        {/* Dynamic search results (only in idle mode) */}
        {quickTradeStep === "idle" && filteredTrades.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Trades">
              {filteredTrades.map((t) => (
                <CommandItem key={t.id} value={`trade:${t.symbol}`} onSelect={handleSelect}>
                  <TrendingUp className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="flex-1">{t.symbol}</span>
                  <Badge variant="outline" className={cn("ml-2 text-xs", t.pnl && t.pnl > 0 ? "text-profit border-profit/30" : t.pnl && t.pnl < 0 ? "text-loss border-loss/30" : "")}>
                    {t.status} {t.pnl != null ? `₹${t.pnl.toFixed(0)}` : ""}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {quickTradeStep === "idle" && filteredAlerts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Alerts">
              {filteredAlerts.map((a) => (
                <CommandItem key={a.id} value={`alert:${a.symbol}`} onSelect={handleSelect}>
                  <Bell className="w-4 h-4 mr-2 text-warning" />
                  <span className="flex-1">{a.symbol}</span>
                  <span className="text-xs text-muted-foreground ml-2">{a.condition_type.replace(/_/g, " ")} {a.threshold}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {quickTradeStep === "idle" && filteredJournal.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Journal">
              {filteredJournal.map((j) => (
                <CommandItem key={j.id} value={`journal:${j.entry_date}`} onSelect={handleSelect}>
                  <BookOpen className="w-4 h-4 mr-2 text-primary" />
                  <span className="flex-1">{j.entry_date}</span>
                  {j.mood && <span className="text-xs text-muted-foreground ml-2 capitalize">{j.mood}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
