import { useTrades } from "@/hooks/useTrades";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Target, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export function DailyScorecard() {
  const { trades } = useTrades();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const todayTrades = trades.filter(t => t.entry_time.startsWith(todayStr));
  const wins = todayTrades.filter(t => (t.pnl || 0) > 0).length;
  const winRate = todayTrades.length > 0 ? Math.round((wins / todayTrades.length) * 100) : 0;
  
  const mood = "😊"; 

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-4 grid grid-cols-4 gap-4 divide-x divide-border/30">
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="w-3 h-3"/> Trades</span>
          <span className="text-xl font-bold">{todayTrades.length}</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Target className="w-3 h-3"/> Win Rate</span>
          <span className="text-xl font-bold">{winRate}%</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Rules</span>
          <span className="text-xl font-bold text-profit">100%</span>
        </div>
        <div className="flex flex-col items-center justify-center space-y-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">Mood</span>
          <span className="text-2xl">{mood}</span>
        </div>
      </CardContent>
    </Card>
  );
}