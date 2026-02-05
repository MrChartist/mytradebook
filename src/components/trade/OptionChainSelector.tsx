 import { useState, useEffect } from "react";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { Loader2, Search, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { cn } from "@/lib/utils";
 
 interface OptionContract {
   symbol: string;
   strike: number;
   optionType: "CE" | "PE";
   expiry: string;
   ltp: number;
   change: number;
   instrumentToken?: string;
 }
 
 interface OptionChainSelectorProps {
   onSelect: (contract: {
     symbol: string;
     ltp: number;
     instrumentToken?: string;
     contractKey: string;
   }) => void;
   className?: string;
 }
 
 // Common NSE underlying symbols for options
 const POPULAR_UNDERLYINGS = [
   "NIFTY",
   "BANKNIFTY",
   "FINNIFTY",
   "RELIANCE",
   "TCS",
   "INFY",
   "HDFCBANK",
   "ICICIBANK",
   "SBIN",
   "TATASTEEL",
   "BHARTIARTL",
   "HINDUNILVR",
   "ITC",
   "LT",
   "KOTAKBANK",
 ];
 
 // Generate mock expiry dates (weekly + monthly)
 function generateExpiryDates(): string[] {
   const dates: string[] = [];
   const today = new Date();
   
   // Add next 8 Thursdays (weekly expiry for indices)
   for (let i = 0; i < 8; i++) {
     const date = new Date(today);
     date.setDate(date.getDate() + ((4 - date.getDay() + 7) % 7) + (i * 7));
     if (i === 0 && date <= today) {
       date.setDate(date.getDate() + 7);
     }
     dates.push(formatExpiry(date));
   }
   
   return dates;
 }
 
 function formatExpiry(date: Date): string {
   const day = date.getDate().toString().padStart(2, "0");
   const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   const month = months[date.getMonth()];
   const year = date.getFullYear().toString().slice(-2);
   return `${day}${month}${year}`;
 }
 
 // Generate strikes around ATM
 function generateStrikes(underlying: string, atmPrice: number): number[] {
   const isIndex = ["NIFTY", "BANKNIFTY", "FINNIFTY"].includes(underlying);
   const step = isIndex ? (underlying === "BANKNIFTY" ? 100 : 50) : 10;
   const range = isIndex ? 20 : 10;
   
   const atm = Math.round(atmPrice / step) * step;
   const strikes: number[] = [];
   
   for (let i = -range; i <= range; i++) {
     strikes.push(atm + (i * step));
   }
   
   return strikes;
 }
 
 export function OptionChainSelector({ onSelect, className }: OptionChainSelectorProps) {
   const [underlying, setUnderlying] = useState("");
   const [underlyingSearch, setUnderlyingSearch] = useState("");
   const [expiry, setExpiry] = useState("");
   const [strike, setStrike] = useState<number | null>(null);
   const [optionType, setOptionType] = useState<"CE" | "PE">("CE");
   const [isLoading, setIsLoading] = useState(false);
   const [atmPrice, setAtmPrice] = useState<number>(0);
   const [selectedLtp, setSelectedLtp] = useState<number | null>(null);
 
   const expiries = generateExpiryDates();
   const strikes = atmPrice > 0 ? generateStrikes(underlying, atmPrice) : [];
 
   // Filter underlyings based on search
   const filteredUnderlyings = underlyingSearch
     ? POPULAR_UNDERLYINGS.filter((u) =>
         u.toLowerCase().includes(underlyingSearch.toLowerCase())
       )
     : POPULAR_UNDERLYINGS;
 
   // Fetch ATM price when underlying changes
   useEffect(() => {
     if (!underlying) return;
 
     const fetchPrice = async () => {
       setIsLoading(true);
       try {
         const { data } = await supabase.functions.invoke("get-live-prices", {
           body: { symbols: [underlying] },
         });
 
         if (data?.success && data?.prices?.[underlying]) {
           setAtmPrice(data.prices[underlying].ltp);
         }
       } catch (e) {
         console.error("Failed to fetch price:", e);
         // Use mock price
         const mockPrices: Record<string, number> = {
           NIFTY: 22500,
           BANKNIFTY: 48000,
           FINNIFTY: 21500,
           RELIANCE: 2450,
           TCS: 3850,
           INFY: 1520,
           HDFCBANK: 1680,
           ICICIBANK: 1120,
           SBIN: 780,
         };
         setAtmPrice(mockPrices[underlying] || 1000);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchPrice();
   }, [underlying]);
 
   // Generate option LTP (mock)
   const getOptionLtp = (strike: number, type: "CE" | "PE"): number => {
     if (!atmPrice) return 0;
     const diff = type === "CE" ? atmPrice - strike : strike - atmPrice;
     const intrinsic = Math.max(0, diff);
     const timeValue = Math.random() * 50 + 10;
     return parseFloat((intrinsic + timeValue).toFixed(2));
   };
 
   // Handle final selection
   const handleSelect = () => {
     if (!underlying || !expiry || !strike) return;
 
     const symbol = `${underlying} ${expiry} ${strike}${optionType}`;
     const ltp = selectedLtp || getOptionLtp(strike, optionType);
     const contractKey = `${underlying}_${expiry}_${strike}_${optionType}`;
 
     onSelect({
       symbol,
       ltp,
       contractKey,
     });
   };
 
   // When strike or option type changes, update LTP
   useEffect(() => {
     if (strike) {
       setSelectedLtp(getOptionLtp(strike, optionType));
     }
   }, [strike, optionType, atmPrice]);
 
   return (
     <div className={cn("space-y-4 p-4 rounded-lg border bg-muted/30", className)}>
       <div className="flex items-center justify-between">
         <Label className="text-sm font-medium">Option Chain Selector</Label>
         {atmPrice > 0 && (
           <Badge variant="outline" className="text-xs">
             ATM: ₹{atmPrice.toLocaleString()}
           </Badge>
         )}
       </div>
 
       {/* Step 1: Underlying */}
       <div className="space-y-2">
         <Label className="text-xs text-muted-foreground">1. Select Underlying</Label>
         <div className="relative">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search underlying..."
             value={underlyingSearch}
             onChange={(e) => setUnderlyingSearch(e.target.value)}
             className="pl-8"
           />
         </div>
         <ScrollArea className="h-24">
           <div className="flex flex-wrap gap-1.5">
             {filteredUnderlyings.map((u) => (
               <Badge
                 key={u}
                 variant={underlying === u ? "default" : "outline"}
                 className="cursor-pointer hover:bg-primary/20 transition-colors"
                 onClick={() => {
                   setUnderlying(u);
                   setUnderlyingSearch("");
                   setStrike(null);
                 }}
               >
                 {u}
               </Badge>
             ))}
           </div>
         </ScrollArea>
       </div>
 
       {underlying && (
         <>
           {/* Step 2: Expiry */}
           <div className="space-y-2">
             <Label className="text-xs text-muted-foreground">2. Select Expiry</Label>
             <Select value={expiry} onValueChange={setExpiry}>
               <SelectTrigger>
                 <SelectValue placeholder="Select expiry date" />
               </SelectTrigger>
               <SelectContent>
                 {expiries.map((exp) => (
                   <SelectItem key={exp} value={exp}>
                     {exp}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>
 
           {expiry && (
             <>
               {/* Step 3: Strike */}
               <div className="space-y-2">
                 <Label className="text-xs text-muted-foreground">3. Select Strike</Label>
                 {isLoading ? (
                   <div className="flex items-center justify-center py-4">
                     <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                   </div>
                 ) : (
                   <ScrollArea className="h-32">
                     <div className="flex flex-wrap gap-1.5">
                       {strikes.map((s) => {
                         const isAtm = Math.abs(s - atmPrice) < (underlying.includes("BANK") ? 50 : 25);
                         return (
                           <Badge
                             key={s}
                             variant={strike === s ? "default" : "outline"}
                             className={cn(
                               "cursor-pointer hover:bg-primary/20 transition-colors",
                               isAtm && strike !== s && "border-primary/50"
                             )}
                             onClick={() => setStrike(s)}
                           >
                             {s}
                             {isAtm && <span className="ml-1 text-[10px] opacity-70">ATM</span>}
                           </Badge>
                         );
                       })}
                     </div>
                   </ScrollArea>
                 )}
               </div>
 
               {strike && (
                 <>
                   {/* Step 4: CE/PE */}
                   <div className="space-y-2">
                     <Label className="text-xs text-muted-foreground">4. Option Type</Label>
                     <div className="flex gap-2">
                       <Button
                         type="button"
                         variant={optionType === "CE" ? "default" : "outline"}
                         size="sm"
                         className={cn(
                           "flex-1",
                           optionType === "CE" && "bg-profit hover:bg-profit/90"
                         )}
                         onClick={() => setOptionType("CE")}
                       >
                         <TrendingUp className="w-4 h-4 mr-1" />
                         CALL (CE)
                       </Button>
                       <Button
                         type="button"
                         variant={optionType === "PE" ? "default" : "outline"}
                         size="sm"
                         className={cn(
                           "flex-1",
                           optionType === "PE" && "bg-loss hover:bg-loss/90"
                         )}
                         onClick={() => setOptionType("PE")}
                       >
                         <TrendingDown className="w-4 h-4 mr-1" />
                         PUT (PE)
                       </Button>
                     </div>
                   </div>
 
                   {/* Preview & Confirm */}
                   <div className="pt-2 border-t">
                     <div className="flex items-center justify-between mb-3">
                       <div>
                         <p className="text-sm font-medium">
                           {underlying} {expiry} {strike}{optionType}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           LTP: ₹{selectedLtp?.toFixed(2) || "—"}
                         </p>
                       </div>
                       <Button
                         type="button"
                         size="sm"
                         onClick={handleSelect}
                       >
                         Use This Contract
                       </Button>
                     </div>
                   </div>
                 </>
               )}
             </>
           )}
         </>
       )}
     </div>
   );
 }