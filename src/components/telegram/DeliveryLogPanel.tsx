import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TelegramDeliveryLog } from "@/hooks/useTelegramChats";

interface DeliveryLogPanelProps {
  logs: TelegramDeliveryLog[];
  isLoading: boolean;
}

export function DeliveryLogPanel({ logs, isLoading }: DeliveryLogPanelProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        Loading delivery logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No delivery attempts yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Send a test message to see logs appear here
        </p>
      </div>
    );
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trade: "Trade",
      alert: "Alert",
      study: "Study",
      report: "Report",
      test: "Test",
      other: "Other",
    };
    return labels[type] || type;
  };

  const getSegmentLabel = (segment: string | null) => {
    if (!segment) return null;
    const labels: Record<string, string> = {
      Equity_Intraday: "Eq-IT",
      Equity_Positional: "Eq-Pos",
      Futures: "Fut",
      Options: "Opt",
      Commodities: "MCX",
    };
    return labels[segment] || segment;
  };

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className={cn(
            "p-3 rounded-lg border text-sm",
            log.success
              ? "bg-profit/5 border-profit/20"
              : "bg-loss/5 border-loss/20"
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {log.success ? (
                <CheckCircle className="w-4 h-4 text-profit flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-loss flex-shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium font-mono text-xs truncate">
                    {log.chat_id}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {getNotificationTypeLabel(log.notification_type)}
                  </Badge>
                  {log.segment && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-primary/5"
                    >
                      {getSegmentLabel(log.segment)}
                    </Badge>
                  )}
                </div>

                {!log.success && log.error_message && (
                  <p className="text-xs text-loss mt-1 line-clamp-2">
                    {log.error_message}
                  </p>
                )}

                {log.success && (
                  <p className="text-xs text-profit mt-1">
                    Delivered successfully
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span className="whitespace-nowrap">
                {formatTimestamp(log.created_at)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
