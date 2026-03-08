import { useState } from "react";
import { Star, CheckCircle2, Loader2, Trash2, Share2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Trade } from "@/hooks/useTrades";
import { TradeShareModal } from "@/components/sharing/TradeShareModal";

interface Props {
  trade: Trade;
  onClose: (exitPrice: number) => Promise<void>;
  isClosing: boolean;
  onShowReview: () => void;
  onDeleteClick: () => void;
  onDuplicate?: () => void;
}

export function TradeDetailActions({ trade, onClose, isClosing, onShowReview, onDeleteClick, onDuplicate }: Props) {
  const [closingMode, setClosingMode] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const handleClose = async () => {
    if (!exitPrice) return;
    await onClose(parseFloat(exitPrice));
    setClosingMode(false);
    setExitPrice("");
  };

  return (
    <>
      {trade.status === "OPEN" && (
        <div className="space-y-3">
          {closingMode ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price</Label>
                <Input id="exitPrice" type="number" step="0.01" placeholder="Enter exit price" value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleClose} disabled={isClosing || !exitPrice}>
                  {isClosing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Close
                </Button>
                <Button variant="outline" onClick={() => { setClosingMode(false); setExitPrice(""); }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button className="w-full" variant="destructive" onClick={() => setClosingMode(true)}>
              Close Trade
            </Button>
          )}
        </div>
      )}

      {trade.status === "CLOSED" && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted text-center">
            <span className="text-sm text-muted-foreground">
              Trade closed on {trade.closed_at && new Date(trade.closed_at).toLocaleDateString("en-IN")}
              {trade.closure_reason && ` • ${trade.closure_reason}`}
            </span>
          </div>

          {(trade as any).reviewed_at ? (
            <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-profit" /> Post-Trade Review
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-background text-center">
                  <p className="text-muted-foreground">Rating</p>
                  <p className="font-bold">{(trade as any).review_rating || "—"}/5</p>
                </div>
                <div className="p-2 rounded bg-background text-center">
                  <p className="text-muted-foreground">Execution</p>
                  <p className="font-bold">{(trade as any).review_execution_quality || "—"}/5</p>
                </div>
                <div className="p-2 rounded bg-background text-center">
                  <p className="text-muted-foreground">Rules</p>
                  <p className={cn("font-bold", (trade as any).review_rules_followed ? "text-profit" : "text-loss")}>
                    {(trade as any).review_rules_followed ? "✓ Yes" : "✗ No"}
                  </p>
                </div>
              </div>
              {(trade as any).review_what_worked && (
                <div><p className="text-xs text-muted-foreground">What worked:</p><p className="text-sm">{(trade as any).review_what_worked}</p></div>
              )}
              {(trade as any).review_what_failed && (
                <div><p className="text-xs text-muted-foreground">What failed:</p><p className="text-sm">{(trade as any).review_what_failed}</p></div>
              )}
            </div>
          ) : (
            <Button variant="outline" className="w-full" onClick={onShowReview}>
              <Star className="w-4 h-4 mr-2" /> Add Post-Trade Review
            </Button>
          )}
        </div>
      )}

      {trade.status === "CLOSED" && (
        <>
          <Button variant="outline" className="w-full" onClick={() => setShareOpen(true)}>
            <Share2 className="w-4 h-4 mr-2" /> Share Trade Card
          </Button>
          <TradeShareModal trade={trade} open={shareOpen} onOpenChange={setShareOpen} />
        </>
      )}

      <Separator />
      <Button variant="outline" className="w-full text-loss border-loss/30 hover:bg-loss/10" onClick={onDeleteClick}>
        <Trash2 className="w-4 h-4 mr-2" /> Delete Trade
      </Button>
    </>
  );
}
