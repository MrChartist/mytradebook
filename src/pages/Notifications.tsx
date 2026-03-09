import { useState, useMemo } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, AlertTriangle, TrendingUp, Info, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { format, formatDistanceToNow } from "date-fns";

type NotifCategory = "all" | "alert" | "trade" | "system";

const CATEGORY_CONFIG: Record<string, { icon: typeof Bell; label: string; color: string }> = {
  alert_triggered: { icon: AlertTriangle, label: "Alert", color: "text-warning bg-warning/10" },
  trade_closed: { icon: TrendingUp, label: "Trade", color: "text-profit bg-profit/10" },
  trade_created: { icon: TrendingUp, label: "Trade", color: "text-primary bg-primary/10" },
  sl_hit: { icon: AlertTriangle, label: "SL Hit", color: "text-loss bg-loss/10" },
  target_hit: { icon: Zap, label: "Target", color: "text-profit bg-profit/10" },
  system: { icon: Info, label: "System", color: "text-muted-foreground bg-muted" },
};

function getNotifConfig(type: string) {
  return CATEGORY_CONFIG[type] || CATEGORY_CONFIG.system;
}

function matchesCategory(type: string, category: NotifCategory): boolean {
  if (category === "all") return true;
  if (category === "alert") return type.includes("alert") || type.includes("sl_hit") || type.includes("target_hit");
  if (category === "trade") return type.includes("trade");
  if (category === "system") return !type.includes("alert") && !type.includes("trade") && !type.includes("sl_hit") && !type.includes("target_hit");
  return true;
}

export default function Notifications() {
  const { notifications, isLoading, unreadCount, markAsRead, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [category, setCategory] = useState<NotifCategory>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = notifications;
    if (showUnreadOnly) list = list.filter((n) => !n.read);
    list = list.filter((n) => matchesCategory(n.type, category));
    return list;
  }, [notifications, category, showUnreadOnly]);

  const categories: { value: NotifCategory; label: string; count: number }[] = [
    { value: "all", label: "All", count: notifications.length },
    { value: "alert", label: "Alerts", count: notifications.filter((n) => matchesCategory(n.type, "alert")).length },
    { value: "trade", label: "Trades", count: notifications.filter((n) => matchesCategory(n.type, "trade")).length },
    { value: "system", label: "System", count: notifications.filter((n) => matchesCategory(n.type, "system")).length },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader title="Notifications" subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`} />
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => markAllRead()}>
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-loss hover:text-loss" onClick={() => clearAll()}>
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs + Unread Filter */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0.5 bg-muted/40 rounded-lg p-0.5 border border-border/15">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={cn(
                "px-3 py-1 text-[11px] font-medium rounded-md transition-all",
                category === cat.value ? "bg-card shadow-sm text-foreground" : "text-muted-foreground/60 hover:text-foreground"
              )}
            >
              {cat.label}
              <span className="ml-1 text-[9px] text-muted-foreground">({cat.count})</span>
            </button>
          ))}
        </div>
        <Button
          variant={showUnreadOnly ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-[10px] gap-1"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <Filter className="w-3 h-3" />
          Unread only
        </Button>
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={showUnreadOnly ? "No unread notifications" : "No notifications"}
          description={showUnreadOnly ? "All caught up! Toggle off the unread filter to see past notifications." : "Notifications from alerts, trades, and system events will appear here."}
        />
      ) : (
        <div className="space-y-1.5">
          {filtered.map((notif) => {
            const config = getNotifConfig(notif.type);
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={cn(
                  "group flex items-start gap-3 p-3 rounded-xl border transition-all hover:bg-muted/20",
                  notif.read ? "border-border/20 bg-transparent" : "border-primary/15 bg-primary/[0.02]"
                )}
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", config.color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={cn("text-sm", !notif.read && "font-semibold")}>{notif.title}</p>
                      {notif.message && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                      )}
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5">{config.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => markAsRead(notif.id)}
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-loss hover:text-loss"
                    onClick={() => deleteNotification(notif.id)}
                    title="Delete"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
