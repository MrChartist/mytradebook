import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import {
  createAlertSchema,
  type CreateAlertInput,
  alertConditionTypes,
  alertRecurrenceTypes,
} from "@/lib/schemas";
import { useAlerts } from "@/hooks/useAlerts";

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
  ONCE: "One-time",
  DAILY: "Daily",
  CONTINUOUS: "Continuous",
};

export function CreateAlertModal({ open, onOpenChange }: CreateAlertModalProps) {
  const { createAlert } = useAlerts();

  const form = useForm<CreateAlertInput>({
    resolver: zodResolver(createAlertSchema),
    defaultValues: {
      symbol: "",
      condition_type: "PRICE_GT",
      threshold: 0,
      recurrence: "ONCE",
    },
  });

  const onSubmit = async (data: CreateAlertInput) => {
    await createAlert.mutateAsync({
      symbol: data.symbol,
      condition_type: data.condition_type,
      threshold: data.threshold,
      recurrence: data.recurrence,
      expires_at: data.expires_at || null,
    });

    form.reset();
    onOpenChange(false);
  };

  const selectedCondition = form.watch("condition_type");
  const isPercentCondition =
    selectedCondition === "PERCENT_CHANGE_GT" ||
    selectedCondition === "PERCENT_CHANGE_LT";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Alert</DialogTitle>
          <DialogDescription>
            Get notified when a price or condition is met.
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                    {isPercentCondition ? "Percentage (%)" : "Price (₹)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step={isPercentCondition ? "0.1" : "0.01"}
                      placeholder={isPercentCondition ? "e.g., 2.5" : "e.g., 2500"}
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                disabled={createAlert.isPending}
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
