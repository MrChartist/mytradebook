import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, ExternalLink, Plus } from "lucide-react";

interface StockPopupCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: FundamentalData | null;
}

function getCapClassification(mc: number | null): { label: string; color: string } {
  if (mc == null) return { label: "—", color: "text-muted-foreground" };
  const crores = mc / 1e7;
  if (crores >= 20000) return { label: "Large Cap", color: "text-blue-500" };
  if (crores >= 5000) return { label: "Mid Cap", color: "text-amber-500" };
  return { label: "Small Cap", color: "text-muted-foreground" };
}

function MetricCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean | null }) {
  return (
    <div className="rounded-[14px] bg-card border border-border p-3.5 space-y-1">
      <p className="text-[11px] text-muted-foreground tracking-wide uppercase">{label}</p>
      <p className={cn("text-sm font-semibold font-mono", positive === true && "text-profit", positive === false && "text-loss")}>
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
    <div className="rounded-[14px] bg-card border border-border p-4 space-y-3">
      <div className="flex justify-between items-center">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-xs font-semibold font-mono">{formatCurrency(current)}</p>
      </div>
      <div className="relative h-2.5 rounded-full bg-muted overflow-hidden">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/40 via-warning/40 to-profit/40" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-2 border-card shadow-lg ring-2 ring-primary/20"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>Low {formatCurrency(low)}</span>
        <span>High {formatCurrency(high)}</span>
      </div>
    </div>
  );
}

function RSIGauge({ value }: { value: number | null }) {
  if (value == null) return <MetricCard label="RSI (14)" value="—" />;
  const color = value > 70 ? "text-loss" : value < 30 ? "text-profit" : "text-foreground";
  const label = value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral";
  return (
    <div className="rounded-[14px] bg-card border border-border p-3.5 space-y-2">
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">RSI (14)</p>
      <p className={cn("text-xl font-bold font-mono", color)}>{value.toFixed(1)}</p>
      <Progress value={value} className="h-1.5" />
      <p className={cn("text-[10px] font-medium", color)}>{label}</p>
    </div>
  );
}

export function StockPopupCard({ open, onOpenChange, stock }: StockPopupCardProps) {
  if (!stock) return null;

  const isPositive = (stock.change ?? 0) >= 0;
  const symbol = stock.ticker?.replace("NSE:", "") || stock.name || "—";
  const capClass = getCapClassification(stock.market_cap);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-2xl gap-0">
        {/* Hero Header */}
        <DialogHeader className="p-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <DialogTitle className="text-xl font-bold tracking-tight">{symbol}</DialogTitle>
              <p className="text-sm text-muted-foreground">{stock.description || "—"}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="secondary" className="text-[10px] font-medium">NSE</Badge>
                {stock.sector && <Badge variant="outline" className="text-[10px]">{stock.sector}</Badge>}
                {stock.industry && <Badge variant="outline" className="text-[10px]">{stock.industry}</Badge>}
                <Badge variant="outline" className={cn("text-[10px] border-transparent", capClass.color)}>
                  {capClass.label}
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0 space-y-1">
              <p className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(stock.close)}</p>
              <div className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                isPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
              )}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(stock.change)}
              </div>
              <p className="text-[10px] text-muted-foreground">Delayed · {timeStr}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="px-5 pb-0 pt-4">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-9">
            <TabsTrigger value="overview" className="text-xs gap-1.5 data-[state=active]:shadow-sm"><BarChart3 className="w-3.5 h-3.5" />Overview</TabsTrigger>
            <TabsTrigger value="valuation" className="text-xs gap-1.5 data-[state=active]:shadow-sm"><DollarSign className="w-3.5 h-3.5" />Valuation</TabsTrigger>
            <TabsTrigger value="financials" className="text-xs gap-1.5 data-[state=active]:shadow-sm"><TrendingUp className="w-3.5 h-3.5" />Financials</TabsTrigger>
            <TabsTrigger value="technicals" className="text-xs gap-1.5 data-[state=active]:shadow-sm"><Activity className="w-3.5 h-3.5" />Technicals</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} />
              <MetricCard label="Volume" value={formatVolume(stock.volume)} />
              <MetricCard label="Rel. Volume" value={formatRatio(stock.relative_volume)} />
              <MetricCard label="Avg Vol 10D" value={formatVolume(stock.avg_volume_10d)} />
            </div>
            <RangeBar label="52-Week Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>

          {/* Valuation */}
          <TabsContent value="valuation" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="P/B Ratio" value={formatRatio(stock.pb_ratio)} />
              <MetricCard label="P/S Ratio" value={formatRatio(stock.ps_ratio)} />
              <MetricCard label="Dividend Yield" value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "—"} positive={stock.dividend_yield != null && stock.dividend_yield > 0 ? true : null} />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} />
              <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
            </div>
          </TabsContent>

          {/* Financials */}
          <TabsContent value="financials" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
            <div className="grid grid-cols-2 gap-2.5">
              <RSIGauge value={stock.rsi} />
              <div className="rounded-[14px] bg-card border border-border p-3.5 space-y-2">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Beta (1Y)</p>
                <p className="text-xl font-bold font-mono">{formatRatio(stock.beta)}</p>
                <p className="text-[10px] text-muted-foreground">ATR: <span className="font-mono">{formatCurrency(stock.atr)}</span></p>
              </div>
            </div>

            <div className="rounded-[14px] bg-card border border-border p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Moving Averages</p>
              <div className="grid grid-cols-3 gap-2.5 text-center">
                {[
                  { label: "SMA 10", val: stock.sma10 },
                  { label: "SMA 20", val: stock.sma20 },
                  { label: "SMA 50", val: stock.sma50 },
                ].map((sma) => (
                  <div key={sma.label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{sma.label}</p>
                    <p className={cn("text-xs font-semibold font-mono", stock.close != null && sma.val != null && stock.close > sma.val ? "text-profit" : "text-loss")}>
                      {formatCurrency(sma.val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[14px] bg-card border border-border p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Performance</p>
              <div className="grid grid-cols-4 gap-2.5 text-center">
                {[
                  { label: "1W", val: stock.perf_w },
                  { label: "1M", val: stock.perf_1m },
                  { label: "3M", val: stock.perf_3m },
                  { label: "1Y", val: stock.perf_y },
                ].map((p) => (
                  <div key={p.label} className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">{p.label}</p>
                    <p className={cn("text-xs font-semibold font-mono", p.val != null && p.val >= 0 ? "text-profit" : "text-loss")}>
                      {formatPercent(p.val)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <RangeBar label="52-Week Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>
        </Tabs>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 border-t border-border bg-card/80 backdrop-blur-sm p-4 flex gap-3 rounded-b-2xl">
          <Button variant="outline" className="flex-1 gap-2 text-xs h-9">
            <ExternalLink className="w-3.5 h-3.5" />
            View Full Details
          </Button>
          <Button className="flex-1 gap-2 text-xs h-9">
            <Plus className="w-3.5 h-3.5" />
            Add to Watchlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
