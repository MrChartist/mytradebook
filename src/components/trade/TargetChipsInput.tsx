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
   className?: string;
 }
 
 export function TargetChipsInput({
   targets,
   onTargetsChange,
   entryPrice,
   stopLoss,
   tradeType,
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
 
     if (targets.length >= 3) {
       setError("Maximum 3 targets allowed");
       return;
     }
 
     // Validation based on trade type
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
 
   // Calculate Risk:Reward ratio
   const calculateRR = () => {
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
   };
 
   const rr = calculateRR();
 
   return (
     <div className={cn("space-y-2", className)}>
       <div className="flex items-center justify-between">
         <Label className="flex items-center gap-1.5">
           <Target className="w-3.5 h-3.5" />
           Targets
         </Label>
         {rr && (
           <div
             className={cn(
               "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded",
               rr.isPositive
                 ? "bg-profit/10 text-profit"
                 : "bg-loss/10 text-loss"
             )}
           >
             {rr.isPositive ? (
               <TrendingUp className="w-3 h-3" />
             ) : (
               <TrendingDown className="w-3 h-3" />
             )}
             <span>R:R 1:{rr.ratio}</span>
           </div>
         )}
       </div>
 
       <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-background">
         {targets.map((target, index) => (
           <Badge
             key={target}
             variant="secondary"
             className="text-xs cursor-pointer hover:bg-destructive/20 transition-colors"
             onClick={() => removeTarget(target)}
           >
             T{index + 1}: ₹{target.toLocaleString()}
             <X className="w-3 h-3 ml-1" />
           </Badge>
         ))}
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
           disabled={targets.length >= 3}
         />
       </div>
 
       {error && (
         <p className="text-xs text-destructive">{error}</p>
       )}
 
       {rr && (
         <div className="flex items-center gap-4 text-xs text-muted-foreground">
           <span>Risk: ₹{rr.risk}</span>
           <span>Reward: ₹{rr.reward}</span>
         </div>
       )}
     </div>
   );
 }