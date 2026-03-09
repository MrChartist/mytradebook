import { useState } from "react";
import { Filter, X, Calendar as CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export interface AdvancedFilters {
  dateFrom?: Date;
  dateTo?: Date;
  pnlMin?: number;
  pnlMax?: number;
  holdingPeriod?: string;
  emotionTag?: string;
  confidenceMin?: number;
  confidenceMax?: number;
  timeframe?: string;
}

const EMOTION_OPTIONS = [
  "Confident", "Fearful", "Greedy", "FOMO", "Revenge", "Calm", "Anxious", "Euphoric", "Disciplined",
];

const HOLDING_PERIODS = [
  { value: "scalp", label: "Scalp (<15m)" },
  { value: "intraday", label: "Intraday" },
  { value: "swing", label: "Swing (2-5d)" },
  { value: "positional", label: "Positional (>5d)" },
];

const TIMEFRAMES = [
  "1min", "5min", "15min", "30min", "1H", "4H", "1D", "1W",
];

interface AdvancedTradeFiltersProps {
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
  onClear: () => void;
}

export function AdvancedTradeFilters({ filters, onChange, onClear }: AdvancedTradeFiltersProps) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length;

  const updateFilter = <K extends keyof AdvancedFilters>(key: K, value: AdvancedFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "gap-1.5 h-8 text-xs",
            activeCount > 0 && "border-primary/30 text-primary bg-primary/5"
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {activeCount > 0 && (
            <Badge className="h-4 px-1 text-[9px] bg-primary text-primary-foreground rounded-full">
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold">Advanced Filters</h4>
            {activeCount > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground" onClick={() => { onClear(); }}>
                Clear all
              </Button>
            )}
          </div>
        </div>

        <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
          {/* Date Range */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Date Range</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] justify-start gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    {filters.dateFrom ? format(filters.dateFrom, "dd MMM") : "From"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={(d) => updateFilter("dateFrom", d)}
                    disabled={(d) => d > new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] justify-start gap-1.5">
                    <CalendarIcon className="w-3 h-3" />
                    {filters.dateTo ? format(filters.dateTo, "dd MMM") : "To"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={(d) => updateFilter("dateTo", d)}
                    disabled={(d) => d > new Date()}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* P&L Range */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">P&L Range (₹)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.pnlMin ?? ""}
                onChange={(e) => updateFilter("pnlMin", e.target.value ? Number(e.target.value) : undefined)}
                className="h-7 text-[10px]"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.pnlMax ?? ""}
                onChange={(e) => updateFilter("pnlMax", e.target.value ? Number(e.target.value) : undefined)}
                className="h-7 text-[10px]"
              />
            </div>
          </div>

          {/* Emotion Tag */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Emotion</Label>
            <div className="flex flex-wrap gap-1">
              {EMOTION_OPTIONS.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => updateFilter("emotionTag", filters.emotionTag === emotion ? undefined : emotion)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-medium rounded-full border transition-colors",
                    filters.emotionTag === emotion
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>

          {/* Holding Period */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Holding Period</Label>
            <div className="flex flex-wrap gap-1">
              {HOLDING_PERIODS.map((hp) => (
                <button
                  key={hp.value}
                  onClick={() => updateFilter("holdingPeriod", filters.holdingPeriod === hp.value ? undefined : hp.value)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-medium rounded-full border transition-colors",
                    filters.holdingPeriod === hp.value
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {hp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Timeframe</Label>
            <div className="flex flex-wrap gap-1">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => updateFilter("timeframe", filters.timeframe === tf ? undefined : tf)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-medium rounded-full border transition-colors",
                    filters.timeframe === tf
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border/30 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Score */}
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence (1-10)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                min={1}
                max={10}
                value={filters.confidenceMin ?? ""}
                onChange={(e) => updateFilter("confidenceMin", e.target.value ? Number(e.target.value) : undefined)}
                className="h-7 text-[10px]"
              />
              <Input
                type="number"
                placeholder="Max"
                min={1}
                max={10}
                value={filters.confidenceMax ?? ""}
                onChange={(e) => updateFilter("confidenceMax", e.target.value ? Number(e.target.value) : undefined)}
                className="h-7 text-[10px]"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
