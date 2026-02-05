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
 import { useInstrumentSearch, type Instrument } from "@/hooks/useInstrumentSearch";
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
   ONCE: "One-time (triggers once)",
   DAILY: "Daily (resets each day)",
   CONTINUOUS: "Continuous (every trigger)",
 };
 
 export function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
   const { createAlert } = useAlerts();
   const [selectedTab, setSelectedTab] = useState<"search" | "recent" | "favorites">("search");
   const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "NSE" | "NFO" | "MCX">("ALL");
   const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
   const [submitError, setSubmitError] = useState<string | null>(null);
 
   const {
     query,
     setQuery,
     instruments,
     isLoading,
     recentInstruments,
     favoriteInstruments,
     addToRecent,
     toggleFavorite,
     isFavorite,
   } = useInstrumentSearch({ exchange: exchangeFilter, limit: 50 });
 
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
 
   const handleSelectInstrument = (instrument: Instrument) => {
     setSelectedInstrument(instrument);
     form.setValue("symbol", instrument.trading_symbol);
     form.setValue("exchange", instrument.exchange as "NSE" | "NFO" | "MCX");
     form.setValue("instrument_id", instrument.security_id);
     addToRecent(instrument);
     setQuery("");
   };
 
   const handleToggleFavorite = (instrument: Instrument, e: React.MouseEvent) => {
     e.stopPropagation();
     toggleFavorite(instrument);
   };
 
   const selectedCondition = form.watch("condition_type");
   const thresholdValue = form.watch("threshold");
   const isPriceCondition = selectedCondition === "PRICE_GT" || selectedCondition === "PRICE_LT";
   const isPercentCondition = selectedCondition === "PERCENT_CHANGE_GT" || selectedCondition === "PERCENT_CHANGE_LT";
   const isVolumeCondition = selectedCondition === "VOLUME_SPIKE";
 
   const thresholdError = useMemo(() => {
     if ((isPriceCondition || isPercentCondition || isVolumeCondition) && 
         (thresholdValue === null || thresholdValue === undefined || thresholdValue <= 0)) {
       return "Enter a value greater than 0";
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
         instrument_id: selectedInstrument.security_id,
         exchange: data.exchange || "NSE",
       });
 
       form.reset();
       setSelectedInstrument(null);
       setQuery("");
       onOpenChange(false);
     } catch (error) {
       const message = error instanceof Error ? error.message : "Failed to create alert";
       setSubmitError(message);
     }
   };
 
   const renderInstrumentList = (instrumentList: Instrument[]) => (
     <div className="max-h-48 overflow-y-auto space-y-1">
       {isLoading && selectedTab === "search" ? (
         <div className="flex items-center justify-center py-4">
           <Loader2 className="w-4 h-4 animate-spin mr-2" />
           <span className="text-sm text-muted-foreground">Searching...</span>
         </div>
       ) : instrumentList.length === 0 ? (
         <p className="text-sm text-muted-foreground text-center py-4">
           {selectedTab === "search" ? "No instruments found. Try syncing instrument master." : 
            selectedTab === "recent" ? "No recent instruments" : "No favorites yet"}
         </p>
       ) : (
         instrumentList.map((instrument) => (
           <div
             key={instrument.security_id}
             onClick={() => handleSelectInstrument(instrument)}
             className={cn(
               "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
               selectedInstrument?.security_id === instrument.security_id
                 ? "bg-primary/20 border border-primary/50"
                 : "hover:bg-accent"
             )}
           >
             <div>
               <span className="font-medium">{instrument.trading_symbol}</span>
               <span className="ml-2 text-xs text-muted-foreground">
                 {instrument.exchange} • {instrument.instrument_type}
               </span>
             </div>
             <button
               onClick={(e) => handleToggleFavorite(instrument, e)}
               className="p-1 hover:bg-background rounded"
             >
               <Star
                 className={cn(
                   "w-4 h-4",
                   isFavorite(instrument.security_id)
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
             Get notified when price or condition is met.
           </DialogDescription>
         </DialogHeader>
 
         <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             {submitError && (
               <Alert variant="destructive">
                 <AlertCircle className="h-4 w-4" />
                 <AlertDescription>{submitError}</AlertDescription>
               </Alert>
             )}
 
             {/* Instrument Selection */}
             <div className="space-y-2">
               <FormLabel>Symbol *</FormLabel>
               
               {selectedInstrument ? (
                 <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                   <div>
                     <span className="font-semibold">{selectedInstrument.trading_symbol}</span>
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
                         value={query}
                         onChange={(e) => setQuery(e.target.value)}
                         className="pl-10"
                       />
                     </div>
                   )}
 
                   {/* Instrument List */}
                   {selectedTab === "search" && renderInstrumentList(instruments)}
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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue placeholder="Select condition" />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {alertConditionTypes.map((type) => (
                         <SelectItem key={type} value={type}>
                           {conditionLabels[type] || type}
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
                     {isPriceCondition ? "Trigger Price *" : 
                      isPercentCondition ? "% Threshold *" : 
                      isVolumeCondition ? "Volume Multiple *" : "Value"}
                   </FormLabel>
                   <FormControl>
                     <Input
                       type="number"
                       step="0.01"
                       placeholder={isPriceCondition ? "e.g., 2500.00" : "e.g., 5"}
                       {...field}
                       onChange={(e) => {
                         const val = e.target.value;
                         field.onChange(val === "" ? null : parseFloat(val));
                       }}
                       value={field.value ?? ""}
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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                     <FormControl>
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                     </FormControl>
                     <SelectContent>
                       {alertRecurrenceTypes.map((type) => (
                         <SelectItem key={type} value={type}>
                           {recurrenceLabels[type] || type}
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
                       placeholder="Why this alert matters..."
                       className="resize-none"
                       rows={2}
                       {...field}
                       value={field.value ?? ""}
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
                     <p className="text-xs text-muted-foreground">
                       Notify via Telegram when triggered
                     </p>
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
 
             {/* Submit */}
             <div className="flex justify-end gap-2 pt-2">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => onOpenChange(false)}
               >
                 Cancel
               </Button>
               <Button type="submit" disabled={!canSubmit}>
                 {createAlert.isPending && (
                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
                 )}
                 Create Alert
               </Button>
             </div>
           </form>
         </Form>
       </DialogContent>
     </Dialog>
   );
 }