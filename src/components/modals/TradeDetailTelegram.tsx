import { useState } from "react";
import { Send, History, Loader2, FileText, BarChart3, MessageCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { sendManualTradeSnapshot, sendManualPnlSnapshot, sendManualCustomNote } from "@/lib/telegram";
import { toast } from "sonner";

interface Props {
  tradeId: string;
  userId: string;
}

export function TradeDetailTelegram({ tradeId, userId }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [showCustomNote, setShowCustomNote] = useState(false);
  const [customNoteText, setCustomNoteText] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [deliveryLogs, setDeliveryLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const handleSendSnapshot = async () => {
    setIsSending(true);
    try {
      const res = await sendManualTradeSnapshot(tradeId);
      if (res.success) toast.success(`Trade snapshot sent to ${res.sent_to || 1} chat(s)`);
      else toast.error(res.error || "Failed to send");
    } catch { toast.error("Failed to send"); }
    setIsSending(false);
  };

  const handleSendPnl = async () => {
    setIsSending(true);
    try {
      const res = await sendManualPnlSnapshot(tradeId);
      if (res.success) toast.success(`P&L snapshot sent to ${res.sent_to || 1} chat(s)`);
      else toast.error(res.error || "Failed to send");
    } catch { toast.error("Failed to send"); }
    setIsSending(false);
  };

  const handleSendCustom = async () => {
    if (!customNoteText.trim()) return;
    setIsSending(true);
    try {
      const res = await sendManualCustomNote(tradeId, customNoteText);
      if (res.success) {
        toast.success(`Custom note sent to ${res.sent_to || 1} chat(s)`);
        setCustomNoteText("");
        setShowCustomNote(false);
      } else toast.error(res.error || "Failed to send");
    } catch { toast.error("Failed to send"); }
    setIsSending(false);
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const { data } = await supabase
        .from("telegram_delivery_log")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setDeliveryLogs(data || []);
    } catch { setDeliveryLogs([]); }
    setLoadingLogs(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" /> Send to Telegram
        </h4>
        <Button variant="ghost" size="sm" onClick={() => { setShowHistory(!showHistory); if (!showHistory) loadLogs(); }}>
          <History className="w-4 h-4 mr-1" /> History
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isSending}>
              {isSending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Send Now
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleSendSnapshot}><FileText className="w-4 h-4 mr-2" /> Full Trade Card</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSendPnl}><BarChart3 className="w-4 h-4 mr-2" /> P&L Snapshot</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowCustomNote(true)}><MessageCircle className="w-4 h-4 mr-2" /> Custom Message</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {showCustomNote && (
        <div className="p-3 rounded-lg bg-accent/50 space-y-2">
          <Textarea value={customNoteText} onChange={(e) => setCustomNoteText(e.target.value)} placeholder="Type your message..." className="min-h-[60px]" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSendCustom} disabled={isSending || !customNoteText.trim()}>
              {isSending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Send
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowCustomNote(false); setCustomNoteText(""); }}>Cancel</Button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {loadingLogs ? (
            <div className="flex items-center justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
          ) : deliveryLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">No delivery logs found</p>
          ) : (
            deliveryLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-2 rounded-lg bg-accent/30 text-xs">
                <div className="flex items-center gap-2">
                  {log.success ? <CheckCircle2 className="w-3 h-3 text-profit" /> : <XCircle className="w-3 h-3 text-loss" />}
                  <span className="font-medium">{log.notification_type}</span>
                  {log.segment && <Badge variant="outline" className="text-[9px] py-0">{log.segment}</Badge>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono">{log.chat_id?.slice(-6)}</span>
                  <span>{new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
