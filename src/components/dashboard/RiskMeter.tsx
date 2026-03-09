import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useTrades } from "@/hooks/useTrades";
import { useUserSettings } from "@/hooks/useUserSettings";
import { TradeStatus } from "@/lib/constants";

export function RiskMeter() {
  const { trades } = useTrades();
  const { settings } = useUserSettings();

  const openTrades = trades.filter((t) => t.status === TradeStatus.OPEN);
  const startingCapital = settings?.starting_capital ?? 500000;

  // Real exposure: sum of (entry_price - stop_loss) * quantity per open trade
  const totalRiskAtSL = openTrades.reduce((sum, t) => {
    if (t.entry_price && t.stop_loss && t.quantity) {
      const perShareRisk = Math.abs(t.entry_price - t.stop_loss);
      return sum + perShareRisk * t.quantity;
    }
    return sum;
  }, 0);

  const exposurePercent = startingCapital > 0
    ? (totalRiskAtSL / startingCapital) * 100
    : 0;

  const maxRisk = 10;
  const percentage = Math.min((exposurePercent / maxRisk) * 100, 100);

  const getRiskColor = () => {
    if (exposurePercent > 5) return { bar: "bg-loss", text: "text-loss", icon: "text-loss" };
    if (exposurePercent > 2) return { bar: "bg-amber-400", text: "text-amber-400", icon: "text-amber-400" };
    return { bar: "bg-profit", text: "text-profit", icon: "text-muted-foreground" };
  };

  const colors = getRiskColor();

  const safeToAdd = exposurePercent < 8;
  const maxPositionSize = startingCapital * 0.02; // 2% rule

  return (
    <Card>
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${colors.icon}`} />
          Risk Exposure
        </CardTitle>
        <span className={`text-sm font-bold ${colors.text}`}>
          {exposurePercent.toFixed(1)}% / {maxRisk}%
        </span>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden flex">
          <div
            className={`h-full transition-all duration-500 ${colors.bar}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{openTrades.length} open position{openTrades.length !== 1 ? "s" : ""}</span>
          <span className={safeToAdd ? "text-profit" : "text-loss"}>
            {safeToAdd ? "✓ Safe to add" : "⚠ Near limit"}
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground">
          Max risk/trade: ₹{maxPositionSize.toLocaleString("en-IN")} (2% rule)
          {totalRiskAtSL > 0 && ` · ₹${Math.round(totalRiskAtSL).toLocaleString("en-IN")} at risk`}
        </p>
      </CardContent>
    </Card>
  );
}
