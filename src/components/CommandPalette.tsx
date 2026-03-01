import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, TrendingUp, Bell, BookOpen, CalendarDays, AlertTriangle,
  BarChart3, FileText, Settings, Eye, Sparkles, Plus, Search,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, group: "Navigate" },
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
  const navigate = useNavigate();

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

  const handleSelect = useCallback((value: string) => {
    setOpen(false);
    // Check if it's a nav item
    const navItem = NAV_ITEMS.find((n) => n.label.toLowerCase() === value);
    if (navItem) {
      navigate(navItem.path);
      return;
    }
    // Check if it's an action
    const actionItem = ACTIONS.find((a) => a.label.toLowerCase() === value);
    if (actionItem) {
      onAction?.(actionItem.action);
      return;
    }
    // Search trades by symbol
    navigate(`/trades?search=${encodeURIComponent(value)}`);
  }, [navigate, onAction]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, trades, actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

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
      </CommandList>
    </CommandDialog>
  );
}
