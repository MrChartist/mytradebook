import { Bell, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/useAlerts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export function AlertsWidget() {
  const { alerts, isLoading } = useAlerts({ active: true });
  const activeAlerts = alerts.slice(0, 4);
  const triggeredCount = activeAlerts.filter((a) => a.last_triggered).length;

  if (isLoading) {
    return (
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-16 mt-1" />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-warning" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Active Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {triggeredCount > 0 ? (
                <span className="text-warning">{triggeredCount} triggered</span>
              ) : alerts.length > 0 ? (
                `${alerts.length} monitoring`
              ) : (
                "No alerts"
              )}
            </p>
          </div>
        </div>
        <Link 
          to="/alerts" 
          className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Manage →
        </Link>
      </div>
      {activeAlerts.length > 0 ? (
        <div className="space-y-2">
          {activeAlerts.map((alert) => {
            const isTriggered = !!alert.last_triggered;
            const conditionType = alert.condition_type;
            
            return (
              <div
                key={alert.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors",
                  isTriggered
                    ? "bg-warning/10 border border-warning/20"
                    : "bg-accent/50 hover:bg-accent"
                )}
              >
                <div className="flex items-center gap-3">
                  {conditionType === "PRICE_GT" ? (
                    <TrendingUp className="w-4 h-4 text-profit" />
                  ) : conditionType === "PRICE_LT" ? (
                    <TrendingDown className="w-4 h-4 text-loss" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{alert.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {conditionType.replace("_", " ")}: ₹{alert.threshold?.toLocaleString() || "—"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {isTriggered && (
                    <span className="text-xs text-warning font-medium">
                      TRIGGERED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No active alerts</p>
          <Link to="/alerts" className="text-primary text-sm hover:underline">
            Create an alert →
          </Link>
        </div>
      )}
    </div>
  );
}
