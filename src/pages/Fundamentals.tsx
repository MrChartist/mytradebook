import { useState, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StockPopupCard } from "@/components/trade/StockPopupCard";
import {
  useFundamentals,
  type FundamentalData,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatCurrency,
} from "@/hooks/useFundamentals";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, TrendingUp, TrendingDown, Filter, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "market_cap" | "pe_ratio" | "pb_ratio" | "roe" | "dividend_yield" | "change" | "close";
type FilterPreset = "all" | "undervalued" | "growth" | "dividend" | "momentum";

const PRESET_LABELS: Record<FilterPreset, string> = {
  all: "All Stocks",
  undervalued: "Undervalued",
  growth: "High Growth",
  dividend: "Dividend",
  momentum: "Momentum",
};

function applyPreset(data: FundamentalData[], preset: FilterPreset): FundamentalData[] {
  switch (preset) {
    case "undervalued":
      return data.filter((s) => s.pe_ratio != null && s.pe_ratio > 0 && s.pe_ratio < 20 && s.pb_ratio != null && s.pb_ratio < 3);
    case "growth":
      return data.filter((s) => s.roe != null && s.roe > 15 && s.net_margin != null && s.net_margin > 10);
    case "dividend":
      return data.filter((s) => s.dividend_yield != null && s.dividend_yield > 1);
    case "momentum":
      return data.filter((s) => s.perf_1m != null && s.perf_1m > 0 && s.perf_3m != null && s.perf_3m > 0);
    default:
      return data;
  }
}

export default function Fundamentals() {
  const { data: result, isLoading } = useFundamentals();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("market_cap");
  const [sortAsc, setSortAsc] = useState(false);
  const [preset, setPreset] = useState<FilterPreset>("all");
  const [selectedStock, setSelectedStock] = useState<FundamentalData | null>(null);

  const stocks = useMemo(() => {
    let list = result?.data ?? [];

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.ticker?.toLowerCase().includes(q) ||
          s.name?.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.sector?.toLowerCase().includes(q) ||
          s.industry?.toLowerCase().includes(q)
      );
    }

    // preset
    list = applyPreset(list, preset);

    // sort
    list = [...list].sort((a, b) => {
      const aVal = a[sortKey] as number | null;
      const bVal = b[sortKey] as number | null;
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

    return list;
  }, [result, search, sortKey, sortAsc, preset]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      <ArrowUpDown className={cn("w-3 h-3", sortKey === field && "text-primary")} />
    </button>
  );

  return (
    <>
      <SEOHead title="Fundamentals Screener — TradeBook" description="Screen NSE stocks by fundamentals, valuation, and technicals." />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">Fundamentals</h1>
            <p className="text-sm text-muted-foreground">Top NSE stocks by market cap with key metrics</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search symbol, sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Filter Presets */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(PRESET_LABELS) as FilterPreset[]).map((p) => (
            <Button
              key={p}
              variant={preset === p ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs rounded-full"
              onClick={() => setPreset(p)}
            >
              {p !== "all" && <Filter className="w-3 h-3 mr-1" />}
              {PRESET_LABELS[p]}
            </Button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : stocks.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No stocks match your filters.
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[180px]">Symbol</TableHead>
                  <TableHead className="hidden md:table-cell">Sector</TableHead>
                  <TableHead className="text-right"><SortHeader label="LTP" field="close" /></TableHead>
                  <TableHead className="text-right"><SortHeader label="Chg%" field="change" /></TableHead>
                  <TableHead className="text-right hidden sm:table-cell"><SortHeader label="Mkt Cap" field="market_cap" /></TableHead>
                  <TableHead className="text-right hidden lg:table-cell"><SortHeader label="P/E" field="pe_ratio" /></TableHead>
                  <TableHead className="text-right hidden lg:table-cell"><SortHeader label="P/B" field="pb_ratio" /></TableHead>
                  <TableHead className="text-right hidden xl:table-cell"><SortHeader label="ROE" field="roe" /></TableHead>
                  <TableHead className="text-right hidden xl:table-cell"><SortHeader label="Div%" field="dividend_yield" /></TableHead>
                  <TableHead className="text-right hidden xl:table-cell">52W High</TableHead>
                  <TableHead className="text-right hidden xl:table-cell">52W Low</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((s) => {
                  const isPos = (s.change ?? 0) >= 0;
                  return (
                    <TableRow
                      key={s.ticker}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setSelectedStock(s)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{s.ticker?.replace("NSE:", "")}</p>
                          <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{s.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {s.sector && <Badge variant="secondary" className="text-[10px]">{s.sector}</Badge>}
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatCurrency(s.close)}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isPos ? "text-profit" : "text-loss")}>
                          {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {formatPercent(s.change)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">{formatMarketCap(s.market_cap)}</TableCell>
                      <TableCell className="text-right text-xs hidden lg:table-cell">{formatRatio(s.pe_ratio)}</TableCell>
                      <TableCell className="text-right text-xs hidden lg:table-cell">{formatRatio(s.pb_ratio)}</TableCell>
                      <TableCell className="text-right text-xs hidden xl:table-cell">
                        <span className={cn(s.roe != null && s.roe > 0 ? "text-profit" : "text-loss")}>{formatPercent(s.roe)}</span>
                      </TableCell>
                      <TableCell className="text-right text-xs hidden xl:table-cell">{s.dividend_yield != null ? `${s.dividend_yield.toFixed(2)}%` : "—"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground text-center">
          Showing {stocks.length} of {result?.totalCount ?? 0} stocks · Data refreshes every 5 min
        </p>
      </div>

      <StockPopupCard open={!!selectedStock} onOpenChange={(o) => !o && setSelectedStock(null)} stock={selectedStock} />
    </>
  );
}
