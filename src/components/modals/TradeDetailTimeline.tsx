import { useState } from "react";
import { Plus, Circle, CheckCircle2, XCircle, ArrowUpRight, Pencil, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const eventIcons: Record<string, React.ReactNode> = {
  ENTRY: <Circle className="w-3 h-3 text-profit fill-profit" />,
  SL_HIT: <XCircle className="w-3 h-3 text-loss" />,
  TSL_HIT: <XCircle className="w-3 h-3 text-warning" />,
  TSL_UPDATED: <TrendingUp className="w-3 h-3 text-profit" />,
  TARGET1_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  TARGET2_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  TARGET3_HIT: <CheckCircle2 className="w-3 h-3 text-profit" />,
  PARTIAL_EXIT: <ArrowUpRight className="w-3 h-3 text-warning" />,
  SL_MODIFIED: <Pencil className="w-3 h-3 text-muted-foreground" />,
  TARGET_MODIFIED: <Pencil className="w-3 h-3 text-muted-foreground" />,
  CLOSED: <XCircle className="w-3 h-3 text-muted-foreground" />,
};

const eventLabels: Record<string, string> = {
  ENTRY: "Entry", SL_HIT: "SL Hit", TSL_HIT: "Trailing SL Hit", TSL_UPDATED: "Trailing SL Updated",
  TARGET1_HIT: "Target 1 Hit", TARGET2_HIT: "Target 2 Hit", TARGET3_HIT: "Target 3 Hit",
  PARTIAL_EXIT: "Partial Exit", SL_MODIFIED: "SL Modified", TARGET_MODIFIED: "Target Modified", CLOSED: "Closed",
};

interface Props {
  events: any[];
  isOpen: boolean;
  onAddEvent: (data: { event_type: string; price: number; quantity?: number; notes?: string }) => Promise<void>;
  isAdding: boolean;
}

export function TradeDetailTimeline({ events, isOpen, onAddEvent, isAdding }: Props) {
  const [addingEvent, setAddingEvent] = useState(false);
  const [newEventType, setNewEventType] = useState("");
  const [newEventPrice, setNewEventPrice] = useState("");
  const [newEventNotes, setNewEventNotes] = useState("");

  const handleAdd = async () => {
    if (!newEventType || !newEventPrice) return;
    await onAddEvent({
      event_type: newEventType,
      price: parseFloat(newEventPrice),
      notes: newEventNotes || undefined,
    });
    setAddingEvent(false);
    setNewEventType("");
    setNewEventPrice("");
    setNewEventNotes("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Event Timeline</h4>
        {isOpen && (
          <Button variant="outline" size="sm" onClick={() => setAddingEvent(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Event
          </Button>
        )}
      </div>

      {addingEvent && (
        <div className="p-4 rounded-lg bg-accent/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Event Type</Label>
              <Select value={newEventType} onValueChange={setNewEventType}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(eventLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Price</Label>
              <Input type="number" step="0.01" value={newEventPrice} onChange={(e) => setNewEventPrice(e.target.value)} className="h-8" placeholder="Price" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea value={newEventNotes} onChange={(e) => setNewEventNotes(e.target.value)} className="h-16" placeholder="Add notes..." />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!newEventType || !newEventPrice || isAdding}>
              {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Add Event
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddingEvent(false)}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
              <div className="mt-1">{eventIcons[event.event_type] || <Circle className="w-3 h-3" />}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{eventLabels[event.event_type] || event.event_type}</span>
                  <span className="text-sm font-mono">@ ₹{event.price.toLocaleString()}</span>
                </div>
                {event.notes && <p className="text-xs text-muted-foreground mt-1">📝 {event.notes}</p>}
                {event.pnl_realized && (
                  <p className={cn("text-xs mt-1 font-medium", event.pnl_realized >= 0 ? "text-profit" : "text-loss")}>
                    P&L: {event.pnl_realized >= 0 ? "+" : ""}₹{event.pnl_realized.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(event.timestamp || event.created_at || "").toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No events recorded yet</p>
        )}
      </div>
    </div>
  );
}
