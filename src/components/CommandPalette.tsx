import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, Bell, BookOpen, Eye, CalendarDays,
  AlertTriangle, BarChart3, FileText, Settings, Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useTrades } from "@/hooks/useTrades";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const pages = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Trades", path: "/trades", icon: TrendingUp },
  { label: "Alerts", path: "/alerts", icon: Bell },
  { label: "Studies", path: "/studies", icon: BookOpen },
  { label: "Watchlist", path: "/watchlist", icon: Eye },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
  { label: "Mistakes", path: "/mistakes", icon: AlertTriangle },
  { label: "Analytics", path: "/analytics", icon: BarChart3 },
  { label: "Reports", path: "/reports", icon: FileText },
  { label: "Settings", path: "/settings", icon: Settings },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trades } = useTrades();

  // Fetch alerts
  const { data: alerts } = useQuery({
    queryKey: ["alerts-search", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("alerts")
        .select("id, symbol, condition_type, threshold, active")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Fetch studies
  const { data: studies } = useQuery({
    queryKey: ["studies-search", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase
        .from("studies")
        .select("id, title, symbol, category")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return data || [];
    },
    enabled: !!user?.id && open,
  });

  // Global Cmd+K listener
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const go = useCallback(
    (path: string) => {
      navigate(path);
      onOpenChange(false);
    },
    [navigate, onOpenChange]
  );

  const recentTrades = useMemo(
    () => trades.slice(0, 15),
    [trades]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search pages, trades, alerts, studies…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)}>
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{p.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        {recentTrades.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Trades">
              {recentTrades.map((t) => (
                <CommandItem key={t.id} onSelect={() => go("/trades")}>
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{t.symbol}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {t.trade_type} · {t.segment.replace("_", " ")}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {alerts && alerts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Alerts">
              {alerts.slice(0, 10).map((a) => (
                <CommandItem key={a.id} onSelect={() => go("/alerts")}>
                  <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{a.symbol}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {a.condition_type} {a.threshold}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {studies && studies.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Studies">
              {studies.slice(0, 10).map((s) => (
                <CommandItem key={s.id} onSelect={() => go("/studies")}>
                  <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{s.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {s.symbol}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
