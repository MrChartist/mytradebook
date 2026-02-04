import { useState } from "react";
import {
  Bell,
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Percent,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Edit2,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Database } from "@/integrations/supabase/types";

type AlertCondition = Database["public"]["Enums"]["alert_condition"];

const conditionLabels: Record<AlertCondition, string> = {
  PRICE_GT: "Price Above",
  PRICE_LT: "Price Below",
  PERCENT_CHANGE_GT: "% Change Above",
  PERCENT_CHANGE_LT: "% Change Below",
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

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const { alerts, isLoading, toggleAlert, deleteAlert } = useAlerts();

  const filteredAlerts = alerts.filter((alert) =>
    alert.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = filteredAlerts.filter((a) => a.active).length;
  const triggeredCount = filteredAlerts.filter((a) => a.last_triggered).length;

  const handleToggleAlert = (id: string, currentActive: boolean) => {
    toggleAlert.mutate({ id, active: !currentActive });
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
            <p className="text-muted-foreground">
              Monitor price and technical conditions
            </p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor price and technical conditions
          </p>
        </div>
        <Button
          className="bg-gradient-primary hover:opacity-90 transition-opacity"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New Alert
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Total Alerts</p>
          <p className="text-2xl font-bold">{filteredAlerts.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-bold text-profit">{activeCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Triggered</p>
          <p className="text-2xl font-bold text-warning">{triggeredCount}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground">Paused</p>
          <p className="text-2xl font-bold text-muted-foreground">
            {filteredAlerts.length - activeCount}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by symbol..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const ConditionIcon = conditionIcons[alert.condition_type];
          const isTriggered = !!alert.last_triggered;
          const isPercentCondition =
            alert.condition_type === "PERCENT_CHANGE_GT" ||
            alert.condition_type === "PERCENT_CHANGE_LT";

          return (
            <div
              key={alert.id}
              className={cn(
                "glass-card p-4 transition-all",
                isTriggered && "border-warning/30 bg-warning/5",
                !alert.active && "opacity-60"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      alert.condition_type === "PRICE_GT" &&
                        "bg-profit/10 text-profit",
                      alert.condition_type === "PRICE_LT" &&
                        "bg-loss/10 text-loss",
                      (alert.condition_type === "PERCENT_CHANGE_GT" ||
                        alert.condition_type === "PERCENT_CHANGE_LT") &&
                        "bg-warning/10 text-warning",
                      alert.condition_type === "VOLUME_SPIKE" &&
                        "bg-primary/10 text-primary",
                      alert.condition_type === "CUSTOM" &&
                        "bg-muted text-muted-foreground"
                    )}
                  >
                    <ConditionIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.symbol}</h3>
                      {isTriggered && (
                        <span className="px-2 py-0.5 rounded-full bg-warning/20 text-warning text-xs font-medium">
                          TRIGGERED
                        </span>
                      )}
                      {alert.trigger_count && alert.trigger_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({alert.trigger_count}x)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {conditionLabels[alert.condition_type]}:{" "}
                      {isPercentCondition
                        ? `${alert.threshold}%`
                        : `₹${alert.threshold?.toLocaleString()}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Recurrence</p>
                    <p className="font-medium text-sm capitalize">
                      {alert.recurrence?.toLowerCase() || "once"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAlert(alert.id, !!alert.active)}
                      className="p-2 rounded-lg hover:bg-accent transition-colors"
                      disabled={toggleAlert.isPending}
                    >
                      {toggleAlert.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      ) : alert.active ? (
                        <ToggleRight className="w-6 h-6 text-profit" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                      )}
                    </button>
                    <button className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(alert.id)}
                      className="p-2 rounded-lg hover:bg-loss/10 transition-colors text-muted-foreground hover:text-loss"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && !isLoading && (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No alerts found</h3>
          <p className="text-muted-foreground mb-4">
            Create alerts to get notified when price conditions are met
          </p>
          <Button
            className="bg-gradient-primary"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateAlertModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      <ConfirmDeleteModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        onConfirm={handleDeleteConfirm}
        title="Delete Alert"
        description="Are you sure you want to delete this alert? This action cannot be undone."
        isLoading={deleteAlert.isPending}
      />
    </div>
  );
}
