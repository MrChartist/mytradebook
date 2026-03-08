import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";
import { format } from "date-fns";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

function getMarketStatus(): { label: string; isOpen: boolean } {
  const now = new Date();
  const day = now.getDay();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 60 + minutes;

  const isWeekday = day >= 1 && day <= 5;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;

  if (!isWeekday) return { label: "Market Closed (Weekend)", isOpen: false };
  if (time < marketOpen) return { label: `Market opens at 9:15 AM`, isOpen: false };
  if (time > marketClose) return { label: "Market Closed", isOpen: false };
  return { label: "Market Open", isOpen: true };
}

export function DashboardGreeting() {
  const { user, profile } = useAuth();

  const greeting = useMemo(() => getGreeting(), []);
  const market = useMemo(() => getMarketStatus(), []);
  const dateStr = useMemo(() => format(new Date(), "EEEE, d MMMM yyyy"), []);

  const displayName = useMemo(() => {
    if (profile?.name) return profile.name;
    const email = user?.email || "";
    return email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Trader";
  }, [user, profile]);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-bold tracking-tight">
        {greeting}, <span className="text-primary">{displayName}</span>
      </h1>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-muted-foreground/60">{dateStr}</span>
        <span className="w-px h-3 bg-border/30" />
        <div className="flex items-center gap-1.5 bg-muted/30 rounded-md px-2 py-0.5 border border-border/15">
          <span className={`w-1.5 h-1.5 rounded-full ${market.isOpen ? "bg-profit pulse-dot" : "bg-muted-foreground/40"}`} />
          <span className="text-[10px] text-muted-foreground/70 font-medium">{market.label}</span>
        </div>
      </div>
    </div>
  );
}
