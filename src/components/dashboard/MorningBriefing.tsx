import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sun, Send, Loader2, TrendingUp, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTrades } from "@/hooks/useTrades";
import { useAlerts } from "@/hooks/useAlerts";
import { useTelegramChats } from "@/hooks/useTelegramChats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TradeStatus } from "@/lib/constants";
import { useNavigate } from "react-router-dom";

export function MorningBriefing() {
  const { trades } = useTrades();
  const { alerts } = useAlerts({ active: true });
  const { chats } = useTelegramChats();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);

  const openTrades = trades.filter((t) => t.status === TradeStatus.OPEN);
  const unrealizedPnl = openTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const activeAlerts = alerts.filter((a) => a.active);
  const hasChats = chats.length > 0;

  const handleSendToTelegram = async () => {
    if (!hasChats) {
      toast.info("Set up a Telegram destination in Settings first");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("morning-briefing", {
        body: { manual: true },
      });
      if (error) throw error;
      toast.success("Morning briefing sent to Telegram!");
    } catch (e: any) {
      toast.error(e.message || "Failed to send briefing");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between text-primary">
          <span className="flex items-center gap-2">
            <Sun className="w-4 h-4" />
            Morning Briefing
          </span>
          {hasChats && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 text-primary hover:text-primary"
              onClick={handleSendToTelegram}
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Send className="w-3 h-3 mr-1" />
              )}
              Send to Telegram
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 bg-card/60 rounded-lg px-3 py-2">
            <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Open Trades</p>
              <p className="text-sm font-bold">{openTrades.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-card/60 rounded-lg px-3 py-2">
            <Bell className="w-3.5 h-3.5 text-primary shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">Active Alerts</p>
              <p className="text-sm font-bold">{activeAlerts.length}</p>
            </div>
          </div>
        </div>

        {openTrades.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Unrealised P&L</span>
            <span className={unrealizedPnl >= 0 ? "text-profit font-semibold" : "text-loss font-semibold"}>
              {unrealizedPnl >= 0 ? "+" : ""}₹{Math.abs(unrealizedPnl).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {openTrades.length === 0 && activeAlerts.length === 0 && (
          <p className="text-xs text-muted-foreground">No open positions or active alerts. Ready for the session.</p>
        )}

        <Button
          variant="link"
          size="sm"
          className="px-0 h-auto text-xs text-primary"
          onClick={() => navigate("/trades")}
        >
          View open positions <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
