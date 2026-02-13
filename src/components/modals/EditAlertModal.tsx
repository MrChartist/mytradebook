import { useEffect } from "react";
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
import { Loader2, Send } from "lucide-react";
import {
  createAlertSchema,
  type CreateAlertInput,
  alertConditionTypes,
  alertRecurrenceTypes,
} from "@/lib/schemas";
import { useAlerts } from "@/hooks/useAlerts";
import type { Database } from "@/integrations/supabase/types";

type Alert = Database["public"]["Tables"]["alerts"]["Row"] & {
  notes?: string | null;
  telegram_enabled?: boolean | null;
  exchange?: string | null;
};

interface EditAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: Alert | null;
}

const conditionLabels: Record<string, string> = {
  PRICE_GT: "Price Above",
  PRICE_LT: "Price Below",
  PRICE_CROSS_ABOVE: "Price Crosses Above",
  PRICE_CROSS_BELOW: "Price Crosses Below",
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

export function EditAlertModal({ open, onOpenChange, alert }: EditAlertModalProps) {
  const { updateAlert } = useAlerts();

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

  // Reset form when alert changes
  useEffect(() => {
    if (alert) {
      form.reset({
        symbol: alert.symbol,
        condition_type: alert.condition_type,
        threshold: alert.threshold ?? undefined,
        recurrence: alert.recurrence ?? "ONCE",
        notes: alert.notes || "",
        telegram_enabled: alert.telegram_enabled || false,
        exchange: (alert.exchange as "NSE" | "NFO" | "MCX") || "NSE",
      });
    }
  }, [alert, form]);

  const onSubmit = async (data: CreateAlertInput) => {
    if (!alert) return;

    await updateAlert.mutateAsync({
      id: alert.id,
      symbol: data.symbol,
      condition_type: data.condition_type,
      threshold: data.threshold || null,
      recurrence: data.recurrence,
      notes: data.notes || null,
      telegram_enabled: data.telegram_enabled || false,
    });

    onOpenChange(false);
  };

  const selectedCondition = form.watch("condition_type");
  const isPercentCondition =
    selectedCondition === "PERCENT_CHANGE_GT" ||
    selectedCondition === "PERCENT_CHANGE_LT";
  const isVolumeCondition = selectedCondition === "VOLUME_SPIKE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Alert</DialogTitle>
          <DialogDescription>
            Modify the alert conditions for {alert?.symbol} ({alert?.exchange || "NSE"}).
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symbol</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., RELIANCE, NIFTY 50"
                      {...field}
                      className="uppercase"
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condition_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
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

            <FormField
              control={form.control}
              name="threshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isPercentCondition ? "Percentage (%)" : 
                     isVolumeCondition ? "Volume Threshold" : "Trigger Price (₹)"}
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
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="Why did you set this alert? (optional)"
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
                disabled={updateAlert.isPending}
              >
                {updateAlert.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
