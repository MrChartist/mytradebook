import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskOfRuinProps {
  winRate: number;        // 0-100
  avgWinAmount: number;   // in INR
  avgLossAmount: number;  // in INR (positive)
  startingCapital: number;
  ruinThreshold?: number; // Default 0.5 = 50% drawdown
}

function simulateRuin(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  capital: number,
  ruinLevel: number,
  simulations: number = 5000,
  tradesPerSim: number = 500
): { ruinProbability: number; avgDrawdown: number; maxDrawdown: number; medianEndCapital: number } {
  const wr = winRate / 100;
  const ruinCapital = capital * (1 - ruinLevel);
  let ruinCount = 0;
  let totalMaxDD = 0;
  const endCapitals: number[] = [];

  for (let s = 0; s < simulations; s++) {
    let bal = capital;
    let peak = capital;
    let maxDD = 0;
    let ruined = false;

    for (let t = 0; t < tradesPerSim; t++) {
      const isWin = Math.random() < wr;
      bal += isWin ? avgWin : -avgLoss;

      if (bal > peak) peak = bal;
      const dd = (peak - bal) / peak;
      if (dd > maxDD) maxDD = dd;

      if (bal <= ruinCapital) {
        ruined = true;
        break;
      }
    }

    if (ruined) ruinCount++;
    totalMaxDD += maxDD;
    endCapitals.push(bal);
  }

  endCapitals.sort((a, b) => a - b);

  return {
    ruinProbability: (ruinCount / simulations) * 100,
    avgDrawdown: (totalMaxDD / simulations) * 100,
    maxDrawdown: Math.max(...endCapitals.map((_, i, arr) => {
      // Already computed per-sim, use avg
      return 0;
    }), (totalMaxDD / simulations) * 100),
    medianEndCapital: endCapitals[Math.floor(simulations / 2)],
  };
}

export function RiskOfRuinCalculator({ winRate, avgWinAmount, avgLossAmount, startingCapital, ruinThreshold = 0.5 }: RiskOfRuinProps) {
  const result = useMemo(() => {
    if (winRate <= 0 || avgWinAmount <= 0 || avgLossAmount <= 0 || startingCapital <= 0) return null;
    return simulateRuin(winRate, avgWinAmount, avgLossAmount, startingCapital, ruinThreshold);
  }, [winRate, avgWinAmount, avgLossAmount, startingCapital, ruinThreshold]);

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground text-sm">
          Close some trades to calculate your Risk of Ruin.
        </CardContent>
      </Card>
    );
  }

  const riskLevel = result.ruinProbability < 5 ? "low" : result.ruinProbability < 25 ? "moderate" : "high";
  const riskColors = {
    low: "text-profit",
    moderate: "text-warning",
    high: "text-loss",
  };
  const riskBg = {
    low: "bg-profit/10 border-profit/20",
    moderate: "bg-warning/10 border-warning/20",
    high: "bg-loss/10 border-loss/20",
  };

  const expectancy = (winRate / 100) * avgWinAmount - ((100 - winRate) / 100) * avgLossAmount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Risk of Ruin Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Risk Display */}
        <div className={cn("rounded-xl border-2 p-5 text-center", riskBg[riskLevel])}>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            Probability of {(ruinThreshold * 100).toFixed(0)}% Drawdown
          </p>
          <p className={cn("text-4xl font-bold font-mono", riskColors[riskLevel])}>
            {result.ruinProbability.toFixed(1)}%
          </p>
          <Badge variant="outline" className={cn("mt-2", riskColors[riskLevel])}>
            {riskLevel === "low" ? "✅ Low Risk" : riskLevel === "moderate" ? "⚠️ Moderate Risk" : "🚨 High Risk"}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Avg Max Drawdown</p>
            <p className="text-lg font-bold font-mono text-loss">{result.avgDrawdown.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Median End Capital</p>
            <p className={cn("text-lg font-bold font-mono", result.medianEndCapital >= startingCapital ? "text-profit" : "text-loss")}>
              ₹{result.medianEndCapital.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expectancy/Trade</p>
            <p className={cn("text-lg font-bold font-mono", expectancy >= 0 ? "text-profit" : "text-loss")}>
              {expectancy >= 0 ? "+" : ""}₹{expectancy.toFixed(0)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Simulations</p>
            <p className="text-lg font-bold font-mono">5,000</p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          Monte Carlo simulation: 5,000 runs × 500 trades each. Based on your current win rate ({winRate.toFixed(1)}%), avg win (₹{avgWinAmount.toFixed(0)}), and avg loss (₹{avgLossAmount.toFixed(0)}).
        </p>
      </CardContent>
    </Card>
  );
}
