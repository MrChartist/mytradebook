 import React, { useState, useEffect, useMemo, useCallback } from "react";
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
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { 
   Loader2, 
   Search, 
   TrendingUp, 
   TrendingDown, 
   Star,
   Clock,
   Check
 } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { cn } from "@/lib/utils";
 
 interface UnifiedInstrumentSearchProps {
   segment?: string;
   onSelect: (contract: {
     symbol: string;
     ltp: number;
     instrumentToken?: string;
     contractKey: string;
     exchange?: string;
   }) => void;
   className?: string;
 }
 
 // Instrument master data
 const NSE_EQUITY = [
   "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL",
   "HINDUNILVR", "ITC", "LT", "KOTAKBANK", "AXISBANK", "MARUTI", "TITAN",
   "WIPRO", "ADANIENT", "TATAMOTORS", "SUNPHARMA", "BAJFINANCE", "HCLTECH",
   "NESTLEIND", "ULTRACEMCO", "POWERGRID", "NTPC", "ONGC", "COALINDIA",
   "TATASTEEL", "JSWSTEEL", "HINDALCO", "GRASIM", "DRREDDY", "DIVISLAB",
   "CIPLA", "APOLLOHOSP", "TECHM", "BPCL", "INDUSINDBK", "EICHERMOT",
   "ASIANPAINT", "BRITANNIA", "HEROMOTOCO", "M&M", "BAJAJ-AUTO", "TATACONSUM"
 ];
 
 const NFO_UNDERLYINGS = [
   "NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY",
   "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN", "BHARTIARTL",
   "HINDUNILVR", "ITC", "LT", "KOTAKBANK", "AXISBANK", "MARUTI", "TITAN",
   "WIPRO", "ADANIENT", "TATAMOTORS", "SUNPHARMA", "BAJFINANCE", "HCLTECH",
   "TATASTEEL", "JSWSTEEL", "HINDALCO", "M&M", "BAJAJ-AUTO"
 ];
 
 const MCX_COMMODITIES = [
   { symbol: "GOLD", name: "Gold", lotSize: 100 },
   { symbol: "GOLDM", name: "Gold Mini", lotSize: 10 },
   { symbol: "GOLDPETAL", name: "Gold Petal", lotSize: 1 },
   { symbol: "SILVER", name: "Silver", lotSize: 30 },
   { symbol: "SILVERM", name: "Silver Mini", lotSize: 5 },
   { symbol: "SILVERMIC", name: "Silver Micro", lotSize: 1 },
   { symbol: "CRUDEOIL", name: "Crude Oil", lotSize: 100 },
   { symbol: "CRUDEOILM", name: "Crude Oil Mini", lotSize: 10 },
   { symbol: "NATURALGAS", name: "Natural Gas", lotSize: 1250 },
   { symbol: "COPPER", name: "Copper", lotSize: 2500 },
   { symbol: "ZINC", name: "Zinc", lotSize: 5000 },
   { symbol: "ALUMINIUM", name: "Aluminium", lotSize: 5000 },
   { symbol: "LEAD", name: "Lead", lotSize: 5000 },
   { symbol: "NICKEL", name: "Nickel", lotSize: 1500 },
   { symbol: "MENTHAOIL", name: "Mentha Oil", lotSize: 360 },
   { symbol: "COTTONCNDY", name: "Cotton", lotSize: 25 },
 ];
 
 // Recent instruments from localStorage
 function getRecentInstruments(): string[] {
   try {
     const stored = localStorage.getItem("recentInstruments");
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function addRecentInstrument(symbol: string) {
   try {
     const recent = getRecentInstruments().filter(s => s !== symbol);
     recent.unshift(symbol);
     localStorage.setItem("recentInstruments", JSON.stringify(recent.slice(0, 10)));
   } catch {}
 }
 
 // Favorites from localStorage
 function getFavorites(): string[] {
   try {
     const stored = localStorage.getItem("favoriteInstruments");
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function toggleFavorite(symbol: string): string[] {
   try {
     let favorites = getFavorites();
     if (favorites.includes(symbol)) {
       favorites = favorites.filter(s => s !== symbol);
     } else {
       favorites.unshift(symbol);
     }
     localStorage.setItem("favoriteInstruments", JSON.stringify(favorites.slice(0, 20)));
     return favorites;
   } catch {
     return [];
   }
 }
 
 function formatExpiry(date: Date): string {
   const day = date.getDate().toString().padStart(2, "0");
   const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
   const month = months[date.getMonth()];
   const year = date.getFullYear().toString().slice(-2);
   return `${day}${month}${year}`;
 }
 
 function generateExpiryDates(): string[] {
   const today = new Date();
   today.setHours(0, 0, 0, 0);
   
   const dayOfWeek = today.getDay();
   const daysUntilThursday = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;
   const firstThursday = new Date(today);
   firstThursday.setDate(today.getDate() + (daysUntilThursday === 0 ? 7 : daysUntilThursday));
   
   const dates: string[] = [];
   for (let i = 0; i < 8; i++) {
     const date = new Date(firstThursday);
     date.setDate(firstThursday.getDate() + (i * 7));
     dates.push(formatExpiry(date));
   }
   
   return dates;
 }
 
 function generateFuturesExpiries(): { value: string; label: string }[] {
   const expiries: { value: string; label: string }[] = [];
   const today = new Date();
   
   for (let i = 0; i < 3; i++) {
     const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
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
 
 function generateStrikes(underlying: string, atmPrice: number): number[] {
   const isIndex = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"].includes(underlying);
   const step = isIndex ? (underlying === "BANKNIFTY" ? 100 : 50) : 10;
   const range = isIndex ? 20 : 10;
   
   const atm = Math.round(atmPrice / step) * step;
   const strikes: number[] = [];
   
   for (let i = -range; i <= range; i++) {
     strikes.push(atm + (i * step));
   }
   
   return strikes;
 }
 
 export function UnifiedInstrumentSearch({ segment, onSelect, className }: UnifiedInstrumentSearchProps) {
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedSymbol, setSelectedSymbol] = useState("");
   const [exchange, setExchange] = useState<"NSE" | "NFO" | "MCX">("NSE");
   const [instrumentType, setInstrumentType] = useState<"equity" | "futures" | "options">("equity");
   
   // Options/Futures specific
   const [expiry, setExpiry] = useState("");
   const [strike, setStrike] = useState<number | null>(null);
   const [optionType, setOptionType] = useState<"CE" | "PE">("CE");
   
   const [isLoading, setIsLoading] = useState(false);
   const [spotPrice, setSpotPrice] = useState<number>(0);
   const [ltp, setLtp] = useState<number | null>(null);
   
   const [recentInstruments, setRecentInstruments] = useState<string[]>([]);
   const [favorites, setFavorites] = useState<string[]>([]);
   const [isConfirmed, setIsConfirmed] = useState(false);
   
   // Load recent/favorites on mount
   useEffect(() => {
     setRecentInstruments(getRecentInstruments());
     setFavorites(getFavorites());
   }, []);
   
   // Auto-select exchange based on segment
   useEffect(() => {
     if (segment === "Options") {
       setExchange("NFO");
       setInstrumentType("options");
     } else if (segment === "Futures") {
       setExchange("NFO");
       setInstrumentType("futures");
     } else if (segment === "Commodities") {
       setExchange("MCX");
       setInstrumentType("futures");
     } else {
       setExchange("NSE");
       setInstrumentType("equity");
     }
   }, [segment]);
   
   // Get instruments based on exchange
   const instruments = useMemo(() => {
     if (exchange === "MCX") {
       return MCX_COMMODITIES.map(c => c.symbol);
     } else if (exchange === "NFO") {
       return NFO_UNDERLYINGS;
     }
     return NSE_EQUITY;
   }, [exchange]);
   
   // Filter instruments based on search
   const filteredInstruments = useMemo(() => {
     if (!searchQuery) return instruments.slice(0, 20);
     return instruments.filter(s => 
       s.toLowerCase().includes(searchQuery.toLowerCase())
     ).slice(0, 20);
   }, [instruments, searchQuery]);
   
   const optionExpiries = useMemo(() => generateExpiryDates(), []);
   const futuresExpiries = useMemo(() => generateFuturesExpiries(), []);
   const strikes = spotPrice > 0 ? generateStrikes(selectedSymbol, spotPrice) : [];
   
   // Fetch price when symbol changes
   useEffect(() => {
     if (!selectedSymbol) return;
     
     const fetchPrice = async () => {
       setIsLoading(true);
       try {
         const { data } = await supabase.functions.invoke("get-live-prices", {
           body: { symbols: [selectedSymbol] },
         });
         
         if (data?.success && data?.prices?.[selectedSymbol]) {
           setSpotPrice(data.prices[selectedSymbol].ltp);
         }
       } catch (e) {
         console.error("Failed to fetch price:", e);
         // Use mock prices
         const mockPrices: Record<string, number> = {
           NIFTY: 22500, BANKNIFTY: 48000, FINNIFTY: 21500,
           RELIANCE: 2450, TCS: 3850, INFY: 1520, HDFCBANK: 1680,
           ICICIBANK: 1120, SBIN: 780, GOLD: 72000, SILVER: 85000,
           CRUDEOIL: 5800, NATURALGAS: 220, COPPER: 780,
         };
         setSpotPrice(mockPrices[selectedSymbol] || 1000);
       } finally {
         setIsLoading(false);
       }
     };
     
     fetchPrice();
   }, [selectedSymbol]);
   
   // Calculate LTP for derivatives
   const calculateLtp = useCallback(() => {
     if (instrumentType === "equity") {
       return spotPrice;
     } else if (instrumentType === "futures") {
       // Futures premium
       return spotPrice > 0 ? parseFloat((spotPrice * 1.002).toFixed(2)) : 0;
     } else if (instrumentType === "options" && strike) {
       // Options pricing (simplified)
       const diff = optionType === "CE" ? spotPrice - strike : strike - spotPrice;
       const intrinsic = Math.max(0, diff);
       const timeValue = 30 + (strike % 100) / 10;
       return parseFloat((intrinsic + timeValue).toFixed(2));
     }
     return 0;
   }, [spotPrice, instrumentType, strike, optionType]);
   
   useEffect(() => {
     setLtp(calculateLtp());
   }, [calculateLtp]);
   
   // Handle symbol selection
   const handleSymbolSelect = (symbol: string) => {
     setSelectedSymbol(symbol);
     setExpiry("");
     setStrike(null);
     setIsConfirmed(false);
     addRecentInstrument(symbol);
     setRecentInstruments(getRecentInstruments());
   };
   
   // Handle favorite toggle
   const handleToggleFavorite = (symbol: string, e: React.MouseEvent) => {
     e.stopPropagation();
     const newFavorites = toggleFavorite(symbol);
     setFavorites(newFavorites);
   };
   
   // Final confirmation
   const handleConfirm = () => {
     let finalSymbol = selectedSymbol;
     let contractKey = selectedSymbol;
     
     if (instrumentType === "futures" && expiry) {
       finalSymbol = `${selectedSymbol}FUT ${expiry}`;
       contractKey = `${selectedSymbol}_FUT_${expiry}`;
     } else if (instrumentType === "options" && expiry && strike) {
       finalSymbol = `${selectedSymbol} ${expiry} ${strike}${optionType}`;
       contractKey = `${selectedSymbol}_${expiry}_${strike}_${optionType}`;
     }
     
     onSelect({
       symbol: finalSymbol,
       ltp: ltp || spotPrice,
       contractKey,
       exchange,
     });
     
     setIsConfirmed(true);
   };
   
   // Check if ready to confirm
   const canConfirm = useMemo(() => {
     if (!selectedSymbol) return false;
     if (instrumentType === "equity") return true;
     if (instrumentType === "futures") return !!expiry;
     if (instrumentType === "options") return !!(expiry && strike);
     return false;
   }, [selectedSymbol, instrumentType, expiry, strike]);
   
   return (
     <div className={cn("space-y-3 p-4 rounded-lg border bg-muted/30", className)}>
       <div className="flex items-center justify-between">
         <Label className="text-sm font-medium">Select Instrument *</Label>
         {spotPrice > 0 && selectedSymbol && (
           <Badge variant="outline" className="text-xs">
             {instrumentType === "equity" ? "LTP" : "Spot"}: ₹{spotPrice.toLocaleString()}
           </Badge>
         )}
       </div>
       
       {/* Exchange & Type Selector */}
       <div className="flex gap-2">
         <Select value={exchange} onValueChange={(v) => {
           setExchange(v as any);
           setSelectedSymbol("");
           setSearchQuery("");
         }}>
           <SelectTrigger className="w-24">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="NSE">NSE</SelectItem>
             <SelectItem value="NFO">NFO</SelectItem>
             <SelectItem value="MCX">MCX</SelectItem>
           </SelectContent>
         </Select>
         
         <Select value={instrumentType} onValueChange={(v) => {
           setInstrumentType(v as any);
           setSelectedSymbol("");
           setExpiry("");
           setStrike(null);
         }}>
           <SelectTrigger className="w-28">
             <SelectValue />
           </SelectTrigger>
           <SelectContent>
             <SelectItem value="equity">Equity</SelectItem>
             <SelectItem value="futures">Futures</SelectItem>
             <SelectItem value="options">Options</SelectItem>
           </SelectContent>
         </Select>
         
         <div className="relative flex-1">
           <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input
             placeholder="Search..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="pl-8"
           />
         </div>
       </div>
       
       {/* Quick Access Tabs */}
       {!selectedSymbol && (
         <Tabs defaultValue="all" className="w-full">
           <TabsList className="grid w-full grid-cols-3 h-8">
             <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
             <TabsTrigger value="recent" className="text-xs">
               <Clock className="w-3 h-3 mr-1" /> Recent
             </TabsTrigger>
             <TabsTrigger value="favorites" className="text-xs">
               <Star className="w-3 h-3 mr-1" /> Favorites
             </TabsTrigger>
           </TabsList>
           
           <TabsContent value="all" className="mt-2">
             <ScrollArea className="h-28">
               <div className="flex flex-wrap gap-1.5">
                 {filteredInstruments.map((sym) => (
                   <Badge
                     key={sym}
                     variant="outline"
                     className="cursor-pointer hover:bg-primary/20 transition-colors group"
                     onClick={() => handleSymbolSelect(sym)}
                   >
                     {sym}
                     <Star
                       className={cn(
                                 "w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground",
                                 favorites.includes(sym) && "fill-primary text-primary opacity-100"
                       )}
                       onClick={(e) => handleToggleFavorite(sym, e)}
                     />
                   </Badge>
                 ))}
               </div>
             </ScrollArea>
           </TabsContent>
           
           <TabsContent value="recent" className="mt-2">
             <ScrollArea className="h-28">
               <div className="flex flex-wrap gap-1.5">
                 {recentInstruments.length === 0 ? (
                   <p className="text-xs text-muted-foreground">No recent instruments</p>
                 ) : (
                   recentInstruments.map((sym) => (
                     <Badge
                       key={sym}
                       variant="outline"
                       className="cursor-pointer hover:bg-primary/20 transition-colors"
                       onClick={() => handleSymbolSelect(sym)}
                     >
                       <Clock className="w-3 h-3 mr-1" />
                       {sym}
                     </Badge>
                   ))
                 )}
               </div>
             </ScrollArea>
           </TabsContent>
           
           <TabsContent value="favorites" className="mt-2">
             <ScrollArea className="h-28">
               <div className="flex flex-wrap gap-1.5">
                 {favorites.length === 0 ? (
                   <p className="text-xs text-muted-foreground">No favorites yet. Click ⭐ to add.</p>
                 ) : (
                   favorites.map((sym) => (
                     <Badge
                       key={sym}
                       variant="outline"
                       className="cursor-pointer hover:bg-primary/20 transition-colors"
                       onClick={() => handleSymbolSelect(sym)}
                     >
                              <Star className="w-3 h-3 mr-1 fill-primary text-primary" />
                       {sym}
                     </Badge>
                   ))
                 )}
               </div>
             </ScrollArea>
           </TabsContent>
         </Tabs>
       )}
       
       {/* Selected Symbol Display */}
       {selectedSymbol && (
         <div className="space-y-3">
           <div className="flex items-center justify-between p-2 rounded bg-primary/10">
             <div className="flex items-center gap-2">
               <Badge>{selectedSymbol}</Badge>
               <span className="text-xs text-muted-foreground">{exchange}</span>
             </div>
             <Button
               type="button"
               variant="ghost"
               size="sm"
               onClick={() => {
                 setSelectedSymbol("");
                 setExpiry("");
                 setStrike(null);
                 setIsConfirmed(false);
               }}
             >
               Change
             </Button>
           </div>
           
           {/* Futures Expiry Selection */}
           {instrumentType === "futures" && (
             <div className="space-y-2">
               <Label className="text-xs text-muted-foreground">Select Expiry</Label>
               {isLoading ? (
                 <div className="flex items-center justify-center py-4">
                   <Loader2 className="w-5 h-5 animate-spin" />
                 </div>
               ) : (
                 <Select value={expiry} onValueChange={setExpiry}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select expiry" />
                   </SelectTrigger>
                   <SelectContent>
                     {futuresExpiries.map((exp) => (
                       <SelectItem key={exp.value} value={exp.value}>
                         {exp.label}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               )}
             </div>
           )}
           
           {/* Options Flow */}
           {instrumentType === "options" && (
             <>
               <div className="space-y-2">
                 <Label className="text-xs text-muted-foreground">Select Expiry</Label>
                 <Select value={expiry} onValueChange={(v) => {
                   setExpiry(v);
                   setStrike(null);
                 }}>
                   <SelectTrigger>
                     <SelectValue placeholder="Select expiry" />
                   </SelectTrigger>
                   <SelectContent>
                     {optionExpiries.map((exp, idx) => (
                       <SelectItem key={`${exp}-${idx}`} value={exp}>
                         {exp}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               
               {expiry && (
                 <>
                   <div className="space-y-2">
                     <Label className="text-xs text-muted-foreground">Select Strike</Label>
                     <ScrollArea className="h-24">
                       <div className="flex flex-wrap gap-1.5">
                         {strikes.map((s) => {
                           const isAtm = Math.abs(s - spotPrice) < (selectedSymbol.includes("BANK") ? 50 : 25);
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
                   </div>
                   
                   {strike && (
                     <div className="space-y-2">
                       <Label className="text-xs text-muted-foreground">Option Type</Label>
                       <div className="flex gap-2">
                         <Button
                           type="button"
                           variant={optionType === "CE" ? "default" : "outline"}
                           size="sm"
                           className={cn("flex-1", optionType === "CE" && "bg-profit hover:bg-profit/90")}
                           onClick={() => setOptionType("CE")}
                         >
                           <TrendingUp className="w-4 h-4 mr-1" />
                           CALL (CE)
                         </Button>
                         <Button
                           type="button"
                           variant={optionType === "PE" ? "default" : "outline"}
                           size="sm"
                           className={cn("flex-1", optionType === "PE" && "bg-loss hover:bg-loss/90")}
                           onClick={() => setOptionType("PE")}
                         >
                           <TrendingDown className="w-4 h-4 mr-1" />
                           PUT (PE)
                         </Button>
                       </div>
                     </div>
                   )}
                 </>
               )}
             </>
           )}
           
           {/* Confirm Button */}
           {canConfirm && (
             <div className="pt-2 border-t">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium">
                     {instrumentType === "futures" && `${selectedSymbol}FUT ${expiry}`}
                     {instrumentType === "options" && `${selectedSymbol} ${expiry} ${strike}${optionType}`}
                     {instrumentType === "equity" && selectedSymbol}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     {instrumentType === "equity" ? "LTP" : "Est. Price"}: ₹{ltp?.toFixed(2) || "—"}
                   </p>
                 </div>
                 <Button
                   type="button"
                   size="sm"
                   onClick={handleConfirm}
                   className={cn(isConfirmed && "bg-profit")}
                 >
                   {isConfirmed ? (
                     <>
                       <Check className="w-4 h-4 mr-1" /> Selected
                     </>
                   ) : (
                     "Use This"
                   )}
                 </Button>
               </div>
             </div>
           )}
         </div>
       )}
     </div>
   );
 }