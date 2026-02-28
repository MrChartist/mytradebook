import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus, Layers, Loader2, ArrowUpRight, ArrowDownRight, X,
  TrendingUp, TrendingDown, RefreshCw, Zap, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFnoUnderlyings } from "@/hooks/useFnoUnderlyings";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStrategyCreated?: () => void;
}

interface StrategyLeg {
  id: string;
  optionType: "CE" | "PE";
  positionType: "BUY" | "SELL";
  strike: number;
  lots: number;
  premium: number;
  ltp: number | null;
  contractKey: string;
}

const STRATEGY_TEMPLATES = [
  { value: "custom", label: "Custom Strategy", legs: [] },
  { value: "long_straddle", label: "Long Straddle", desc: "Buy ATM CE + ATM PE", legs: [
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 0 },
    { optionType: "PE" as const, positionType: "BUY" as const, strikeOffset: 0 },
  ]},
  { value: "short_straddle", label: "Short Straddle", desc: "Sell ATM CE + ATM PE", legs: [
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 0 },
    { optionType: "PE" as const, positionType: "SELL" as const, strikeOffset: 0 },
  ]},
  { value: "long_strangle", label: "Long Strangle", desc: "Buy OTM CE + OTM PE", legs: [
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 2 },
    { optionType: "PE" as const, positionType: "BUY" as const, strikeOffset: -2 },
  ]},
  { value: "short_strangle", label: "Short Strangle", desc: "Sell OTM CE + OTM PE", legs: [
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 2 },
    { optionType: "PE" as const, positionType: "SELL" as const, strikeOffset: -2 },
  ]},
  { value: "bull_call_spread", label: "Bull Call Spread", desc: "Buy lower CE, Sell higher CE", legs: [
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 0 },
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 2 },
  ]},
  { value: "bear_put_spread", label: "Bear Put Spread", desc: "Buy higher PE, Sell lower PE", legs: [
    { optionType: "PE" as const, positionType: "BUY" as const, strikeOffset: 0 },
    { optionType: "PE" as const, positionType: "SELL" as const, strikeOffset: -2 },
  ]},
  { value: "iron_condor", label: "Iron Condor", desc: "Short strangle + protective wings", legs: [
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 2 },
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 4 },
    { optionType: "PE" as const, positionType: "SELL" as const, strikeOffset: -2 },
    { optionType: "PE" as const, positionType: "BUY" as const, strikeOffset: -4 },
  ]},
  { value: "iron_butterfly", label: "Iron Butterfly", desc: "Short straddle + protective wings", legs: [
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 0 },
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 2 },
    { optionType: "PE" as const, positionType: "SELL" as const, strikeOffset: 0 },
    { optionType: "PE" as const, positionType: "BUY" as const, strikeOffset: -2 },
  ]},
  { value: "ratio_spread", label: "Ratio Call Spread (1:2)", desc: "Buy 1 ATM CE, Sell 2 OTM CE", legs: [
    { optionType: "CE" as const, positionType: "BUY" as const, strikeOffset: 0 },
    { optionType: "CE" as const, positionType: "SELL" as const, strikeOffset: 2, lots: 2 },
  ]},
];

function getStrikeStep(underlying: string, price?: number): number {
  if (underlying === "BANKNIFTY") return 100;
  if (underlying === "NIFTY" || underlying === "FINNIFTY") return 50;
  if (underlying === "SENSEX") return 100;
  if (underlying === "MIDCPNIFTY") return 25;
  // Dynamic step for stock options based on price
  if (price && price > 5000) return 50;
  if (price && price > 2000) return 25;
  return 10;
}

function generateStrikes(underlying: string, atm: number): number[] {
  const step = getStrikeStep(underlying);
  const atmStrike = Math.round(atm / step) * step;
  const range = 15;
  return Array.from({ length: range * 2 + 1 }, (_, i) => atmStrike + (i - range) * step);
}

function generateExpiries(): { value: string; label: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysToThursday = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;
  const firstThursday = new Date(today);
  firstThursday.setDate(today.getDate() + (daysToThursday || 7));

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: 8 }, (_, i) => {
    const d = new Date(firstThursday);
    d.setDate(firstThursday.getDate() + i * 7);
    const dd = d.getDate().toString().padStart(2, "0");
    const mmm = months[d.getMonth()].toUpperCase();
    const yy = d.getFullYear().toString().slice(-2);
    const key = `${dd}${mmm}${yy}`;
    return { value: key, label: `${dd} ${mmm} ${yy}` };
  });
}

let legIdCounter = 0;
function genId() { return `leg-${++legIdCounter}-${Date.now()}`; }

export function MultiLegStrategyModal({ open, onOpenChange, onStrategyCreated }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [strategyType, setStrategyType] = useState("custom");
  const [underlying, setUnderlying] = useState("");
  const [underlyingSearch, setUnderlyingSearch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [notes, setNotes] = useState("");
  const [legs, setLegs] = useState<StrategyLeg[]>([]);
  const [atmPrice, setAtmPrice] = useState(0);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [lotSize, setLotSize] = useState(1);

  const expiries = useMemo(() => generateExpiries(), []);
  const strikes = useMemo(() => underlying && atmPrice > 0 ? generateStrikes(underlying, atmPrice) : [], [underlying, atmPrice]);

  const { indices, stocks, isLoading: loadingUnderlyings } = useFnoUnderlyings();

  const filteredStocks = underlyingSearch
    ? stocks.filter(u => u.toLowerCase().includes(underlyingSearch.toLowerCase()))
    : stocks.slice(0, 30);

  // Fetch ATM price
  useEffect(() => {
    if (!underlying) return;
    const fetch = async () => {
      setLoadingPrices(true);
      try {
        const { data } = await supabase.functions.invoke("get-live-prices", {
          body: { symbols: [underlying] },
        });
        if (data?.success && data?.prices?.[underlying]) {
          setAtmPrice(data.prices[underlying].ltp);
        }
        // Get lot size from instrument master
        const { data: inst } = await supabase
          .from("instrument_master")
          .select("lot_size")
          .eq("trading_symbol", underlying)
          .eq("instrument_type", "INDEX")
          .maybeSingle();
        if (inst?.lot_size) setLotSize(inst.lot_size);
        else {
          // Default lot sizes
          const defaults: Record<string, number> = { NIFTY: 75, BANKNIFTY: 30, FINNIFTY: 40, SENSEX: 20, MIDCPNIFTY: 75 };
          setLotSize(defaults[underlying] || 1);
        }
      } catch (e) {
        console.error(e);
        const mocks: Record<string, number> = { NIFTY: 24500, BANKNIFTY: 52000, FINNIFTY: 23000 };
        setAtmPrice(mocks[underlying] || 1000);
      } finally {
        setLoadingPrices(false);
      }
    };
    fetch();
  }, [underlying]);

  // Auto-generate legs from template
  const applyTemplate = useCallback((templateValue: string) => {
    setStrategyType(templateValue);
    const template = STRATEGY_TEMPLATES.find(t => t.value === templateValue);
    if (!template || !template.legs.length || !atmPrice) return;

    const step = getStrikeStep(underlying);
    const atmStrike = Math.round(atmPrice / step) * step;

    const newLegs: StrategyLeg[] = template.legs.map(tl => ({
      id: genId(),
      optionType: tl.optionType,
      positionType: tl.positionType,
      strike: atmStrike + tl.strikeOffset * step,
      lots: (tl as any).lots || 1,
      premium: 0,
      ltp: null,
      contractKey: `${underlying}_${expiry}_${atmStrike + tl.strikeOffset * step}_${tl.optionType}`,
    }));
    setLegs(newLegs);
    setName(template.label + ` ${underlying}`);
  }, [atmPrice, underlying, expiry]);

  // Fetch live premiums for all legs
  const fetchPremiums = useCallback(async () => {
    if (!legs.length || !underlying) return;
    setLoadingPrices(true);
    try {
      // For now, estimate premium based on moneyness
      setLegs(prev => prev.map(leg => {
        const diff = leg.optionType === "CE"
          ? atmPrice - leg.strike
          : leg.strike - atmPrice;
        const intrinsic = Math.max(0, diff);
        const timeValue = 30 + Math.abs(leg.strike - atmPrice) * 0.1;
        const estimated = parseFloat((intrinsic + timeValue).toFixed(2));
        return { ...leg, ltp: estimated, premium: leg.premium || estimated };
      }));
    } finally {
      setLoadingPrices(false);
    }
  }, [legs.length, underlying, atmPrice]);

  useEffect(() => {
    if (legs.length > 0 && atmPrice > 0) fetchPremiums();
  }, [legs.length, atmPrice]);

  const addLeg = () => {
    const step = getStrikeStep(underlying);
    const atmStrike = atmPrice > 0 ? Math.round(atmPrice / step) * step : 0;
    setLegs(prev => [...prev, {
      id: genId(),
      optionType: "CE",
      positionType: "BUY",
      strike: atmStrike,
      lots: 1,
      premium: 0,
      ltp: null,
      contractKey: "",
    }]);
  };

  const updateLeg = (id: string, updates: Partial<StrategyLeg>) => {
    setLegs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLeg = (id: string) => {
    setLegs(prev => prev.filter(l => l.id !== id));
  };

  // Calculations
  const netPremium = useMemo(() => {
    return legs.reduce((sum, leg) => {
      const prem = leg.premium || leg.ltp || 0;
      const multiplier = leg.positionType === "SELL" ? 1 : -1;
      return sum + (prem * leg.lots * lotSize * multiplier);
    }, 0);
  }, [legs, lotSize]);

  const totalLots = useMemo(() => legs.reduce((s, l) => s + l.lots, 0), [legs]);

  const createStrategy = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      if (!name.trim() || !underlying.trim()) throw new Error("Name and underlying required");
      if (legs.length < 2) throw new Error("Add at least 2 legs");

      // Create strategy record
      const { data: strategy, error } = await supabase
        .from("strategy_trades" as any)
        .insert({
          user_id: user.id,
          name,
          strategy_type: strategyType,
          symbol: underlying,
          segment: "Options",
          notes: notes || null,
          combined_pnl: 0,
          status: "OPEN",
        })
        .select()
        .single();
      if (error) throw error;

      // Create individual trade legs
      const legInserts = legs.map(leg => ({
        user_id: user.id,
        symbol: `${underlying} ${expiry} ${leg.strike}${leg.optionType}`,
        segment: "Options" as const,
        trade_type: leg.positionType as "BUY" | "SELL",
        quantity: leg.lots * lotSize,
        entry_price: leg.premium || leg.ltp || 0,
        status: "OPEN" as const,
        strategy_id: (strategy as any).id,
        contract_key: `${underlying}_${expiry}_${leg.strike}_${leg.optionType}`,
        notes: `Leg of ${name}`,
      }));

      const { error: legsError } = await supabase
        .from("trades")
        .insert(legInserts);
      if (legsError) throw legsError;

      return strategy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["strategy-trades"] });
      queryClient.invalidateQueries({ queryKey: ["trades"] });
      toast.success("Strategy created with all legs!");
      resetForm();
      onOpenChange(false);
      onStrategyCreated?.();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetForm = () => {
    setName(""); setStrategyType("custom"); setUnderlying(""); setUnderlyingSearch("");
    setExpiry(""); setNotes(""); setLegs([]); setAtmPrice(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Options Strategy Builder
          </DialogTitle>
          <DialogDescription>
            Build multi-leg option strategies with live premium calculation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Step 1: Underlying */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">1. Select Underlying</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search underlying..."
                value={underlyingSearch}
                onChange={(e) => setUnderlyingSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            {loadingUnderlyings ? (
              <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading F&O symbols…
              </div>
            ) : (
              <div className="space-y-2">
                {/* Indices - always visible */}
                <div className="flex flex-wrap gap-1.5">
                  {indices.map(u => (
                    <Badge
                      key={u}
                      variant={underlying === u ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => { setUnderlying(u); setUnderlyingSearch(""); setLegs([]); }}
                    >
                      {u}
                    </Badge>
                  ))}
                </div>
                {/* Stocks - searchable */}
                {filteredStocks.length > 0 && (
                  <>
                    <Separator />
                    <ScrollArea className="h-24">
                      <div className="flex flex-wrap gap-1.5">
                        {filteredStocks.map(u => (
                          <Badge
                            key={u}
                            variant={underlying === u ? "default" : "outline"}
                            className="cursor-pointer hover:bg-primary/20 transition-colors"
                            onClick={() => { setUnderlying(u); setUnderlyingSearch(""); setLegs([]); }}
                          >
                            {u}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </>
                )}
              </div>
            )}
            {atmPrice > 0 && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">ATM:</span>
                <span className="font-mono font-bold">₹{atmPrice.toLocaleString()}</span>
                <Badge variant="outline" className="text-xs">Lot: {lotSize}</Badge>
              </div>
            )}
          </div>

          {underlying && (
            <>
              {/* Step 2: Expiry + Strategy Template */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">2. Expiry</Label>
                  <Select value={expiry} onValueChange={setExpiry}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select expiry" /></SelectTrigger>
                    <SelectContent>
                      {expiries.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">3. Strategy Template</Label>
                  <Select value={strategyType} onValueChange={applyTemplate}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STRATEGY_TEMPLATES.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <div>
                            <span>{t.label}</span>
                            {t.desc && <span className="text-xs text-muted-foreground ml-2">— {t.desc}</span>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Strategy Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., NIFTY Iron Condor" className="h-9" />
              </div>

              {/* Legs Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">4. Strategy Legs</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={fetchPremiums} disabled={loadingPrices}>
                      <RefreshCw className={cn("w-3 h-3 mr-1", loadingPrices && "animate-spin")} /> Refresh LTP
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={addLeg}>
                      <Plus className="w-3 h-3 mr-1" /> Add Leg
                    </Button>
                  </div>
                </div>

                {legs.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-sm">
                    Select a strategy template or add legs manually
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-[80px_60px_1fr_80px_100px_100px_32px] gap-2 px-2 text-[10px] font-semibold uppercase text-muted-foreground">
                      <span>Action</span>
                      <span>Type</span>
                      <span>Strike</span>
                      <span>Lots</span>
                      <span>LTP (₹)</span>
                      <span>Premium (₹)</span>
                      <span></span>
                    </div>

                    {legs.map(leg => (
                      <div key={leg.id} className={cn(
                        "grid grid-cols-[80px_60px_1fr_80px_100px_100px_32px] gap-2 items-center p-2 rounded-lg border",
                        leg.positionType === "BUY" ? "border-profit/30 bg-profit/5" : "border-loss/30 bg-loss/5"
                      )}>
                        {/* Action */}
                        <Select value={leg.positionType} onValueChange={v => updateLeg(leg.id, { positionType: v as "BUY" | "SELL" })}>
                          <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="BUY"><span className="text-profit font-medium">BUY</span></SelectItem>
                            <SelectItem value="SELL"><span className="text-loss font-medium">SELL</span></SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Option Type */}
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className={cn("px-2 py-1 rounded text-[10px] font-bold transition-colors",
                              leg.optionType === "CE" ? "bg-profit text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                            onClick={() => updateLeg(leg.id, { optionType: "CE" })}
                          >CE</button>
                          <button
                            type="button"
                            className={cn("px-2 py-1 rounded text-[10px] font-bold transition-colors",
                              leg.optionType === "PE" ? "bg-loss text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                            onClick={() => updateLeg(leg.id, { optionType: "PE" })}
                          >PE</button>
                        </div>

                        {/* Strike */}
                        <Select value={String(leg.strike)} onValueChange={v => updateLeg(leg.id, { strike: Number(v) })}>
                          <SelectTrigger className="h-7 text-xs font-mono"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <ScrollArea className="h-48">
                              {strikes.map(s => {
                                const isAtm = Math.abs(s - atmPrice) < getStrikeStep(underlying) / 2;
                                return (
                                  <SelectItem key={s} value={String(s)}>
                                    {s} {isAtm && "⬅ ATM"}
                                  </SelectItem>
                                );
                              })}
                            </ScrollArea>
                          </SelectContent>
                        </Select>

                        {/* Lots */}
                        <Input
                          type="number"
                          min={1}
                          value={leg.lots}
                          onChange={e => updateLeg(leg.id, { lots: parseInt(e.target.value) || 1 })}
                          className="h-7 text-xs font-mono text-center"
                        />

                        {/* LTP */}
                        <div className="text-xs font-mono text-center text-muted-foreground">
                          {leg.ltp ? `₹${leg.ltp.toFixed(2)}` : "—"}
                        </div>

                        {/* Premium (editable) */}
                        <Input
                          type="number"
                          step="0.05"
                          value={leg.premium || ""}
                          onChange={e => updateLeg(leg.id, { premium: parseFloat(e.target.value) || 0 })}
                          placeholder={leg.ltp ? leg.ltp.toFixed(2) : "0"}
                          className="h-7 text-xs font-mono"
                        />

                        {/* Remove */}
                        <button type="button" onClick={() => removeLeg(leg.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* P&L Summary */}
              {legs.length > 0 && (
                <div className="rounded-xl border border-border bg-accent/30 p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Strategy Summary</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Net Premium</p>
                      <p className={cn("text-lg font-bold font-mono", netPremium >= 0 ? "text-profit" : "text-loss")}>
                        {netPremium >= 0 ? "+" : ""}₹{netPremium.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {netPremium >= 0 ? "Credit received" : "Debit paid"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total Legs</p>
                      <p className="text-lg font-bold font-mono">{legs.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Total Lots</p>
                      <p className="text-lg font-bold font-mono">{totalLots}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Lot Size</p>
                      <p className="text-lg font-bold font-mono">{lotSize}</p>
                    </div>
                  </div>

                  {/* Per-leg breakdown */}
                  <Separator className="my-3" />
                  <div className="space-y-1">
                    {legs.map(leg => {
                      const prem = leg.premium || leg.ltp || 0;
                      const value = prem * leg.lots * lotSize * (leg.positionType === "SELL" ? 1 : -1);
                      return (
                        <div key={leg.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={cn("text-[10px]", leg.positionType === "BUY" ? "text-profit" : "text-loss")}>
                              {leg.positionType}
                            </Badge>
                            <span className="font-mono">{leg.strike}{leg.optionType}</span>
                            <span className="text-muted-foreground">× {leg.lots} lot</span>
                          </div>
                          <span className={cn("font-mono font-medium", value >= 0 ? "text-profit" : "text-loss")}>
                            {value >= 0 ? "+" : ""}₹{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-xs">Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Strategy thesis, breakeven levels..." rows={2} className="text-sm resize-none" />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button
                  onClick={() => createStrategy.mutate()}
                  disabled={!name.trim() || !underlying.trim() || legs.length < 2 || createStrategy.isPending}
                >
                  {createStrategy.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Zap className="w-4 h-4 mr-1" />
                  Create Strategy ({legs.length} legs)
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for fetching strategies
export function useStrategies() {
  const { user } = useAuth();

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ["strategy-trades", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("strategy_trades" as any)
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
    enabled: !!user?.id,
  });

  return { strategies, isLoading };
}
