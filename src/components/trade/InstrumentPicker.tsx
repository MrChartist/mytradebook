 import { useState, useCallback, useEffect, useRef, useMemo } from "react";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Button } from "@/components/ui/button";
// Native <select> used instead of Radix Select to avoid infinite re-render loop inside Dialog
 import { NativeToggle } from "@/components/ui/native-toggle";
 import { Loader2, Search, Star, Clock, Zap, Keyboard } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { cn } from "@/lib/utils";
 
 export interface SelectedInstrument {
   symbol: string;
   security_id: string | null;
   exchange_segment: string;
   exchange: string;
   instrument_type: string;
   ltp?: number;
   lot_size?: number;
 }
 
 interface InstrumentPickerProps {
   segment?: string;
   onSelect: (instrument: SelectedInstrument) => void;
   showLtpFetch?: boolean;
   className?: string;
 }
 
 const STORAGE_KEY_RECENT = "instrument_picker_recent";
 const STORAGE_KEY_FAVORITES = "instrument_picker_favorites";
 
 function getStoredItems(key: string): SelectedInstrument[] {
   try {
     const stored = localStorage.getItem(key);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function setStoredItems(key: string, items: SelectedInstrument[]) {
   try {
     localStorage.setItem(key, JSON.stringify(items.slice(0, 15)));
   } catch {}
 }
 
 export function InstrumentPicker({ 
   segment, 
   onSelect, 
   showLtpFetch = true,
   className 
 }: InstrumentPickerProps) {
   // Mode: search or manual
   const [mode, setMode] = useState<"search" | "manual">("search");
   
   // Search mode state
   const [query, setQuery] = useState("");
   const [debouncedQuery, setDebouncedQuery] = useState("");
   const [results, setResults] = useState<SelectedInstrument[]>([]);
   const [isSearching, setIsSearching] = useState(false);
   const [activeTab, setActiveTab] = useState<"search" | "recent" | "favorites">("search");
   const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "NSE" | "NFO" | "MCX">("ALL");
   
   // Manual mode state
   const [manualExchange, setManualExchange] = useState<"NSE" | "NFO" | "MCX">("NSE");
   const [manualType, setManualType] = useState<"EQ" | "FUT" | "OPT">("EQ");
   const [manualSymbol, setManualSymbol] = useState("");
   
   // LTP fetch state
   const [isFetchingLtp, setIsFetchingLtp] = useState(false);
  const [ltpResult, setLtpResult] = useState<{ 
    price: number | null; 
    error: string | null;
    source?: string;
    timestamp?: string;
    change?: number;
    changePercent?: number;
  }>({ price: null, error: null });
   
   // Selection state
   const [selected, setSelected] = useState<SelectedInstrument | null>(null);
   
   // Stored items
   const [recentItems, setRecentItems] = useState<SelectedInstrument[]>(() => getStoredItems(STORAGE_KEY_RECENT));
   const [favoriteItems, setFavoriteItems] = useState<SelectedInstrument[]>(() => getStoredItems(STORAGE_KEY_FAVORITES));
   
   const debounceRef = useRef<NodeJS.Timeout | null>(null);
   
   // Auto-set exchange based on segment
   useEffect(() => {
     if (segment === "Options" || segment === "Futures") {
       setExchangeFilter("NFO");
       setManualExchange("NFO");
       setManualType(segment === "Options" ? "OPT" : "FUT");
     } else if (segment === "Commodities") {
       setExchangeFilter("MCX");
       setManualExchange("MCX");
       setManualType("FUT");
     } else {
       setExchangeFilter("NSE");
       setManualExchange("NSE");
       setManualType("EQ");
     }
   }, [segment]);
   
   // Debounced search
   useEffect(() => {
     if (debounceRef.current) clearTimeout(debounceRef.current);
     debounceRef.current = setTimeout(() => {
       setDebouncedQuery(query);
     }, 200);
     return () => {
       if (debounceRef.current) clearTimeout(debounceRef.current);
     };
   }, [query]);
   
   // Search from DB
   useEffect(() => {
     if (activeTab !== "search") return;
     
     const searchDB = async () => {
       setIsSearching(true);
       try {
         let dbQuery = supabase
           .from("instrument_master")
           .select("security_id, exchange_segment, exchange, instrument_type, trading_symbol, display_name, lot_size")
           .limit(30);
         
         if (exchangeFilter !== "ALL") {
           dbQuery = dbQuery.eq("exchange", exchangeFilter);
         }
         
         if (debouncedQuery.trim()) {
           const term = debouncedQuery.trim().toUpperCase();
           dbQuery = dbQuery.or(`trading_symbol.ilike.%${term}%,display_name.ilike.%${term}%`);
         }
         
         dbQuery = dbQuery.order("trading_symbol", { ascending: true });
         
         const { data, error } = await dbQuery;
         
         if (error) throw error;
         
         const mapped: SelectedInstrument[] = (data || []).map((d) => ({
           symbol: d.trading_symbol,
           security_id: d.security_id,
           exchange_segment: d.exchange_segment,
           exchange: d.exchange,
           instrument_type: d.instrument_type,
           lot_size: d.lot_size || undefined,
         }));
         
         setResults(mapped);
       } catch (err) {
         console.error("Search error:", err);
         setResults([]);
       } finally {
         setIsSearching(false);
       }
     };
     
     searchDB();
   }, [debouncedQuery, exchangeFilter, activeTab]);
   
   // Add to recent
   const addToRecent = useCallback((instrument: SelectedInstrument) => {
     setRecentItems((prev) => {
       const filtered = prev.filter((i) => i.symbol !== instrument.symbol);
       const updated = [instrument, ...filtered].slice(0, 10);
       setStoredItems(STORAGE_KEY_RECENT, updated);
       return updated;
     });
   }, []);
   
   // Toggle favorite
   const toggleFavorite = useCallback((instrument: SelectedInstrument, e: React.MouseEvent) => {
     e.stopPropagation();
     setFavoriteItems((prev) => {
       const exists = prev.some((i) => i.symbol === instrument.symbol);
       let updated: SelectedInstrument[];
       if (exists) {
         updated = prev.filter((i) => i.symbol !== instrument.symbol);
       } else {
         updated = [instrument, ...prev].slice(0, 15);
       }
       setStoredItems(STORAGE_KEY_FAVORITES, updated);
       return updated;
     });
   }, []);
   
   const isFavorite = useCallback((symbol: string) => {
     return favoriteItems.some((i) => i.symbol === symbol);
   }, [favoriteItems]);
   
   // Handle selection from list
   const handleSelect = (instrument: SelectedInstrument) => {
     setSelected(instrument);
     addToRecent(instrument);
     onSelect(instrument);
     setQuery("");
   };
   
    // Fetch LTP for manual or selected instrument
    const fetchLtp = async (instrument: SelectedInstrument) => {
      setIsFetchingLtp(true);
      setLtpResult({ price: null, error: null });
      
      try {
        const { data, error } = await supabase.functions.invoke("get-live-prices", {
          body: {
            instruments: [{
              symbol: instrument.symbol,
              security_id: instrument.security_id,
              exchange_segment: instrument.exchange_segment,
            }],
          },
        });
        
        if (error) throw error;

        // Handle token expired gracefully
        if (data?.error === "token_expired") {
          setLtpResult({ price: null, error: "Dhan token expired — update in Settings → Integrations." });
          return;
        }
        
        if (data?.success && data?.prices?.[instrument.symbol]) {
          const priceData = data.prices[instrument.symbol];
          const ltp = priceData.ltp;
          if (ltp && ltp > 0) {
            setLtpResult({ 
              price: ltp, 
              error: null,
              source: priceData.source || data.source || "dhan",
              timestamp: priceData.timestamp || data.timestamp,
              change: priceData.change,
              changePercent: priceData.changePercent,
            });
            const updated = { ...instrument, ltp };
            setSelected(updated);
            onSelect(updated);
          } else {
            setLtpResult({ price: null, error: "Price unavailable. Enter manually." });
          }
        } else if (data?.error) {
          setLtpResult({ price: null, error: `${data.error}. Enter price manually.` });
        } else {
          setLtpResult({ price: null, error: "Price unavailable. Enter manually." });
        }
      } catch (err) {
        console.error("LTP fetch error:", err);
        setLtpResult({ price: null, error: "Failed to fetch price. Enter manually." });
      } finally {
        setIsFetchingLtp(false);
      }
    };
   
   // Handle manual entry confirmation
   const handleManualConfirm = () => {
     if (!manualSymbol.trim()) return;
     
     const exchangeSegmentMap: Record<string, Record<string, string>> = {
       NSE: { EQ: "NSE_EQ", FUT: "NSE_FNO", OPT: "NSE_FNO" },
       NFO: { EQ: "NSE_FNO", FUT: "NSE_FNO", OPT: "NSE_FNO" },
       MCX: { EQ: "MCX_COMM", FUT: "MCX_COMM", OPT: "MCX_COMM" },
     };
     
     const instrument: SelectedInstrument = {
       symbol: manualSymbol.trim().toUpperCase(),
       security_id: null, // Manual entry has no security_id
       exchange_segment: exchangeSegmentMap[manualExchange]?.[manualType] || "NSE_EQ",
       exchange: manualExchange,
       instrument_type: manualType,
     };
     
     setSelected(instrument);
     addToRecent(instrument);
     onSelect(instrument);
   };
   
   // Clear selection
   const clearSelection = () => {
     setSelected(null);
     setLtpResult({ price: null, error: null });
     setQuery("");
     setManualSymbol("");
   };
   
   // Get display list
   const displayList = useMemo(() => {
     if (activeTab === "recent") return recentItems;
     if (activeTab === "favorites") return favoriteItems;
     return results;
   }, [activeTab, results, recentItems, favoriteItems]);
   
   // Render instrument list item
   const renderItem = (item: SelectedInstrument) => (
     <div
       key={`${item.symbol}-${item.exchange_segment}`}
       onClick={() => handleSelect(item)}
       className={cn(
         "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
         selected?.symbol === item.symbol ? "bg-primary/20 border border-primary/50" : "hover:bg-accent"
       )}
     >
       <div className="flex-1 min-w-0">
         <span className="font-medium text-sm">{item.symbol}</span>
         <span className="ml-2 text-xs text-muted-foreground">
           {item.exchange} • {item.instrument_type}
         </span>
       </div>
       <button
         onClick={(e) => toggleFavorite(item, e)}
         className="p-1 hover:bg-background rounded ml-2 flex-shrink-0"
       >
         <Star
           className={cn(
             "w-3.5 h-3.5",
             isFavorite(item.symbol) ? "fill-warning text-warning" : "text-muted-foreground"
           )}
         />
       </button>
     </div>
   );
   
   if (selected) {
     return (
       <div className={cn("space-y-2", className)}>
         <Label>Instrument</Label>
         <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
           <div className="flex-1">
             <span className="font-semibold">{selected.symbol}</span>
             <span className="ml-2 text-sm text-muted-foreground">
               {selected.exchange} • {selected.instrument_type}
             </span>
             {ltpResult.price && (
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-profit">
                    LTP: ₹{ltpResult.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                  {ltpResult.changePercent !== undefined && (
                    <span className={`text-xs ${ltpResult.changePercent >= 0 ? "text-profit" : "text-loss"}`}>
                      ({ltpResult.changePercent >= 0 ? "+" : ""}{ltpResult.changePercent.toFixed(2)}%)
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    • {ltpResult.source} • {ltpResult.timestamp ? new Date(ltpResult.timestamp).toLocaleTimeString() : ""}
                  </span>
                </div>
             )}
           </div>
           <div className="flex items-center gap-2">
             {showLtpFetch && (
               <Button
                 type="button"
                 variant="ghost"
                 size="sm"
                 onClick={() => fetchLtp(selected)}
                 disabled={isFetchingLtp}
               >
                 {isFetchingLtp ? (
                   <Loader2 className="w-3.5 h-3.5 animate-spin" />
                 ) : (
                   <Zap className="w-3.5 h-3.5" />
                 )}
                 <span className="ml-1 text-xs">Fetch LTP</span>
               </Button>
             )}
             <Button type="button" variant="ghost" size="sm" onClick={clearSelection}>
               Change
             </Button>
           </div>
         </div>
         {ltpResult.error && (
           <p className="text-xs text-muted-foreground">{ltpResult.error}</p>
         )}
       </div>
     );
   }
   
   return (
     <div className={cn("space-y-3", className)}>
       <div className="flex items-center justify-between">
         <Label>Select Instrument *</Label>
         <div className="flex items-center gap-2 text-xs">
           <span className={cn(mode === "search" ? "text-foreground" : "text-muted-foreground")}>
             <Search className="w-3 h-3 inline mr-0.5" />
             Search
           </span>
            <NativeToggle
              checked={mode === "manual"}
              onCheckedChange={(checked) => setMode(checked ? "manual" : "search")}
              className="scale-75"
            />
           <span className={cn(mode === "manual" ? "text-foreground" : "text-muted-foreground")}>
             <Keyboard className="w-3 h-3 inline mr-0.5" />
             Manual
           </span>
         </div>
       </div>
       
       {mode === "search" ? (
         <div className="space-y-2">
           {/* Exchange filter */}
           <div className="flex gap-1">
             {(["ALL", "NSE", "NFO", "MCX"] as const).map((ex) => (
               <Button
                 key={ex}
                 type="button"
                 variant={exchangeFilter === ex ? "default" : "outline"}
                 size="sm"
                 onClick={() => setExchangeFilter(ex)}
                 className="text-xs h-7 px-2"
               >
                 {ex}
               </Button>
             ))}
           </div>
           
           {/* Tabs */}
           <div className="flex gap-1 border-b">
             <button
               type="button"
               onClick={() => setActiveTab("search")}
               className={cn(
                 "px-2 py-1 text-xs transition-colors",
                 activeTab === "search" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
               )}
             >
               <Search className="w-3 h-3 inline mr-0.5" />
               Search
             </button>
             <button
               type="button"
               onClick={() => setActiveTab("recent")}
               className={cn(
                 "px-2 py-1 text-xs transition-colors",
                 activeTab === "recent" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
               )}
             >
               <Clock className="w-3 h-3 inline mr-0.5" />
               Recent
             </button>
             <button
               type="button"
               onClick={() => setActiveTab("favorites")}
               className={cn(
                 "px-2 py-1 text-xs transition-colors",
                 activeTab === "favorites" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"
               )}
             >
               <Star className="w-3 h-3 inline mr-0.5" />
               Favorites
             </button>
           </div>
           
           {/* Search input */}
           {activeTab === "search" && (
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
               <Input
                 placeholder="Type symbol..."
                 value={query}
                 onChange={(e) => setQuery(e.target.value)}
                 className="pl-8 h-9 text-sm"
               />
             </div>
           )}
           
           {/* Results list */}
           <div className="max-h-40 overflow-y-auto space-y-0.5 border rounded-md p-1">
             {isSearching && activeTab === "search" ? (
               <div className="flex items-center justify-center py-3">
                 <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 <span className="text-xs text-muted-foreground">Searching...</span>
               </div>
             ) : displayList.length === 0 ? (
               <p className="text-xs text-muted-foreground text-center py-3">
                 {activeTab === "search" ? "No results. Try a different search or use Manual mode." : 
                  activeTab === "recent" ? "No recent items" : "No favorites"}
               </p>
             ) : (
               displayList.map(renderItem)
             )}
           </div>
         </div>
       ) : (
         /* Manual mode */
         <div className="space-y-3 p-3 border rounded-lg bg-accent/30">
           <div className="grid grid-cols-2 gap-2">
             <div className="space-y-1">
               <Label className="text-xs">Exchange</Label>
                <select
                  value={manualExchange}
                  onChange={(e) => setManualExchange(e.target.value as "NSE" | "NFO" | "MCX")}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="NSE">NSE</option>
                  <option value="NFO">NFO</option>
                  <option value="MCX">MCX</option>
                </select>
             </div>
             <div className="space-y-1">
               <Label className="text-xs">Type</Label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value as "EQ" | "FUT" | "OPT")}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <option value="EQ">Equity</option>
                  <option value="FUT">Futures</option>
                  <option value="OPT">Options</option>
                </select>
             </div>
           </div>
           
           <div className="space-y-1">
             <Label className="text-xs">Symbol</Label>
             <Input
               placeholder="e.g. RELIANCE, NIFTY 24FEB 22500CE"
               value={manualSymbol}
               onChange={(e) => setManualSymbol(e.target.value)}
               className="h-9 text-sm"
             />
           </div>
           
           <Button
             type="button"
             size="sm"
             onClick={handleManualConfirm}
             disabled={!manualSymbol.trim()}
             className="w-full"
           >
             Use This Instrument
           </Button>
           
           <p className="text-xs text-muted-foreground">
             Manual entry allows any symbol. Live price may not be available.
           </p>
         </div>
       )}
     </div>
   );
 }