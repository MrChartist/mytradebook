import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import { useDashboard } from "@/pages/Dashboard";
import { toast } from "sonner";
import { Star, ChevronRight, ChevronLeft, Save, Loader2, CheckCircle2 } from "lucide-react";

const MOODS = [
  { value: "great", label: "Great", emoji: "🔥", color: "text-profit bg-profit/10 border-profit/30" },
  { value: "good", label: "Good", emoji: "😊", color: "text-profit bg-profit/5 border-profit/20" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "text-warning bg-warning/10 border-warning/30" },
  { value: "bad", label: "Bad", emoji: "😟", color: "text-loss bg-loss/5 border-loss/20" },
  { value: "terrible", label: "Terrible", emoji: "😩", color: "text-loss bg-loss/10 border-loss/30" },
] as const;

interface DailyReviewWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DailyReviewWizard({ open, onOpenChange }: DailyReviewWizardProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const { entry, upsertEntry } = useDailyJournal(today);
  const { trades } = useDashboard();

  const [step, setStep] = useState(0);
  const [mood, setMood] = useState<string | null>(entry?.mood ?? null);
  const [discipline, setDiscipline] = useState(0);
  const [bestTradeId, setBestTradeId] = useState<string | null>(null);
  const [worstTradeId, setWorstTradeId] = useState<string | null>(null);
  const [whatWorked, setWhatWorked] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [lessons, setLessons] = useState("");

  const todaysTrades = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return (trades || []).filter((t) => {
      if (t.status !== "CLOSED" || !t.closed_at) return false;
      return format(new Date(t.closed_at), "yyyy-MM-dd") === todayStr;
    });
  }, [trades]);

  const handleSave = useCallback(async () => {
    const bestTrade = todaysTrades.find((t) => t.id === bestTradeId);
    const worstTrade = todaysTrades.find((t) => t.id === worstTradeId);

    const reviewParts: string[] = [];
    if (discipline > 0) reviewParts.push(`Discipline: ${discipline}/5`);
    if (bestTrade) reviewParts.push(`Best trade: ${bestTrade.symbol} (${bestTrade.pnl && bestTrade.pnl >= 0 ? "+" : ""}₹${bestTrade.pnl?.toLocaleString("en-IN")})`);
    if (worstTrade) reviewParts.push(`Worst trade: ${worstTrade.symbol} (${worstTrade.pnl && worstTrade.pnl >= 0 ? "+" : ""}₹${worstTrade.pnl?.toLocaleString("en-IN")})`);
    if (whatWorked) reviewParts.push(`What worked: ${whatWorked}`);
    if (whatToImprove) reviewParts.push(`To improve: ${whatToImprove}`);

    try {
      await upsertEntry.mutateAsync({
        entry_date: today,
        mood: mood as any,
        post_market_review: reviewParts.join("\n") || null,
        lessons_learned: lessons || null,
      });
      toast.success("Daily review saved to journal!");
      onOpenChange(false);
      // Reset
      setStep(0);
      setMood(null);
      setDiscipline(0);
      setBestTradeId(null);
      setWorstTradeId(null);
      setWhatWorked("");
      setWhatToImprove("");
      setLessons("");
    } catch {
      toast.error("Failed to save review");
    }
  }, [mood, discipline, bestTradeId, worstTradeId, whatWorked, whatToImprove, lessons, todaysTrades, today, upsertEntry, onOpenChange]);

  const STEPS = ["Mood", "Trades", "Reflect", "Save"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">🌙 End-of-Day Review</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={cn(
                "h-1.5 rounded-full flex-1 transition-colors",
                i <= step ? "bg-primary" : "bg-muted"
              )} />
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mb-3">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>

        {/* Step 0: Mood + Discipline */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">How are you feeling?</label>
              <div className="flex gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border-2 text-center transition-all",
                      mood === m.value ? m.color + " scale-105 shadow-sm" : "border-border text-muted-foreground hover:border-foreground/20"
                    )}
                  >
                    <span className="text-lg block">{m.emoji}</span>
                    <span className="text-[9px] font-medium mt-0.5 block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Discipline rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setDiscipline(n)} className="p-1 transition-transform hover:scale-110">
                    <Star className={cn("w-6 h-6", n <= discipline ? "fill-warning text-warning" : "text-muted-foreground/30")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Tag best/worst trade */}
        {step === 1 && (
          <div className="space-y-3">
            {todaysTrades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No closed trades today. You can skip this step.</p>
            ) : (
              <>
                <label className="text-xs font-medium text-muted-foreground block">Tag your best & worst trade</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {todaysTrades.map((t) => (
                    <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{t.symbol}</span>
                        <span className={cn("text-xs", (t.pnl ?? 0) >= 0 ? "text-profit" : "text-loss")}>
                          {(t.pnl ?? 0) >= 0 ? "+" : ""}₹{(t.pnl ?? 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <button
                        onClick={() => setBestTradeId(bestTradeId === t.id ? null : t.id)}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded-full border transition-all font-medium",
                          bestTradeId === t.id ? "bg-profit/15 border-profit/40 text-profit" : "border-border text-muted-foreground"
                        )}
                      >
                        ✅ Best
                      </button>
                      <button
                        onClick={() => setWorstTradeId(worstTradeId === t.id ? null : t.id)}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded-full border transition-all font-medium",
                          worstTradeId === t.id ? "bg-loss/15 border-loss/40 text-loss" : "border-border text-muted-foreground"
                        )}
                      >
                        ❌ Worst
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 2: Reflection */}
        {step === 2 && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">What worked today?</label>
              <Textarea value={whatWorked} onChange={(e) => setWhatWorked(e.target.value)} placeholder="Followed plan, held winners..." className="min-h-[60px] text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">What to improve?</label>
              <Textarea value={whatToImprove} onChange={(e) => setWhatToImprove(e.target.value)} placeholder="Exited too early, missed setups..." className="min-h-[60px] text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Key lessons</label>
              <Textarea value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="Main takeaways..." className="min-h-[60px] text-sm resize-none" />
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3 space-y-2 text-sm">
              {mood && <p>Mood: {MOODS.find((m) => m.value === mood)?.emoji} {MOODS.find((m) => m.value === mood)?.label}</p>}
              {discipline > 0 && <p>Discipline: {"⭐".repeat(discipline)}</p>}
              {bestTradeId && <p>Best: {todaysTrades.find((t) => t.id === bestTradeId)?.symbol}</p>}
              {worstTradeId && <p>Worst: {todaysTrades.find((t) => t.id === worstTradeId)?.symbol}</p>}
              {whatWorked && <p className="text-muted-foreground text-xs">✅ {whatWorked}</p>}
              {whatToImprove && <p className="text-muted-foreground text-xs">🔧 {whatToImprove}</p>}
              {lessons && <p className="text-muted-foreground text-xs">💡 {lessons}</p>}
              {!mood && !discipline && !bestTradeId && !whatWorked && !lessons && (
                <p className="text-muted-foreground">No data entered. You can go back to fill in details.</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3.5 h-3.5 text-profit" />
              This will be saved to your journal for {format(new Date(), "MMM d, yyyy")}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < 3 ? (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={upsertEntry.isPending}>
              {upsertEntry.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save Review
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
