import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Star, Clock, Zap, Keyboard, Link2, X, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { OptionChainSelector } from "./OptionChainSelector";

export interface SelectedInstrument {
  symbol: string;
  security_id: string | null;
  exchange_segment: string;
  exchange: string;
  instrument_type: string;
  ltp?: number;
  lot_size?: number;
}

interface InstrumentPickerProps {
  segment?: string;
  onSelect: (instrument: SelectedInstrument) => void;
  showLtpFetch?: boolean;
  className?: string;
}

const STORAGE_KEY_RECENT = "instrument_picker_recent";
const STORAGE_KEY_FAVORITES = "instrument_picker_favorites";
const STORAGE_KEY_EXCHANGE = "instrument_picker_exchange_";

function getStoredItems(key: string): SelectedInstrument[] {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStoredItems(key: string, items: SelectedInstrument[]) {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, 15)));
  } catch {}
}

function getStoredExchange(segment: string): "ALL" | "NSE" | "NFO" | "MCX" {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_EXCHANGE + segment);
    if (stored && ["ALL", "NSE", "NFO", "MCX"].includes(stored)) return stored as any;
  } catch {}
  return "ALL";
}

function setStoredExchange(segment: string, exchange: string) {
  try {
    localStorage.setItem(STORAGE_KEY_EXCHANGE + segment, exchange);
  } catch {}
}

export function InstrumentPicker({ 
  segment, 
  onSelect, 
  showLtpFetch = true,
  className 
}: InstrumentPickerProps) {
  const isOptionsSegment = segment === "Options";
  const [mode, setMode] = useState<"search" | "chain" | "manual">(isOptionsSegment ? "chain" : "search");
  
  // Search state
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SelectedInstrument[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [exchangeFilter, setExchangeFilter] = useState<"ALL" | "NSE" | "NFO" | "MCX">("ALL");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  
  // Manual state
  const [manualExchange, setManualExchange] = useState<"NSE" | "NFO" | "MCX">("NSE");
  const [manualType, setManualType] = useState<"EQ" | "FUT" | "OPT">("EQ");
  const [manualSymbol, setManualSymbol] = useState("");
  
  // LTP state
  const [isFetchingLtp, setIsFetchingLtp] = useState(false);
  const [ltpResult, setLtpResult] = useState<{ 
    price: number | null; 
    error: string | null;
    source?: string;
    timestamp?: string;
    change?: number;
    changePercent?: number;
  }>({ price: null, error: null });
  
  // Selection
  const [selected, setSelected] = useState<SelectedInstrument | null>(null);
  
  // Stored items
  const [recentItems, setRecentItems] = useState<SelectedInstrument[]>(() => getStoredItems(STORAGE_KEY_RECENT));
  const [favoriteItems, setFavoriteItems] = useState<SelectedInstrument[]>(() => getStoredItems(STORAGE_KEY_FAVORITES));
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-set exchange and mode based on segment
  useEffect(() => {
    if (segment === "Options") {
      setExchangeFilter("NFO");
      setManualExchange("NFO");
      setManualType("OPT");
      setMode("chain");
    } else if (segment === "Futures") {
      const stored = getStoredExchange("Futures");
      setExchangeFilter(stored === "ALL" ? "NFO" : stored);
      setManualExchange("NFO");
      setManualType("FUT");
      setMode("search");
    } else if (segment === "Commodities") {
      setExchangeFilter("MCX");
      setManualExchange("MCX");
      setManualType("FUT");
      setMode("search");
    } else {
      const stored = getStoredExchange(segment || "Equity");
      setExchangeFilter(stored === "ALL" ? "NSE" : stored);
      setManualExchange("NSE");
      setManualType("EQ");
      setMode("search");
    }
  }, [segment]);

  // Persist exchange filter
  useEffect(() => {
    if (segment) setStoredExchange(segment, exchangeFilter);
  }, [exchangeFilter, segment]);
  
  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);
  
  // Search from DB
  useEffect(() => {
    if (mode !== "search") return;
    
    const searchDB = async () => {
      setIsSearching(true);
      try {
        let dbQuery = supabase
          .from("instrument_master")
          .select("security_id, exchange_segment, exchange, instrument_type, trading_symbol, display_name, lot_size")
          .limit(30);
        
        if (exchangeFilter !== "ALL") {
          dbQuery = dbQuery.eq("exchange", exchangeFilter);
        }
        
        if (debouncedQuery.trim()) {
          const term = debouncedQuery.trim().toUpperCase();
          dbQuery = dbQuery.or(`trading_symbol.ilike.%${term}%,display_name.ilike.%${term}%`);
        }
        
        dbQuery = dbQuery.order("trading_symbol", { ascending: true });
        
        const { data, error } = await dbQuery;
        
        if (error) throw error;
        
        const mapped: SelectedInstrument[] = (data || []).map((d) => ({
          symbol: d.trading_symbol,
          security_id: d.security_id,
          exchange_segment: d.exchange_segment,
          exchange: d.exchange,
          instrument_type: d.instrument_type,
          lot_size: d.lot_size || undefined,
        }));
        
        setResults(mapped);
        setHighlightedIndex(-1);
      } catch (err) {
        console.error("Search error:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    searchDB();
  }, [debouncedQuery, exchangeFilter, mode]);
  
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Merged display list: favorites pinned on top, then recents or search results
  const displayList = useMemo(() => {
    if (!isOpen) return [];
    
    const hasQuery = debouncedQuery.trim().length > 0;
    
    if (hasQuery) {
      // When searching: show favorites matching query at top, then results
      const matchingFavs = favoriteItems.filter(f => 
        f.symbol.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
      const favSymbols = new Set(matchingFavs.map(f => f.symbol));
      const nonFavResults = results.filter(r => !favSymbols.has(r.symbol));
      return [...matchingFavs, ...nonFavResults];
    }
    
    // No query: show favorites first, then recent
    const favSymbols = new Set(favoriteItems.map(f => f.symbol));
    const nonFavRecent = recentItems.filter(r => !favSymbols.has(r.symbol));
    return [...favoriteItems, ...nonFavRecent, ...results];
  }, [isOpen, debouncedQuery, results, recentItems, favoriteItems]);

  // Add to recent
  const addToRecent = useCallback((instrument: SelectedInstrument) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.symbol !== instrument.symbol);
      const updated = [instrument, ...filtered].slice(0, 10);
      setStoredItems(STORAGE_KEY_RECENT, updated);
      return updated;
    });
  }, []);
  
  // Toggle favorite
  const toggleFavorite = useCallback((instrument: SelectedInstrument, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteItems((prev) => {
      const exists = prev.some((i) => i.symbol === instrument.symbol);
      let updated: SelectedInstrument[];
      if (exists) {
        updated = prev.filter((i) => i.symbol !== instrument.symbol);
      } else {
        updated = [instrument, ...prev].slice(0, 15);
      }
      setStoredItems(STORAGE_KEY_FAVORITES, updated);
      return updated;
    });
  }, []);
  
  const isFavorite = useCallback((symbol: string) => {
    return favoriteItems.some((i) => i.symbol === symbol);
  }, [favoriteItems]);
  
  // Handle selection
  const handleSelect = (instrument: SelectedInstrument) => {
    setSelected(instrument);
    addToRecent(instrument);
    onSelect(instrument);
    setQuery("");
    setIsOpen(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || displayList.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, displayList.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(displayList[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[highlightedIndex] as HTMLElement;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);
  
  // Fetch LTP
  const fetchLtp = async (instrument: SelectedInstrument) => {
    setIsFetchingLtp(true);
    setLtpResult({ price: null, error: null });
    
    try {
      const { data, error } = await supabase.functions.invoke("get-live-prices", {
        body: {
          instruments: [{
            symbol: instrument.symbol,
            security_id: instrument.security_id,
            exchange_segment: instrument.exchange_segment,
          }],
        },
      });
      
      if (error) throw error;

      if (data?.error === "token_expired") {
        setLtpResult({ price: null, error: "Dhan token expired — update in Settings → Integrations." });
        return;
      }
      
      if (data?.success && data?.prices?.[instrument.symbol]) {
        const priceData = data.prices[instrument.symbol];
        const ltp = priceData.ltp;
        if (ltp && ltp > 0) {
          setLtpResult({ 
            price: ltp, 
            error: null,
            source: priceData.source || data.source || "dhan",
            timestamp: priceData.timestamp || data.timestamp,
            change: priceData.change,
            changePercent: priceData.changePercent,
          });
          const updated = { ...instrument, ltp };
          setSelected(updated);
          onSelect(updated);
        } else {
          setLtpResult({ price: null, error: "Price unavailable. Enter manually." });
        }
      } else if (data?.error) {
        setLtpResult({ price: null, error: `${data.error}. Enter price manually.` });
      } else {
        setLtpResult({ price: null, error: "Price unavailable. Enter manually." });
      }
    } catch (err) {
      console.error("LTP fetch error:", err);
      setLtpResult({ price: null, error: "Failed to fetch price. Enter manually." });
    } finally {
      setIsFetchingLtp(false);
    }
  };
  
  // Manual entry
  const handleManualConfirm = () => {
    if (!manualSymbol.trim()) return;
    
    const exchangeSegmentMap: Record<string, Record<string, string>> = {
      NSE: { EQ: "NSE_EQ", FUT: "NSE_FNO", OPT: "NSE_FNO" },
      NFO: { EQ: "NSE_FNO", FUT: "NSE_FNO", OPT: "NSE_FNO" },
      MCX: { EQ: "MCX_COMM", FUT: "MCX_COMM", OPT: "MCX_COMM" },
    };
    
    const instrument: SelectedInstrument = {
      symbol: manualSymbol.trim().toUpperCase(),
      security_id: null,
      exchange_segment: exchangeSegmentMap[manualExchange]?.[manualType] || "NSE_EQ",
      exchange: manualExchange,
      instrument_type: manualType,
    };
    
    setSelected(instrument);
    addToRecent(instrument);
    onSelect(instrument);
  };
  
  // Clear selection — preserves search context
  const clearSelection = () => {
    setSelected(null);
    setLtpResult({ price: null, error: null });
  };

  // ─── Render: Selected chip ───
  if (selected) {
    return (
      <div className={cn("space-y-2", className)}>
        <Label>Instrument</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Chip */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-accent text-sm font-medium">
            <span>{selected.symbol}</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
              {selected.exchange}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
              {selected.instrument_type}
            </Badge>
            {selected.lot_size && (
              <span className="text-[10px] text-muted-foreground">Lot: {selected.lot_size}</span>
            )}
            <button
              type="button"
              onClick={clearSelection}
              className="ml-0.5 p-0.5 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>

          {/* LTP fetch */}
          {showLtpFetch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchLtp(selected)}
              disabled={isFetchingLtp}
              className="h-7 text-xs gap-1"
            >
              {isFetchingLtp ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Zap className="w-3 h-3" />
              )}
              Fetch LTP
            </Button>
          )}
        </div>

        {/* LTP result */}
        {ltpResult.price && (
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-medium text-profit">
              ₹{ltpResult.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            {ltpResult.changePercent !== undefined && (
              <span className={ltpResult.changePercent >= 0 ? "text-profit" : "text-loss"}>
                ({ltpResult.changePercent >= 0 ? "+" : ""}{ltpResult.changePercent.toFixed(2)}%)
              </span>
            )}
            <span className="text-muted-foreground">
              {ltpResult.source} • {ltpResult.timestamp ? new Date(ltpResult.timestamp).toLocaleTimeString() : ""}
            </span>
          </div>
        )}
        {ltpResult.error && (
          <p className="text-xs text-muted-foreground">{ltpResult.error}</p>
        )}
      </div>
    );
  }

  // ─── Render: Picker ───
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label>Select Instrument *</Label>
        <div className="flex items-center gap-0.5 text-xs">
          <button
            type="button"
            onClick={() => setMode("search")}
            className={cn(
              "px-2 py-1 rounded-md transition-colors",
              mode === "search" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Search className="w-3 h-3 inline mr-0.5" />
            Search
          </button>
          {isOptionsSegment && (
            <button
              type="button"
              onClick={() => setMode("chain")}
              className={cn(
                "px-2 py-1 rounded-md transition-colors",
                mode === "chain" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
              )}
            >
              <Link2 className="w-3 h-3 inline mr-0.5" />
              Chain
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={cn(
              "px-2 py-1 rounded-md transition-colors",
              mode === "manual" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"
            )}
          >
            <Keyboard className="w-3 h-3 inline mr-0.5" />
            Manual
          </button>
        </div>
      </div>

      {!isOptionsSegment && exchangeFilter === "NFO" && mode === "search" && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5 text-xs text-muted-foreground">
          💡 For the CE | Strike | PE grid, set <span className="font-medium text-foreground">Segment = Options</span>.
        </div>
      )}

      {mode === "search" ? (
        <div className="space-y-2" ref={containerRef}>
          {/* Exchange chips */}
          <div className="flex gap-1 flex-wrap">
            {(["ALL", "NSE", "NFO", "MCX"] as const).map((ex) => (
              <Badge
                key={ex}
                variant={exchangeFilter === ex ? "default" : "outline"}
                className={cn(
                  "cursor-pointer text-xs px-2 py-0.5 transition-colors",
                  exchangeFilter === ex 
                    ? "" 
                    : "hover:bg-accent"
                )}
                onClick={() => setExchangeFilter(ex)}
              >
                {ex}
              </Badge>
            ))}
          </div>

          {/* Combobox input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              placeholder="Type to search instruments…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              className="pl-8 pr-8 h-9 text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setDebouncedQuery(""); inputRef.current?.focus(); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-muted"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {!query && (
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            )}
          </div>

          {/* Dropdown results */}
          {isOpen && (
            <div
              ref={listRef}
              className="max-h-64 overflow-y-auto border rounded-md bg-popover shadow-md"
            >
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin mr-2 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Searching…</span>
                </div>
              ) : displayList.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {debouncedQuery.trim() ? "No results. Try different keywords or Manual mode." : "Start typing to search…"}
                </p>
              ) : (
                displayList.map((item, idx) => {
                  const isFav = isFavorite(item.symbol);
                  const isRecent = !isFav && recentItems.some(r => r.symbol === item.symbol);
                  const isFnO = ["FUT", "OPT"].includes(item.instrument_type);

                  return (
                    <div
                      key={`${item.symbol}-${item.exchange_segment}-${idx}`}
                      onClick={() => handleSelect(item)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-2 cursor-pointer transition-colors text-sm",
                        highlightedIndex === idx ? "bg-accent" : "hover:bg-accent/50"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isFav && <Star className="w-3 h-3 fill-warning text-warning flex-shrink-0" />}
                        {isRecent && <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                        <span className="font-medium truncate">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {item.exchange} • {item.instrument_type}
                        </span>
                        {isFnO && item.lot_size && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 flex-shrink-0">
                            Lot {item.lot_size}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(item, e)}
                        className="p-1 hover:bg-background rounded flex-shrink-0"
                      >
                        <Star
                          className={cn(
                            "w-3 h-3",
                            isFav ? "fill-warning text-warning" : "text-muted-foreground"
                          )}
                        />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      ) : mode === "chain" ? (
        <OptionChainSelector
          onSelect={(contract) => {
            const instrument: SelectedInstrument = {
              symbol: contract.symbol,
              security_id: null,
              exchange_segment: contract.exchange_segment,
              exchange: contract.exchange,
              instrument_type: contract.instrument_type,
              ltp: contract.ltp,
            };
            setSelected(instrument);
            addToRecent(instrument);
            onSelect(instrument);
          }}
        />
      ) : (
        /* Manual mode */
        <div className="space-y-3 p-3 border rounded-lg bg-accent/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Exchange</Label>
              <select
                value={manualExchange}
                onChange={(e) => setManualExchange(e.target.value as "NSE" | "NFO" | "MCX")}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="NSE">NSE</option>
                <option value="NFO">NFO</option>
                <option value="MCX">MCX</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select
                value={manualType}
                onChange={(e) => setManualType(e.target.value as "EQ" | "FUT" | "OPT")}
                className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="EQ">Equity</option>
                <option value="FUT">Futures</option>
                <option value="OPT">Options</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs">Symbol</Label>
            <Input
              placeholder="e.g. RELIANCE, NIFTY 24FEB 22500CE"
              value={manualSymbol}
              onChange={(e) => setManualSymbol(e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          
          <Button
            type="button"
            size="sm"
            onClick={handleManualConfirm}
            disabled={!manualSymbol.trim()}
            className="w-full"
          >
            Use This Instrument
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Manual entry allows any symbol. Live price may not be available.
          </p>
        </div>
      )}
    </div>
  );
}
