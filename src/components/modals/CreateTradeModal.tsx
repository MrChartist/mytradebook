import { useState, useCallback, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTradeSchema, type CreateTradeInput, marketSegments, tradeTypes, timeframes } from "@/lib/schemas";
import { useTrades } from "@/hooks/useTrades";
import { Loader2, AlertCircle, Zap, ChevronDown, TrendingUp, Shield, Target, FileText, Send, Radio, Activity, Link as LinkIcon } from "lucide-react";
import { TargetChipsInput } from "@/components/trade/TargetChipsInput";
import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
import { PositionSizingCalculator } from "@/components/trade/PositionSizingCalculator";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useUserSettings } from "@/hooks/useUserSettings";
import { cn } from "@/lib/utils";
import { TradingRulesChecklist } from "@/components/trade/TradingRulesChecklist";

interface CreateTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const segmentLabels: Record<string, string> = {
  Equity_Intraday: "Equity – Intraday & Short Term",
  Equity_Positional: "Equity – Positional & Investment",
  Futures: "Futures Trade",
  Options: "Options Trade",
  Commodities: "MCX / Commodity Trade",
};

const timeframeLabels: Record<string, string> = {
  "1min": "1 Min", "5min": "5 Min", "15min": "15 Min", "30min": "30 Min",
  "1H": "1 Hour", "4H": "4 Hour", "1D": "Daily", "1W": "Weekly",
};

const holdingPeriodOptions = [
  { value: "intraday", label: "Intraday (Same Day)" },
  { value: "1-5days", label: "1–5 Days (Swing)" },
  { value: "1-4weeks", label: "1–4 Weeks" },
  { value: "1-3months", label: "1–3 Months" },
  { value: "3-6months", label: "3–6 Months" },
  { value: "6months+", label: "6+ Months (Positional)" },
];

const trailingSlMethods = [
  { value: "fixed_percent", label: "Fixed % Trail" },
  { value: "fixed_points", label: "Fixed Points Trail" },
  { value: "step_trail", label: "Step Trail (+X → move SL +Y)" },
  { value: "cost_after_t1", label: "Move SL to Cost after T1" },
];

const trailingSlActivation = [
  { value: "immediate", label: "Start immediately" },
  { value: "after_percent", label: "After price moves +X%" },
  { value: "after_t1", label: "After T1 hit" },
];

const noteTemplates: { label: string; template: string }[] = [
  {
    label: "Trade Plan",
    template: `**Setup:** \n**Trigger:** \n**Entry:** \n**SL:** \n**Targets:** \n**Risk Plan:** \n**Management:**`,
  },
  {
    label: "Quick Notes",
    template: `**Why this trade:** \n**Key levels:** \n**Invalidation:** \n**Exit plan:**`,
  },
  {
    label: "Post-Trade",
    template: `**What worked:** \n**What failed:** \n**Lessons:** \n**Would I take this again:**`,
  },
];

// Segment-driven defaults
function getSegmentDefaults(segment: string) {
  switch (segment) {
    case "Equity_Intraday":
      return { holdingPeriod: "intraday", trailingEnabled: true, telegramEnabled: true, autoTrack: true };
    case "Equity_Positional":
      return { holdingPeriod: "1-4weeks", trailingEnabled: false, telegramEnabled: true, autoTrack: true };
    case "Futures":
      return { holdingPeriod: "1-5days", trailingEnabled: true, telegramEnabled: true, autoTrack: true };
    case "Options":
      return { holdingPeriod: "intraday", trailingEnabled: false, telegramEnabled: true, autoTrack: true };
    case "Commodities":
      return { holdingPeriod: "1-5days", trailingEnabled: true, telegramEnabled: true, autoTrack: true };
    default:
      return { holdingPeriod: "", trailingEnabled: false, telegramEnabled: false, autoTrack: false };
  }
}

export function CreateTradeModal({ open, onOpenChange }: CreateTradeModalProps) {
  const { createTrade } = useTrades();
  const { settings } = useUserSettings();
  const startingCapital = (settings as any)?.starting_capital ?? 500000;
  
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
  const [targets, setTargets] = useState<number[]>([]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [isFetchingLtp, setIsFetchingLtp] = useState(false);
  
  // Automation
  const [autoTrackEnabled, setAutoTrackEnabled] = useState(false);
  const [telegramPostEnabled, setTelegramPostEnabled] = useState(false);
  
  // Trailing SL
  const [trailingSlEnabled, setTrailingSlEnabled] = useState(false);
  const [trailingSlMethod, setTrailingSlMethod] = useState("fixed_percent");
  const [trailingSlActivationRule, setTrailingSlActivationRule] = useState("immediate");
  
  // SL invalidation note
  const [slInvalidationNote, setSlInvalidationNote] = useState("");
  
  // Pre-trade checklist
  const [checkedRules, setCheckedRules] = useState<Set<string>>(new Set());
  const [chartLink, setChartLink] = useState("");

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
  const quantity = watch("quantity") || 1;
  const notes = watch("notes") || "";

  // Apply segment defaults when segment changes
  useEffect(() => {
    if (!segment) return;
    const defaults = getSegmentDefaults(segment);
    setValue("holding_period", defaults.holdingPeriod);
    setTrailingSlEnabled(defaults.trailingEnabled);
    setTelegramPostEnabled(defaults.telegramEnabled);
    setAutoTrackEnabled(defaults.autoTrack);
  }, [segment, setValue]);

  // Risk calculations
  const riskCalc = (() => {
    const entry = Number(entryPrice);
    const sl = Number(stopLoss);
    const qty = Number(quantity) || 1;
    if (!entry || !sl || entry <= 0 || sl <= 0) return null;
    
    const isBuy = tradeType === "BUY";
    const slPoints = isBuy ? entry - sl : sl - entry;
    const slPercent = (slPoints / entry) * 100;
    const riskAmount = slPoints * qty;
    
    return {
      slPoints: Math.abs(slPoints).toFixed(2),
      slPercent: slPercent.toFixed(2),
      riskAmount: Math.abs(riskAmount).toFixed(0),
      isValid: isBuy ? sl < entry : sl > entry,
    };
  })();

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

    // Append SL invalidation note to notes
    let finalNotes = data.notes?.trim() || "";
    if (slInvalidationNote.trim()) {
      finalNotes += `\n\n**SL Reason:** ${slInvalidationNote.trim()}`;
    }

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
        notes: finalNotes || null,
        status: tradeStatus,
        entry_time: new Date().toISOString(),
        timeframe: data.timeframe || null,
        holding_period: data.holding_period?.trim() || null,
        trailing_sl_enabled: trailingSlEnabled,
        trailing_sl_percent: trailingSlMethod === "fixed_percent" ? toNumberOrNull(data.trailing_sl_percent) : null,
        trailing_sl_points: trailingSlMethod === "fixed_points" || trailingSlMethod === "step_trail" ? toNumberOrNull(data.trailing_sl_points) : null,
        trailing_sl_trigger_price: trailingSlActivationRule === "after_percent" ? toNumberOrNull(data.trailing_sl_trigger_price) : null,
        auto_track_enabled: autoTrackEnabled,
        telegram_post_enabled: telegramPostEnabled,
        chart_link: chartLink.trim() || null,
        security_id: selectedInstrument?.security_id || null,
        exchange_segment: selectedInstrument?.exchange_segment || null,
        rating: toNumberOrNull(data.rating),
        confidence_score: toNumberOrNull(data.confidence_score),
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
    setTrailingSlMethod("fixed_percent");
    setTrailingSlActivationRule("immediate");
    setSlInvalidationNote("");
    setCheckedRules(new Set());
    setChartLink("");
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
    if (instrument.lot_size) {
      setValue("quantity", instrument.lot_size, { shouldValidate: true });
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

  const insertNoteTemplate = (template: string) => {
    const current = notes;
    const newNotes = current ? `${current}\n\n${template}` : template;
    setValue("notes", newNotes);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
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
                    <SelectItem key={type} value={type}>{type === "BUY" ? "BUY (Long)" : "SELL (Short)"}</SelectItem>
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

          {/* Entry Price with Fetch LTP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="entry_price">Entry Price</Label>
              <div className="flex items-center gap-1">
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
                    <span className="ml-1">Use LTP</span>
                  </Button>
                )}
              </div>
            </div>
            <Input
              id="entry_price"
              type="number"
              step="0.01"
              placeholder="Optional — leave blank for PENDING status"
              {...register("entry_price", { valueAsNumber: true })}
            />
          </div>

          {/* Stop Loss with Risk Math */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="stop_loss" className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-loss" />
                Stop Loss
              </Label>
              {riskCalc && (
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "px-1.5 py-0.5 rounded",
                    riskCalc.isValid ? "bg-loss/10 text-loss" : "bg-destructive/10 text-destructive"
                  )}>
                    {riskCalc.slPercent}%
                  </span>
                  <span className="text-muted-foreground">
                    {riskCalc.slPoints} pts
                  </span>
                  <span className="font-medium text-loss">
                    Risk: ₹{Number(riskCalc.riskAmount).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
            <Input
              id="stop_loss"
              type="number"
              step="0.01"
              placeholder="Optional"
              {...register("stop_loss", { valueAsNumber: true })}
            />
            {riskCalc && !riskCalc.isValid && (
              <p className="text-xs text-destructive">
                ⚠ SL should be {tradeType === "BUY" ? "below" : "above"} entry price for {tradeType}
              </p>
            )}
            {/* SL Invalidation Note */}
            <Input
              placeholder="Why this SL? (e.g., below swing low, below support)"
              value={slInvalidationNote}
              onChange={(e) => setSlInvalidationNote(e.target.value)}
              className="text-xs h-8"
            />
          </div>

          {/* Timeframe & Quantity */}
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity / Lots</Label>
              <Input
                id="quantity"
                type="number"
                step="1"
                min="1"
                placeholder="1"
                {...register("quantity", { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Position Sizing Calculator */}
          <PositionSizingCalculator
            entryPrice={entryPrice}
            stopLoss={stopLoss}
            tradeType={tradeType}
            accountSize={startingCapital}
            onQuantitySuggested={(qty) => setValue("quantity", qty, { shouldValidate: true })}
          />

          {/* Targets */}
          <TargetChipsInput
            targets={targets}
            onTargetsChange={setTargets}
            entryPrice={entryPrice}
            stopLoss={stopLoss}
            tradeType={tradeType}
            quantity={quantity}
          />

          {/* Trailing Stop Loss */}
          <div className="space-y-3 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-profit" />
                <Label className="text-sm font-medium">Trailing Stop Loss</Label>
              </div>
              <Switch
                checked={trailingSlEnabled}
                onCheckedChange={setTrailingSlEnabled}
              />
            </div>

            {trailingSlEnabled && (
              <div className="space-y-3 pt-2 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Method</Label>
                    <Select value={trailingSlMethod} onValueChange={setTrailingSlMethod}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trailingSlMethods.map((m) => (
                          <SelectItem key={m.value} value={m.value} className="text-xs">
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Activation</Label>
                    <Select value={trailingSlActivationRule} onValueChange={setTrailingSlActivationRule}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {trailingSlActivation.map((a) => (
                          <SelectItem key={a.value} value={a.value} className="text-xs">
                            {a.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Method-specific inputs */}
                {trailingSlMethod === "fixed_percent" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Trail by %</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 1.5" className="h-8"
                      {...register("trailing_sl_percent", { valueAsNumber: true })} />
                  </div>
                )}
                {(trailingSlMethod === "fixed_points" || trailingSlMethod === "step_trail") && (
                  <div className="space-y-1">
                    <Label className="text-xs">Trail by Points</Label>
                    <Input type="number" step="0.5" placeholder="e.g. 20" className="h-8"
                      {...register("trailing_sl_points", { valueAsNumber: true })} />
                  </div>
                )}
                {trailingSlActivationRule === "after_percent" && (
                  <div className="space-y-1">
                    <Label className="text-xs">Trigger after price moves +%</Label>
                    <Input type="number" step="0.1" placeholder="e.g. 2.0" className="h-8"
                      {...register("trailing_sl_trigger_price", { valueAsNumber: true })} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Chart Link */}
          <div className="space-y-2">
            <Label htmlFor="chart_link" className="flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-primary" />
              Chart Link
            </Label>
            <Input
              id="chart_link"
              type="url"
              placeholder="Paste TradingView / chart URL (optional)"
              value={chartLink}
              onChange={(e) => setChartLink(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Automation Controls */}
          <div className="space-y-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Activity className="w-3.5 h-3.5" />
              Automation & Notifications
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer",
                  autoTrackEnabled ? "bg-profit/10 border-profit/30" : "bg-muted/50 border-border hover:border-profit/30"
                )}
                onClick={() => setAutoTrackEnabled(!autoTrackEnabled)}
              >
                <div className="flex items-center gap-2">
                  <Radio className={cn("w-3.5 h-3.5", autoTrackEnabled ? "text-profit" : "text-muted-foreground")} />
                  <span className="text-xs font-medium">Auto Track</span>
                </div>
                <Switch checked={autoTrackEnabled} onCheckedChange={setAutoTrackEnabled}
                  onClick={(e) => e.stopPropagation()} className="scale-75" />
              </div>
              <div
                className={cn(
                  "flex items-center justify-between p-2.5 rounded-lg border transition-colors cursor-pointer",
                  telegramPostEnabled ? "bg-primary/10 border-primary/30" : "bg-muted/50 border-border hover:border-primary/30"
                )}
                onClick={() => setTelegramPostEnabled(!telegramPostEnabled)}
              >
                <div className="flex items-center gap-2">
                  <Send className={cn("w-3.5 h-3.5", telegramPostEnabled ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs font-medium">Telegram</span>
                </div>
                <Switch checked={telegramPostEnabled} onCheckedChange={setTelegramPostEnabled}
                  onClick={(e) => e.stopPropagation()} className="scale-75" />
              </div>
            </div>
          </div>

          {/* Advanced Section */}
          <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="w-full justify-between">
                <span className="text-sm text-muted-foreground">More Options (Holding, Rating, Notes)</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-2">
              {/* Holding Period */}
              <div className="space-y-2">
                <Label>Expected Holding Period</Label>
                <Select
                  value={watch("holding_period") ?? ""}
                  onValueChange={(val) => setValue("holding_period", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select holding period" />
                  </SelectTrigger>
                  <SelectContent>
                    {holdingPeriodOptions.map((hp) => (
                      <SelectItem key={hp.value} value={hp.value}>{hp.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating & Confidence */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Setup Rating (1–10)</Label>
                  <Input id="rating" type="number" min="1" max="10" step="1" placeholder="Optional"
                    {...register("rating", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence (1–5)</Label>
                  <Input id="confidence" type="number" min="1" max="5" step="1" placeholder="Optional"
                    {...register("confidence_score", { valueAsNumber: true })} />
                </div>
              </div>

              {/* Structured Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notes" className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Notes / Thesis
                  </Label>
                  <div className="flex gap-1">
                    {noteTemplates.map((tmpl) => (
                      <Button
                        key={tmpl.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => insertNoteTemplate(tmpl.template)}
                      >
                        {tmpl.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <Textarea
                  id="notes"
                  placeholder="Trade thesis, setup context, risk plan..."
                  className="resize-none min-h-[100px] text-sm"
                  rows={5}
                  {...register("notes")}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Pre-Trade Rules Checklist */}
          <TradingRulesChecklist
            checkedRules={checkedRules}
            onToggleCheck={(id) => {
              setCheckedRules((prev) => {
                const next = new Set(prev);
                next.has(id) ? next.delete(id) : next.add(id);
                return next;
              });
            }}
          />

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
