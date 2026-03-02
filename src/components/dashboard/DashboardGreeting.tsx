import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

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
  const { user } = useAuth();

  const greeting = useMemo(() => getGreeting(), []);
  const market = useMemo(() => getMarketStatus(), []);

  const displayName = useMemo(() => {
    const email = user?.email || "";
    return email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Trader";
  }, [user]);

  const lastLogin = useMemo(() => {
    const d = user?.last_sign_in_at ? new Date(user.last_sign_in_at) : new Date();
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }, [user]);

  return (
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
        {greeting}, <span className="text-primary">{displayName}</span> 👋
      </h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Last login: {lastLogin}</span>
        <span className="text-muted-foreground/40">•</span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${market.isOpen ? "bg-profit animate-pulse" : "bg-muted-foreground"}`} />
          <span className="text-sm text-muted-foreground">{market.label}</span>
        </div>
      </div>
    </div>
  );
}
