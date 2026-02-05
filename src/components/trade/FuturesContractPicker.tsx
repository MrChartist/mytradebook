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
 import { Loader2, Search } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { cn } from "@/lib/utils";
 
 interface FuturesContractPickerProps {
   onSelect: (contract: {
     symbol: string;
     ltp: number;
     instrumentToken?: string;
     contractKey: string;
   }) => void;
   className?: string;
 }
 
 // Common NSE futures underlyings
 const POPULAR_FUTURES = [
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
   "AXISBANK",
   "MARUTI",
   "TITAN",
   "WIPRO",
   "ADANIENT",
 ];
 
 // Generate futures expiry dates
 function generateFuturesExpiries(): { value: string; label: string }[] {
   const expiries: { value: string; label: string }[] = [];
   const today = new Date();
   
   // Current month, next month, far month
   for (let i = 0; i < 3; i++) {
     const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
     // Last Thursday of the month
     const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
     const lastThursday = new Date(lastDay);
     lastThursday.setDate(lastDay.getDate() - ((lastDay.getDay() + 3) % 7));
     
     if (lastThursday <= today && i === 0) continue;
     
     const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
     const monthStr = months[lastThursday.getMonth()];
     const year = lastThursday.getFullYear().toString().slice(-2);
     
     const labels = ["Near Month", "Next Month", "Far Month"];
     expiries.push({
       value: `${monthStr}${year}`,
       label: `${monthStr} ${year} (${labels[i]})`,
     });
   }
   
   return expiries;
 }
 
 export function FuturesContractPicker({ onSelect, className }: FuturesContractPickerProps) {
   const [underlying, setUnderlying] = useState("");
   const [underlyingSearch, setUnderlyingSearch] = useState("");
   const [expiry, setExpiry] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [spotPrice, setSpotPrice] = useState<number>(0);
   const [futuresLtp, setFuturesLtp] = useState<number | null>(null);
 
   const expiries = generateFuturesExpiries();
 
   // Filter underlyings based on search
   const filteredUnderlyings = underlyingSearch
     ? POPULAR_FUTURES.filter((u) =>
         u.toLowerCase().includes(underlyingSearch.toLowerCase())
       )
     : POPULAR_FUTURES;
 
   // Fetch spot price when underlying changes
   useEffect(() => {
     if (!underlying) return;
 
     const fetchPrice = async () => {
       setIsLoading(true);
       try {
         const { data } = await supabase.functions.invoke("get-live-prices", {
           body: { symbols: [underlying] },
         });
 
         if (data?.success && data?.prices?.[underlying]) {
           setSpotPrice(data.prices[underlying].ltp);
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
         setSpotPrice(mockPrices[underlying] || 1000);
       } finally {
         setIsLoading(false);
       }
     };
 
     fetchPrice();
   }, [underlying]);
 
   // Calculate futures price (spot + premium)
   useEffect(() => {
     if (spotPrice > 0 && expiry) {
       // Add typical futures premium (0.1-0.3%)
       const premium = spotPrice * (0.001 + Math.random() * 0.002);
       setFuturesLtp(parseFloat((spotPrice + premium).toFixed(2)));
     }
   }, [spotPrice, expiry]);
 
   // Handle final selection
   const handleSelect = () => {
     if (!underlying || !expiry) return;
 
     const symbol = `${underlying}FUT ${expiry}`;
     const contractKey = `${underlying}_FUT_${expiry}`;
 
     onSelect({
       symbol,
       ltp: futuresLtp || spotPrice,
       contractKey,
     });
   };
 
   return (
     <div className={cn("space-y-4 p-4 rounded-lg border bg-muted/30", className)}>
       <div className="flex items-center justify-between">
         <Label className="text-sm font-medium">Futures Contract Picker</Label>
         {spotPrice > 0 && (
           <Badge variant="outline" className="text-xs">
             Spot: ₹{spotPrice.toLocaleString()}
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
             {isLoading ? (
               <div className="flex items-center justify-center py-4">
                 <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
               </div>
             ) : (
               <Select value={expiry} onValueChange={setExpiry}>
                 <SelectTrigger>
                   <SelectValue placeholder="Select expiry" />
                 </SelectTrigger>
                 <SelectContent>
                   {expiries.map((exp) => (
                     <SelectItem key={exp.value} value={exp.value}>
                       {exp.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             )}
           </div>
 
           {expiry && (
             <div className="pt-2 border-t">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium">
                     {underlying}FUT {expiry}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Futures LTP: ₹{futuresLtp?.toFixed(2) || "—"}
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
           )}
         </>
       )}
     </div>
   );
 }