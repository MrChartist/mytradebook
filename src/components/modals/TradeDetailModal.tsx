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
} from "lucide-react";
import type { Trade } from "@/hooks/useTrades";
import { useTrades } from "@/hooks/useTrades";

interface TradeDetailModalProps {
  trade: Trade | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeDetailModal({
  trade,
  open,
  onOpenChange,
}: TradeDetailModalProps) {
  const { closeTrade, updateTrade } = useTrades();
  const [isClosing, setIsClosing] = useState(false);
  const [exitPrice, setExitPrice] = useState("");
  const [editingSL, setEditingSL] = useState(false);
  const [newSL, setNewSL] = useState("");

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
    setEditingSL(false);
    setNewSL("");
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Trade Summary */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-accent/50">
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

        {/* Price Levels */}
        <div className="space-y-3">
          <h4 className="font-medium">Price Levels</h4>
          <div className="space-y-2">
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

        {/* Notes */}
        {trade.notes && (
          <div className="space-y-2">
            <h4 className="font-medium">Notes</h4>
            <p className="text-sm text-muted-foreground p-3 rounded-lg bg-accent/50">
              {trade.notes}
            </p>
          </div>
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
