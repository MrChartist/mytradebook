import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  type FundamentalData,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatCurrency,
  formatVolume,
} from "@/hooks/useFundamentals";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity } from "lucide-react";

interface StockPopupCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: FundamentalData | null;
}

function MetricCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean | null }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3 space-y-1">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold", positive === true && "text-profit", positive === false && "text-loss")}>
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function RangeBar({ label, low, high, current }: { label: string; low: number | null; high: number | null; current: number | null }) {
  if (low == null || high == null || current == null) return null;
  const range = high - low;
  const pct = range > 0 ? Math.min(100, Math.max(0, ((current - low) / range) * 100)) : 50;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span>{formatCurrency(current)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-loss/60 via-warning/60 to-profit/60" style={{ width: "100%" }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card shadow-md"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{formatCurrency(low)}</span>
        <span>{formatCurrency(high)}</span>
      </div>
    </div>
  );
}

function RSIGauge({ value }: { value: number | null }) {
  if (value == null) return <MetricCard label="RSI" value="—" />;
  const color = value > 70 ? "text-loss" : value < 30 ? "text-profit" : "text-foreground";
  const label = value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral";
  return (
    <div className="rounded-xl bg-muted/50 p-3 space-y-2">
      <p className="text-[11px] text-muted-foreground">RSI (14)</p>
      <p className={cn("text-lg font-bold", color)}>{value.toFixed(1)}</p>
      <Progress value={value} className="h-1.5" />
      <p className={cn("text-[10px]", color)}>{label}</p>
    </div>
  );
}

export function StockPopupCard({ open, onOpenChange, stock }: StockPopupCardProps) {
  if (!stock) return null;

  const isPositive = (stock.change ?? 0) >= 0;
  const symbol = stock.ticker?.replace("NSE:", "") || stock.name || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        {/* Hero Header */}
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-lg font-bold">{symbol}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{stock.description || "—"}</p>
              <div className="flex gap-1.5 mt-2">
                {stock.sector && <Badge variant="secondary" className="text-[10px]">{stock.sector}</Badge>}
                {stock.industry && <Badge variant="outline" className="text-[10px]">{stock.industry}</Badge>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold">{formatCurrency(stock.close)}</p>
              <div className={cn("flex items-center gap-1 justify-end text-sm font-medium", isPositive ? "text-profit" : "text-loss")}>
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{formatPercent(stock.change)}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-5 pb-5 pt-3">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="text-xs gap-1.5"><BarChart3 className="w-3.5 h-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="valuation" className="text-xs gap-1.5"><DollarSign className="w-3.5 h-3.5" />Valuation</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Financials</TabsTrigger>
            <TabsTrigger value="technicals" className="text-xs gap-1.5"><Activity className="w-3.5 h-3.5" />Technicals</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} />
              <MetricCard label="Volume" value={formatVolume(stock.volume)} />
              <MetricCard label="Rel. Volume" value={formatRatio(stock.relative_volume)} />
              <MetricCard label="Avg Vol 10D" value={formatVolume(stock.avg_volume_10d)} />
            </div>
            <RangeBar label="52W Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>

          {/* Valuation */}
          <TabsContent value="valuation" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="P/B Ratio" value={formatRatio(stock.pb_ratio)} />
              <MetricCard label="P/S Ratio" value={formatRatio(stock.ps_ratio)} />
              <MetricCard label="EV/EBITDA" value={formatRatio(stock.ev_ebitda)} />
              <MetricCard label="Dividend Yield" value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "—"} positive={stock.dividend_yield != null && stock.dividend_yield > 0 ? true : null} />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} />
            </div>
          </TabsContent>

          {/* Financials */}
          <TabsContent value="financials" className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <MetricCard label="ROE" value={formatPercent(stock.roe)} positive={stock.roe != null ? stock.roe > 0 : null} />
              <MetricCard label="ROA" value={formatPercent(stock.roa)} positive={stock.roa != null ? stock.roa > 0 : null} />
              <MetricCard label="Net Margin" value={formatPercent(stock.net_margin)} positive={stock.net_margin != null ? stock.net_margin > 0 : null} />
              <MetricCard label="Operating Margin" value={formatPercent(stock.operating_margin)} positive={stock.operating_margin != null ? stock.operating_margin > 0 : null} />
              <MetricCard label="Gross Margin" value={formatPercent(stock.gross_margin)} positive={stock.gross_margin != null ? stock.gross_margin > 0 : null} />
              <MetricCard label="Revenue" value={formatMarketCap(stock.total_revenue)} />
              <MetricCard label="Net Income" value={formatMarketCap(stock.net_income)} positive={stock.net_income != null ? stock.net_income > 0 : null} />
              <MetricCard label="Debt/Equity" value={formatRatio(stock.debt_to_equity)} />
              <MetricCard label="Current Ratio" value={formatRatio(stock.current_ratio)} />
            </div>
          </TabsContent>

          {/* Technicals */}
          <TabsContent value="technicals" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <RSIGauge value={stock.rsi} />
              <div className="rounded-xl bg-muted/50 p-3 space-y-2">
                <p className="text-[11px] text-muted-foreground">Beta (1Y)</p>
                <p className="text-lg font-bold">{formatRatio(stock.beta)}</p>
                <p className="text-[10px] text-muted-foreground">ATR: {formatCurrency(stock.atr)}</p>
              </div>
            </div>

            {/* SMAs */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Moving Averages</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "SMA 10", val: stock.sma10 },
                  { label: "SMA 20", val: stock.sma20 },
                  { label: "SMA 50", val: stock.sma50 },
                ].map((sma) => (
                  <div key={sma.label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{sma.label}</p>
                    <p className={cn("text-xs font-semibold", stock.close != null && sma.val != null && stock.close > sma.val ? "text-profit" : "text-loss")}>
                      {formatCurrency(sma.val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className="rounded-xl border border-border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Performance</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "1W", val: stock.perf_w },
                  { label: "1M", val: stock.perf_1m },
                  { label: "3M", val: stock.perf_3m },
                  { label: "1Y", val: stock.perf_y },
                ].map((p) => (
                  <div key={p.label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{p.label}</p>
                    <p className={cn("text-xs font-semibold", p.val != null && p.val >= 0 ? "text-profit" : "text-loss")}>
                      {formatPercent(p.val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <RangeBar label="52W Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
