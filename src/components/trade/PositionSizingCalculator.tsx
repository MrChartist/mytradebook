import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calculator, Shield, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  entryPrice: number | undefined;
  stopLoss: number | undefined;
  tradeType: string;
  accountSize?: number;
  onQuantitySuggested?: (qty: number) => void;
}

export function PositionSizingCalculator({ entryPrice, stopLoss, tradeType, accountSize = 500000, onQuantitySuggested }: Props) {
  const [riskPercent, setRiskPercent] = useState(2);
  const [customAccountSize, setCustomAccountSize] = useState(accountSize);

  useEffect(() => {
    setCustomAccountSize(accountSize);
  }, [accountSize]);

  const calc = useMemo(() => {
    const entry = Number(entryPrice);
    const sl = Number(stopLoss);
    const account = Number(customAccountSize);
    const risk = Number(riskPercent);

    if (!entry || !sl || !account || !risk || entry <= 0 || sl <= 0) return null;

    const isBuy = tradeType === "BUY";
    const slPoints = isBuy ? entry - sl : sl - entry;

    if (slPoints <= 0) return null;

    const maxRiskAmount = (account * risk) / 100;
    const suggestedQty = Math.floor(maxRiskAmount / slPoints);
    const actualRisk = suggestedQty * slPoints;
    const actualRiskPct = (actualRisk / account) * 100;
    const positionValue = suggestedQty * entry;
    const leverage = positionValue / account;

    return {
      suggestedQty: Math.max(1, suggestedQty),
      maxRiskAmount,
      actualRisk,
      actualRiskPct,
      slPoints,
      positionValue,
      leverage,
    };
  }, [entryPrice, stopLoss, tradeType, customAccountSize, riskPercent]);

  if (!entryPrice || !stopLoss) return null;

  return (
    <div className="space-y-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-primary">
          <Calculator className="w-3.5 h-3.5" />
          Position Sizing Calculator
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Account Size (₹)</Label>
          <Input
            type="number"
            value={customAccountSize}
            onChange={(e) => setCustomAccountSize(Number(e.target.value))}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Risk per Trade (%)</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskPercent(r)}
                className={cn(
                  "flex-1 h-8 rounded-md text-xs font-medium border transition-all",
                  riskPercent === r
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {calc && (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border">
            <div>
              <p className="text-xs text-muted-foreground">Suggested Quantity</p>
              <p className="text-2xl font-bold text-primary">{calc.suggestedQty}</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => onQuantitySuggested?.(calc.suggestedQty)}
            >
              <Check className="w-3 h-3 mr-1" />
              Use
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded bg-accent/50 text-center">
              <p className="text-muted-foreground">Max Risk</p>
              <p className="font-semibold">₹{calc.maxRiskAmount.toLocaleString("en-IN")}</p>
            </div>
            <div className="p-2 rounded bg-accent/50 text-center">
              <p className="text-muted-foreground">SL Distance</p>
              <p className="font-semibold">{calc.slPoints.toFixed(1)} pts</p>
            </div>
            <div className="p-2 rounded bg-accent/50 text-center">
              <p className="text-muted-foreground">Position Value</p>
              <p className="font-semibold">₹{(calc.positionValue / 1000).toFixed(0)}k</p>
            </div>
          </div>

          {calc.leverage > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-warning p-2 rounded bg-warning/5">
              <AlertTriangle className="w-3 h-3" />
              <span>Leverage: {calc.leverage.toFixed(1)}x — Position exceeds account size</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
