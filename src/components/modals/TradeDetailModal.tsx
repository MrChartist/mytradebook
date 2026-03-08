import { useState, useEffect } from "react";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { PostTradeReviewModal } from "@/components/modals/PostTradeReviewModal";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Activity, Send, Calendar, ExternalLink, Loader2,
} from "lucide-react";
import type { Trade } from "@/hooks/useTrades";
import { useTrades } from "@/hooks/useTrades";
import { useTradeEvents } from "@/hooks/useTradeEvents";
import { useTradeTags } from "@/hooks/useTradeTags";
import { ConfirmDeleteModal } from "@/components/modals/ConfirmDeleteModal";

// Sub-components
import { TradeDetailHeader } from "./TradeDetailHeader";
import { TradeDetailMetrics } from "./TradeDetailMetrics";
import { TradeDetailTags } from "./TradeDetailTags";
import { TradeDetailTimeline } from "./TradeDetailTimeline";
import { TradeDetailTelegram } from "./TradeDetailTelegram";
import { TradeDetailActions } from "./TradeDetailActions";
import { TradeCoachPanel } from "@/components/trade/TradeCoachPanel";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Equity Intraday",
  Equity_Positional: "Equity Positional",
  Futures: "Futures",
  Options: "Options",
  Commodities: "Commodities",
};

const timeframeLabels: Record<string, string> = {
  "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
  "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
};

export function TradeDetailModal({ trade, open, onOpenChange }: TradeDetailModalProps) {
  const { closeTrade, updateTrade, deleteTrade } = useTrades();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const { events, addEvent } = useTradeEvents(trade?.id || null);
  const tags = useTradeTags(trade?.id || null);

  const [showReview, setShowReview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  if (!trade) return null;

  const startEditing = () => {
    setEditForm({
      symbol: trade.symbol,
      entry_price: trade.entry_price ?? "",
      quantity: trade.quantity,
      stop_loss: trade.stop_loss ?? "",
      targets: JSON.stringify((trade.targets as number[]) || []),
      notes: trade.notes ?? "",
      segment: trade.segment,
      trade_type: trade.trade_type,
      entry_time: trade.entry_time ? new Date(trade.entry_time).toISOString().slice(0, 16) : "",
      status: trade.status ?? "PENDING",
      timeframe: (trade as any).timeframe ?? "",
      holding_period: (trade as any).holding_period ?? "",
      chart_link: (trade as any).chart_link ?? "",
      rating: trade.rating ?? "",
      confidence_score: trade.confidence_score ?? "",
      current_price: trade.current_price ?? "",
      trailing_sl_enabled: trade.trailing_sl_enabled ?? false,
      trailing_sl_percent: trade.trailing_sl_percent ?? "",
      trailing_sl_points: trade.trailing_sl_points ?? "",
      trailing_sl_trigger_price: trade.trailing_sl_trigger_price ?? "",
      auto_track_enabled: trade.auto_track_enabled ?? false,
      telegram_post_enabled: trade.telegram_post_enabled ?? false,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    let parsedTargets: number[] = [];
    try {
      const raw = editForm.targets;
      if (raw) {
        parsedTargets = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsedTargets)) parsedTargets = [];
      }
    } catch { parsedTargets = []; }

    await updateTrade.mutateAsync({
      id: trade.id,
      symbol: editForm.symbol,
      entry_price: editForm.entry_price ? parseFloat(editForm.entry_price) : null,
      quantity: parseInt(editForm.quantity) || trade.quantity,
      stop_loss: editForm.stop_loss ? parseFloat(editForm.stop_loss) : null,
      targets: parsedTargets,
      notes: editForm.notes || null,
      segment: editForm.segment,
      trade_type: editForm.trade_type,
      entry_time: editForm.entry_time ? new Date(editForm.entry_time).toISOString() : trade.entry_time,
      status: editForm.status,
      timeframe: editForm.timeframe || null,
      holding_period: editForm.holding_period || null,
      chart_link: editForm.chart_link || null,
      rating: editForm.rating ? parseInt(editForm.rating) : null,
      confidence_score: editForm.confidence_score ? parseInt(editForm.confidence_score) : null,
      current_price: editForm.current_price ? parseFloat(editForm.current_price) : null,
      trailing_sl_enabled: editForm.trailing_sl_enabled,
      trailing_sl_percent: editForm.trailing_sl_percent ? parseFloat(editForm.trailing_sl_percent) : null,
      trailing_sl_points: editForm.trailing_sl_points ? parseFloat(editForm.trailing_sl_points) : null,
      trailing_sl_trigger_price: editForm.trailing_sl_trigger_price ? parseFloat(editForm.trailing_sl_trigger_price) : null,
      auto_track_enabled: editForm.auto_track_enabled,
      telegram_post_enabled: editForm.telegram_post_enabled,
    });
    setIsEditing(false);
  };

  const handleClose = async (exitPrice: number) => {
    await closeTrade.mutateAsync({ id: trade.id, exitPrice, closureReason: "MANUAL" });
    setShowReview(true);
  };

  const handleUpdateSL = async (newSLValue: number) => {
    await updateTrade.mutateAsync({ id: trade.id, stop_loss: newSLValue });
    await addEvent.mutateAsync({ event_type: "SL_MODIFIED", price: newSLValue, notes: `SL modified to ₹${newSLValue}` });
  };

  const handleAddEvent = async (data: { event_type: string; price: number; quantity?: number; notes?: string }) => {
    await addEvent.mutateAsync({
      event_type: data.event_type as any,
      price: data.price,
      quantity: data.quantity,
      notes: data.notes,
      pnl_realized: undefined,
    });
  };

  const pnl = trade.pnl || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <TradeDetailHeader
              trade={trade}
              isEditing={isEditing}
              onStartEditing={startEditing}
              onCancelEditing={() => setIsEditing(false)}
            />
          </DialogTitle>
        </DialogHeader>

        {/* Edit Mode */}
        {isEditing ? (
          <EditModeContent
            editForm={editForm}
            setEditForm={setEditForm}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            isSaving={updateTrade.isPending}
          />
        ) : (
          <>
            <TradeDetailMetrics trade={trade} onUpdateSL={handleUpdateSL} isUpdating={updateTrade.isPending} />

            {/* Chart Snapshots */}
            {trade.chart_images && Array.isArray(trade.chart_images) && (trade.chart_images as string[]).length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Chart Snapshots</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(trade.chart_images as string[]).map((url, index) => {
                      const isImage = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url) || url.includes("/storage/v1/object/");
                      return isImage ? (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-video rounded-lg overflow-hidden border border-border bg-accent hover:opacity-80 transition-opacity">
                          <img src={url} alt={`Chart ${index + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border border-border bg-accent/50 hover:bg-accent transition-colors">
                          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-xs text-primary truncate">{(() => { try { return new URL(url).hostname.replace("www.", ""); } catch { return url; } })()}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {trade.notes && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Notes</h4>
                  <p className="text-sm text-muted-foreground p-3 rounded-lg bg-accent/50">{trade.notes}</p>
                </div>
              </>
            )}

            {/* Timestamps */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Entry: {new Date(trade.entry_time).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
              </div>
              {trade.closed_at && (
                <div className="flex items-center gap-1">
                  <span>Closed: {new Date(trade.closed_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                </div>
              )}
            </div>

            <Separator />

            <TradeDetailTags tags={tags} />

            <Separator />

            <TradeDetailTimeline
              events={events}
              isOpen={trade.status === "OPEN"}
              onAddEvent={handleAddEvent}
              isAdding={addEvent.isPending}
            />

            {/* AI Trade Coach - only for closed trades */}
            {trade.status === "CLOSED" && (
              <>
                <Separator />
                <TradeCoachPanel trade={trade} />
              </>
            )}

            <Separator />

            <TradeDetailActions
              trade={trade}
              onClose={handleClose}
              isClosing={closeTrade.isPending}
              onShowReview={() => setShowReview(true)}
              onDeleteClick={() => setDeleteModalOpen(true)}
            />

            <Separator />

            <TradeDetailTelegram tradeId={trade.id} userId={trade.user_id} />
          </>
        )}

        <PostTradeReviewModal
          tradeId={trade.id}
          symbol={trade.symbol}
          pnl={pnl}
          open={showReview}
          onOpenChange={setShowReview}
          onComplete={() => onOpenChange(false)}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={async () => {
            await deleteTrade.mutateAsync(trade.id);
            setDeleteModalOpen(false);
            onOpenChange(false);
          }}
          isLoading={deleteTrade.isPending}
          title="Delete Trade"
          description={`Are you sure you want to delete the trade for "${trade.symbol}"? This action cannot be undone.`}
        />
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Mode (kept inline to avoid passing too many props) ──

function EditModeContent({
  editForm, setEditForm, onSave, onCancel, isSaving,
}: {
  editForm: Record<string, any>;
  setEditForm: (form: Record<string, any>) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const segmentLabelsLocal: Record<string, string> = {
    Equity_Intraday: "Equity Intraday", Equity_Positional: "Equity Positional",
    Futures: "Futures", Options: "Options", Commodities: "Commodities",
  };

  const timeframeLabelsLocal: Record<string, string> = {
    "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
    "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
  };

  return (
    <div className="space-y-5">
      {/* Core Details */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Core Details</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Symbol</Label>
            <Input value={editForm.symbol} onChange={(e) => setEditForm({ ...editForm, symbol: e.target.value })} className="bg-background" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Segment</Label>
            <Select value={editForm.segment} onValueChange={(v) => setEditForm({ ...editForm, segment: v })}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>{Object.entries(segmentLabelsLocal).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Trade Type</Label>
            <Select value={editForm.trade_type} onValueChange={(v) => setEditForm({ ...editForm, trade_type: v })}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="BUY">BUY</SelectItem><SelectItem value="SELL">SELL</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Status</Label>
            <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Planned</SelectItem><SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem><SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pricing & Quantity</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Entry Price</Label>
            <Input type="number" step="0.01" value={editForm.entry_price} onChange={(e) => setEditForm({ ...editForm, entry_price: e.target.value })} className="bg-background font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Current Price</Label>
            <Input type="number" step="0.01" value={editForm.current_price} onChange={(e) => setEditForm({ ...editForm, current_price: e.target.value })} className="bg-background font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Quantity</Label>
            <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} className="bg-background font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Stop Loss</Label>
            <Input type="number" step="0.01" value={editForm.stop_loss} onChange={(e) => setEditForm({ ...editForm, stop_loss: e.target.value })} className="bg-background font-mono" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Targets (comma-separated)</Label>
          <Input
            value={(() => { try { const arr = typeof editForm.targets === "string" ? JSON.parse(editForm.targets) : editForm.targets; return Array.isArray(arr) ? arr.join(", ") : editForm.targets; } catch { return editForm.targets; } })()}
            onChange={(e) => { const parts = e.target.value.split(",").map(s => s.trim()).filter(Boolean).map(Number).filter(n => !isNaN(n)); setEditForm({ ...editForm, targets: JSON.stringify(parts) }); }}
            placeholder="e.g. 100, 110, 120"
            className="bg-background font-mono text-sm"
          />
        </div>
      </div>

      {/* TSL */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Trailing Stop Loss</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-muted-foreground">{editForm.trailing_sl_enabled ? "Enabled" : "Disabled"}</span>
            <button type="button" role="switch" aria-checked={editForm.trailing_sl_enabled}
              className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", editForm.trailing_sl_enabled ? "bg-profit" : "bg-muted")}
              onClick={() => setEditForm({ ...editForm, trailing_sl_enabled: !editForm.trailing_sl_enabled })}>
              <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg transition-transform", editForm.trailing_sl_enabled ? "translate-x-4" : "translate-x-0")} />
            </button>
          </label>
        </div>
        {editForm.trailing_sl_enabled && (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">TSL %</Label>
              <Input type="number" step="0.1" value={editForm.trailing_sl_percent} onChange={(e) => setEditForm({ ...editForm, trailing_sl_percent: e.target.value })} className="bg-background font-mono" placeholder="e.g. 1.5" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">TSL Points</Label>
              <Input type="number" step="0.5" value={editForm.trailing_sl_points} onChange={(e) => setEditForm({ ...editForm, trailing_sl_points: e.target.value })} className="bg-background font-mono" placeholder="e.g. 10" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Trigger Price</Label>
              <Input type="number" step="0.01" value={editForm.trailing_sl_trigger_price} onChange={(e) => setEditForm({ ...editForm, trailing_sl_trigger_price: e.target.value })} className="bg-background font-mono" placeholder="₹" />
            </div>
          </div>
        )}
      </div>

      {/* Timing */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Timing & Setup</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Entry Date & Time</Label>
            <DateTimePicker value={editForm.entry_time ? new Date(editForm.entry_time) : null} onChange={(d) => setEditForm({ ...editForm, entry_time: d ? d.toISOString().slice(0, 16) : "" })} maxDate={new Date()} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Timeframe</Label>
            <Select value={editForm.timeframe || "__none__"} onValueChange={(v) => setEditForm({ ...editForm, timeframe: v === "__none__" ? "" : v })}>
              <SelectTrigger className="bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent><SelectItem value="__none__">None</SelectItem>{Object.entries(timeframeLabelsLocal).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rating (1–10)</Label>
            <Input type="number" min="1" max="10" value={editForm.rating} onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })} className="bg-background font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Confidence (1–5)</Label>
            <Input type="number" min="1" max="5" value={editForm.confidence_score} onChange={(e) => setEditForm({ ...editForm, confidence_score: e.target.value })} className="bg-background font-mono" />
          </div>
        </div>
      </div>

      {/* Automation */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Automation & Alerts</h4>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-profit" />
              <div><p className="text-sm font-medium">Auto Track (Live Price Sync)</p><p className="text-xs text-muted-foreground">Monitor price for SL/TSL/Target triggers</p></div>
            </div>
            <button type="button" role="switch" aria-checked={editForm.auto_track_enabled}
              className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", editForm.auto_track_enabled ? "bg-profit" : "bg-muted")}
              onClick={() => setEditForm({ ...editForm, auto_track_enabled: !editForm.auto_track_enabled })}>
              <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg transition-transform", editForm.auto_track_enabled ? "translate-x-4" : "translate-x-0")} />
            </button>
          </label>
          <label className="flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <div><p className="text-sm font-medium">Post to Telegram</p><p className="text-xs text-muted-foreground">Send updates to your linked channels</p></div>
            </div>
            <button type="button" role="switch" aria-checked={editForm.telegram_post_enabled}
              className={cn("relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors", editForm.telegram_post_enabled ? "bg-primary" : "bg-muted")}
              onClick={() => setEditForm({ ...editForm, telegram_post_enabled: !editForm.telegram_post_enabled })}>
              <span className={cn("pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg transition-transform", editForm.telegram_post_enabled ? "translate-x-4" : "translate-x-0")} />
            </button>
          </label>
        </div>
      </div>

      {/* Additional Info */}
      <div className="rounded-xl border border-border bg-accent/30 p-4 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Additional Info</h4>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Chart Link</Label>
          <Input value={editForm.chart_link} onChange={(e) => setEditForm({ ...editForm, chart_link: e.target.value })} className="bg-background" placeholder="https://..." />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Notes</Label>
          <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="bg-background min-h-[80px]" placeholder="Trade notes..." />
        </div>
      </div>

      {/* Save / Cancel */}
      <div className="flex gap-2 sticky bottom-0 bg-background pt-2 pb-1">
        <Button onClick={onSave} disabled={isSaving} className="flex-1">
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
