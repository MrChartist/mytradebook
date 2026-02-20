import { useState } from "react";
import { Sun, TrendingUp, Bell, BookOpen, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

export function MorningBriefingWidget() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const { trades } = useTrades();
  const { alerts } = useAlerts({ active: true });

  const openTrades = trades.filter((t) => t.status === "OPEN");
  const todayClosed = trades.filter((t) => {
    if (t.status !== "CLOSED" || !t.closed_at) return false;
    return new Date(t.closed_at).toDateString() === new Date().toDateString();
  });
  const todayPnl = todayClosed.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Fetch today's studies
  const { data: todayStudies } = useQuery({
    queryKey: ["today-studies", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const today = format(new Date(), "yyyy-MM-dd");
      const { data } = await supabase
        .from("studies")
        .select("id, symbol, title, status")
        .eq("user_id", user.id)
        .in("status", ["Active", "Draft"])
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Expiring alerts (next 24h)
  const expiringAlerts = (alerts || []).filter((a) => {
    if (!a.expires_at) return false;
    const exp = new Date(a.expires_at);
    const now = new Date();
    return exp > now && exp.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
  });

  const totalRisk = openTrades.reduce((sum, t) => {
    if (!t.entry_price || !t.stop_loss) return sum;
    const risk = Math.abs(t.entry_price - t.stop_loss) * t.quantity;
    return sum + risk;
  }, 0);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning/20 flex items-center justify-center">
            <Sun className="w-5 h-5 text-warning" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm">Morning Briefing</h3>
            <p className="text-xs text-muted-foreground">
              {format(new Date(), "EEEE, d MMM yyyy")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {todayPnl !== 0 && (
            <span className={cn("text-sm font-mono font-semibold", todayPnl >= 0 ? "text-profit" : "text-loss")}>
              {todayPnl >= 0 ? "+" : ""}₹{todayPnl.toLocaleString("en-IN")}
            </span>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Open Positions</p>
              <p className="text-lg font-bold">{openTrades.length}</p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">₹ At Risk</p>
              <p className="text-lg font-bold font-mono text-loss">
                ₹{totalRisk.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Active Alerts</p>
              <p className="text-lg font-bold">{alerts?.length || 0}</p>
            </div>
            <div className="bg-accent/40 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-0.5">Today's P&L</p>
              <p className={cn("text-lg font-bold font-mono", todayPnl >= 0 ? "text-profit" : "text-loss")}>
                {todayPnl >= 0 ? "+" : ""}₹{todayPnl.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Open positions preview */}
          {openTrades.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Open Positions
              </h4>
              <div className="space-y-1.5">
                {openTrades.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm py-1.5 px-2 rounded bg-accent/20">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("text-[10px] h-4 px-1", t.trade_type === "BUY" ? "text-profit border-profit/30" : "text-loss border-loss/30")}>
                        {t.trade_type}
                      </Badge>
                      <span className="font-medium">{t.symbol}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Entry ₹{t.entry_price?.toLocaleString("en-IN") || "—"}</span>
                      {t.stop_loss && <span className="text-loss">SL ₹{t.stop_loss.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                ))}
                {openTrades.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">+{openTrades.length - 5} more</p>
                )}
              </div>
            </div>
          )}

          {/* Expiring alerts */}
          {expiringAlerts.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-warning mb-2 flex items-center gap-1.5">
                <Bell className="w-3 h-3" /> Expiring Today ({expiringAlerts.length})
              </h4>
              <div className="space-y-1">
                {expiringAlerts.slice(0, 3).map((a) => (
                  <div key={a.id} className="text-xs flex items-center justify-between py-1 px-2 bg-warning/5 rounded">
                    <span className="font-medium">{a.symbol}</span>
                    <span className="text-muted-foreground">{a.condition_type} ₹{a.threshold?.toLocaleString("en-IN") || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active studies */}
          {todayStudies && todayStudies.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Active Studies
              </h4>
              <div className="space-y-1">
                {todayStudies.map((s) => (
                  <div key={s.id} className="text-xs flex items-center gap-2 py-1 px-2 bg-accent/20 rounded">
                    <span className="font-medium text-primary">{s.symbol}</span>
                    <span className="text-muted-foreground truncate">{s.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
