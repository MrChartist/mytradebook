import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck } from "lucide-react";
import { useTradingRules } from "@/hooks/useTradingRules";
import { useTrades } from "@/hooks/useTrades";
import { useDailyJournal } from "@/hooks/useDailyJournal";
import { format } from "date-fns";

export function DisciplineScore() {
  const { rules, isLoading: rulesLoading } = useTradingRules();
  const { trades } = useTrades();
  const { entry } = useDailyJournal(format(new Date(), "yyyy-MM-dd"));

  // Pillar 1 (40%): Rules adherence — ratio of active rules to total rules (assuming all active = followed)
  const activeRules = rules.filter((r) => r.active);
  const totalRules = rules.length;
  const rulesScore = totalRules > 0 ? (activeRules.length / totalRules) * 100 : 100;

  // Pillar 2 (25%): Post-trade review completion — % of closed trades reviewed
  const closedTrades = trades.filter((t) => t.status === "CLOSED");
  const reviewedTrades = closedTrades.filter((t) => t.reviewed_at);
  const reviewScore = closedTrades.length > 0 ? (reviewedTrades.length / closedTrades.length) * 100 : 100;

  // Pillar 3 (20%): Journaling — did they journal today?
  const journaledToday = !!(entry?.pre_market_plan || entry?.post_market_review);
  const journalScore = journaledToday ? 100 : 0;

  // Pillar 4 (15%): Holding period discipline — trades with holding_period set
  const holdingTrades = trades.filter((t) => t.status === "CLOSED");
  const disciplinedHolding = holdingTrades.filter((t) => t.holding_period);
  const holdingScore = holdingTrades.length > 0 ? (disciplinedHolding.length / holdingTrades.length) * 100 : 100;

  const score = Math.round(
    rulesScore * 0.4 + reviewScore * 0.25 + journalScore * 0.2 + holdingScore * 0.15
  );

  const getColor = () => {
    if (score >= 80) return "text-profit";
    if (score >= 50) return "text-amber-400";
    return "text-loss";
  };

  const pillars = [
    { label: "Rules", value: Math.round(rulesScore), weight: "40%" },
    { label: "Reviews", value: Math.round(reviewScore), weight: "25%" },
    { label: "Journal", value: journalScore, weight: "20%" },
    { label: "Holding", value: Math.round(holdingScore), weight: "15%" },
  ];

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Discipline Score
        </CardTitle>
        <span className={`text-2xl font-bold ${getColor()}`}>{rulesLoading ? "—" : score}</span>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <Progress value={score} className="h-2 mb-3" />
        <div className="grid grid-cols-4 gap-1">
          {pillars.map((p) => (
            <div key={p.label} className="text-center">
              <div className="text-[10px] text-muted-foreground">{p.label}</div>
              <div className={`text-xs font-semibold ${p.value >= 80 ? "text-profit" : p.value >= 50 ? "text-amber-400" : "text-loss"}`}>
                {p.value}%
              </div>
              <div className="text-[9px] text-muted-foreground/60">{p.weight}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
