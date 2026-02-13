import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface TargetChipsInputProps {
  targets: number[];
  onTargetsChange: (targets: number[]) => void;
  entryPrice?: number;
  stopLoss?: number;
  tradeType?: "BUY" | "SELL";
  quantity?: number;
  className?: string;
}

export function TargetChipsInput({
  targets,
  onTargetsChange,
  entryPrice,
  stopLoss,
  tradeType,
  quantity = 1,
  className,
}: TargetChipsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTarget();
    }
  };

  const addTarget = () => {
    const value = parseFloat(inputValue.trim());
    
    if (isNaN(value) || value <= 0) {
      setError("Enter a valid positive number");
      return;
    }

    if (targets.includes(value)) {
      setError("Target already exists");
      return;
    }

    if (targets.length >= 5) {
      setError("Maximum 5 targets allowed");
      return;
    }

    if (entryPrice && tradeType === "BUY" && value <= entryPrice) {
      setError("Target should be above entry for BUY");
      return;
    }

    if (entryPrice && tradeType === "SELL" && value >= entryPrice) {
      setError("Target should be below entry for SELL");
      return;
    }

    const newTargets = [...targets, value].sort((a, b) => 
      tradeType === "SELL" ? b - a : a - b
    );
    onTargetsChange(newTargets);
    setInputValue("");
    setError(null);
  };

  const removeTarget = (target: number) => {
    onTargetsChange(targets.filter((t) => t !== target));
  };

  // Calculate per-target stats
  const getTargetStats = (target: number, index: number) => {
    if (!entryPrice || entryPrice <= 0) return null;

    const isBuy = tradeType === "BUY";
    const targetPoints = isBuy ? target - entryPrice : entryPrice - target;
    const targetPercent = (targetPoints / entryPrice) * 100;
    const rewardAmount = targetPoints * (quantity || 1);

    let rMultiple: number | null = null;
    if (stopLoss && stopLoss > 0) {
      const slPoints = isBuy ? entryPrice - stopLoss : stopLoss - entryPrice;
      if (slPoints > 0) {
        rMultiple = targetPoints / slPoints;
      }
    }

    return {
      points: targetPoints.toFixed(1),
      percent: targetPercent.toFixed(1),
      reward: Math.abs(rewardAmount).toFixed(0),
      rMultiple: rMultiple?.toFixed(1),
    };
  };

  // Overall Risk:Reward
  const overallRR = (() => {
    if (!entryPrice || !stopLoss || targets.length === 0) return null;
    const risk = Math.abs(entryPrice - stopLoss);
    if (risk === 0) return null;
    const firstTarget = targets[0];
    const reward = Math.abs(firstTarget - entryPrice);
    const ratio = reward / risk;
    return {
      risk: risk.toFixed(2),
      reward: reward.toFixed(2),
      ratio: ratio.toFixed(2),
      isPositive: ratio >= 1,
    };
  })();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          Targets (up to 5)
        </Label>
        {overallRR && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded",
              overallRR.isPositive
                ? "bg-profit/10 text-profit"
                : "bg-loss/10 text-loss"
            )}
          >
            {overallRR.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>R:R 1:{overallRR.ratio}</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-background">
        {targets.map((target, index) => {
          const stats = getTargetStats(target, index);
          return (
            <Badge
              key={target}
              variant="secondary"
              className="text-xs cursor-pointer hover:bg-destructive/20 transition-colors gap-1"
              onClick={() => removeTarget(target)}
            >
              <span className="font-semibold">T{index + 1}:</span>
              <span>₹{target.toLocaleString()}</span>
              {stats && (
                <>
                  <span className="text-profit/80">+{stats.percent}%</span>
                  {stats.rMultiple && (
                    <span className="text-muted-foreground">{stats.rMultiple}R</span>
                  )}
                </>
              )}
              <X className="w-3 h-3 ml-0.5" />
            </Badge>
          );
        })}
        <Input
          type="number"
          step="0.01"
          placeholder={targets.length === 0 ? "Type target & press Enter" : "Add more..."}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTarget()}
          className="flex-1 min-w-[100px] h-7 border-0 shadow-none focus-visible:ring-0 text-xs"
          disabled={targets.length >= 5}
        />
      </div>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {overallRR && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Risk: ₹{overallRR.risk}</span>
          <span>Reward: ₹{overallRR.reward}</span>
          {quantity > 1 && (
            <span className="text-loss">Risk ₹: {(Number(overallRR.risk) * quantity).toLocaleString()}</span>
          )}
        </div>
      )}
    </div>
  );
}
