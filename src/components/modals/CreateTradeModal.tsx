 import { useState, useCallback } from "react";
 import { useForm } from "react-hook-form";
 import { zodResolver } from "@hookform/resolvers/zod";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Switch } from "@/components/ui/switch";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { createTradeSchema, type CreateTradeInput, marketSegments, tradeTypes, timeframes } from "@/lib/schemas";
 import { useTrades } from "@/hooks/useTrades";
 import { Loader2, AlertCircle, Zap, ChevronDown, TrendingUp } from "lucide-react";
 import { TargetChipsInput } from "@/components/trade/TargetChipsInput";
 import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
 import { toast } from "sonner";
 import { Alert, AlertDescription } from "@/components/ui/alert";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { supabase } from "@/integrations/supabase/client";
 import { cn } from "@/lib/utils";
 
 interface CreateTradeModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 const segmentLabels: Record<string, string> = {
   Equity_Intraday: "Equity Intraday",
   Equity_Positional: "Equity Positional",
   Futures: "Futures",
   Options: "Options",
   Commodities: "Commodities",
 };
 
 const timeframeLabels: Record<string, string> = {
   "1min": "1 Min",
   "5min": "5 Min",
   "15min": "15 Min",
   "30min": "30 Min",
   "1H": "1 Hour",
   "4H": "4 Hour",
   "1D": "Daily",
   "1W": "Weekly",
 };
 
 export function CreateTradeModal({ open, onOpenChange }: CreateTradeModalProps) {
   const { createTrade } = useTrades();
   
   // Core state
   const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
   const [targets, setTargets] = useState<number[]>([]);
   const [advancedOpen, setAdvancedOpen] = useState(false);
   const [isFetchingLtp, setIsFetchingLtp] = useState(false);
   
   // Automation
   const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);
   const [telegramPostEnabled, setTelegramPostEnabled] = useState(false);
   const [trailingSlEnabled, setTrailingSlEnabled] = useState(false);
 
   const {
     register,
     handleSubmit,
     setValue,
     watch,
     reset,
     formState: { errors },
   } = useForm<CreateTradeInput>({
     resolver: zodResolver(createTradeSchema),
     defaultValues: {
       quantity: 1,
       trailing_sl_enabled: false,
       auto_track_enabled: false,
       telegram_post_enabled: false,
     },
   });
 
   const segment = watch("segment");
   const tradeType = watch("trade_type");
   const entryPrice = watch("entry_price");
   const stopLoss = watch("stop_loss");
 
   // Helper to safely convert to number or null
   const toNumberOrNull = (value: unknown): number | null => {
     if (value === undefined || value === null || value === "") return null;
     const num = Number(value);
     return Number.isNaN(num) ? null : num;
   };
 
   const onSubmit = async (data: CreateTradeInput) => {
     const symbolToUse = selectedInstrument?.symbol || data.symbol;
     if (!symbolToUse || symbolToUse.trim() === "") {
       toast.error("Please select an instrument or enter a symbol");
       return;
     }
 
     const sanitizedEntryPrice = toNumberOrNull(data.entry_price);
     const sanitizedStopLoss = toNumberOrNull(data.stop_loss);
     const sanitizedQuantity = toNumberOrNull(data.quantity) || 1;
 
     try {
       const hasKeyFields = sanitizedEntryPrice && sanitizedEntryPrice > 0;
       const tradeStatus = hasKeyFields ? "OPEN" : "PENDING";
 
       await createTrade.mutateAsync({
         symbol: symbolToUse,
         segment: data.segment,
         trade_type: data.trade_type,
         quantity: sanitizedQuantity,
         entry_price: sanitizedEntryPrice || 0,
         stop_loss: sanitizedStopLoss,
         targets: targets.length > 0 ? targets : null,
         notes: data.notes?.trim() || null,
         status: tradeStatus,
         entry_time: new Date().toISOString(),
         timeframe: data.timeframe || null,
         holding_period: data.holding_period?.trim() || null,
         trailing_sl_enabled: trailingSlEnabled,
         auto_track_enabled: autoTrackEnabled,
         telegram_post_enabled: telegramPostEnabled,
         security_id: selectedInstrument?.security_id || null,
         exchange_segment: selectedInstrument?.exchange_segment || null,
       });
 
       resetForm();
       onOpenChange(false);
       toast.success("Trade created successfully");
     } catch (error: unknown) {
       console.error("Trade creation failed:", error);
       const message = error instanceof Error ? error.message : "Failed to create trade";
       toast.error(message);
     }
   };
 
   const resetForm = () => {
     reset();
     setSelectedInstrument(null);
     setTargets([]);
     setAdvancedOpen(false);
     setAutoTrackEnabled(false);
     setTelegramPostEnabled(false);
     setTrailingSlEnabled(false);
   };
 
   const handleClose = () => {
     resetForm();
     onOpenChange(false);
   };
 
   const handleInstrumentSelect = useCallback((instrument: SelectedInstrument) => {
     setSelectedInstrument(instrument);
     setValue("symbol", instrument.symbol, { shouldValidate: true });
     if (instrument.ltp && instrument.ltp > 0) {
       setValue("entry_price", instrument.ltp, { shouldValidate: true });
     }
   }, [setValue]);
 
   const fetchAndFillLtp = async () => {
     if (!selectedInstrument) return;
     
     setIsFetchingLtp(true);
     try {
       const { data, error } = await supabase.functions.invoke("get-live-prices", {
         body: {
           instruments: [{
             symbol: selectedInstrument.symbol,
             security_id: selectedInstrument.security_id,
             exchange_segment: selectedInstrument.exchange_segment,
           }],
         },
       });
       
       if (error) throw error;
       
       if (data?.success && data?.prices?.[selectedInstrument.symbol]) {
         const ltp = data.prices[selectedInstrument.symbol].ltp;
         setValue("entry_price", ltp, { shouldValidate: true });
         toast.success(`LTP: ₹${ltp.toLocaleString()}`);
       } else {
         toast.error("Price not available. Enter manually.");
       }
     } catch (err) {
       console.error("LTP fetch error:", err);
       toast.error("Failed to fetch price");
     } finally {
       setIsFetchingLtp(false);
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Create Research Trade</DialogTitle>
           <DialogDescription>
             Log a trade quickly. Only Segment, Trade Type, and Instrument are required.
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {Object.keys(errors).length > 0 && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertDescription>
                 {Object.values(errors).map((e, i) => (
                   <span key={i} className="block text-sm">{e.message}</span>
                 ))}
               </AlertDescription>
             </Alert>
           )}
 
           {/* Segment & Trade Type */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Segment *</Label>
               <Select
                 value={segment ?? ""}
                 onValueChange={(val) => setValue("segment", val as CreateTradeInput["segment"], { shouldValidate: true })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select segment" />
                 </SelectTrigger>
                 <SelectContent>
                   {marketSegments.map((seg) => (
                     <SelectItem key={seg} value={seg}>
                       {segmentLabels[seg] || seg}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.segment && <p className="text-sm text-destructive">{errors.segment.message}</p>}
             </div>
 
             <div className="space-y-2">
               <Label>Trade Type *</Label>
               <Select
                 value={tradeType ?? ""}
                 onValueChange={(val) => setValue("trade_type", val as CreateTradeInput["trade_type"], { shouldValidate: true })}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="BUY/SELL" />
                 </SelectTrigger>
                 <SelectContent>
                   {tradeTypes.map((type) => (
                     <SelectItem key={type} value={type}>{type}</SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.trade_type && <p className="text-sm text-destructive">{errors.trade_type.message}</p>}
             </div>
           </div>
 
           {/* Instrument Picker */}
           <InstrumentPicker
             segment={segment}
             onSelect={handleInstrumentSelect}
             showLtpFetch={true}
           />
 
           {/* Entry Price with Fetch LTP + Quantity */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <div className="flex items-center justify-between">
                 <Label htmlFor="entry_price">Entry Price</Label>
                 {selectedInstrument && (
                   <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     onClick={fetchAndFillLtp}
                     disabled={isFetchingLtp}
                     className="h-6 px-2 text-xs"
                   >
                     {isFetchingLtp ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                     <span className="ml-1">Fetch LTP</span>
                   </Button>
                 )}
               </div>
               <Input
                 id="entry_price"
                 type="number"
                 step="0.01"
                 placeholder="Optional"
                 {...register("entry_price", { valueAsNumber: true })}
               />
             </div>
 
             <div className="space-y-2">
               <Label htmlFor="quantity">Quantity</Label>
               <Input
                 id="quantity"
                 type="number"
                 placeholder="1"
                 {...register("quantity", { valueAsNumber: true })}
               />
             </div>
           </div>
 
           {/* Stop Loss and Timeframe */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="stop_loss">Stop Loss</Label>
               <Input
                 id="stop_loss"
                 type="number"
                 step="0.01"
                 placeholder="Optional"
                 {...register("stop_loss", { valueAsNumber: true })}
               />
             </div>
             <div className="space-y-2">
               <Label>Timeframe</Label>
               <Select
                 value={watch("timeframe") ?? ""}
                 onValueChange={(val) => setValue("timeframe", val as CreateTradeInput["timeframe"])}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select timeframe" />
                 </SelectTrigger>
                 <SelectContent>
                   {timeframes.map((tf) => (
                     <SelectItem key={tf} value={tf}>
                       {timeframeLabels[tf] || tf}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
 
           {/* Targets */}
           <TargetChipsInput
             targets={targets}
             onTargetsChange={setTargets}
             entryPrice={entryPrice}
             stopLoss={stopLoss}
             tradeType={tradeType}
           />
 
           {/* Advanced Section */}
           <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
             <CollapsibleTrigger asChild>
               <Button type="button" variant="ghost" size="sm" className="w-full justify-between">
                 <span className="text-sm text-muted-foreground">Advanced Options</span>
                 <ChevronDown className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-180")} />
               </Button>
             </CollapsibleTrigger>
             <CollapsibleContent className="space-y-4 pt-2">
               {/* Trailing SL */}
               <div className="flex items-center justify-between p-3 rounded-lg border">
                 <div className="flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-profit" />
                   <Label>Trailing Stop Loss</Label>
                 </div>
                 <Switch
                   checked={trailingSlEnabled}
                   onCheckedChange={setTrailingSlEnabled}
                 />
               </div>
 
               {/* Automation */}
               <div className="flex items-center justify-between p-3 rounded-lg border">
                 <Label>Auto Track Enabled</Label>
                 <Switch checked={autoTrackEnabled} onCheckedChange={setAutoTrackEnabled} />
               </div>
               <div className="flex items-center justify-between p-3 rounded-lg border">
                 <Label>Post to Telegram</Label>
                 <Switch checked={telegramPostEnabled} onCheckedChange={setTelegramPostEnabled} />
               </div>
 
               {/* Holding Period */}
               <div className="space-y-2">
                 <Label htmlFor="holding_period">Holding Period</Label>
                 <Input
                   id="holding_period"
                   placeholder="e.g., Intraday, 2-3 days"
                   {...register("holding_period")}
                 />
               </div>
 
               {/* Notes */}
               <div className="space-y-2">
                 <Label htmlFor="notes">Notes / Thesis</Label>
                 <Textarea
                   id="notes"
                   placeholder="Trade thesis, observations..."
                   className="resize-none"
                   rows={3}
                   {...register("notes")}
                 />
               </div>
             </CollapsibleContent>
           </Collapsible>
 
           {/* Actions */}
           <div className="flex justify-end gap-2 pt-4 border-t">
             <Button type="button" variant="outline" onClick={handleClose}>
               Cancel
             </Button>
             <Button type="submit" disabled={createTrade.isPending}>
               {createTrade.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
               Create Trade
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }