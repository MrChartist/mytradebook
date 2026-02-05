 import { useState, useMemo } from "react";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from "@/components/ui/dialog";
 import {
   Form,
   FormControl,
   FormField,
   FormItem,
   FormLabel,
   FormMessage,
   FormDescription,
 } from "@/components/ui/form";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import { Alert, AlertDescription } from "@/components/ui/alert";
 import { Loader2, Search, AlertCircle, Star, Clock, Send } from "lucide-react";
 import {
   createAlertSchema,
   type CreateAlertInput,
   alertConditionTypes,
   alertRecurrenceTypes,
 } from "@/lib/schemas";
 import { useAlerts } from "@/hooks/useAlerts";
 import { cn } from "@/lib/utils";
 
 interface CreateAlertModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const conditionLabels: Record<string, string> = {
   PRICE_GT: "Price Above",
   PRICE_LT: "Price Below",
   PERCENT_CHANGE_GT: "% Change Above",
   PERCENT_CHANGE_LT: "% Change Below",
   VOLUME_SPIKE: "Volume Spike",
   CUSTOM: "Custom Condition",
 };
 
 const recurrenceLabels: Record<string, string> = {
   ONCE: "One-time (triggers once, then deactivates)",
   DAILY: "Daily (resets and checks each day)",
   CONTINUOUS: "Continuous (triggers every time condition met)",
 };
 
 // Instrument master data (same as trade module)
 const NSE_EQUITY = [
   "RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY", "HINDUNILVR", "SBIN", "BHARTIARTL",
   "KOTAKBANK", "ITC", "LT", "AXISBANK", "BAJFINANCE", "ASIANPAINT", "MARUTI", "TITAN",
   "SUNPHARMA", "ULTRACEMCO", "WIPRO", "HCLTECH", "NESTLEIND", "TATAMOTORS", "POWERGRID",
   "NTPC", "M&M", "JSWSTEEL", "TATASTEEL", "TECHM", "ADANIPORTS", "BAJAJFINSV", "ONGC",
   "COALINDIA", "GRASIM", "DIVISLAB", "DRREDDY", "CIPLA", "APOLLOHOSP", "EICHERMOT",
   "HINDALCO", "BPCL", "INDUSINDBK", "SBILIFE", "HDFCLIFE", "BRITANNIA", "HEROMOTOCO",
   "TATACONSUM", "LTIM", "ADANIENT", "RECLTD", "PFC", "IRFC", "NHPC", "SJVN", "BEL",
   "HAL", "BHEL", "GAIL", "IOC", "VEDL", "SAIL", "NMDC", "UNIONBANK", "BANKBARODA",
   "CANBK", "PNB", "IDEA", "ZEEL", "TATAPOWER", "TATAELXSI", "PERSISTENT", "COFORGE",
   "MPHASIS", "MINDTREE", "NAUKRI", "ZOMATO", "PAYTM", "POLICYBZR", "DELHIVERY",
   "IRCTC", "RVNL", "COCHINSHIP", "GRSE", "MAZAGONDOCK", "NBCC", "RAILTEL", "RITES",
   "IRCON", "HUDCO", "EXIDEIND", "AMARARAJA", "MOTHERSON", "BALKRISIND", "MRF",
   "APOLLOTYRE", "CEAT", "TVSMOTORS", "BAJAJ-AUTO", "ESCORTS", "ASHOKLEY", "TVSMOTOR",
   "PAGEIND", "RAYMOND", "ARVIND", "ABFRL", "TRENT", "SHOPERSTOP", "JUBLFOOD", "DMART",
   "RELAXO", "BATA", "VBL", "MARICO", "DABUR", "GODREJCP", "COLPAL", "PGHH", "BERGEPAINT",
   "KANSAINER", "INDIGO", "SPICEJET", "GMRINFRA", "ADANIGREEN", "ADANITRANS", "TORNTPOWER",
   "TATACOMM", "ATGL", "MGL", "IGL", "PETRONET", "GSPL", "HPCL", "CASTROLIND",
   "PIIND", "UPL", "BAYERCROP", "RALLIS", "DHANUKA", "GNFC", "GSFC", "FACT", "CHAMBAL",
   "COROMANDEL", "DEEPAKFERT", "DEEPAKNITRI", "FINEORG", "NAVINFLUOR", "SRF", "AARTIIND",
   "TATACHEM", "ALKYLAMINE", "ATUL", "SUDARSCHEM", "CLEAN", "ANURAS", "AUROPHARMA",
   "BIOCON", "LALPATHLAB", "METROPOLIS", "THYROCARE", "SYNGENE", "GLAND", "NATCOPHARM",
   "ALKEM", "TORNTPHARM", "IPCALAB", "LUPIN", "CADILAHC", "GLENMARK", "ZYDUSWELL",
   "LAURUSLABS", "GRANULES", "ABBOTINDIA", "PFIZER", "GLAXO", "SANOFI",
 ].sort();
 
 const NFO_UNDERLYINGS = [
   "NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "NIFTYNXT50",
   ...NSE_EQUITY.slice(0, 100),
 ];
 
 const MCX_COMMODITIES = [
   "GOLD", "GOLDM", "GOLDPETAL", "SILVER", "SILVERM", "SILVERMIC",
   "CRUDEOIL", "CRUDEOILM", "NATURALGAS", "COPPER", "ZINC", "LEAD",
   "ALUMINIUM", "NICKEL", "COTTON", "MENTHAOIL",
 ].sort();
 
 type InstrumentItem = {
   symbol: string;
   display_name: string;
   exchange: "NSE" | "NFO" | "MCX";
   instrument_type: "EQ" | "FUT" | "OPT" | "INDEX" | "COMMODITY";
 };
 
 function getAllInstruments(): InstrumentItem[] {
   const instruments: InstrumentItem[] = [];
   
   NSE_EQUITY.forEach(symbol => {
     instruments.push({
       symbol,
       display_name: `${symbol}`,
       exchange: "NSE",
       instrument_type: "EQ",
     });
   });
   
   NFO_UNDERLYINGS.forEach(symbol => {
     if (!instruments.find(i => i.symbol === symbol && i.exchange === "NFO")) {
       const isIndex = ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY", "NIFTYNXT50"].includes(symbol);
       instruments.push({
         symbol,
         display_name: `${symbol} (F&O)`,
         exchange: "NFO",
         instrument_type: isIndex ? "INDEX" : "EQ",
       });
     }
   });
   
   MCX_COMMODITIES.forEach(symbol => {
     instruments.push({
       symbol,
       display_name: `${symbol}`,
       exchange: "MCX",
       instrument_type: "COMMODITY",
     });
   });
   
   return instruments;
 }
 
 const STORAGE_KEY_RECENT = "alert_recent_instruments";
 const STORAGE_KEY_FAVORITES = "alert_favorite_instruments";
 
 function getRecentInstruments(): string[] {
   try {
     const stored = localStorage.getItem(STORAGE_KEY_RECENT);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function addRecentInstrument(symbol: string) {
   try {
     const recent = getRecentInstruments().filter(s => s !== symbol);
     recent.unshift(symbol);
     localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recent.slice(0, 10)));
   } catch {}
 }
 
 function getFavoriteInstruments(): string[] {
   try {
     const stored = localStorage.getItem(STORAGE_KEY_FAVORITES);
     return stored ? JSON.parse(stored) : [];
   } catch {
     return [];
   }
 }
 
 function toggleFavoriteInstrument(symbol: string): boolean {
   try {
     const favorites = getFavoriteInstruments();
     const index = favorites.indexOf(symbol);
     if (index >= 0) {
       favorites.splice(index, 1);
       localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
       return false;
     } else {
       favorites.unshift(symbol);
       localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
       return true;
     }
   } catch {
     return false;
   }
 }
 
 export function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
   const { createAlert } = useAlerts();
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedTab, setSelectedTab] = useState<"search" | "recent" | "favorites">("search");
   const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "NSE" | "NFO" | "MCX">("ALL");
   const [selectedInstrument, setSelectedInstrument] = useState<InstrumentItem | null>(null);
   const [favorites, setFavorites] = useState<string[]>(getFavoriteInstruments());
   const [submitError, setSubmitError] = useState<string | null>(null);
 
   const allInstruments = useMemo(() => getAllInstruments(), []);
 
   const form = useForm<CreateAlertInput>({
     resolver: zodResolver(createAlertSchema),
     defaultValues: {
       symbol: "",
       condition_type: "PRICE_GT",
       threshold: undefined,
       recurrence: "ONCE",
       notes: "",
       telegram_enabled: false,
       exchange: "NSE",
     },
   });
 
   const filteredInstruments = useMemo(() => {
     let instruments = allInstruments;
     
     if (exchangeFilter !== "ALL") {
       instruments = instruments.filter(i => i.exchange === exchangeFilter);
     }
     
     if (searchQuery.trim()) {
       const query = searchQuery.toLowerCase();
       instruments = instruments.filter(i => 
         i.symbol.toLowerCase().includes(query) ||
         i.display_name.toLowerCase().includes(query)
       );
     }
     
     return instruments.slice(0, 50);
   }, [allInstruments, exchangeFilter, searchQuery]);
 
   const recentInstruments = useMemo(() => {
     const recent = getRecentInstruments();
     return allInstruments.filter(i => recent.includes(i.symbol)).slice(0, 10);
   }, [allInstruments]);
 
   const favoriteInstruments = useMemo(() => {
     return allInstruments.filter(i => favorites.includes(i.symbol));
   }, [allInstruments, favorites]);
 
   const handleSelectInstrument = (instrument: InstrumentItem) => {
     setSelectedInstrument(instrument);
     form.setValue("symbol", instrument.symbol);
     form.setValue("exchange", instrument.exchange);
     form.setValue("instrument_id", `${instrument.exchange}:${instrument.symbol}`);
     addRecentInstrument(instrument.symbol);
     setSearchQuery("");
   };
 
   const handleToggleFavorite = (symbol: string, e: React.MouseEvent) => {
     e.stopPropagation();
     const isFavorite = toggleFavoriteInstrument(symbol);
     setFavorites(getFavoriteInstruments());
   };
 
   const selectedCondition = form.watch("condition_type");
   const thresholdValue = form.watch("threshold");
   const isPercentCondition = selectedCondition === "PERCENT_CHANGE_GT" || selectedCondition === "PERCENT_CHANGE_LT";
   const isPriceCondition = selectedCondition === "PRICE_GT" || selectedCondition === "PRICE_LT";
   const isVolumeCondition = selectedCondition === "VOLUME_SPIKE";
 
   // Validation: price conditions require threshold > 0
   const thresholdError = useMemo(() => {
     if ((isPriceCondition || isPercentCondition || isVolumeCondition) && 
         (thresholdValue === null || thresholdValue === undefined || thresholdValue <= 0)) {
       return "Enter a valid trigger value greater than 0";
     }
     return null;
   }, [isPriceCondition, isPercentCondition, isVolumeCondition, thresholdValue]);
 
   const canSubmit = selectedInstrument && !thresholdError && !createAlert.isPending;
 
   const onSubmit = async (data: CreateAlertInput) => {
     setSubmitError(null);
     
     if (!selectedInstrument) {
       setSubmitError("Please select an instrument");
       return;
     }
     
     if (thresholdError) {
       setSubmitError(thresholdError);
       return;
     }
 
     try {
       await createAlert.mutateAsync({
         symbol: data.symbol,
         condition_type: data.condition_type,
         threshold: data.threshold || null,
         recurrence: data.recurrence,
         expires_at: data.expires_at || null,
         notes: data.notes || null,
         telegram_enabled: data.telegram_enabled || false,
         instrument_id: data.instrument_id || null,
         exchange: data.exchange || "NSE",
       });
 
       form.reset();
       setSelectedInstrument(null);
       setSearchQuery("");
       onOpenChange(false);
     } catch (error) {
       const message = error instanceof Error ? error.message : "Failed to create alert";
       setSubmitError(message);
     }
   };
 
   const renderInstrumentList = (instruments: InstrumentItem[]) => (
     <div className="max-h-48 overflow-y-auto space-y-1">
       {instruments.length === 0 ? (
         <p className="text-sm text-muted-foreground text-center py-4">
           {selectedTab === "search" ? "No instruments found" : 
            selectedTab === "recent" ? "No recent instruments" : "No favorites yet"}
         </p>
       ) : (
         instruments.map((instrument) => (
           <div
             key={`${instrument.exchange}-${instrument.symbol}`}
             onClick={() => handleSelectInstrument(instrument)}
             className={cn(
               "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
               selectedInstrument?.symbol === instrument.symbol && selectedInstrument?.exchange === instrument.exchange
                 ? "bg-primary/20 border border-primary/50"
                 : "hover:bg-accent"
             )}
           >
             <div>
               <span className="font-medium">{instrument.symbol}</span>
               <span className="ml-2 text-xs text-muted-foreground">
                 {instrument.exchange}
               </span>
             </div>
             <button
               onClick={(e) => handleToggleFavorite(instrument.symbol, e)}
               className="p-1 hover:bg-background rounded"
             >
               <Star
                 className={cn(
                   "w-4 h-4",
                   favorites.includes(instrument.symbol)
                     ? "fill-warning text-warning"
                     : "text-muted-foreground"
                 )}
               />
             </button>
           </div>
         ))
       )}
     </div>
   );
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Create New Alert</DialogTitle>
           <DialogDescription>
             Get notified when a price or condition is met.
           </DialogDescription>
         </DialogHeader>
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             {/* Instrument Selection */}
             <div className="space-y-2">
               <FormLabel>Symbol *</FormLabel>
               
               {selectedInstrument ? (
                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                   <div>
                     <span className="font-semibold">{selectedInstrument.symbol}</span>
                     <span className="ml-2 text-sm text-muted-foreground">
                       {selectedInstrument.exchange}
                     </span>
                   </div>
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={() => setSelectedInstrument(null)}
                   >
                     Change
                   </Button>
                 </div>
               ) : (
                 <div className="space-y-2">
                   {/* Exchange Filter */}
                   <div className="flex gap-1">
                     {(["ALL", "NSE", "NFO", "MCX"] as const).map((ex) => (
                       <Button
                         key={ex}
                         type="button"
                         variant={exchangeFilter === ex ? "default" : "outline"}
                         size="sm"
                         onClick={() => setExchangeFilter(ex)}
                         className="text-xs"
                       >
                         {ex}
                       </Button>
                     ))}
                   </div>
 
                   {/* Tabs */}
                   <div className="flex gap-1 border-b">
                     <button
                       type="button"
                       onClick={() => setSelectedTab("search")}
                       className={cn(
                         "px-3 py-1.5 text-sm transition-colors",
                         selectedTab === "search"
                           ? "border-b-2 border-primary text-primary"
                           : "text-muted-foreground"
                       )}
                     >
                       <Search className="w-3 h-3 inline mr-1" />
                       Search
                     </button>
                     <button
                       type="button"
                       onClick={() => setSelectedTab("recent")}
                       className={cn(
                         "px-3 py-1.5 text-sm transition-colors",
                         selectedTab === "recent"
                           ? "border-b-2 border-primary text-primary"
                           : "text-muted-foreground"
                       )}
                     >
                       <Clock className="w-3 h-3 inline mr-1" />
                       Recent
                     </button>
                     <button
                       type="button"
                       onClick={() => setSelectedTab("favorites")}
                       className={cn(
                         "px-3 py-1.5 text-sm transition-colors",
                         selectedTab === "favorites"
                           ? "border-b-2 border-primary text-primary"
                           : "text-muted-foreground"
                       )}
                     >
                       <Star className="w-3 h-3 inline mr-1" />
                       Favorites
                     </button>
                   </div>
 
                   {/* Search Input */}
                   {selectedTab === "search" && (
                     <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                       <Input
                         placeholder="Search symbols..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="pl-10"
                       />
                     </div>
                   )}
 
                   {/* Instrument List */}
                   {selectedTab === "search" && renderInstrumentList(filteredInstruments)}
                   {selectedTab === "recent" && renderInstrumentList(recentInstruments)}
                   {selectedTab === "favorites" && renderInstrumentList(favoriteInstruments)}
                 </div>
               )}
             </div>
 
             {/* Condition Type */}
             <FormField
               control={form.control}
               name="condition_type"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Condition *</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select condition" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {alertConditionTypes.map((type) => (
                         <SelectItem key={type} value={type}>
                           {conditionLabels[type]}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Threshold */}
             <FormField
               control={form.control}
               name="threshold"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>
                     {isPercentCondition ? "Percentage (%) *" : 
                      isVolumeCondition ? "Volume Threshold *" : "Trigger Price (₹) *"}
                   </FormLabel>
                   <FormControl>
                     <Input
                       type="number"
                       step={isPercentCondition ? "0.1" : "0.01"}
                       placeholder={isPercentCondition ? "e.g., 2.5" : 
                                   isVolumeCondition ? "e.g., 1000000" : "e.g., 2500"}
                       value={field.value ?? ""}
                       onChange={(e) => {
                         const val = e.target.value;
                         field.onChange(val === "" ? null : parseFloat(val));
                       }}
                       className={cn(thresholdError && "border-destructive")}
                     />
                   </FormControl>
                   {thresholdError && (
                     <p className="text-sm text-destructive">{thresholdError}</p>
                   )}
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Recurrence */}
             <FormField
               control={form.control}
               name="recurrence"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Recurrence</FormLabel>
                   <Select onValueChange={field.onChange} value={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select recurrence" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {alertRecurrenceTypes.map((type) => (
                         <SelectItem key={type} value={type}>
                           {recurrenceLabels[type]}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Notes */}
             <FormField
               control={form.control}
               name="notes"
               render={({ field }) => (
                 <FormItem>
                   <FormLabel>Notes / Reason</FormLabel>
                   <FormControl>
                     <Textarea
                       placeholder="Why are you setting this alert? (optional)"
                       className="resize-none"
                       rows={3}
                       {...field}
                       value={field.value || ""}
                     />
                   </FormControl>
                   <FormMessage />
                 </FormItem>
               )}
             />
 
             {/* Telegram Toggle */}
             <FormField
               control={form.control}
               name="telegram_enabled"
               render={({ field }) => (
                 <FormItem className="flex items-center justify-between rounded-lg border p-3">
                   <div className="space-y-0.5">
                     <FormLabel className="flex items-center gap-2">
                       <Send className="w-4 h-4" />
                       Send to Telegram
                     </FormLabel>
                     <FormDescription className="text-xs">
                       Get notified on Telegram when alert triggers
                     </FormDescription>
                   </div>
                   <FormControl>
                     <Switch
                       checked={field.value}
                       onCheckedChange={field.onChange}
                     />
                   </FormControl>
                 </FormItem>
               )}
             />
 
             {/* Error Display */}
             {submitError && (
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription>{submitError}</AlertDescription>
               </Alert>
             )}
 
             {/* Actions */}
             <div className="flex justify-end gap-3 pt-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => onOpenChange(false)}
               >
                 Cancel
               </Button>
               <Button
                 type="submit"
                 className="bg-gradient-primary"
                 disabled={!canSubmit}
               >
                 {createAlert.isPending ? (
                   <>
                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                     Creating...
                   </>
                 ) : (
                   "Create Alert"
                 )}
               </Button>
             </div>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   );
 }