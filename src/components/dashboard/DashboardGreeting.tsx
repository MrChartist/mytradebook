import { useAuth } from "@/contexts/AuthContext";
import { useUserSettings } from "@/hooks/useUserSettings";
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

  // NSE market hours: Mon-Fri 9:15 AM - 3:30 PM IST
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
  const { settings } = useUserSettings();

  const greeting = useMemo(() => getGreeting(), []);
  const market = useMemo(() => getMarketStatus(), []);

  // Try to get name from profile or email
  const displayName = useMemo(() => {
    const email = user?.email || "";
    return email.split("@")[0]?.replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Trader";
  }, [user]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome Back, <span className="text-primary">{displayName}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your trading control room — monitoring positions, analytics, and discipline
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${market.isOpen ? "bg-profit animate-pulse" : "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground">{market.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
