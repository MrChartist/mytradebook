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
 import { Slider } from "@/components/ui/slider";
 import { Switch } from "@/components/ui/switch";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { ChartImageUpload } from "@/components/ui/chart-image-upload";
 import { createTradeSchema, type CreateTradeInput, marketSegments, tradeTypes, timeframes } from "@/lib/schemas";
 import { useTrades } from "@/hooks/useTrades";
 import { useAvailableTags } from "@/hooks/useAvailableTags";
 import { Loader2, TrendingUp, Tag } from "lucide-react";
 import { TagSearchPicker } from "@/components/trade/TagSearchPicker";
 import { TargetChipsInput } from "@/components/trade/TargetChipsInput";
 import { TradeAutomationControls } from "@/components/trade/TradeAutomationControls";
 import { OptionChainSelector } from "@/components/trade/OptionChainSelector";
 import { FuturesContractPicker } from "@/components/trade/FuturesContractPicker";
 
 interface CreateTradeModalProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
 }
 
 export function CreateTradeModal({ open, onOpenChange }: CreateTradeModalProps) {
   const { createTrade } = useTrades();
   const availableTags = useAvailableTags();
   
   const [rating, setRating] = useState(8);
   const [confidence, setConfidence] = useState(3);
   const [chartImages, setChartImages] = useState<string[]>([]);
   const [trailingSlEnabled, setTrailingSlEnabled] = useState(false);
   const [trailingSlType, setTrailingSlType] = useState<"percent" | "points">("percent");
   
   // Selected tags
   const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
   const [selectedCandlesticks, setSelectedCandlesticks] = useState<string[]>([]);
   const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
   const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);
 
   // New automation controls
   const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);
   const [telegramPostEnabled, setTelegramPostEnabled] = useState(false);
   
   // Targets as array for chip-based input
   const [targets, setTargets] = useState<number[]>([]);
   
   // Contract info for options/futures
   const [contractKey, setContractKey] = useState<string | null>(null);
   const [instrumentToken, setInstrumentToken] = useState<string | null>(null);
 
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
       rating: 8,
       confidence_score: 3,
       quantity: 1,
       trailing_sl_enabled: false,
     },
   });
 
   const segment = watch("segment");
   const tradeType = watch("trade_type");
   const timeframe = watch("timeframe");
   const entryPrice = watch("entry_price");
   const stopLoss = watch("stop_loss");
 
   const segmentValue = segment ?? "";
   const tradeTypeValue = tradeType ?? "";
   const timeframeValue = timeframe ?? "";
 
   const onSubmit = async (data: CreateTradeInput) => {
     const newTrade = await createTrade.mutateAsync({
       symbol: data.symbol,
       segment: data.segment,
       trade_type: data.trade_type,
       quantity: data.quantity || 1,
       entry_price: data.entry_price,
       stop_loss: data.stop_loss,
       targets: targets,
       rating: data.rating,
       confidence_score: data.confidence_score,
       notes: data.notes,
       study_id: data.study_id,
       status: "OPEN",
       entry_time: new Date().toISOString(),
       chart_images: chartImages,
       timeframe: data.timeframe,
       holding_period: data.holding_period,
       trailing_sl_enabled: data.trailing_sl_enabled,
       trailing_sl_percent: trailingSlType === "percent" ? data.trailing_sl_percent : undefined,
       trailing_sl_points: trailingSlType === "points" ? data.trailing_sl_points : undefined,
       trailing_sl_trigger_price: data.trailing_sl_trigger_price,
       auto_track_enabled: autoTrackEnabled,
       telegram_post_enabled: telegramPostEnabled,
       contract_key: contractKey,
       instrument_token: instrumentToken,
     });
 
     // Link selected tags to the new trade
     if (newTrade?.id) {
       const { supabase } = await import("@/integrations/supabase/client");
       
       if (selectedPatterns.length > 0) {
         await supabase.from("trade_patterns").insert(
           selectedPatterns.map((patternId) => ({
             trade_id: newTrade.id,
             pattern_id: patternId,
           }))
         );
       }
       
       if (selectedCandlesticks.length > 0) {
         await supabase.from("trade_candlesticks").insert(
           selectedCandlesticks.map((candlestickId) => ({
             trade_id: newTrade.id,
             candlestick_id: candlestickId,
           }))
         );
       }
       
       if (selectedVolumes.length > 0) {
         await supabase.from("trade_volume").insert(
           selectedVolumes.map((volumeId) => ({
             trade_id: newTrade.id,
             volume_id: volumeId,
           }))
         );
       }
       
       if (selectedMistakes.length > 0) {
         await supabase.from("trade_mistakes").insert(
           selectedMistakes.map((mistakeId) => ({
             trade_id: newTrade.id,
             mistake_id: mistakeId,
           }))
         );
       }
     }
 
     resetForm();
     onOpenChange(false);
   };
 
   const resetForm = () => {
     reset();
     setChartImages([]);
     setRating(8);
     setConfidence(3);
     setTrailingSlEnabled(false);
     setSelectedPatterns([]);
     setSelectedCandlesticks([]);
     setSelectedVolumes([]);
     setSelectedMistakes([]);
     setAutoTrackEnabled(false);
     setTelegramPostEnabled(false);
     setTargets([]);
     setContractKey(null);
     setInstrumentToken(null);
   };
 
   const handleClose = () => {
     resetForm();
     onOpenChange(false);
   };
 
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
 
   // Handle contract selection from Option Chain or Futures picker
   const handleContractSelect = useCallback((contract: {
     symbol: string;
     ltp: number;
     instrumentToken?: string;
     contractKey: string;
   }) => {
     setValue("symbol", contract.symbol, { shouldValidate: true });
     setValue("entry_price", contract.ltp, { shouldValidate: true });
     setContractKey(contract.contractKey);
     if (contract.instrumentToken) {
       setInstrumentToken(contract.instrumentToken);
     }
   }, [setValue]);
 
   // Toggle functions for tags
   const togglePattern = useCallback((id: string) => {
     setSelectedPatterns(prev => 
       prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
     );
   }, []);
 
   const toggleCandlestick = useCallback((id: string) => {
     setSelectedCandlesticks(prev => 
       prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
     );
   }, []);
 
   const toggleVolume = useCallback((id: string) => {
     setSelectedVolumes(prev => 
       prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
     );
   }, []);
 
   const toggleMistake = useCallback((id: string) => {
     setSelectedMistakes(prev => 
       prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
     );
   }, []);
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
         <DialogHeader>
           <DialogTitle>Create Research Trade</DialogTitle>
           <DialogDescription>
             Log a trade idea with entry, targets, SL, tags, and automation options.
           </DialogDescription>
         </DialogHeader>
 
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
           {/* Segment & Trade Type */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Segment *</Label>
               <Select
                 value={segmentValue}
                 onValueChange={(val) =>
                   setValue("segment", val as any, { shouldDirty: true, shouldValidate: true })
                 }
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
               {errors.segment && (
                 <p className="text-sm text-destructive">{errors.segment.message}</p>
               )}
             </div>
 
             <div className="space-y-2">
               <Label>Trade Type *</Label>
               <Select
                 value={tradeTypeValue}
                 onValueChange={(val) =>
                   setValue("trade_type", val as any, { shouldDirty: true, shouldValidate: true })
                 }
               >
                 <SelectTrigger>
                   <SelectValue placeholder="BUY/SELL" />
                 </SelectTrigger>
                 <SelectContent>
                   {tradeTypes.map((type) => (
                     <SelectItem key={type} value={type}>
                       {type}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {errors.trade_type && (
                 <p className="text-sm text-destructive">{errors.trade_type.message}</p>
               )}
             </div>
           </div>
 
           {/* Symbol - Conditional based on segment */}
           {segment === "Options" ? (
             <OptionChainSelector onSelect={handleContractSelect} />
           ) : segment === "Futures" ? (
             <FuturesContractPicker onSelect={handleContractSelect} />
           ) : (
             <div className="space-y-2">
               <Label htmlFor="symbol">Symbol *</Label>
               <Input
                 id="symbol"
                 placeholder="e.g., RELIANCE, TATASTEEL"
                 {...register("symbol")}
               />
               {errors.symbol && (
                 <p className="text-sm text-destructive">{errors.symbol.message}</p>
               )}
             </div>
           )}
 
           {/* Entry Price & Timeframe */}
           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label htmlFor="entry_price">Entry Price *</Label>
               <Input
                 id="entry_price"
                 type="number"
                 step="0.01"
                 placeholder="2400.00"
                 {...register("entry_price", { valueAsNumber: true })}
               />
               {errors.entry_price && (
                 <p className="text-sm text-destructive">{errors.entry_price.message}</p>
               )}
             </div>
 
             <div className="space-y-2">
               <Label>Timeframe</Label>
               <Select
                 value={timeframeValue}
                 onValueChange={(val) =>
                   setValue("timeframe", val as any, { shouldDirty: true, shouldValidate: true })
                 }
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
 
           {/* Holding Period */}
           <div className="space-y-2">
             <Label htmlFor="holding_period">Expected Holding Period</Label>
             <Input
               id="holding_period"
               placeholder="e.g., Intraday, 2-3 days, Swing"
               {...register("holding_period")}
             />
           </div>
 
           {/* Stop Loss */}
           <div className="space-y-2">
             <Label htmlFor="stop_loss">Stop Loss</Label>
             <Input
               id="stop_loss"
               type="number"
               step="0.01"
               placeholder="2350.00"
               {...register("stop_loss", { valueAsNumber: true })}
             />
             {errors.stop_loss && (
               <p className="text-sm text-destructive">{errors.stop_loss.message}</p>
             )}
           </div>
 
           {/* Targets - Chip-based input with R:R preview */}
           <TargetChipsInput
             targets={targets}
             onTargetsChange={setTargets}
             entryPrice={entryPrice}
             stopLoss={stopLoss}
             tradeType={tradeType}
           />
 
           {/* Trailing Stop Loss Section */}
           <div className="space-y-3 p-4 rounded-lg bg-accent/50 border">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-profit" />
                 <Label htmlFor="trailing_sl" className="font-medium">
                   Trailing Stop Loss
                 </Label>
               </div>
               <Switch
                 id="trailing_sl"
                 checked={trailingSlEnabled}
                 onCheckedChange={(checked) => {
                   setTrailingSlEnabled(checked);
                   setValue("trailing_sl_enabled", checked, { shouldDirty: true, shouldValidate: true });
                 }}
               />
             </div>
 
             {trailingSlEnabled && (
               <div className="space-y-3 pt-2">
                 <div className="flex gap-2">
                   <Button
                     type="button"
                     variant={trailingSlType === "percent" ? "default" : "outline"}
                     size="sm"
                     onClick={() => setTrailingSlType("percent")}
                   >
                     Percentage
                   </Button>
                   <Button
                     type="button"
                     variant={trailingSlType === "points" ? "default" : "outline"}
                     size="sm"
                     onClick={() => setTrailingSlType("points")}
                   >
                     Points
                   </Button>
                 </div>
 
                 <div className="grid grid-cols-2 gap-3">
                   {trailingSlType === "percent" ? (
                     <div className="space-y-1">
                       <Label className="text-xs">Trail Distance (%)</Label>
                       <Input
                         type="number"
                         step="0.1"
                         placeholder="2.0"
                         {...register("trailing_sl_percent", { valueAsNumber: true })}
                       />
                     </div>
                   ) : (
                     <div className="space-y-1">
                       <Label className="text-xs">Trail Distance (Points)</Label>
                       <Input
                         type="number"
                         step="0.5"
                         placeholder="50"
                         {...register("trailing_sl_points", { valueAsNumber: true })}
                       />
                     </div>
                   )}
 
                   <div className="space-y-1">
                     <Label className="text-xs">Trigger Price (optional)</Label>
                     <Input
                       type="number"
                       step="0.01"
                       placeholder="Leave empty to start immediately"
                       {...register("trailing_sl_trigger_price", { valueAsNumber: true })}
                     />
                   </div>
                 </div>
 
                 <p className="text-xs text-muted-foreground">
                   TSL activates immediately if Trigger Price is empty.
                 </p>
               </div>
             )}
           </div>
 
           {/* Trade Tags - Searchable Picker */}
           <div className="space-y-3 p-4 rounded-lg bg-accent/50 border">
             <div className="flex items-center gap-2">
               <Tag className="w-4 h-4 text-primary" />
               <Label className="font-medium">Trade Tags</Label>
             </div>
             <TagSearchPicker
               groups={[
                 {
                   label: "Patterns",
                   color: "bg-blue-500/20 text-blue-400",
                   tags: availableTags.patterns,
                   selectedIds: selectedPatterns,
                   onToggle: togglePattern,
                 },
                 {
                   label: "Candlesticks",
                   color: "bg-amber-500/20 text-amber-400",
                   tags: availableTags.candlesticks,
                   selectedIds: selectedCandlesticks,
                   onToggle: toggleCandlestick,
                 },
                 {
                   label: "Volume",
                   color: "bg-purple-500/20 text-purple-400",
                   tags: availableTags.volumes,
                   selectedIds: selectedVolumes,
                   onToggle: toggleVolume,
                 },
                 {
                   label: "Mistakes",
                   color: "bg-red-500/20 text-red-400",
                   tags: availableTags.mistakes,
                   selectedIds: selectedMistakes,
                   onToggle: toggleMistake,
                 },
               ]}
             />
           </div>
 
           {/* Rating */}
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label>Setup Rating</Label>
               <span className="text-sm font-medium">{rating}/10</span>
             </div>
             <Slider
               value={[rating]}
               onValueChange={([val]) => {
                 setRating(val);
                 setValue("rating", val, { shouldDirty: true, shouldValidate: true });
               }}
               min={1}
               max={10}
               step={1}
             />
           </div>
 
           {/* Confidence */}
           <div className="space-y-2">
             <div className="flex items-center justify-between">
               <Label>Confidence Score</Label>
               <span className="text-sm font-medium">{confidence}/5</span>
             </div>
             <Slider
               value={[confidence]}
               onValueChange={([val]) => {
                 setConfidence(val);
                 setValue("confidence_score", val, { shouldDirty: true, shouldValidate: true });
               }}
               min={1}
               max={5}
               step={1}
             />
           </div>
 
           {/* Chart Images Upload */}
           <div className="space-y-2">
             <Label>Chart Images</Label>
             <ChartImageUpload
               images={chartImages}
               onImagesChange={setChartImages}
               bucket="trade-charts"
               maxImages={5}
             />
           </div>
 
           {/* Notes */}
           <div className="space-y-2">
             <Label htmlFor="notes">Notes / Setup Reason</Label>
             <Textarea
               id="notes"
               placeholder="Reason for entry, setup details, analysis..."
               rows={3}
               {...register("notes")}
             />
           </div>
 
           {/* Automation Controls - Near the Create button */}
           <TradeAutomationControls
             autoTrackEnabled={autoTrackEnabled}
             onAutoTrackChange={setAutoTrackEnabled}
             telegramPostEnabled={telegramPostEnabled}
             onTelegramPostChange={setTelegramPostEnabled}
           />
 
           {/* Actions */}
           <div className="flex justify-end gap-3 pt-4">
             <Button type="button" variant="outline" onClick={handleClose}>
               Cancel
             </Button>
             <Button type="submit" disabled={createTrade.isPending}>
               {createTrade.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
               Create Trade
             </Button>
           </div>
         </form>
       </DialogContent>
     </Dialog>
   );
 }