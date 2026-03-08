import { useState, useMemo } from "react";
import {
  Bell, Plus, Search, TrendingUp, TrendingDown, Percent,
  ToggleLeft, ToggleRight, Trash2, Edit2, Loader2, Zap,
  Send, Clock, CalendarClock, PauseCircle,
  BellOff, Timer, History, MoreHorizontal, ArrowRightCircle,
} from "lucide-react";
import { useLivePrices, type InstrumentInput } from "@/hooks/useLivePrices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { EditAlertModal } from "@/components/modals/EditAlertModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { InsightCard, type InsightCardAction } from "@/components/ui/insight-card";
import { ViewToggle, type ViewMode } from "@/components/ui/view-toggle";
import { SortSelect, type SortOption } from "@/components/ui/sort-select";
import { EmptyState } from "@/components/ui/empty-state";
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
  PRICE_CROSS_ABOVE: "Crosses Above",
  PRICE_CROSS_BELOW: "Crosses Below",
  PERCENT_CHANGE_GT: "% Change ↑",
  PERCENT_CHANGE_LT: "% Change ↓",
  VOLUME_SPIKE: "Volume Spike",
  CUSTOM: "Custom",
};

const conditionTypeColors: Record<AlertCondition, string> = {
  PRICE_GT: "text-profit bg-profit/10",
  PRICE_LT: "text-loss bg-loss/10",
  PRICE_CROSS_ABOVE: "text-profit bg-profit/10",
  PRICE_CROSS_BELOW: "text-loss bg-loss/10",
  PERCENT_CHANGE_GT: "text-warning bg-warning/10",
  PERCENT_CHANGE_LT: "text-warning bg-warning/10",
  VOLUME_SPIKE: "text-primary bg-primary/10",
  CUSTOM: "text-muted-foreground bg-muted",
};

type FilterTab = "all" | "active" | "triggered" | "paused" | "expired";

const sortOptions: SortOption[] = [
  { value: "latest", label: "Latest First" },
  { value: "symbol", label: "Symbol A–Z" },
  { value: "most_triggered", label: "Most Triggered" },
  { value: "status", label: "By Status" },
];

function isSnoozed(alert: Alert, now: Date): boolean {
  if (!alert.snooze_until) return false;
  return new Date(alert.snooze_until) > now;
}

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState("latest");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [bulkPausing, setBulkPausing] = useState(false);
  const [createTradeFromAlert, setCreateTradeFromAlert] = useState<Alert | null>(null);

  const { alerts, isLoading, toggleAlert, deleteAlert, updateAlert } = useAlerts();

  // Live prices for active alerts
  const priceInstruments = useMemo<InstrumentInput[]>(() => {
    const seen = new Set<string>();
    return (alerts as Alert[])
      .filter(a => a.active)
      .reduce<InstrumentInput[]>((acc, a) => {
        if (!seen.has(a.symbol)) {
          seen.add(a.symbol);
          acc.push({ symbol: a.symbol, security_id: a.security_id, exchange_segment: a.exchange_segment });
        }
        return acc;
      }, []);
  }, [alerts]);

  const { prices } = useLivePrices(priceInstruments);

  const now = new Date();
  const activeCount = alerts.filter(a => a.active && !isSnoozed(a as Alert, now)).length;
  const triggeredTodayCount = alerts.filter(a => {
    if (!a.last_triggered) return false;
    return new Date(a.last_triggered).toDateString() === now.toDateString();
  }).length;
  const pausedCount = alerts.filter(a => !a.active || isSnoozed(a as Alert, now)).length;
  const expiredCount = alerts.filter(a => a.expires_at && new Date(a.expires_at) < now).length;

  const tabCounts: Record<FilterTab, number> = {
    all: alerts.length, active: activeCount, triggered: triggeredTodayCount,
    paused: pausedCount, expired: expiredCount,
  };

  const filteredAlerts = useMemo(() => {
    let list = alerts as Alert[];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.symbol.toLowerCase().includes(q) || (a.notes || "").toLowerCase().includes(q));
    }

    switch (activeTab) {
      case "active": list = list.filter(a => a.active && !isSnoozed(a, now)); break;
      case "triggered": list = list.filter(a => !!a.last_triggered); break;
      case "paused": list = list.filter(a => !a.active || isSnoozed(a, now)); break;
      case "expired": list = list.filter(a => a.expires_at && new Date(a.expires_at) < now); break;
    }

    // Sort
    switch (sortBy) {
      case "symbol": list = [...list].sort((a, b) => a.symbol.localeCompare(b.symbol)); break;
      case "most_triggered": list = [...list].sort((a, b) => (b.trigger_count || 0) - (a.trigger_count || 0)); break;
      default: list = [...list].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return list;
  }, [alerts, searchQuery, activeTab, sortBy]);

  const handleToggleAlert = (id: string, currentActive: boolean) => toggleAlert.mutate({ id, active: !currentActive });
  const handleSnooze = async (alert: Alert, hours: number) => {
    const until = new Date(); until.setHours(until.getHours() + hours);
    await updateAlert.mutateAsync({ id: alert.id, snooze_until: until.toISOString() } as any);
  };
  const handleSnoozeRestOfDay = async (alert: Alert) => {
    const until = new Date(); until.setHours(15, 30, 0, 0);
    await updateAlert.mutateAsync({ id: alert.id, snooze_until: until.toISOString() } as any);
  };
  const handleBulkPause = async () => {
    setBulkPausing(true);
    for (const alert of alerts.filter(a => a.active)) {
      await toggleAlert.mutateAsync({ id: alert.id, active: false });
    }
    setBulkPausing(false);
  };
  const handleEditClick = (alert: Alert) => { setSelectedAlert(alert); setEditModalOpen(true); };
  const handleDeleteClick = (id: string) => { setSelectedAlertId(id); setDeleteModalOpen(true); };
  const handleDeleteConfirm = () => {
    if (selectedAlertId) { deleteAlert.mutate(selectedAlertId); setDeleteModalOpen(false); setSelectedAlertId(null); }
  };

  const getAlertStatus = (a: Alert) => {
    if (a.expires_at && new Date(a.expires_at) < now) return { label: "Expired", color: "text-muted-foreground bg-muted" };
    if (isSnoozed(a, now)) return { label: "Snoozed", color: "text-warning bg-warning/10" };
    if (!a.active) return { label: "Paused", color: "text-muted-foreground bg-muted" };
    if (a.last_triggered) return { label: "Triggered", color: "text-warning bg-warning/10" };
    return { label: "Active", color: "text-profit bg-profit/10" };
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="flex justify-between items-center">
          <div><Skeleton className="h-8 w-32 mb-2" /><Skeleton className="h-4 w-48" /></div>
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Alerts</h1>
            <p className="text-sm text-muted-foreground">Monitor price & market conditions</p>
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

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            role="button"
            tabIndex={0}
            className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setActiveTab("all")}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("all"); }}
            aria-label="Show all alerts"
          >
            <div className="absolute -top-3 -right-3 w-14 h-14 dot-pattern opacity-30 rounded-bl-2xl" />
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold font-mono mt-1">{alerts.length}</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setActiveTab("active")}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("active"); }}
            aria-label="Show active alerts"
          >
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Active</p>
            <p className="text-2xl font-bold font-mono text-profit mt-1">{activeCount}</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setActiveTab("triggered")}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("triggered"); }}
            aria-label="Show triggered alerts"
          >
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Triggered Today</p>
            <p className="text-2xl font-bold font-mono text-warning mt-1">{triggeredTodayCount}</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            className="premium-card-hover !p-5 cursor-pointer active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setActiveTab("paused")}
            onKeyDown={(e) => { if (e.key === "Enter") setActiveTab("paused"); }}
            aria-label="Show paused alerts"
          >
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">Paused</p>
            <p className="text-2xl font-bold font-mono text-muted-foreground mt-1">{pausedCount}</p>
          </div>
        </div>

        {/* Tabs + Search + Sort + View */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(["all", "active", "triggered", "paused", "expired"] as FilterTab[]).map(tab => (
              <Badge
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                className="cursor-pointer capitalize shrink-0 text-xs"
                onClick={() => setActiveTab(tab)}
              >
                {tab} ({tabCounts[tab]})
              </Badge>
            ))}
          </div>
          <div className="flex gap-2 flex-1 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search symbol or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <SortSelect value={sortBy} onValueChange={setSortBy} options={sortOptions} />
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Alerts Grid/List */}
        {filteredAlerts.length > 0 ? (
          <div className={cn(
            viewMode === "grid" ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-2"
          )}>
            {filteredAlerts.map((a) => {
              const alert = a as Alert;
              const snoozed = isSnoozed(alert, now);
              const isPercentCondition = alert.condition_type === "PERCENT_CHANGE_GT" || alert.condition_type === "PERCENT_CHANGE_LT";
              const alertStatus = getAlertStatus(alert);

              const alertLtp = prices[alert.symbol]?.ltp;
              const alertChangePercent = prices[alert.symbol]?.changePercent;

              // Build condition summary with LTP distance
              let conditionSummary = `${conditionLabels[alert.condition_type]}: ${
                isPercentCondition ? `${alert.threshold}%` : `₹${alert.threshold?.toLocaleString() || "—"}`
              }`;
              if (alertLtp && alert.threshold && !isPercentCondition) {
                const distPct = ((alert.threshold - alertLtp) / alertLtp * 100).toFixed(1);
                conditionSummary += ` | LTP ₹${alertLtp.toLocaleString()} (${Number(distPct) >= 0 ? "+" : ""}${distPct}%)`;
              }

              const levels = alert.threshold ? [{
                label: conditionLabels[alert.condition_type] || "Trigger",
                value: isPercentCondition ? `${alert.threshold}%` : alert.threshold,
                color: alert.condition_type.includes("GT") || alert.condition_type.includes("ABOVE")
                  ? "text-profit" : "text-loss"
              }] : [];

              const menuActions: InsightCardAction[] = [
                { label: "Edit", icon: Edit2, onClick: () => handleEditClick(alert) },
                { label: "Create Trade", icon: ArrowRightCircle, onClick: () => {
                  setCreateTradeFromAlert(alert);
                  setCreateModalOpen(true);
                }},
                { label: alert.active ? "Pause" : "Resume", icon: alert.active ? PauseCircle : Zap, onClick: () => handleToggleAlert(alert.id, !!alert.active) },
                { label: "Snooze 1h", icon: BellOff, onClick: () => handleSnooze(alert, 1) },
                { label: "Snooze rest of day", icon: BellOff, onClick: () => handleSnoozeRestOfDay(alert) },
                { label: "Delete", icon: Trash2, onClick: () => handleDeleteClick(alert.id), variant: "destructive" },
              ];

              const metaParts: string[] = [];
              if (alert.recurrence) metaParts.push(alert.recurrence.toLowerCase());
              if (alert.cooldown_minutes && alert.cooldown_minutes > 0) metaParts.push(`${alert.cooldown_minutes}m cooldown`);
              if (alert.trigger_count && alert.trigger_count > 0) metaParts.push(`${alert.trigger_count}× triggered`);
              if (alert.last_triggered) metaParts.push(`Last: ${formatDistanceToNow(new Date(alert.last_triggered), { addSuffix: true })}`);

              return (
                <InsightCard
                  key={alert.id}
                  symbol={alert.symbol}
                  ltp={alertLtp}
                  dayChangePercent={alertChangePercent}
                  typeLabel={conditionLabels[alert.condition_type]}
                  typeColor={conditionTypeColors[alert.condition_type]}
                  status={alertStatus.label}
                  statusColor={alertStatus.color}
                  subtitle={conditionSummary}
                  notes={alert.notes || undefined}
                  levels={levels}
                  tags={[
                    alert.exchange || "NSE",
                    ...(alert.telegram_enabled ? ["📱 Telegram"] : []),
                    ...metaParts.slice(0, 2),
                  ]}
                  timestamp={alert.expires_at && new Date(alert.expires_at) > now
                    ? `Expires ${format(new Date(alert.expires_at), "dd MMM HH:mm")}`
                    : undefined}
                  onView={() => handleEditClick(alert)}
                  onCreateTrade={() => {}}
                  menuActions={menuActions}
                  viewMode={viewMode}
                  className={cn(
                    snoozed && "opacity-60",
                    !alert.active && !snoozed && "opacity-60",
                  )}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title={activeTab !== "all" ? `No ${activeTab} alerts` : "No alerts yet"}
            description={searchQuery
              ? "Try adjusting your search to find what you're looking for."
              : "Set up price and volume alerts to stay on top of market conditions."}
            createLabel="Create Your First Alert"
            onCreate={() => setCreateModalOpen(true)}
            steps={["Pick a symbol", "Set condition & threshold", "Get notified instantly"]}
            hint="Alerts support Telegram, in-app notifications, and webhooks"
          />
        )}

        <CreateAlertModal open={createModalOpen && !createTradeFromAlert} onOpenChange={setCreateModalOpen} />
        <CreateTradeModal
          open={createModalOpen && !!createTradeFromAlert}
          onOpenChange={(open) => {
            if (!open) { setCreateModalOpen(false); setCreateTradeFromAlert(null); }
          }}
          initialData={createTradeFromAlert ? {
            symbol: createTradeFromAlert.symbol,
          } : null}
        />
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
