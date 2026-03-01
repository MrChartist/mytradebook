import { useState, useCallback } from "react";
import { format } from "date-fns";
import { Smile, Meh, Frown, ThumbsUp, AlertTriangle, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import { toast } from "sonner";

const MOODS = [
  { value: "great", label: "Great", emoji: "🔥", color: "text-profit bg-profit/10 border-profit/30" },
  { value: "good", label: "Good", emoji: "😊", color: "text-profit bg-profit/5 border-profit/20" },
  { value: "neutral", label: "Neutral", emoji: "😐", color: "text-warning bg-warning/10 border-warning/30" },
  { value: "bad", label: "Bad", emoji: "😟", color: "text-loss bg-loss/5 border-loss/20" },
  { value: "terrible", label: "Terrible", emoji: "😩", color: "text-loss bg-loss/10 border-loss/30" },
] as const;

interface DailyJournalEditorProps {
  date?: Date;
  compact?: boolean;
}

export function DailyJournalEditor({ date = new Date(), compact = false }: DailyJournalEditorProps) {
  const dateStr = format(date, "yyyy-MM-dd");
  const { entry, isLoading, upsertEntry } = useDailyJournal(dateStr);

  const [mood, setMood] = useState<string | null>(null);
  const [prePlan, setPrePlan] = useState("");
  const [postReview, setPostReview] = useState("");
  const [outlook, setOutlook] = useState("");
  const [lessons, setLessons] = useState("");
  const [initialized, setInitialized] = useState(false);

  // Sync from DB when entry loads
  if (entry && !initialized) {
    setMood(entry.mood);
    setPrePlan(entry.pre_market_plan || "");
    setPostReview(entry.post_market_review || "");
    setOutlook(entry.market_outlook || "");
    setLessons(entry.lessons_learned || "");
    setInitialized(true);
  }

  // Reset when date changes
  const [lastDate, setLastDate] = useState(dateStr);
  if (dateStr !== lastDate) {
    setLastDate(dateStr);
    setInitialized(false);
    setMood(null);
    setPrePlan("");
    setPostReview("");
    setOutlook("");
    setLessons("");
  }

  const handleSave = useCallback(async () => {
    await upsertEntry.mutateAsync({
      entry_date: dateStr,
      mood: mood as any,
      pre_market_plan: prePlan || null,
      post_market_review: postReview || null,
      market_outlook: outlook || null,
      lessons_learned: lessons || null,
    });
    toast.success("Journal saved");
  }, [dateStr, mood, prePlan, postReview, outlook, lessons, upsertEntry]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📝 Daily Journal — {format(date, "MMM d")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-1.5">
            {MOODS.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={cn(
                  "flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all",
                  mood === m.value ? m.color : "border-border text-muted-foreground hover:border-foreground/20"
                )}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="How was your trading day?"
            value={postReview}
            onChange={(e) => setPostReview(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
          />
          <Button size="sm" className="w-full" onClick={handleSave} disabled={upsertEntry.isPending}>
            {upsertEntry.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Save
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📝 Daily Journal — {format(date, "EEEE, MMM d, yyyy")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Mood Selector */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            How are you feeling today?
          </label>
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
                <span className="text-xl block">{m.emoji}</span>
                <span className="text-[10px] font-medium mt-0.5 block">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pre-Market Plan */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            🌅 Pre-Market Plan
          </label>
          <Textarea
            placeholder="What's your game plan for today? Key levels, setups to watch..."
            value={prePlan}
            onChange={(e) => setPrePlan(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
          />
        </div>

        {/* Market Outlook */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            📊 Market Outlook
          </label>
          <Textarea
            placeholder="Overall market sentiment, sector trends, global cues..."
            value={outlook}
            onChange={(e) => setOutlook(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
          />
        </div>

        {/* Post-Market Review */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            🌙 Post-Market Review
          </label>
          <Textarea
            placeholder="How did the day go? What worked, what didn't?"
            value={postReview}
            onChange={(e) => setPostReview(e.target.value)}
            className="min-h-[80px] text-sm resize-none"
          />
        </div>

        {/* Lessons Learned */}
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
            💡 Lessons Learned
          </label>
          <Textarea
            placeholder="Key takeaways from today's session..."
            value={lessons}
            onChange={(e) => setLessons(e.target.value)}
            className="min-h-[60px] text-sm resize-none"
          />
        </div>

        <Button className="w-full" onClick={handleSave} disabled={upsertEntry.isPending}>
          {upsertEntry.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Journal Entry
        </Button>
      </CardContent>
    </Card>
  );
}
