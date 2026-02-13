import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Star, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { toast } from "sonner";

interface Props {
  tradeId: string;
  symbol: string;
  pnl: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function PostTradeReviewModal({ tradeId, symbol, pnl, open, onOpenChange, onComplete }: Props) {
  const { updateTrade } = useTrades();
  const [rating, setRating] = useState(0);
  const [executionQuality, setExecutionQuality] = useState(0);
  const [rulesFollowed, setRulesFollowed] = useState(true);
  const [whatWorked, setWhatWorked] = useState("");
  const [whatFailed, setWhatFailed] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateTrade.mutateAsync({
        id: tradeId,
        review_rating: rating || null,
        review_execution_quality: executionQuality || null,
        review_rules_followed: rulesFollowed,
        review_what_worked: whatWorked.trim() || null,
        review_what_failed: whatFailed.trim() || null,
        reviewed_at: new Date().toISOString(),
      } as any);
      toast.success("Review saved!");
      onOpenChange(false);
      onComplete?.();
    } catch (e) {
      toast.error("Failed to save review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-profit" />
            Post-Trade Review
          </DialogTitle>
          <DialogDescription>
            Review your {symbol} trade • P&L: <span className={cn(pnl >= 0 ? "text-profit" : "text-loss", "font-semibold")}>
              {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString("en-IN")}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Trade Rating */}
          <div className="space-y-2">
            <Label className="text-sm">How would you rate this trade setup? (1-5)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star className={cn("w-7 h-7", s <= rating ? "text-warning fill-warning" : "text-muted-foreground/30")} />
                </button>
              ))}
            </div>
          </div>

          {/* Execution Quality */}
          <div className="space-y-2">
            <Label className="text-sm">Execution quality (1-5)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setExecutionQuality(q)}
                  className={cn(
                    "w-10 h-10 rounded-lg border text-sm font-semibold transition-all",
                    q <= executionQuality
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Rules Followed */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
            <div className="flex items-center gap-2">
              {rulesFollowed ? (
                <CheckCircle2 className="w-4 h-4 text-profit" />
              ) : (
                <XCircle className="w-4 h-4 text-loss" />
              )}
              <Label className="text-sm font-medium">Did you follow your trading rules?</Label>
            </div>
            <Switch checked={rulesFollowed} onCheckedChange={setRulesFollowed} />
          </div>

          {/* What Worked */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
              What went right?
            </Label>
            <Textarea
              value={whatWorked}
              onChange={(e) => setWhatWorked(e.target.value)}
              placeholder="e.g., Waited for confirmation, proper position sizing, followed SL..."
              className="resize-none text-sm"
              rows={3}
            />
          </div>

          {/* What Failed */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-loss" />
              What went wrong?
            </Label>
            <Textarea
              value={whatFailed}
              onChange={(e) => setWhatFailed(e.target.value)}
              placeholder="e.g., Entered too early, didn't trail SL, oversized position..."
              className="resize-none text-sm"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Skip</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
