import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Loader2, AlertCircle, Send, Bell, Webhook, ChevronDown,
  Zap, Clock, CalendarClock, TestTube,
} from "lucide-react";
import {
  createAlertSchema, type CreateAlertInput, alertConditionTypes, alertRecurrenceTypes,
} from "@/lib/schemas";
import { useAlerts } from "@/hooks/useAlerts";
import { InstrumentPicker, type SelectedInstrument } from "@/components/trade/InstrumentPicker";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface CreateAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const conditionLabels: Record<string, { label: string; desc: string }> = {
  PRICE_GT: { label: "Price Above", desc: "Triggers when LTP exceeds threshold" },
  PRICE_LT: { label: "Price Below", desc: "Triggers when LTP drops below threshold" },
  PRICE_CROSS_ABOVE: { label: "Price Crosses Above", desc: "Triggers when price crosses above threshold (was below, now above)" },
  PRICE_CROSS_BELOW: { label: "Price Crosses Below", desc: "Triggers when price crosses below threshold (was above, now below)" },
  PERCENT_CHANGE_GT: { label: "Day % Change Above", desc: "(LTP - PrevClose) / PrevClose × 100 > X%" },
  PERCENT_CHANGE_LT: { label: "Day % Change Below", desc: "(LTP - PrevClose) / PrevClose × 100 < -X%" },
  VOLUME_SPIKE: { label: "Volume Spike", desc: "Current volume >= Multiplier × Avg volume" },
  CUSTOM: { label: "Custom", desc: "Custom condition" },
};

const recurrenceLabels: Record<string, string> = {
  ONCE: "One-time (triggers once, then deactivates)",
  DAILY: "Daily (resets each day)",
  CONTINUOUS: "Continuous (every time condition met)",
};

const cooldownOptions = [
  { value: 0, label: "No cooldown" },
  { value: 5, label: "5 min" },
  { value: 15, label: "15 min" },
  { value: 60, label: "1 hour" },
  { value: 1440, label: "1 day" },
];

const expiryOptions = [
  { value: "", label: "No expiry" },
  { value: "eod", label: "End of day" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "custom", label: "Custom date" },
];

// Quick LTP offset buttons
const ltpOffsets = [
  { label: "LTP", offset: 0 },
  { label: "+0.5%", offset: 0.005 },
  { label: "+1%", offset: 0.01 },
  { label: "+2%", offset: 0.02 },
  { label: "-0.5%", offset: -0.005 },
  { label: "-1%", offset: -0.01 },
  { label: "-2%", offset: -0.02 },
];

export function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
  const { createAlert } = useAlerts();
  const [selectedInstrument, setSelectedInstrument] = useState<SelectedInstrument | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(15);
  const [activeHoursOnly, setActiveHoursOnly] = useState(true);
  const [expiryMode, setExpiryMode] = useState("");
  const [customExpiry, setCustomExpiry] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [deliveryInApp, setDeliveryInApp] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [testingTrigger, setTestingTrigger] = useState(false);
  const [liveLtp, setLiveLtp] = useState<number | null>(null);

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
    // Set live LTP if available
    if (instrument.ltp) {
      setLiveLtp(instrument.ltp);
    }
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

  // Compute expiry date
  const computeExpiry = (): string | undefined => {
    if (!expiryMode || expiryMode === "") return undefined;
    const now = new Date();
    if (expiryMode === "eod") {
      const eod = new Date(now);
      eod.setHours(15, 30, 0, 0); // IST market close
      return eod.toISOString();
    }
    if (expiryMode === "7d") {
      now.setDate(now.getDate() + 7);
      return now.toISOString();
    }
    if (expiryMode === "30d") {
      now.setDate(now.getDate() + 30);
      return now.toISOString();
    }
    if (expiryMode === "custom" && customExpiry) {
      return new Date(customExpiry).toISOString();
    }
    return undefined;
  };

  const handleQuickLtp = (offset: number) => {
    if (!liveLtp) return;
    const price = Math.round(liveLtp * (1 + offset) * 100) / 100;
    form.setValue("threshold", price, { shouldValidate: true });
  };

  const handleTestTrigger = async () => {
    if (!selectedInstrument) {
      toast.error("Select an instrument first");
      return;
    }
    setTestingTrigger(true);
    try {
      const conditionType = form.getValues("condition_type");
      const threshold = form.getValues("threshold");
      const notes = form.getValues("notes");
      const telegramEnabled = form.getValues("telegram_enabled");

      if (telegramEnabled) {
        // Send a test telegram notification
        const { error } = await supabase.functions.invoke("telegram-notify", {
          body: {
            type: "test_alert",
            data: {
              symbol: selectedInstrument.symbol,
              exchange: selectedInstrument.exchange,
              condition_type: conditionType,
              threshold,
              notes: notes || "Test trigger from alert creation",
              ltp: liveLtp || threshold,
            },
          },
        });
        if (error) throw error;
        toast.success("Test notification sent to Telegram!");
      } else {
        toast.success(`Test trigger: ${selectedInstrument.symbol} ${conditionLabels[conditionType]?.label} ${threshold}`);
      }
    } catch (err) {
      toast.error("Test trigger failed");
      console.error(err);
    } finally {
      setTestingTrigger(false);
    }
  };

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
        expires_at: computeExpiry() || null,
        notes: data.notes || null,
        telegram_enabled: data.telegram_enabled || false,
        instrument_id: selectedInstrument.security_id || undefined,
        exchange: data.exchange || "NSE",
        exchange_segment: selectedInstrument.exchange_segment,
        security_id: selectedInstrument.security_id || undefined,
        // V2 fields
        cooldown_minutes: cooldown,
        active_hours_only: activeHoursOnly,
        webhook_enabled: webhookEnabled,
        delivery_in_app: deliveryInApp,
      } as any);

      handleClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create alert";
      setSubmitError(message);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedInstrument(null);
    setSubmitError(null);
    setCooldown(15);
    setActiveHoursOnly(true);
    setExpiryMode("");
    setCustomExpiry("");
    setWebhookEnabled(false);
    setDeliveryInApp(true);
    setAdvancedOpen(false);
    setLiveLtp(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Alert</DialogTitle>
          <DialogDescription>
            Get notified when price or market conditions are met.
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
              showLtpFetch={true}
            />

            {/* Live context panel */}
            {selectedInstrument && liveLtp && (
              <div className="rounded-lg border border-border bg-accent/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-medium">{selectedInstrument.symbol}</span>
                  </div>
                  <span className="text-sm font-mono font-bold">₹{liveLtp.toLocaleString()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ltpOffsets.map((o) => (
                    <Button
                      key={o.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[10px] font-mono"
                      onClick={() => handleQuickLtp(o.offset)}
                    >
                      {o.label} {o.offset !== 0 && `(₹${(liveLtp * (1 + o.offset)).toFixed(0)})`}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Condition Type - as chips */}
            <div className="space-y-2">
              <FormLabel>Condition *</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {alertConditionTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={selectedCondition === type ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => form.setValue("condition_type", type, { shouldValidate: true })}
                  >
                    {conditionLabels[type]?.label || type}
                  </Badge>
                ))}
              </div>
              {conditionLabels[selectedCondition] && (
                <p className="text-[10px] text-muted-foreground">{conditionLabels[selectedCondition].desc}</p>
              )}
            </div>

            {/* Threshold */}
            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isPriceCondition ? "Trigger Price (₹) *" :
                      isPercentCondition ? "% Threshold *" :
                        isVolumeCondition ? "Volume Multiplier (e.g. 2x) *" : "Value *"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={isPriceCondition ? "e.g., 2500.00" : isPercentCondition ? "e.g., 2.5" : "e.g., 3"}
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : parseFloat(val));
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  {thresholdError && <p className="text-sm text-destructive">{thresholdError}</p>}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurrence + Cooldown row */}
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="recurrence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trigger Mode</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {alertRecurrenceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "ONCE" ? "One-time" : type === "DAILY" ? "Daily" : "Continuous"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Cooldown
                </FormLabel>
                <Select value={String(cooldown)} onValueChange={(v) => setCooldown(Number(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cooldownOptions.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason / Note</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why this alert matters... (shown in Telegram notification)"
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

            {/* Delivery Channels */}
            <div className="space-y-3 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Delivery Channels</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">In-app notification</span>
                </div>
                <Switch checked={deliveryInApp} onCheckedChange={setDeliveryInApp} />
              </div>

              <FormField
                control={form.control}
                name="telegram_enabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4 text-primary" />
                      <span className="text-sm">Telegram</span>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Webhook</span>
                  <Badge variant="outline" className="text-[9px] h-4">Soon</Badge>
                </div>
                <Switch checked={webhookEnabled} onCheckedChange={setWebhookEnabled} disabled />
              </div>
            </div>

            {/* Advanced: Expiry + Active Hours */}
            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="w-full justify-between">
                  <span className="text-sm text-muted-foreground">Advanced (Expiry, Active Hours)</span>
                  <ChevronDown className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-180")} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <FormLabel className="flex items-center gap-1">
                      <CalendarClock className="w-3 h-3" /> Expiry
                    </FormLabel>
                    <Select value={expiryMode} onValueChange={setExpiryMode}>
                      <SelectTrigger>
                        <SelectValue placeholder="No expiry" />
                      </SelectTrigger>
                      <SelectContent>
                        {expiryOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {expiryMode === "custom" && (
                      <Input
                        type="datetime-local"
                        value={customExpiry}
                        onChange={(e) => setCustomExpiry(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <FormLabel>Active Hours</FormLabel>
                    <div className="flex items-center justify-between rounded-lg border p-2.5">
                      <span className="text-xs">Market hours only</span>
                      <Switch checked={activeHoursOnly} onCheckedChange={setActiveHoursOnly} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">09:15 – 15:30 IST</p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestTrigger}
                disabled={testingTrigger || !selectedInstrument}
              >
                {testingTrigger ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <TestTube className="w-3.5 h-3.5 mr-1" />}
                Test Trigger
              </Button>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" disabled={!canSubmit}>
                  {createAlert.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Create Alert
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
