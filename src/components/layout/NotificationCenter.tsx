import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCircle2, AlertTriangle, TrendingUp, Target, Zap } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "alert_triggered" | "trade_closed" | "trade_event" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon: React.ElementType;
  color: string;
}

export function NotificationCenter() {
  const { user } = useAuth();
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem("tb_read_notifications");
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  // Fetch recent telegram delivery log as notification proxy
  const { data: deliveryLogs } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("telegram_delivery_log")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  // Fetch recent trade events
  const { data: tradeEvents } = useQuery({
    queryKey: ["trade-events-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("trade_events")
        .select("*, trades!inner(symbol, user_id)")
        .eq("trades.user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: 60000,
  });

  const notifications: Notification[] = [
    ...(deliveryLogs || []).map((log) => ({
      id: `dl-${log.id}`,
      type: log.notification_type.includes("alert") ? "alert_triggered" as const : "trade_event" as const,
      title: log.notification_type === "alert_triggered" ? "Alert Triggered" :
             log.notification_type === "trade_closed" ? "Trade Closed" :
             log.notification_type === "new_trade" ? "New Trade" :
             log.notification_type.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      message: log.success ? `Sent to ${log.chat_id.slice(-4)}` : `Failed: ${log.error_message?.slice(0, 50) || "Unknown"}`,
      timestamp: new Date(log.created_at),
      read: readIds.has(`dl-${log.id}`),
      icon: log.notification_type.includes("alert") ? AlertTriangle :
            log.notification_type.includes("closed") ? CheckCircle2 :
            log.notification_type.includes("target") ? Target : Zap,
      color: log.success ? "text-[hsl(var(--profit))]" : "text-loss",
    })),
    ...(tradeEvents || []).map((event) => ({
      id: `te-${event.id}`,
      type: "trade_event" as const,
      title: event.event_type.replace(/_/g, " "),
      message: `${(event as any).trades?.symbol || "Trade"} @ ₹${event.price}`,
      timestamp: new Date(event.created_at || event.timestamp || Date.now()),
      read: readIds.has(`te-${event.id}`),
      icon: event.event_type === "CLOSED" ? CheckCircle2 :
            event.event_type.includes("TARGET") ? Target :
            event.event_type.includes("SL") ? AlertTriangle : TrendingUp,
      color: event.event_type.includes("TARGET") ? "text-[hsl(var(--profit))]" :
             event.event_type.includes("SL") ? "text-loss" : "text-[hsl(var(--tb-accent))]",
    })),
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 20);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    localStorage.setItem("tb_read_notifications", JSON.stringify([...allIds]));
  };

  const markRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("tb_read_notifications", JSON.stringify([...next]));
      return next;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[hsl(var(--tb-accent))] text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-[hsl(var(--tb-accent))] hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        <ScrollArea className="max-h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex gap-3 hover:bg-muted/50 transition-colors",
                    !n.read && "bg-[hsl(var(--tb-accent)/0.04)]"
                  )}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", n.color, "bg-current/10")}>
                    <n.icon className={cn("w-4 h-4", n.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--tb-accent))] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(n.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
