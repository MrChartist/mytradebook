import { Bell, TrendingUp, TrendingDown, AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditAlertModal } from "@/components/modals/EditAlertModal";

interface Alert {
  id: string;
  symbol: string;
  condition_type: string;
  threshold: number | null;
  active: boolean | null;
  last_triggered: string | null;
  trigger_count: number | null;
  created_at: string | null;
}

interface Props {
  alerts: Alert[];
}

export function DashboardAlertsPanel({ alerts }: Props) {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  const displayed = showActiveOnly ? alerts.filter((a) => a.active) : alerts;

  const conditionLabel = (c: string) => {
    switch (c) {
      case "PRICE_GT": return "Above";
      case "PRICE_LT": return "Below";
      case "PERCENT_CHANGE_GT": return "% ↑";
      case "PERCENT_CHANGE_LT": return "% ↓";
      case "VOLUME_SPIKE": return "Vol Spike";
      default: return c;
    }
  };

  const ConditionIcon = ({ type }: { type: string }) => {
    if (type === "PRICE_GT" || type === "PERCENT_CHANGE_GT") return <TrendingUp className="w-3.5 h-3.5 text-profit" />;
    if (type === "PRICE_LT" || type === "PERCENT_CHANGE_LT") return <TrendingDown className="w-3.5 h-3.5 text-loss" />;
    return <AlertTriangle className="w-3.5 h-3.5 text-warning" />;
  };

  const triggeredToday = (alert: Alert) =>
    alert.last_triggered && new Date(alert.last_triggered).toDateString() === new Date().toDateString();

  return (
    <div className="premium-card flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="icon-badge-sm bg-warning/10">
            <Bell className="w-4 h-4 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Alerts</h3>
            <span className="text-[10px] text-muted-foreground">{alerts.length} active</span>
          </div>
        </div>
        <Link to="/alerts" className="text-xs text-primary hover:underline font-medium">Manage →</Link>
      </div>

      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setShowActiveOnly(!showActiveOnly)}
          className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
            showActiveOnly ? "border-primary/20 bg-primary/5 text-primary" : "border-border text-muted-foreground"
          }`}
        >
          Active only
        </button>
        <Link to="/alerts">
          <Button size="sm" className="h-7 text-xs gap-1 rounded-full bg-gradient-primary text-primary-foreground">
            <Plus className="w-3 h-3" /> New
          </Button>
        </Link>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto max-h-[320px]">
        {displayed.length === 0 ? (
          <Link to="/alerts" className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/40 rounded-2xl hover:border-primary/20 transition-colors">
            <Bell className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">No alerts</p>
            <span className="text-xs text-primary font-medium mt-1">Create one →</span>
          </Link>
        ) : (
          displayed.map((alert) => (
            <div
              key={alert.id}
              role="button"
              tabIndex={0}
              aria-label={`${alert.symbol} alert - click to edit`}
              className={cn(
                "inner-panel transition-all cursor-pointer hover:border-primary/20 hover:shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:scale-[0.99]",
                triggeredToday(alert) && "border-l-2 border-l-warning animate-pulse-slow"
              )}
              onClick={() => setSelectedAlert(alert)}
              onKeyDown={(e) => { if (e.key === "Enter") setSelectedAlert(alert); }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ConditionIcon type={alert.condition_type} />
                  <span className="text-xs font-medium">{alert.symbol}</span>
                </div>
                <span className={cn(
                  "text-[9px] font-medium uppercase px-1.5 py-0.5 rounded-full",
                  alert.active ? "bg-profit/10 text-profit" : "bg-muted text-muted-foreground"
                )}>
                  {alert.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground font-mono">
                  {conditionLabel(alert.condition_type)} ₹{alert.threshold?.toLocaleString() || "—"}
                </span>
                {alert.trigger_count && alert.trigger_count > 0 && (
                  <span className="text-[9px] text-warning font-medium">
                    ×{alert.trigger_count}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <EditAlertModal
        open={!!selectedAlert}
        onOpenChange={(open) => !open && setSelectedAlert(null)}
        alert={selectedAlert as any}
      />
    </div>
  );
}
