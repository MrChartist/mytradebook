import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useWatchlists, useWatchlistItems } from "@/hooks/useWatchlists";
import { CreateTradeModal } from "@/components/modals/CreateTradeModal";
import { CreateAlertModal } from "@/components/modals/CreateAlertModal";
import { CreateStudyModal } from "@/components/modals/CreateStudyModal";
import { toast } from "sonner";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Activity,
  ExternalLink,
  Layers,
  ArrowUp,
  ArrowDown,
  Gauge,
  Building2,
  IndianRupee,
  ShoppingCart,
  Bell,
  BookOpen,
  Bookmark,
} from "lucide-react";

interface StockPopupCardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stock: FundamentalData | null;
}

function getCapClassification(mc: number | null): { label: string; color: string; bg: string } {
  if (mc == null) return { label: "—", color: "text-muted-foreground", bg: "bg-muted" };
  const crores = mc / 1e7;
  if (crores >= 20000) return { label: "Large Cap", color: "text-blue-500", bg: "bg-blue-500/10" };
  if (crores >= 5000) return { label: "Mid Cap", color: "text-amber-500", bg: "bg-amber-500/10" };
  return { label: "Small Cap", color: "text-muted-foreground", bg: "bg-muted" };
}

/* ─── Metric Card ─── */
function MetricCard({
  label,
  value,
  sub,
  positive,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean | null;
  icon?: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-xl bg-muted/40 border border-border/60 p-3 sm:p-3.5 space-y-1.5 transition-all hover:border-primary/25 hover:bg-muted/60">
      {positive != null && (
        <div
          className={cn(
            "absolute left-0 top-3 bottom-3 w-[2.5px] rounded-full",
            positive ? "bg-profit" : "bg-loss"
          )}
        />
      )}
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">{label}</p>
      </div>
      <p
        className={cn(
          "text-sm sm:text-[15px] font-bold font-mono leading-tight",
          positive === true && "text-profit",
          positive === false && "text-loss"
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] sm:text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ─── Summary Stat ─── */
function SummaryStat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-0 px-1">
      <span className="text-[10px] sm:text-[11px] text-muted-foreground tracking-wider uppercase whitespace-nowrap font-medium">{label}</span>
      <span className={cn("text-xs sm:text-sm font-bold font-mono whitespace-nowrap", highlight ? "text-primary" : "text-foreground")}>{value}</span>
    </div>
  );
}

/* ─── Range Insight ─── */
function RangeInsight({
  label,
  low,
  high,
  current,
  lowLabel = "Low",
  highLabel = "High",
}: {
  label: string;
  low: number | null;
  high: number | null;
  current: number | null;
  lowLabel?: string;
  highLabel?: string;
}) {
  if (low == null || high == null || current == null) return null;
  const range = high - low;
  const pct = range > 0 ? Math.min(100, Math.max(0, ((current - low) / range) * 100)) : 50;
  const fromLow = low > 0 ? (((current - low) / low) * 100).toFixed(1) : "—";
  const fromHigh = high > 0 ? (((high - current) / high) * 100).toFixed(1) : "—";

  return (
    <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
      <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">{label}</p>
      <div className="grid grid-cols-3 text-center gap-1">
        <div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase">{lowLabel}</p>
          <p className="text-sm sm:text-base font-bold font-mono text-loss">{formatCurrency(low)}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase">Current</p>
          <p className="text-sm sm:text-base font-bold font-mono text-foreground">{formatCurrency(current)}</p>
        </div>
        <div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase">{highLabel}</p>
          <p className="text-sm sm:text-base font-bold font-mono text-profit">{formatCurrency(high)}</p>
        </div>
      </div>
      <div className="relative h-2.5 rounded-full overflow-hidden bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, hsl(var(--loss) / 0.5), hsl(var(--warning) / 0.5), hsl(var(--profit) / 0.5))`,
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary border-[2.5px] border-card shadow-lg"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      <div className="flex justify-between text-[11px] sm:text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1">
          <ArrowUp className="w-3 h-3 text-profit" />
          {fromLow}% from {lowLabel.toLowerCase()}
        </span>
        <span className="flex items-center gap-1">
          <ArrowDown className="w-3 h-3 text-loss" />
          {fromHigh}% from {highLabel.toLowerCase()}
        </span>
      </div>
    </div>
  );
}

/* ─── RSI Gauge ─── */
function RSIGauge({ value }: { value: number | null }) {
  if (value == null) return <MetricCard label="RSI (14)" value="—" icon={<Gauge className="w-3 h-3 text-muted-foreground" />} />;
  const color = value > 70 ? "text-loss" : value < 30 ? "text-profit" : "text-foreground";
  const label = value > 70 ? "Overbought" : value < 30 ? "Oversold" : "Neutral";
  const bgColor = value > 70 ? "bg-loss/10" : value < 30 ? "bg-profit/10" : "bg-muted/60";

  return (
    <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-muted-foreground" />
          <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">RSI (14)</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] sm:text-[11px] h-5 border-0 font-semibold", bgColor, color)}>
          {label}
        </Badge>
      </div>
      <p className={cn("text-2xl sm:text-3xl font-bold font-mono", color)}>{value.toFixed(1)}</p>
      <div className="relative h-3 rounded-full overflow-hidden bg-muted flex">
        <div className="h-full w-[30%] bg-profit/25 rounded-l-full" />
        <div className="h-full w-[40%] bg-muted-foreground/8" />
        <div className="h-full w-[30%] bg-loss/25 rounded-r-full" />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-card shadow-md"
          style={{ left: `calc(${Math.min(100, Math.max(0, value))}% - 6px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] sm:text-[11px] text-muted-foreground font-medium">
        <span>Oversold (0-30)</span>
        <span>Neutral</span>
        <span>Overbought (70-100)</span>
      </div>
    </div>
  );
}

/* ─── SMA Signal Badge ─── */
function SMASignal({ label, smaVal, current }: { label: string; smaVal: number | null; current: number | null }) {
  const above = current != null && smaVal != null && current > smaVal;
  const diff = current != null && smaVal != null && smaVal > 0 ? (((current - smaVal) / smaVal) * 100) : null;
  return (
    <div className="rounded-lg bg-muted/30 border border-border/40 p-3 space-y-1.5 text-center">
      <p className="text-[11px] sm:text-xs text-muted-foreground font-medium">{label}</p>
      <p className={cn("text-sm sm:text-base font-bold font-mono", above ? "text-profit" : "text-loss")}>
        {formatCurrency(smaVal)}
      </p>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] sm:text-[11px] px-2 py-0.5 h-5 border-0 font-semibold",
          above ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
        )}
      >
        {above ? "▲ Above" : "▼ Below"}
        {diff != null && ` ${Math.abs(diff).toFixed(1)}%`}
      </Badge>
    </div>
  );
}

/* ─── Perf Pill ─── */
function PerfPill({ label, value }: { label: string; value: number | null }) {
  const pos = value != null && value >= 0;
  return (
    <div className="space-y-1.5 text-center">
      <p className="text-[11px] sm:text-xs text-muted-foreground font-semibold">{label}</p>
      <span
        className={cn(
          "inline-block text-xs sm:text-sm font-bold font-mono px-3 py-1 rounded-full",
          pos ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
        )}
      >
        {value != null && value > 0 && "+"}
        {formatPercent(value)}
      </span>
    </div>
  );
}

/* ═══════════════════ MAIN COMPONENT ═══════════════════ */
export function StockPopupCard({ open, onOpenChange, stock }: StockPopupCardProps) {
  const navigate = useNavigate();
  const { watchlists } = useWatchlists();
  const firstWatchlist = watchlists[0] ?? null;
  const { addItem } = useWatchlistItems(firstWatchlist?.id ?? null);

  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);

  const handleNavigate = (path: string) => {
    onOpenChange(false);
    navigate(path);
  };

  if (!stock) return null;

  const isPositive = (stock.change ?? 0) >= 0;
  const symbol = stock.ticker?.replace("NSE:", "") || stock.name || "—";
  const capClass = getCapClassification(stock.market_cap);
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });

  const pctFrom52H =
    stock.high_52w && stock.close
      ? (((stock.high_52w - stock.close) / stock.high_52w) * 100).toFixed(1)
      : "—";

  const handleTrade = () => handleNavigate("/trades");
  const handleAlert = () => handleNavigate("/alerts");
  const handleStudy = () => handleNavigate("/studies");

  const handleWatchlist = () => {
    if (!firstWatchlist) {
      toast.info("No watchlist found — redirecting to create one.");
      onOpenChange(false);
      navigate("/watchlist");
      return;
    }
    addItem.mutate(
      { watchlist_id: firstWatchlist.id, symbol, exchange: "NSE" },
      {
        onSuccess: () => toast.success(`${symbol} added to "${firstWatchlist.name}"`),
        onError: (err) => {
          if (err.message?.includes("duplicate") || err.message?.includes("unique")) {
            toast.info(`${symbol} is already in "${firstWatchlist.name}"`);
          } else {
            toast.error("Failed to add to watchlist");
          }
        },
      }
    );
  };

  const handleTradingView = () => {
    window.open(`https://www.tradingview.com/chart/?symbol=NSE:${symbol}`, "_blank");
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[92vh] overflow-y-auto p-0 rounded-2xl gap-0 shadow-2xl border-border/50 bg-card sm:w-full">
          {/* ── Hero Header ── */}
          <DialogHeader className="relative p-4 sm:p-5 pb-3 sm:pb-4 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight leading-none">{symbol}</DialogTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate mt-0.5">{stock.description || stock.name || "—"}</p>
                  </div>
                  {/* Price on mobile */}
                  <div className="sm:hidden text-right shrink-0">
                    <p className="text-lg font-bold font-mono tracking-tight leading-none">
                      {stock.close != null ? `₹${stock.close.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                    </p>
                    <div className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold mt-0.5", isPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss")}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive && "+"}{formatPercent(stock.change)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px] sm:text-[11px] font-semibold tracking-wider h-5">NSE</Badge>
                  {stock.sector && <Badge variant="outline" className="text-[10px] sm:text-[11px] h-5">{stock.sector}</Badge>}
                  {stock.industry && <Badge variant="outline" className="text-[10px] sm:text-[11px] h-5 hidden sm:inline-flex">{stock.industry}</Badge>}
                  <Badge variant="outline" className={cn("text-[10px] sm:text-[11px] border-0 font-semibold h-5", capClass.color, capClass.bg)}>
                    {capClass.label}
                  </Badge>
                </div>
              </div>

              {/* Price on desktop */}
              <div className="hidden sm:block text-right shrink-0 space-y-1.5">
                <div className="flex items-baseline gap-1 justify-end">
                  <IndianRupee className="w-4 h-4 text-muted-foreground mb-0.5" />
                  <p className="text-2xl font-bold font-mono tracking-tight leading-none">
                    {stock.close != null ? stock.close.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                  </p>
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
                    isPositive ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}
                >
                  {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPositive && "+"}{formatPercent(stock.change)}
                </div>
                <p className="text-[10px] text-muted-foreground tracking-wide">Delayed · {timeStr} IST</p>
              </div>
            </div>
          </DialogHeader>

          {/* ── Market Summary Strip ── */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-around gap-2 sm:gap-1 px-4 sm:px-5 py-2.5 border-y border-border bg-muted/20">
            <SummaryStat label="Mkt Cap" value={formatMarketCap(stock.market_cap)} highlight />
            <SummaryStat label="P/E" value={formatRatio(stock.pe_ratio)} />
            <SummaryStat label="Volume" value={formatVolume(stock.volume)} />
            <SummaryStat label="52W High" value={`-${pctFrom52H}%`} />
            <div className="hidden sm:block">
              <SummaryStat label="Div Yield" value={stock.dividend_yield != null ? `${stock.dividend_yield.toFixed(2)}%` : "—"} />
            </div>
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview" className="px-4 sm:px-5 pt-3 sm:pt-4 pb-0">
            <TabsList className="w-full grid grid-cols-4 mb-3 sm:mb-4 h-9 sm:h-10 bg-muted/50 rounded-xl p-0.5">
              <TabsTrigger value="overview" className="text-[11px] sm:text-xs gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-bold">
                <BarChart3 className="w-3.5 h-3.5" /><span className="hidden xs:inline">Overview</span><span className="xs:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="valuation" className="text-[11px] sm:text-xs gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-bold">
                <DollarSign className="w-3.5 h-3.5" /><span className="hidden xs:inline">Valuation</span><span className="xs:hidden">Val</span>
              </TabsTrigger>
              <TabsTrigger value="financials" className="text-[11px] sm:text-xs gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-bold">
                <Layers className="w-3.5 h-3.5" /><span className="hidden xs:inline">Financials</span><span className="xs:hidden">Fin</span>
              </TabsTrigger>
              <TabsTrigger value="technicals" className="text-[11px] sm:text-xs gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:font-bold">
                <Activity className="w-3.5 h-3.5" /><span className="hidden xs:inline">Technicals</span><span className="xs:hidden">Tech</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview" className="space-y-3 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <MetricCard label="Market Cap" value={formatMarketCap(stock.market_cap)} />
                <MetricCard label="P/E (TTM)" value={formatRatio(stock.pe_ratio)} />
                <MetricCard label="EPS (TTM)" value={formatCurrency(stock.eps)} positive={stock.eps != null ? stock.eps > 0 : null} />
                <MetricCard label="Volume" value={formatVolume(stock.volume)} />
                <MetricCard label="Rel. Volume" value={formatRatio(stock.relative_volume)} />
                <MetricCard label="Avg Vol 10D" value={formatVolume(stock.avg_volume_10d)} />
              </div>
              <RangeInsight label="52-Week Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} lowLabel="52W Low" highLabel="52W High" />
              <RangeInsight label="All-Time Range" low={stock.atl} high={stock.ath} current={stock.close} lowLabel="ATL" highLabel="ATH" />
            </TabsContent>

            {/* Valuation */}
            <TabsContent value="valuation" className="space-y-3 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <div className="rounded-xl bg-muted/30 border border-border/60 p-4 space-y-2">
                <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">Quick Assessment</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "P/E", val: stock.pe_ratio, good: 20 },
                    { label: "P/B", val: stock.pb_ratio, good: 3 },
                    { label: "Div Yield", val: stock.dividend_yield, good: 1, invert: true },
                  ].map((m) => {
                    const isGood = m.val != null && (m.invert ? m.val >= m.good : m.val <= m.good) && m.val > 0;
                    return (
                      <div key={m.label} className="text-center space-y-1">
                        <p className="text-[11px] sm:text-xs text-muted-foreground">{m.label}</p>
                        <Badge variant="outline" className={cn("text-[10px] sm:text-[11px] h-5 border-0 font-semibold", isGood ? "bg-profit/10 text-profit" : "bg-muted text-muted-foreground")}>
                          {m.val != null && m.val > 0 ? (isGood ? "✓ Attractive" : "Moderate") : "N/A"}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Financials */}
            <TabsContent value="financials" className="space-y-3 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
              <div className="rounded-xl bg-muted/30 border border-border/60 p-4 space-y-2">
                <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">Financial Health Snapshot</p>
                <div className="space-y-2.5">
                  {[
                    { label: "ROE", val: stock.roe, max: 40 },
                    { label: "Net Margin", val: stock.net_margin, max: 30 },
                    { label: "Current Ratio", val: stock.current_ratio, max: 3 },
                  ].map((m) => {
                    const pct = m.val != null ? Math.min(100, Math.max(0, (m.val / m.max) * 100)) : 0;
                    const isGood = m.val != null && m.val > 0;
                    return (
                      <div key={m.label} className="flex items-center gap-3">
                        <span className="text-[11px] sm:text-xs text-muted-foreground w-24 shrink-0">{m.label}</span>
                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", isGood ? "bg-profit/60" : "bg-loss/60")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={cn("text-xs sm:text-sm font-mono font-semibold w-16 text-right", isGood ? "text-profit" : "text-loss")}>
                          {m.val != null ? (m.label === "Current Ratio" ? formatRatio(m.val) : formatPercent(m.val)) : "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* Technicals */}
            <TabsContent value="technicals" className="space-y-3 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <RSIGauge value={stock.rsi} />
                <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
                  <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">Volatility</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">Beta (1Y)</p>
                      <p className="text-xl sm:text-2xl font-bold font-mono">{formatRatio(stock.beta)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground">ATR (14)</p>
                      <p className="text-sm sm:text-base font-bold font-mono">{formatCurrency(stock.atr)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
                <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">Moving Averages</p>
                <div className="grid grid-cols-3 gap-2">
                  <SMASignal label="SMA 10" smaVal={stock.sma10} current={stock.close} />
                  <SMASignal label="SMA 20" smaVal={stock.sma20} current={stock.close} />
                  <SMASignal label="SMA 50" smaVal={stock.sma50} current={stock.close} />
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-3">
                <p className="text-[11px] sm:text-xs text-muted-foreground tracking-wider uppercase font-semibold">Performance</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <PerfPill label="1W" value={stock.perf_w} />
                  <PerfPill label="1M" value={stock.perf_1m} />
                  <PerfPill label="3M" value={stock.perf_3m} />
                  <PerfPill label="1Y" value={stock.perf_y} />
                </div>
              </div>

              <RangeInsight label="52-Week Range" low={stock.low_52w} high={stock.high_52w} current={stock.close} lowLabel="52W Low" highLabel="52W High" />
              <RangeInsight label="All-Time Range" low={stock.atl} high={stock.ath} current={stock.close} lowLabel="ATL" highLabel="ATH" />
            </TabsContent>
          </Tabs>

          {/* ── Bottom Actions — landscape-friendly horizontal layout ── */}
          <div className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur-md p-3 sm:p-4 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors"
                onClick={handleTrade}
              >
                <ShoppingCart className="w-4 h-4 text-primary" />
                Trade
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors"
                onClick={handleAlert}
              >
                <Bell className="w-4 h-4 text-primary" />
                Alert
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10 rounded-xl hover:border-primary/30 hover:bg-primary/5 transition-colors"
                onClick={handleStudy}
              >
                <BookOpen className="w-4 h-4 text-primary" />
                Study
              </Button>
              <Button
                className="flex-1 gap-1.5 text-xs sm:text-sm h-9 sm:h-10 rounded-xl shadow-sm hover:shadow-md transition-all"
                onClick={handleWatchlist}
              >
                <Bookmark className="w-4 h-4" />
                Watchlist
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-1.5 text-[11px] sm:text-xs text-muted-foreground h-7 sm:h-8 mt-1.5 hover:text-foreground"
              onClick={handleTradingView}
            >
              <ExternalLink className="w-3 h-3" />
              View on TradingView
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Action Modals */}
      <CreateTradeModal open={showTradeModal} onOpenChange={setShowTradeModal} />
      <CreateAlertModal open={showAlertModal} onOpenChange={setShowAlertModal} prefillSymbol={symbol} prefillExchange="NSE" />
      <CreateStudyModal open={showStudyModal} onOpenChange={setShowStudyModal} />
    </>
  );
}
