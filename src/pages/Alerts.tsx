import { useState, useMemo } from "react";
import {
  Bell, Plus, Search, TrendingUp, TrendingDown, Percent,
  ToggleLeft, ToggleRight, Trash2, Edit2, Loader2, Zap,
  Send, MessageSquare, Clock, CalendarClock, PauseCircle,
  PlayCircle, Filter, MoreHorizontal, TestTube, History,
  BellOff, Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { EditAlertModal } from "@/components/modals/EditAlertModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import type { Database } from "@/integrations/supabase/types";
import { format, formatDistanceToNow } from "date-fns";

type Alert = Database["public"]["Tables"]["alerts"]["Row"] & {
  notes?: string | null;
  telegram_enabled?: boolean | null;
  exchange?: string | null;
  cooldown_minutes?: number | null;
  active_hours_only?: boolean | null;
  snooze_until?: string | null;
  webhook_enabled?: boolean | null;
  delivery_in_app?: boolean | null;
};
type AlertCondition = Database["public"]["Enums"]["alert_condition"];

const conditionLabels: Record<AlertCondition, string> = {
  PRICE_GT: "Price Above",
  PRICE_LT: "Price Below",
  PERCENT_CHANGE_GT: "% Change ↑",
  PERCENT_CHANGE_LT: "% Change ↓",
  VOLUME_SPIKE: "Volume Spike",
  CUSTOM: "Custom",
};

const conditionIcons: Record<AlertCondition, typeof TrendingUp> = {
  PRICE_GT: TrendingUp,
  PRICE_LT: TrendingDown,
  PERCENT_CHANGE_GT: Percent,
  PERCENT_CHANGE_LT: Percent,
  VOLUME_SPIKE: Zap,
  CUSTOM: Bell,
};

const conditionColors: Record<AlertCondition, string> = {
  PRICE_GT: "bg-profit/10 text-profit border-profit/20",
  PRICE_LT: "bg-loss/10 text-loss border-loss/20",
  PERCENT_CHANGE_GT: "bg-warning/10 text-warning border-warning/20",
  PERCENT_CHANGE_LT: "bg-warning/10 text-warning border-warning/20",
  VOLUME_SPIKE: "bg-primary/10 text-primary border-primary/20",
  CUSTOM: "bg-muted text-muted-foreground border-border",
};

type FilterTab = "all" | "active" | "triggered" | "paused" | "expired";

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [bulkPausing, setBulkPausing] = useState(false);

  const { alerts, isLoading, toggleAlert, deleteAlert, updateAlert } = useAlerts();

  // Filter logic
  const filteredAlerts = useMemo(() => {
    let list = alerts as Alert[];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.symbol.toLowerCase().includes(q) ||
        (a.notes || "").toLowerCase().includes(q)
      );
    }

    // Tab filter
    const now = new Date();
    switch (activeTab) {
      case "active":
        list = list.filter(a => a.active && !isSnoozed(a, now));
        break;
      case "triggered":
        list = list.filter(a => !!a.last_triggered);
        break;
      case "paused":
        list = list.filter(a => !a.active || isSnoozed(a, now));
        break;
      case "expired":
        list = list.filter(a => a.expires_at && new Date(a.expires_at) < now);
        break;
    }

    return list;
  }, [alerts, searchQuery, activeTab]);

  // Stats
  const now = new Date();
  const activeCount = alerts.filter(a => a.active && !isSnoozed(a as Alert, now)).length;
  const triggeredTodayCount = alerts.filter(a => {
    if (!a.last_triggered) return false;
    const t = new Date(a.last_triggered);
    return t.toDateString() === now.toDateString();
  }).length;
  const pausedCount = alerts.filter(a => !a.active || isSnoozed(a as Alert, now)).length;
  const expiredCount = alerts.filter(a => a.expires_at && new Date(a.expires_at) < now).length;

  const tabCounts: Record<FilterTab, number> = {
    all: alerts.length,
    active: activeCount,
    triggered: triggeredTodayCount,
    paused: pausedCount,
    expired: expiredCount,
  };

  const handleToggleAlert = (id: string, currentActive: boolean) => {
    toggleAlert.mutate({ id, active: !currentActive });
  };

  const handleSnooze = async (alert: Alert, hours: number) => {
    const until = new Date();
    until.setHours(until.getHours() + hours);
    await updateAlert.mutateAsync({
      id: alert.id,
      snooze_until: until.toISOString(),
    } as any);
  };

  const handleSnoozeRestOfDay = async (alert: Alert) => {
    const until = new Date();
    until.setHours(15, 30, 0, 0); // IST market close
    await updateAlert.mutateAsync({
      id: alert.id,
      snooze_until: until.toISOString(),
    } as any);
  };

  const handleBulkPause = async () => {
    setBulkPausing(true);
    const activeAlerts = alerts.filter(a => a.active);
    for (const alert of activeAlerts) {
      await toggleAlert.mutateAsync({ id: alert.id, active: false });
    }
    setBulkPausing(false);
  };

  const handleEditClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedAlertId(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedAlertId) {
      deleteAlert.mutate(selectedAlertId);
      setDeleteModalOpen(false);
      setSelectedAlertId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">Monitor price and market conditions</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Alerts</h1>
            <p className="text-muted-foreground">Monitor price & market conditions with smart notifications</p>
          </div>
          <div className="flex gap-2">
            {activeCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleBulkPause} disabled={bulkPausing}>
                {bulkPausing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <PauseCircle className="w-4 h-4 mr-1" />}
                Pause All
              </Button>
            )}
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Alert
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="surface-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold">{alerts.length}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold text-profit">{activeCount}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Triggered Today</p>
            <p className="text-2xl font-bold text-warning">{triggeredTodayCount}</p>
          </div>
          <div className="surface-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Paused / Snoozed</p>
            <p className="text-2xl font-bold text-muted-foreground">{pausedCount}</p>
          </div>
        </div>

        {/* Filter tabs + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "active", "triggered", "paused", "expired"] as FilterTab[]).map(tab => (
              <Badge
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                className="cursor-pointer capitalize shrink-0"
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({tabCounts[tab]})
              </Badge>
            ))}
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search symbol or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const a = alert as Alert;
            const ConditionIcon = conditionIcons[a.condition_type];
            const isTriggered = !!a.last_triggered;
            const snoozed = isSnoozed(a, now);
            const expired = a.expires_at && new Date(a.expires_at) < now;
            const isPercentCondition = a.condition_type === "PERCENT_CHANGE_GT" || a.condition_type === "PERCENT_CHANGE_LT";

            return (
              <div
                key={a.id}
                className={cn(
                  "surface-card p-4 transition-all group",
                  isTriggered && "border-warning/30",
                  snoozed && "opacity-60",
                  expired && "opacity-40",
                  !a.active && !snoozed && !expired && "opacity-60",
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                      conditionColors[a.condition_type]
                    )}>
                      <ConditionIcon className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold">{a.symbol}</h3>
                        <span className="text-[10px] text-muted-foreground font-mono">{a.exchange || "NSE"}</span>

                        {/* Status badges */}
                        {snoozed && (
                          <Badge variant="outline" className="text-[10px] gap-1 text-warning border-warning/20">
                            <BellOff className="w-2.5 h-2.5" /> Snoozed
                          </Badge>
                        )}
                        {expired && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">Expired</Badge>
                        )}
                        {isTriggered && (
                          <Badge variant="outline" className="text-[10px] gap-1 text-warning border-warning/20">
                            <Zap className="w-2.5 h-2.5" /> Triggered
                            {a.trigger_count ? ` (${a.trigger_count}×)` : ""}
                          </Badge>
                        )}

                        {/* Delivery icons */}
                        {a.telegram_enabled && (
                          <Tooltip>
                            <TooltipTrigger><Send className="w-3 h-3 text-primary" /></TooltipTrigger>
                            <TooltipContent>Telegram enabled</TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      {/* Condition description */}
                      <p className="text-sm text-muted-foreground">
                        {conditionLabels[a.condition_type]}:{" "}
                        <span className="font-mono font-medium text-foreground">
                          {isPercentCondition ? `${a.threshold}%` : `₹${a.threshold?.toLocaleString() || "—"}`}
                        </span>
                      </p>

                      {/* Meta row */}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {a.recurrence?.toLowerCase() || "once"}
                        </span>
                        {(a as any).cooldown_minutes > 0 && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Timer className="w-2.5 h-2.5" />
                            {(a as any).cooldown_minutes}m cooldown
                          </span>
                        )}
                        {a.last_triggered && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <History className="w-2.5 h-2.5" />
                            Last: {formatDistanceToNow(new Date(a.last_triggered), { addSuffix: true })}
                          </span>
                        )}
                        {a.expires_at && !expired && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <CalendarClock className="w-2.5 h-2.5" />
                            Expires {format(new Date(a.expires_at), "dd MMM HH:mm")}
                          </span>
                        )}
                      </div>

                      {/* Notes */}
                      {a.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          📝 {a.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleToggleAlert(a.id, !!a.active)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors"
                          disabled={toggleAlert.isPending}
                        >
                          {a.active ? (
                            <ToggleRight className="w-5 h-5 text-profit" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{a.active ? "Pause" : "Resume"}</TooltipContent>
                    </Tooltip>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(a)}>
                          <Edit2 className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleSnooze(a, 1)}>
                          <BellOff className="w-4 h-4 mr-2" /> Snooze 1 hour
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSnoozeRestOfDay(a)}>
                          <BellOff className="w-4 h-4 mr-2" /> Snooze rest of day
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(a.id)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAlerts.length === 0 && (
          <div className="surface-card p-12 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              {activeTab !== "all" ? `No ${activeTab} alerts` : "No alerts found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search" : "Create alerts to get notified on price conditions"}
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}

        {/* Modals */}
        <CreateAlertModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
        <EditAlertModal open={editModalOpen} onOpenChange={setEditModalOpen} alert={selectedAlert} />
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={handleDeleteConfirm}
          title="Delete Alert"
          description="Are you sure you want to delete this alert? This action cannot be undone."
          isLoading={deleteAlert.isPending}
        />
      </div>
    </TooltipProvider>
  );
}

function isSnoozed(alert: Alert, now: Date): boolean {
  if (!alert.snooze_until) return false;
  return new Date(alert.snooze_until) > now;
}
