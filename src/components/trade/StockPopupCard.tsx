import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type FundamentalData,
  formatMarketCap,
  formatPercent,
  formatRatio,
  formatCurrency,
  formatVolume,
} from "@/hooks/useFundamentals";
import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity, ExternalLink, Plus, Layers } from "lucide-react";

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

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
}) {
  return (
    <div
      className={cn(
        "relative rounded-[14px] bg-card border border-border p-3.5 space-y-1 transition-all duration-150",
        "hover:border-primary/20 hover:shadow-sm",
        positive != null && "overflow-hidden"
      )}
    >
      {/* Accent bar */}
      {positive != null && (
        <div
          className={cn(
            "absolute left-0 top-2 bottom-2 w-[2px] rounded-full",
            positive ? "bg-profit" : "bg-loss"
          )}
        />
      )}
      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">{label}</p>
      <p
        className={cn(
          "text-[15px] font-semibold font-mono leading-tight",
          positive === true && "text-profit",
          positive === false && "text-loss"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ─── Summary Stat (for the horizontal strip) ─── */
function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0">
      <span className="text-[9px] text-muted-foreground tracking-widest uppercase whitespace-nowrap">{label}</span>
      <span className="text-xs font-semibold font-mono text-foreground whitespace-nowrap">{value}</span>
    </div>
  );
}

/* ─── 52W Range Insight ─── */
function RangeInsight({
  low,
  high,
  current,
}: {
  low: number | null;
  high: number | null;
  current: number | null;
}) {
  if (low == null || high == null || current == null) return null;
  const range = high - low;
  const pct = range > 0 ? Math.min(100, Math.max(0, ((current - low) / range) * 100)) : 50;
  const fromLow = low > 0 ? (((current - low) / low) * 100).toFixed(1) : "—";
  const fromHigh = high > 0 ? (((high - current) / high) * 100).toFixed(1) : "—";

  return (
    <div className="rounded-[14px] bg-card border border-border p-4 space-y-3 shadow-sm">
      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">52-Week Range</p>

      {/* Labels row */}
      <div className="grid grid-cols-3 text-center gap-1">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Low</p>
          <p className="text-xs font-semibold font-mono text-loss">{formatCurrency(low)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">Current</p>
          <p className="text-xs font-semibold font-mono text-foreground">{formatCurrency(current)}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase">High</p>
          <p className="text-xs font-semibold font-mono text-profit">{formatCurrency(high)}</p>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-muted">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-loss/50 via-warning/50 to-profit/50" />
        {/* Diamond marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 rounded-[2px] bg-primary border-2 border-card shadow-md"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>

      {/* Distance labels */}
      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
        <span>{fromLow}% from low</span>
        <span>{fromHigh}% from high</span>
      </div>
    </div>
  );
}

/* ─── RSI Gauge ─── */
function RSIGauge({ value }: { value: number | null }) {
  if (value == null) return <MetricCard label="RSI (14)" value="—" />;
  const color = value > 70 ? "text-loss" : value < 30 ? "text-profit" : "text-foreground";
  const label = value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral";

  return (
    <div className="rounded-[14px] bg-card border border-border p-3.5 space-y-2 hover:border-primary/20 hover:shadow-sm transition-all duration-150">
      <p className="text-[10px] text-muted-foreground tracking-widest uppercase">RSI (14)</p>
      <p className={cn("text-xl font-bold font-mono", color)}>{value.toFixed(1)}</p>

      {/* Segmented RSI bar */}
      <div className="relative h-2 rounded-full overflow-hidden bg-muted">
        {/* Zone backgrounds */}
        <div className="absolute inset-y-0 left-0 w-[30%] bg-profit/20 rounded-l-full" />
        <div className="absolute inset-y-0 left-[30%] w-[40%] bg-muted-foreground/10" />
        <div className="absolute inset-y-0 right-0 w-[30%] bg-loss/20 rounded-r-full" />
        {/* Indicator */}
        <div
          className="absolute top-0 h-full w-[3px] rounded-full bg-primary shadow"
          style={{ left: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>

      <p className={cn("text-[10px] font-medium", color)}>{label}</p>
    </div>
  );
}

/* ─── SMA Signal Badge ─── */
function SMASignal({ label, smaVal, current }: { label: string; smaVal: number | null; current: number | null }) {
  const above = current != null && smaVal != null && current > smaVal;
  return (
    <div className="space-y-0.5 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-semibold font-mono", above ? "text-profit" : "text-loss")}>
        {formatCurrency(smaVal)}
      </p>
      <Badge
        variant="outline"
        className={cn(
          "text-[8px] px-1.5 py-0 h-4 border-0",
          above ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
        )}
      >
        {above ? "Above" : "Below"}
      </Badge>
    </div>
  );
}

/* ─── Perf Pill ─── */
function PerfPill({ label, value }: { label: string; value: number | null }) {
  const pos = value != null && value >= 0;
  return (
    <div className="space-y-0.5 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <span
        className={cn(
          "inline-block text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full",
          pos ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
        )}
      >
        {formatPercent(value)}
      </span>
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export function StockPopupCard({ open, onOpenChange, stock }: StockPopupCardProps) {
  if (!stock) return null;

  const isPositive = (stock.change ?? 0) >= 0;
  const symbol = stock.ticker?.replace("NSE:", "") || stock.name || "—";
  const capClass = getCapClassification(stock.market_cap);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  // 52W % from high
  const pctFrom52H =
    stock.high_52w && stock.close
      ? (((stock.high_52w - stock.close) / stock.high_52w) * 100).toFixed(1)
      : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto p-0 rounded-2xl gap-0 shadow-2xl border-border/50">
        {/* ── Hero Header ── */}
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0">
              <DialogTitle className="text-xl font-bold tracking-tight leading-none">{symbol}</DialogTitle>
              <p className="text-sm text-muted-foreground truncate">{stock.description || stock.name || "—"}</p>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <Badge variant="secondary" className="text-[9px] font-semibold tracking-wider">NSE</Badge>
                {stock.sector && <Badge variant="outline" className="text-[9px]">{stock.sector}</Badge>}
                {stock.industry && <Badge variant="outline" className="text-[9px]">{stock.industry}</Badge>}
                <Badge variant="outline" className={cn("text-[9px] border-transparent font-semibold", capClass.color)}>
                  {capClass.label}
                </Badge>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <p className="text-2xl font-bold font-mono tracking-tight leading-none">{formatCurrency(stock.close)}</p>
              <div
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                  isPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                )}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {formatPercent(stock.change)}
              </div>
              <p className="text-[9px] text-muted-foreground tracking-wide">Delayed · {timeStr}</p>
            </div>
          </div>
        </DialogHeader>

        {/* ── Market Summary Strip ── */}
        <div className="flex items-center justify-around gap-2 px-5 py-2.5 border-b border-border bg-muted/30">
          <SummaryStat label="Mkt Cap" value={formatMarketCap(stock.market_cap)} />
          <div className="w-px h-6 bg-border" />
          <SummaryStat label="P/E" value={formatRatio(stock.pe_ratio)} />
          <div className="w-px h-6 bg-border" />
          <SummaryStat label="Volume" value={formatVolume(stock.volume)} />
          <div className="w-px h-6 bg-border" />
          <SummaryStat label="52W High" value={`-${pctFrom52H}%`} />
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview" className="px-5 pt-4 pb-0">
          <TabsList className="w-full grid grid-cols-4 mb-4 h-9 bg-muted/60">
            <TabsTrigger value="overview" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:font-semibold">
              <BarChart3 className="w-3.5 h-3.5" />Overview
            </TabsTrigger>
            <TabsTrigger value="valuation" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:font-semibold">
              <DollarSign className="w-3.5 h-3.5" />Valuation
            </TabsTrigger>
            <TabsTrigger value="financials" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:font-semibold">
              <Layers className="w-3.5 h-3.5" />Financials
            </TabsTrigger>
            <TabsTrigger value="technicals" className="text-xs gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:font-semibold">
              <Activity className="w-3.5 h-3.5" />Technicals
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} positive={stock.eps != null ? stock.eps > 0 : null} />
              <MetricCard label="Volume" value={formatVolume(stock.volume)} />
              <MetricCard label="Rel. Volume" value={formatRatio(stock.relative_volume)} />
              <MetricCard label="Avg Vol 10D" value={formatVolume(stock.avg_volume_10d)} />
            </div>
            <RangeInsight low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>

          {/* Valuation */}
          <TabsContent value="valuation" className="space-y-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
              <MetricCard label="P/B Ratio" value={formatRatio(stock.pb_ratio)} />
              <MetricCard label="P/S Ratio" value={formatRatio(stock.ps_ratio)} />
              <MetricCard
                label="Dividend Yield"
                value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "—"}
                positive={stock.dividend_yield != null && stock.dividend_yield > 0 ? true : null}
              />
              <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} positive={stock.eps != null ? stock.eps > 0 : null} />
              <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
            </div>
          </TabsContent>

          {/* Financials */}
          <TabsContent value="financials" className="space-y-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <MetricCard label="ROE" value={formatPercent(stock.roe)} positive={stock.roe != null ? stock.roe > 0 : null} />
              <MetricCard label="ROA" value={formatPercent(stock.roa)} positive={stock.roa != null ? stock.roa > 0 : null} />
              <MetricCard label="Net Margin" value={formatPercent(stock.net_margin)} positive={stock.net_margin != null ? stock.net_margin > 0 : null} />
              <MetricCard label="Oper. Margin" value={formatPercent(stock.operating_margin)} positive={stock.operating_margin != null ? stock.operating_margin > 0 : null} />
              <MetricCard label="Gross Margin" value={formatPercent(stock.gross_margin)} positive={stock.gross_margin != null ? stock.gross_margin > 0 : null} />
              <MetricCard label="Revenue" value={formatMarketCap(stock.total_revenue)} />
              <MetricCard label="Net Income" value={formatMarketCap(stock.net_income)} positive={stock.net_income != null ? stock.net_income > 0 : null} />
              <MetricCard label="Debt/Equity" value={formatRatio(stock.debt_to_equity)} />
              <MetricCard label="Current Ratio" value={formatRatio(stock.current_ratio)} />
            </div>
          </TabsContent>

          {/* Technicals */}
          <TabsContent value="technicals" className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-2.5">
              <RSIGauge value={stock.rsi} />
              <div className="rounded-[14px] bg-card border border-border p-3.5 space-y-2 hover:border-primary/20 hover:shadow-sm transition-all duration-150">
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Beta (1Y)</p>
                <p className="text-xl font-bold font-mono">{formatRatio(stock.beta)}</p>
                <p className="text-[10px] text-muted-foreground">
                  ATR: <span className="font-mono font-semibold text-foreground">{formatCurrency(stock.atr)}</span>
                </p>
              </div>
            </div>

            {/* Moving Averages */}
            <div className="rounded-[14px] bg-card border border-border p-4 space-y-3 hover:border-primary/20 hover:shadow-sm transition-all duration-150">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Moving Averages</p>
              <div className="grid grid-cols-3 gap-3">
                <SMASignal label="SMA 10" smaVal={stock.sma10} current={stock.close} />
                <SMASignal label="SMA 20" smaVal={stock.sma20} current={stock.close} />
                <SMASignal label="SMA 50" smaVal={stock.sma50} current={stock.close} />
              </div>
            </div>

            {/* Performance */}
            <div className="rounded-[14px] bg-card border border-border p-4 space-y-3 hover:border-primary/20 hover:shadow-sm transition-all duration-150">
              <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Performance</p>
              <div className="grid grid-cols-4 gap-2.5">
                <PerfPill label="1W" value={stock.perf_w} />
                <PerfPill label="1M" value={stock.perf_1m} />
                <PerfPill label="3M" value={stock.perf_3m} />
                <PerfPill label="1Y" value={stock.perf_y} />
              </div>
            </div>

            <RangeInsight low={stock.low_52w} high={stock.high_52w} current={stock.close} />
          </TabsContent>
        </Tabs>

        {/* ── Bottom Actions ── */}
        <div className="sticky bottom-0 border-t border-border bg-card/90 backdrop-blur-md p-4 flex gap-3 rounded-b-2xl">
          <Button variant="outline" className="flex-1 gap-2 text-xs h-10 rounded-xl hover:border-primary/30">
            <ExternalLink className="w-3.5 h-3.5" />
            View Full Details
          </Button>
          <Button className="flex-1 gap-2 text-xs h-10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <Plus className="w-3.5 h-3.5" />
            Add to Watchlist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
