import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, TrendingUp, Bell, BookOpen, CalendarDays, AlertTriangle,
  BarChart3, FileText, Settings, Eye, Sparkles, Plus, Clock,
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

interface CommandPaletteProps {
  onAction?: (action: string) => void;
}

export function CommandPalette({ onAction }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
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

  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const q = query.toLowerCase().trim();
  const showDynamic = q.length >= 2;

  const filteredTrades = useMemo(() => {
    if (!showDynamic) return [];
    return trades.filter((t) => t.symbol.toLowerCase().includes(q)).slice(0, 5);
  }, [trades, q, showDynamic]);

  const filteredAlerts = useMemo(() => {
    if (!showDynamic) return [];
    return alerts.filter((a) => a.symbol.toLowerCase().includes(q)).slice(0, 5);
  }, [alerts, q, showDynamic]);

  const filteredJournal = useMemo(() => {
    if (!showDynamic) return [];
    return journalEntries
      .filter((j) => {
        const searchable = [j.pre_market_plan, j.post_market_review, j.lessons_learned, j.market_outlook].filter(Boolean).join(" ").toLowerCase();
        return searchable.includes(q);
      })
      .slice(0, 3);
  }, [journalEntries, q, showDynamic]);

  const handleSelect = useCallback((value: string) => {
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
  }, [navigate, onAction]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, trades, alerts… (⌘K)" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Recent Items */}
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
          {ACTIONS.map((item) => (
            <CommandItem key={item.action} value={item.label} onSelect={handleSelect}>
              <item.icon className="w-4 h-4 mr-2 text-primary" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {filteredTrades.length > 0 && (
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

        {filteredAlerts.length > 0 && (
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

        {filteredJournal.length > 0 && (
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
