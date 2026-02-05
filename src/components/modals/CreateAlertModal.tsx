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
 import { Loader2, AlertCircle, Send } from "lucide-react";
 import {
   createAlertSchema,
   type CreateAlertInput,
   alertConditionTypes,
   alertRecurrenceTypes,
 } from "@/lib/schemas";
 import { useAlerts } from "@/hooks/useAlerts";
 import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
 
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
   const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
   const [submitError, setSubmitError] = useState<string | null>(null);
 
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
 
   const handleInstrumentSelect = (instrument: SelectedInstrument) => {
     setSelectedInstrument(instrument);
     form.setValue("symbol", instrument.symbol);
     form.setValue("exchange", instrument.exchange as "NSE" | "NFO" | "MCX");
     form.setValue("instrument_id", instrument.security_id || undefined);
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
         instrument_id: selectedInstrument.security_id || undefined,
         exchange: data.exchange || "NSE",
         exchange_segment: selectedInstrument.exchange_segment,
         security_id: selectedInstrument.security_id || undefined,
       });
 
       form.reset();
       setSelectedInstrument(null);
       onOpenChange(false);
     } catch (error) {
       const message = error instanceof Error ? error.message : "Failed to create alert";
       setSubmitError(message);
     }
   };
 
   const handleClose = () => {
     form.reset();
     setSelectedInstrument(null);
     setSubmitError(null);
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
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
 
             {/* Instrument Picker */}
             <InstrumentPicker
               onSelect={handleInstrumentSelect}
               showLtpFetch={false}
             />
 
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
                 onClick={handleClose}
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