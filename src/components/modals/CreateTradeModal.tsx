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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createTradeSchema, type CreateTradeInput, marketSegments, tradeTypes } from "@/lib/schemas";
import { useTrades } from "@/hooks/useTrades";
import { Loader2 } from "lucide-react";

interface CreateTradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTradeModal({ open, onOpenChange }: CreateTradeModalProps) {
  const { createTrade } = useTrades();
  const [rating, setRating] = useState(8);
  const [confidence, setConfidence] = useState(3);

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
    },
  });

  const segment = watch("segment");
  const tradeType = watch("trade_type");

  const onSubmit = async (data: CreateTradeInput) => {
    // Parse targets from comma-separated string
    const targets = data.targets || [];
    
    await createTrade.mutateAsync({
      symbol: data.symbol,
      segment: data.segment,
      trade_type: data.trade_type,
      quantity: data.quantity,
      entry_price: data.entry_price,
      stop_loss: data.stop_loss,
      targets: targets,
      rating: data.rating,
      confidence_score: data.confidence_score,
      notes: data.notes,
      study_id: data.study_id,
      status: "OPEN",
      entry_time: new Date().toISOString(),
    });

    reset();
    onOpenChange(false);
  };

  const segmentLabels: Record<string, string> = {
    Equity_Intraday: "Equity Intraday",
    Equity_Positional: "Equity Positional",
    Futures: "Futures",
    Options: "Options",
    Commodities: "Commodities",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trade</DialogTitle>
          <DialogDescription>
            Log a new trade with entry details and risk parameters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Symbol */}
          <div className="space-y-2">
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              placeholder="e.g., RELIANCE, NIFTY 24FEB 22000CE"
              {...register("symbol")}
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          {/* Segment & Trade Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Segment *</Label>
              <Select
                value={segment}
                onValueChange={(val) => setValue("segment", val as any)}
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
                value={tradeType}
                onValueChange={(val) => setValue("trade_type", val as any)}
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

          {/* Quantity & Entry Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="100"
                {...register("quantity", { valueAsNumber: true })}
              />
              {errors.quantity && (
                <p className="text-sm text-destructive">{errors.quantity.message}</p>
              )}
            </div>

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

          {/* Targets - simple text for now, parsed as numbers */}
          <div className="space-y-2">
            <Label htmlFor="targets">Targets (comma-separated)</Label>
            <Input
              id="targets"
              placeholder="2500, 2600, 2700"
              onChange={(e) => {
                const values = e.target.value
                  .split(",")
                  .map((v) => parseFloat(v.trim()))
                  .filter((v) => !isNaN(v));
                setValue("targets", values);
              }}
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Rating (min 8)</Label>
              <span className="text-sm font-medium">{rating}/10</span>
            </div>
            <Slider
              value={[rating]}
              onValueChange={([val]) => {
                setRating(val);
                setValue("rating", val);
              }}
              min={1}
              max={10}
              step={1}
            />
            {errors.rating && (
              <p className="text-sm text-destructive">{errors.rating.message}</p>
            )}
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
                setValue("confidence_score", val);
              }}
              min={1}
              max={5}
              step={1}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Reason for entry, setup details..."
              {...register("notes")}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTrade.isPending}>
              {createTrade.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Trade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
