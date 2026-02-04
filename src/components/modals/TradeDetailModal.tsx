import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  Star,
  Calendar,
  Edit,
  X,
  Check,
  Loader2,
  Plus,
  Circle,
  Pencil,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { Trade } from "@/hooks/useTrades";
import { useTrades } from "@/hooks/useTrades";
import { useTradeEvents } from "@/hooks/useTradeEvents";
import { useTradeTags } from "@/hooks/useTradeTags";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const eventIcons: Record<string, React.ReactNode> = {
  ENTRY: <Circle className="w-3 h-3 text-profit fill-profit" />,
  SL_HIT: <XCircle className="w-3 h-3 text-loss" />,
  TARGET1_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  TARGET2_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  TARGET3_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  PARTIAL_EXIT: <ArrowUpRight className="w-3 h-3 text-warning" />,
  SL_MODIFIED: <Pencil className="w-3 h-3 text-muted-foreground" />,
  TARGET_MODIFIED: <Pencil className="w-3 h-3 text-muted-foreground" />,
  CLOSED: <XCircle className="w-3 h-3 text-muted-foreground" />,
};

const eventLabels: Record<string, string> = {
  ENTRY: "Entry",
  SL_HIT: "SL Hit",
  TARGET1_HIT: "Target 1 Hit",
  TARGET2_HIT: "Target 2 Hit",
  TARGET3_HIT: "Target 3 Hit",
  PARTIAL_EXIT: "Partial Exit",
  SL_MODIFIED: "SL Modified",
  TARGET_MODIFIED: "Target Modified",
  CLOSED: "Closed",
};

export function TradeDetailModal({
  trade,
  open,
  onOpenChange,
}: TradeDetailModalProps) {
  const { closeTrade, updateTrade } = useTrades();
  const { events, addEvent } = useTradeEvents(trade?.id || null);
  const tags = useTradeTags(trade?.id || null);

  const [isClosing, setIsClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [editingSL, setEditingSL] = useState(false);
  const [newSL, setNewSL] = useState("");
  
  // Add event state
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventType, setNewEventType] = useState<string>("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventQty, setNewEventQty] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");

  if (!trade) return null;

  const pnl = trade.pnl || 0;
  const pnlPercent = trade.pnl_percent || 0;
  const targets = (trade.targets as number[]) || [];

  const handleClose = async () => {
    if (!exitPrice) return;
    await closeTrade.mutateAsync({
      id: trade.id,
      exitPrice: parseFloat(exitPrice),
      closureReason: "MANUAL",
    });
    setIsClosing(false);
    setExitPrice("");
    onOpenChange(false);
  };

  const handleUpdateSL = async () => {
    if (!newSL) return;
    await updateTrade.mutateAsync({
      id: trade.id,
      stop_loss: parseFloat(newSL),
    });
    // Add SL modified event
    await addEvent.mutateAsync({
      event_type: "SL_MODIFIED",
      price: parseFloat(newSL),
      notes: `SL modified to ₹${newSL}`,
    });
    setEditingSL(false);
    setNewSL("");
  };

  const handleAddEvent = async () => {
    if (!newEventType || !newEventPrice) return;
    await addEvent.mutateAsync({
      event_type: newEventType as any,
      price: parseFloat(newEventPrice),
      quantity: newEventQty ? parseInt(newEventQty) : undefined,
      notes: newEventNotes || undefined,
      pnl_realized: undefined,
    });
    setAddingEvent(false);
    setNewEventType("");
    setNewEventPrice("");
    setNewEventQty("");
    setNewEventNotes("");
  };

  const segmentLabels: Record<string, string> = {
    Equity_Intraday: "Equity Intraday",
    Equity_Positional: "Equity Positional",
    Futures: "Futures",
    Options: "Options",
    Commodities: "Commodities",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                trade.trade_type === "BUY" ? "bg-profit/10" : "bg-loss/10"
              )}
            >
              {trade.trade_type === "BUY" ? (
                <ArrowUpRight className="w-5 h-5 text-profit" />
              ) : (
                <ArrowDownRight className="w-5 h-5 text-loss" />
              )}
            </div>
            <div>
              <span className="text-xl">{trade.symbol}</span>
              <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {trade.trade_type}
                </Badge>
                <span>{trade.quantity} qty</span>
                <span>•</span>
                <span>{segmentLabels[trade.segment] || trade.segment}</span>
                <span>•</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    trade.status === "OPEN"
                      ? "border-profit/50 text-profit"
                      : "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {trade.status}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Trade Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-accent/50">
          <div>
            <p className="text-sm text-muted-foreground">Entry Price</p>
            <p className="text-lg font-semibold font-mono">
              ₹{trade.entry_price.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-lg font-semibold font-mono">
              ₹{(trade.current_price || trade.entry_price).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">P&L</p>
            <p
              className={cn(
                "text-lg font-semibold",
                pnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">P&L %</p>
            <p
              className={cn(
                "text-lg font-semibold",
                pnlPercent >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {pnlPercent >= 0 ? "+" : ""}
              {pnlPercent.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Rating & Confidence */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="text-sm">
              Rating: <strong>{trade.rating || "N/A"}/10</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Confidence: <strong>{trade.confidence_score || "N/A"}/5</strong>
            </span>
          </div>
        </div>

        {/* Price Levels */}
        <div className="space-y-3">
          <h4 className="font-medium">Price Levels</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Stop Loss */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-loss/5 border border-loss/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-loss" />
                <span className="text-sm font-medium">Stop Loss</span>
              </div>
              {editingSL ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newSL}
                    onChange={(e) => setNewSL(e.target.value)}
                    type="number"
                    step="0.01"
                    className="w-24 h-8 text-right"
                    placeholder={trade.stop_loss?.toString()}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={handleUpdateSL}
                    disabled={updateTrade.isPending}
                  >
                    {updateTrade.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 text-profit" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => setEditingSL(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-mono text-loss">
                    ₹{trade.stop_loss?.toLocaleString() || "Not set"}
                  </span>
                  {trade.status === "OPEN" && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditingSL(true);
                        setNewSL(trade.stop_loss?.toString() || "");
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Targets */}
            {targets.map((target, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-profit/5 border border-profit/20"
              >
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-profit" />
                  <span className="text-sm font-medium">Target {index + 1}</span>
                </div>
                <span className="font-mono text-profit">
                  ₹{target.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tags Section */}
        <div className="space-y-3">
          <h4 className="font-medium">Tags</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Patterns */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Patterns</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      {tags.allPatterns
                        .filter((p) => !tags.patterns.find((tp) => tp.id === p.id))
                        .map((pattern) => (
                          <Button
                            key={pattern.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => tags.addPattern.mutate(pattern.id)}
                          >
                            {pattern.name}
                          </Button>
                        ))}
                      {tags.allPatterns.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No patterns available</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.patterns.map((pattern) => (
                  <Badge
                    key={pattern.id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => tags.removePattern.mutate(pattern.id)}
                  >
                    {pattern.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {tags.patterns.length === 0 && (
                  <span className="text-xs text-muted-foreground">No patterns</span>
                )}
              </div>
            </div>

            {/* Candlesticks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Candlesticks</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {tags.allCandlesticks
                        .filter((c) => !tags.candlesticks.find((tc) => tc.id === c.id))
                        .map((cs) => (
                          <Button
                            key={cs.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => tags.addCandlestick.mutate(cs.id)}
                          >
                            {cs.name}
                          </Button>
                        ))}
                      {tags.allCandlesticks.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No candlesticks available</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.candlesticks.map((cs) => (
                  <Badge
                    key={cs.id}
                    variant="secondary"
                    className={cn(
                      "text-xs cursor-pointer hover:bg-destructive/20",
                      cs.bullish ? "border-profit/30" : "border-loss/30"
                    )}
                    onClick={() => tags.removeCandlestick.mutate(cs.id)}
                  >
                    {cs.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {tags.candlesticks.length === 0 && (
                  <span className="text-xs text-muted-foreground">No candlesticks</span>
                )}
              </div>
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volume</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      {tags.allVolumes
                        .filter((v) => !tags.volumes.find((tv) => tv.id === v.id))
                        .map((vol) => (
                          <Button
                            key={vol.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => tags.addVolume.mutate(vol.id)}
                          >
                            {vol.name}
                          </Button>
                        ))}
                      {tags.allVolumes.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No volumes available</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.volumes.map((vol) => (
                  <Badge
                    key={vol.id}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-destructive/20"
                    onClick={() => tags.removeVolume.mutate(vol.id)}
                  >
                    {vol.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {tags.volumes.length === 0 && (
                  <span className="text-xs text-muted-foreground">No volume tags</span>
                )}
              </div>
            </div>

            {/* Mistakes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mistakes</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2">
                    <div className="space-y-1">
                      {tags.allMistakes
                        .filter((m) => !tags.mistakes.find((tm) => tm.id === m.id))
                        .map((mistake) => (
                          <Button
                            key={mistake.id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={() => tags.addMistake.mutate(mistake.id)}
                          >
                            {mistake.name}
                          </Button>
                        ))}
                      {tags.allMistakes.length === 0 && (
                        <p className="text-xs text-muted-foreground p-2">No mistakes available</p>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-1">
                {tags.mistakes.map((mistake) => (
                  <Badge
                    key={mistake.id}
                    variant="destructive"
                    className="text-xs cursor-pointer"
                    onClick={() => tags.removeMistake.mutate(mistake.id)}
                  >
                    {mistake.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {tags.mistakes.length === 0 && (
                  <span className="text-xs text-muted-foreground">No mistakes</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Event Timeline */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Event Timeline</h4>
            {trade.status === "OPEN" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddingEvent(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Event
              </Button>
            )}
          </div>

          {/* Add Event Form */}
          {addingEvent && (
            <div className="p-4 rounded-lg bg-accent/50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Event Type</Label>
                  <Select value={newEventType} onValueChange={setNewEventType}>
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(eventLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newEventPrice}
                    onChange={(e) => setNewEventPrice(e.target.value)}
                    className="h-8"
                    placeholder="Price"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Quantity (optional)</Label>
                  <Input
                    type="number"
                    value={newEventQty}
                    onChange={(e) => setNewEventQty(e.target.value)}
                    className="h-8"
                    placeholder="Qty"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Notes (optional)</Label>
                <Textarea
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  className="h-16"
                  placeholder="Add notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleAddEvent}
                  disabled={!newEventType || !newEventPrice || addEvent.isPending}
                >
                  {addEvent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Event
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setAddingEvent(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/30"
                >
                  <div className="mt-1">
                    {eventIcons[event.event_type] || <Circle className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {eventLabels[event.event_type] || event.event_type}
                      </span>
                      <span className="text-sm font-mono">
                        @ ₹{event.price.toLocaleString()}
                      </span>
                      {event.quantity && (
                        <span className="text-xs text-muted-foreground">
                          ({event.quantity} qty)
                        </span>
                      )}
                    </div>
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1">
                        📝 {event.notes}
                      </p>
                    )}
                    {event.pnl_realized && (
                      <p className={cn(
                        "text-xs mt-1 font-medium",
                        event.pnl_realized >= 0 ? "text-profit" : "text-loss"
                      )}>
                        P&L: {event.pnl_realized >= 0 ? "+" : ""}₹{event.pnl_realized.toLocaleString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp || event.created_at || "").toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No events recorded yet
              </p>
            )}
          </div>
        </div>

        {/* Notes */}
        {trade.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium">Notes</h4>
              <p className="text-sm text-muted-foreground p-3 rounded-lg bg-accent/50">
                {trade.notes}
              </p>
            </div>
          </>
        )}

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              Entry:{" "}
              {new Date(trade.entry_time).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
          {trade.closed_at && (
            <div className="flex items-center gap-1">
              <span>
                Closed:{" "}
                {new Date(trade.closed_at).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        {trade.status === "OPEN" && (
          <div className="space-y-3">
            {isClosing ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.01"
                    placeholder="Enter exit price"
                    value={exitPrice}
                    onChange={(e) => setExitPrice(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={handleClose}
                    disabled={closeTrade.isPending || !exitPrice}
                  >
                    {closeTrade.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Confirm Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsClosing(false);
                      setExitPrice("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => setIsClosing(true)}
              >
                Close Trade
              </Button>
            )}
          </div>
        )}

        {trade.status === "CLOSED" && (
          <div className="p-3 rounded-lg bg-muted text-center">
            <span className="text-sm text-muted-foreground">
              Trade closed on{" "}
              {trade.closed_at &&
                new Date(trade.closed_at).toLocaleDateString("en-IN")}
              {trade.closure_reason && ` • ${trade.closure_reason}`}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
