import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Crosshair } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useFnoUnderlyings } from "@/hooks/useFnoUnderlyings";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface OptionChainSelectorProps {
  onSelect: (contract: {
    symbol: string;
    ltp: number;
    instrumentToken?: string;
    contractKey: string;
    exchange: string;
    instrument_type: string;
    exchange_segment: string;
  }) => void;
  className?: string;
}

function formatExpiry(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}${month}${year}`;
}

function generateExpiryDates(): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const daysUntilThursday = dayOfWeek === 4 ? 7 : (4 - dayOfWeek + 7) % 7;
  const firstThursday = new Date(today);
  firstThursday.setDate(today.getDate() + daysUntilThursday);
  const dates: string[] = [];
  for (let i = 0; i < 8; i++) {
    const date = new Date(firstThursday);
    date.setDate(firstThursday.getDate() + i * 7);
    dates.push(formatExpiry(date));
  }
  return dates;
}

function getStrikeStep(underlying: string, price: number): number {
  if (underlying === "BANKNIFTY") return 100;
  if (underlying === "NIFTY" || underlying === "FINNIFTY") return 50;
  if (underlying === "SENSEX") return 100;
  if (underlying === "MIDCPNIFTY") return 25;
  if (price > 5000) return 50;
  if (price > 2000) return 25;
  return 10;
}

function generateStrikes(underlying: string, atmPrice: number): number[] {
  const step = getStrikeStep(underlying, atmPrice);
  // Always generate ±20 range, filtering happens in UI
  const atm = Math.round(atmPrice / step) * step;
  const strikes: number[] = [];
  for (let i = -20; i <= 20; i++) {
    strikes.push(atm + i * step);
  }
  return strikes;
}

function getAtmStrike(underlying: string, atmPrice: number): number {
  const step = getStrikeStep(underlying, atmPrice);
  return Math.round(atmPrice / step) * step;
}

export function OptionChainSelector({ onSelect, className }: OptionChainSelectorProps) {
  const { indices, stocks, isLoading: loadingUnderlyings } = useFnoUnderlyings();
  const [underlying, setUnderlying] = useState("");
  const [underlyingSearch, setUnderlyingSearch] = useState("");
  const [expiry, setExpiry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atmPrice, setAtmPrice] = useState<number>(0);
  const [range, setRange] = useState<"5" | "10" | "20">("10");
  const [strikeSearch, setStrikeSearch] = useState("");
  const [selected, setSelected] = useState<{ strike: number; type: "CE" | "PE" } | null>(null);

  const atmRowRef = useRef<HTMLTableRowElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const expiries = useMemo(() => generateExpiryDates(), []);

  const filteredStocks = underlyingSearch
    ? stocks.filter((u) => u.toLowerCase().includes(underlyingSearch.toLowerCase()))
    : stocks.slice(0, 30);

  // Fetch ATM price when underlying changes
  useEffect(() => {
    if (!underlying) return;
    const fetchPrice = async () => {
      setIsLoading(true);
      try {
        const { data } = await supabase.functions.invoke("get-live-prices", {
          body: { symbols: [underlying] },
        });
        if (data?.success && data?.prices?.[underlying]) {
          setAtmPrice(data.prices[underlying].ltp);
        }
      } catch (e) {
        console.error("Failed to fetch price:", e);
        const mockPrices: Record<string, number> = {
          NIFTY: 22500, BANKNIFTY: 48000, FINNIFTY: 21500,
          RELIANCE: 2450, TCS: 3850, INFY: 1520,
          HDFCBANK: 1680, ICICIBANK: 1120, SBIN: 780,
        };
        setAtmPrice(mockPrices[underlying] || 1000);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrice();
  }, [underlying]);

  const atmStrike = atmPrice > 0 ? getAtmStrike(underlying, atmPrice) : 0;

  // All strikes ±20, then filter by range
  const allStrikes = atmPrice > 0 ? generateStrikes(underlying, atmPrice) : [];
  const rangeNum = parseInt(range);

  const visibleStrikes = useMemo(() => {
    let filtered = allStrikes.filter((s) => {
      const idx = Math.abs(allStrikes.indexOf(s) - 20); // distance from ATM index
      return idx <= rangeNum;
    });
    if (strikeSearch) {
      const num = parseInt(strikeSearch);
      if (!isNaN(num)) {
        filtered = filtered.filter((s) => s.toString().includes(strikeSearch));
      }
    }
    return filtered;
  }, [allStrikes, rangeNum, strikeSearch]);

  // Mock option LTP
  const getOptionLtp = useCallback(
    (strikePrice: number, type: "CE" | "PE"): number => {
      if (!atmPrice) return 0;
      const diff = type === "CE" ? atmPrice - strikePrice : strikePrice - atmPrice;
      const intrinsic = Math.max(0, diff);
      const timeValue = 30 + (strikePrice % 100) / 10;
      return parseFloat((intrinsic + timeValue).toFixed(2));
    },
    [atmPrice]
  );

  // Auto-scroll to ATM row
  useEffect(() => {
    if (atmRowRef.current && expiry) {
      setTimeout(() => {
        atmRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [expiry, atmPrice, range]);

  const handleCellClick = (strike: number, type: "CE" | "PE") => {
    setSelected({ strike, type });
  };

  const handleConfirm = () => {
    if (!selected || !underlying || !expiry) return;
    const { strike, type } = selected;
    const symbol = `${underlying} ${expiry} ${strike}${type}`;
    const ltp = getOptionLtp(strike, type);
    const contractKey = `${underlying}_${expiry}_${strike}_${type}`;
    onSelect({
      symbol,
      ltp,
      contractKey,
      exchange: "NFO",
      instrument_type: "OPT",
      exchange_segment: "NSE_FNO",
    });
  };

  const handleAtmShortcut = (type: "CE" | "PE") => {
    if (!atmStrike || !expiry) return;
    setSelected({ strike: atmStrike, type });
  };

  return (
    <div className={cn("space-y-3 rounded-lg border bg-muted/30 p-3", className)}>
      {/* Header: compact with ATM inline */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-muted-foreground">Underlying</span>
        {atmPrice > 0 && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            ATM ₹{atmPrice.toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Step 1: Underlying */}
      <div className="space-y-1.5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search underlying..."
            value={underlyingSearch}
            onChange={(e) => setUnderlyingSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {loadingUnderlyings ? (
          <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading F&O symbols…
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {indices.map((u) => (
                <Badge
                  key={u}
                  variant={underlying === u ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/20 transition-colors"
                  onClick={() => { setUnderlying(u); setUnderlyingSearch(""); setSelected(null); }}
                >
                  {u}
                </Badge>
              ))}
            </div>
            {filteredStocks.length > 0 && (
              <>
                <Separator />
                <ScrollArea className="h-24">
                  <div className="flex flex-wrap gap-1.5">
                    {filteredStocks.map((u) => (
                      <Badge
                        key={u}
                        variant={underlying === u ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => { setUnderlying(u); setUnderlyingSearch(""); setSelected(null); }}
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
      </div>

      {underlying && (
        <>
          {/* Step 2: Expiry */}
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Expiry</span>
            <Select value={expiry} onValueChange={(v) => { setExpiry(v); setSelected(null); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select expiry date" />
              </SelectTrigger>
              <SelectContent>
                {expiries.map((exp, index) => (
                  <SelectItem key={`${exp}-${index}`} value={exp}>
                    {exp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {expiry && (
            <>
              {/* Controls: Range + Strike Search + ATM shortcuts */}
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Strike</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <ToggleGroup
                    type="single"
                    value={range}
                    onValueChange={(v) => v && setRange(v as "5" | "10" | "20")}
                    size="sm"
                  >
                    <ToggleGroupItem value="5" className="text-xs px-2">±5</ToggleGroupItem>
                    <ToggleGroupItem value="10" className="text-xs px-2">±10</ToggleGroupItem>
                    <ToggleGroupItem value="20" className="text-xs px-2">±20</ToggleGroupItem>
                  </ToggleGroup>
                  <div className="relative flex-1 min-w-[100px]">
                    <Input
                      placeholder="Strike…"
                      value={strikeSearch}
                      onChange={(e) => setStrikeSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                    onClick={() => {
                      setStrikeSearch("");
                      atmRowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                  >
                    <Crosshair className="w-3 h-3" /> ATM
                  </Button>
                </div>

                {/* Quick ATM shortcuts */}
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-profit/10 hover:bg-profit/20 text-profit border-profit/30"
                    onClick={() => handleAtmShortcut("CE")}
                  >
                    ATM CE
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-7 bg-loss/10 hover:bg-loss/20 text-loss border-loss/30"
                    onClick={() => handleAtmShortcut("PE")}
                  >
                    ATM PE
                  </Button>
                </div>
              </div>

              {/* Option Chain Grid */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ScrollArea className="h-52 rounded-md border" ref={scrollAreaRef}>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-center text-xs text-profit font-semibold w-[30%]">
                          CE LTP
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold w-[40%]">
                          Strike
                        </TableHead>
                        <TableHead className="text-center text-xs text-loss font-semibold w-[30%]">
                          PE LTP
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleStrikes.map((s) => {
                        const isAtm = s === atmStrike;
                        const ceLtp = getOptionLtp(s, "CE");
                        const peLtp = getOptionLtp(s, "PE");
                        const ceSelected = selected?.strike === s && selected?.type === "CE";
                        const peSelected = selected?.strike === s && selected?.type === "PE";

                        return (
                          <TableRow
                            key={s}
                            ref={isAtm ? atmRowRef : undefined}
                            className={cn(
                              "cursor-pointer transition-colors",
                              isAtm && "bg-primary/10 hover:bg-primary/15"
                            )}
                          >
                            <TableCell
                              className={cn(
                                "text-center text-xs py-1.5 font-mono hover:bg-profit/15 transition-colors",
                                ceSelected && "bg-profit/25 ring-1 ring-profit/50 rounded-sm"
                              )}
                              onClick={() => handleCellClick(s, "CE")}
                            >
                              ₹{ceLtp.toFixed(2)}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-center text-xs py-1.5 font-semibold",
                                isAtm && "text-primary"
                              )}
                            >
                              {s}
                              {isAtm && <span className="ml-1 text-[10px] opacity-60">ATM</span>}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-center text-xs py-1.5 font-mono hover:bg-loss/15 transition-colors",
                                peSelected && "bg-loss/25 ring-1 ring-loss/50 rounded-sm"
                              )}
                              onClick={() => handleCellClick(s, "PE")}
                            >
                              ₹{peLtp.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}

              {/* Preview & Confirm */}
              {selected && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {underlying} {expiry} {selected.strike}
                        <span className={cn(
                          "ml-1",
                          selected.type === "CE" ? "text-profit" : "text-loss"
                        )}>
                          {selected.type}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        LTP: ₹{getOptionLtp(selected.strike, selected.type).toFixed(2)}
                      </p>
                    </div>
                    <Button type="button" size="sm" onClick={handleConfirm}>
                      Use This Contract
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
