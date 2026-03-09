import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { TradeStatus } from "@/lib/constants";

export function RiskMeter() {
  const { trades } = useTrades();
  const openTrades = trades.filter(t => t.status === TradeStatus.OPEN);
  
  const currentExposure = openTrades.length * 2;
  const maxRisk = 10;
  const percentage = Math.min((currentExposure / maxRisk) * 100, 100);

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${percentage > 80 ? 'text-destructive' : 'text-warning'}`} />
          Risk Exposure
        </CardTitle>
        <span className="text-sm font-bold">{currentExposure}% / {maxRisk}%</span>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden flex">
          <div className={`h-full ${percentage > 80 ? 'bg-destructive' : percentage > 50 ? 'bg-warning' : 'bg-profit'}`} style={{ width: `${percentage}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">{openTrades.length} open positions. Safe to add new trades.</p>
      </CardContent>
    </Card>
  );
}