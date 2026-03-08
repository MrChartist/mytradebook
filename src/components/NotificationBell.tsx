import { useState, useMemo } from "react";
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, TrendingUp, BookOpen, FileText, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek, format } from "date-fns";
import { useNavigate } from "react-router-dom";

type FilterType = "all" | "trades" | "alerts" | "studies" | "reports";

const notificationTypeConfig: Record<string, { icon: React.ElementType; color: string; route?: string }> = {
  new_trade: { icon: TrendingUp, color: "text-emerald-500", route: "/trades" },
  trade_update: { icon: TrendingUp, color: "text-blue-500", route: "/trades" },
  trade_closed: { icon: TrendingUp, color: "text-amber-500", route: "/trades" },
  trade_sl_modified: { icon: TrendingUp, color: "text-orange-500", route: "/trades" },
  alert_triggered: { icon: AlertTriangle, color: "text-red-500", route: "/alerts" },
  alert_created: { icon: AlertTriangle, color: "text-emerald-500", route: "/alerts" },
  study_created: { icon: BookOpen, color: "text-violet-500", route: "/studies" },
  study_updated: { icon: BookOpen, color: "text-blue-500", route: "/studies" },
  study_triggered: { icon: BookOpen, color: "text-amber-500", route: "/studies" },
  weekly_report: { icon: FileText, color: "text-primary", route: "/reports" },
  default: { icon: Bell, color: "text-muted-foreground" },
};

const filterConfig: { key: FilterType; label: string; types: string[] }[] = [
  { key: "all", label: "All", types: [] },
  { key: "trades", label: "Trades", types: ["new_trade", "trade_update", "trade_closed", "trade_sl_modified", "trade_event_added"] },
  { key: "alerts", label: "Alerts", types: ["alert_triggered", "alert_created", "alert_paused", "alert_deleted"] },
  { key: "studies", label: "Studies", types: ["study_created", "study_updated", "study_triggered"] },
  { key: "reports", label: "Reports", types: ["weekly_report", "eod_report"] },
];

function groupNotificationsByDate(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = [];
  const today: Notification[] = [];
  const yesterday: Notification[] = [];
  const thisWeek: Notification[] = [];
  const older: Notification[] = [];

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (isToday(date)) {
      today.push(n);
    } else if (isYesterday(date)) {
      yesterday.push(n);
    } else if (isThisWeek(date)) {
      thisWeek.push(n);
    } else {
      older.push(n);
    }
  }

  if (today.length > 0) groups.push({ label: "Today", items: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", items: yesterday });
  if (thisWeek.length > 0) groups.push({ label: "This Week", items: thisWeek });
  if (older.length > 0) groups.push({ label: "Older", items: older });

  return groups;
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const navigate = useNavigate();

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    const config = filterConfig.find((f) => f.key === filter);
    if (!config) return notifications;
    return notifications.filter((n) => config.types.includes(n.type));
  }, [notifications, filter]);

  const groupedNotifications = useMemo(() => groupNotificationsByDate(filteredNotifications), [filteredNotifications]);

  const handleNotificationClick = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    const config = notificationTypeConfig[n.type] || notificationTypeConfig.default;
    if (config.route) {
      setOpen(false);
      navigate(config.route);
    }
  };

  const getNotificationIcon = (type: string) => {
    const config = notificationTypeConfig[type] || notificationTypeConfig.default;
    const IconComponent = config.icon;
    return <IconComponent className={cn("w-4 h-4", config.color)} />;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-lg" aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}>
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground"
                onClick={() => markAllRead()}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => clearAll?.()}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 overflow-x-auto">
          {filterConfig.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 text-xs px-2.5 rounded-full shrink-0",
                filter === f.key && "bg-primary/10 text-primary"
              )}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {/* Notification List */}
        <ScrollArea className="max-h-[400px]">
          {groupedNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {groupedNotifications.map((group) => (
                <div key={group.label}>
                  <div className="px-4 py-2 bg-muted/30">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                  {group.items.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={cn(
                        "px-4 py-3 flex gap-3 group hover:bg-muted/50 transition-colors cursor-pointer",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm leading-snug", !n.read && "font-medium")}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(n.id);
                            }}
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(n.id);
                          }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
