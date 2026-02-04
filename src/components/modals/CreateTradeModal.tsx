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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChartImageUpload } from "@/components/ui/chart-image-upload";
import { createTradeSchema, type CreateTradeInput, marketSegments, tradeTypes, timeframes } from "@/lib/schemas";
import { useTrades } from "@/hooks/useTrades";
import { useAvailableTags } from "@/hooks/useAvailableTags";
import { Loader2, TrendingUp, Plus, X, Tag } from "lucide-react";

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
  
  // Selected tags (stored as IDs, linked after trade creation)
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [selectedCandlesticks, setSelectedCandlesticks] = useState<string[]>([]);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>([]);

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

  const segmentValue = segment ?? "";
  const tradeTypeValue = tradeType ?? "";
  const timeframeValue = timeframe ?? "";

  const onSubmit = async (data: CreateTradeInput) => {
    const targets = data.targets || [];
    
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
    });

    // Link selected tags to the new trade
    if (newTrade?.id) {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Link patterns
      if (selectedPatterns.length > 0) {
        await supabase.from("trade_patterns").insert(
          selectedPatterns.map((patternId) => ({
            trade_id: newTrade.id,
            pattern_id: patternId,
          }))
        );
      }
      
      // Link candlesticks
      if (selectedCandlesticks.length > 0) {
        await supabase.from("trade_candlesticks").insert(
          selectedCandlesticks.map((candlestickId) => ({
            trade_id: newTrade.id,
            candlestick_id: candlestickId,
          }))
        );
      }
      
      // Link volumes
      if (selectedVolumes.length > 0) {
        await supabase.from("trade_volume").insert(
          selectedVolumes.map((volumeId) => ({
            trade_id: newTrade.id,
            volume_id: volumeId,
          }))
        );
      }
      
      // Link mistakes
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

  // Helper to toggle tag selection
  const toggleTag = (
    id: string,
    selected: string[],
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((t) => t !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Research Trade</DialogTitle>
          <DialogDescription>
            Log a trade idea with entry, targets, SL, tags, and trailing stop loss.
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

          {/* Targets */}
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
                setValue("targets", values, { shouldDirty: true, shouldValidate: true });
              }}
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-3 p-4 rounded-lg bg-accent/50 border">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              <Label className="font-medium">Trade Tags</Label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Patterns */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Patterns</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {availableTags.patterns
                          .filter((p) => !selectedPatterns.includes(p.id))
                          .map((pattern) => (
                            <Button
                              key={pattern.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => toggleTag(pattern.id, selectedPatterns, setSelectedPatterns)}
                            >
                              {pattern.name}
                            </Button>
                          ))}
                        {availableTags.patterns.length === 0 && (
                          <p className="text-xs text-muted-foreground p-2">No patterns available</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedPatterns.map((id) => {
                    const pattern = availableTags.patterns.find((p) => p.id === id);
                    return pattern ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleTag(id, selectedPatterns, setSelectedPatterns)}
                      >
                        {pattern.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                  {selectedPatterns.length === 0 && (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>

              {/* Candlesticks */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Candlesticks</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {availableTags.candlesticks
                          .filter((c) => !selectedCandlesticks.includes(c.id))
                          .map((cs) => (
                            <Button
                              key={cs.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => toggleTag(cs.id, selectedCandlesticks, setSelectedCandlesticks)}
                            >
                              {cs.name}
                            </Button>
                          ))}
                        {availableTags.candlesticks.length === 0 && (
                          <p className="text-xs text-muted-foreground p-2">No candlesticks available</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedCandlesticks.map((id) => {
                    const cs = availableTags.candlesticks.find((c) => c.id === id);
                    return cs ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleTag(id, selectedCandlesticks, setSelectedCandlesticks)}
                      >
                        {cs.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                  {selectedCandlesticks.length === 0 && (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Volume</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {availableTags.volumes
                          .filter((v) => !selectedVolumes.includes(v.id))
                          .map((vol) => (
                            <Button
                              key={vol.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => toggleTag(vol.id, selectedVolumes, setSelectedVolumes)}
                            >
                              {vol.name}
                            </Button>
                          ))}
                        {availableTags.volumes.length === 0 && (
                          <p className="text-xs text-muted-foreground p-2">No volume tags available</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedVolumes.map((id) => {
                    const vol = availableTags.volumes.find((v) => v.id === id);
                    return vol ? (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-destructive/20"
                        onClick={() => toggleTag(id, selectedVolumes, setSelectedVolumes)}
                      >
                        {vol.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                  {selectedVolumes.length === 0 && (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>

              {/* Mistakes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Mistakes</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2 max-h-48 overflow-y-auto">
                      <div className="space-y-1">
                        {availableTags.mistakes
                          .filter((m) => !selectedMistakes.includes(m.id))
                          .map((mistake) => (
                            <Button
                              key={mistake.id}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => toggleTag(mistake.id, selectedMistakes, setSelectedMistakes)}
                            >
                              {mistake.name}
                            </Button>
                          ))}
                        {availableTags.mistakes.length === 0 && (
                          <p className="text-xs text-muted-foreground p-2">No mistakes available</p>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedMistakes.map((id) => {
                    const mistake = availableTags.mistakes.find((m) => m.id === id);
                    return mistake ? (
                      <Badge
                        key={id}
                        variant="destructive"
                        className="text-xs cursor-pointer"
                        onClick={() => toggleTag(id, selectedMistakes, setSelectedMistakes)}
                      >
                        {mistake.name}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ) : null;
                  })}
                  {selectedMistakes.length === 0 && (
                    <span className="text-xs text-muted-foreground">None selected</span>
                  )}
                </div>
              </div>
            </div>
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
