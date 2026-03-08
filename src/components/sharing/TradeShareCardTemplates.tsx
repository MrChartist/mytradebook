import type { Trade } from "@/hooks/useTrades";
import { fmt, pct, getCardSize, watermark, type CardSizeId } from "./shareCardUtils";
import type { TradeTarget } from "@/types/trade";

export interface TradeCardData {
  trade: Trade;
  tags?: string[];
  customLogo?: string | null;
  cardSize?: CardSizeId;
}

const segmentLabel = (s: string) => s.replace(/_/g, " ");
const dirLabel = (t: string) => (t === "BUY" ? "LONG" : "SHORT");
const dateStr = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—";
const timeStr = (d: string | null) => d ? new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "";

function computeRR(trade: Trade): string | null {
  if (!trade.entry_price || !trade.stop_loss || !trade.pnl) return null;
  const risk = Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity;
  if (risk === 0) return null;
  const rr = Math.abs(trade.pnl) / risk;
  return `${trade.pnl >= 0 ? "" : "-"}${rr.toFixed(1)}R`;
}

function holdingDuration(entry: string, exit: string | null): string | null {
  if (!exit) return null;
  const ms = new Date(exit).getTime() - new Date(entry).getTime();
  if (ms < 0) return null;
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m`;
  const days = Math.floor(hrs / 24);
  return `${days}d ${hrs % 24}h`;
}

function getTargetsHit(trade: Trade): number {
  if (!trade.targets) return 0;
  try {
    return (trade.targets as unknown as TradeTarget[]).filter((t) => t.hit).length;
  } catch { return 0; }
}

function getTargetsTotal(trade: Trade): number {
  if (!trade.targets) return 0;
  try {
    return (trade.targets as unknown as TradeTarget[]).length;
  } catch { return 0; }
}

// ─── Compact stat box ───
const miniStat = (label: string, value: string, color: string, compact = false) => (
  <div style={{ flex: 1, textAlign: "center", padding: compact ? "10px 4px" : "14px 4px" }}>
    <div style={{ fontSize: compact ? 16 : 20, color: "#9ca3af", marginBottom: compact ? 2 : 4, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: compact ? 22 : 28, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
  </div>
);

const outcomeBadge = (pnl: number, styles: { bg: string; color: string }) => (
  <div style={{
    display: "inline-block", padding: "8px 28px", borderRadius: 12,
    background: styles.bg, color: styles.color, fontSize: 28, fontWeight: 700, letterSpacing: 1,
  }}>
    {pnl >= 0 ? "WIN" : "LOSS"}
  </div>
);

const dirBadge = (type: string, dark: boolean) => (
  <div style={{
    display: "inline-block", padding: "6px 20px", borderRadius: 8,
    background: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    color: type === "BUY" ? "#34d399" : "#f87171",
    fontSize: 24, fontWeight: 700, letterSpacing: 1,
  }}>
    {dirLabel(type)}
  </div>
);

const tagsRow = (tags: string[], dark: boolean) => {
  if (!tags.length) return null;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
      {tags.slice(0, 8).map((t, i) => (
        <div key={i} style={{
          padding: "5px 14px", borderRadius: 8, fontSize: 20, fontWeight: 500,
          background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          color: dark ? "#cbd5e1" : "#6b7280",
        }}>
          {t}
        </div>
      ))}
    </div>
  );
};

const notesRow = (text: string, dark: boolean) => (
  <div style={{
    marginTop: 12, padding: "10px 16px", borderRadius: 10,
    background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
    fontSize: 20, lineHeight: 1.5, fontStyle: "italic",
    color: dark ? "#94a3b8" : "#6b7280",
    overflow: "hidden", maxHeight: 60,
  }}>
    "{text}"
  </div>
);

const chartLinkRow = (link: string, dark: boolean) => (
  <div style={{
    marginTop: 8, padding: "8px 16px", borderRadius: 10,
    background: dark ? "rgba(96,165,250,0.1)" : "rgba(37,99,235,0.06)",
    fontSize: 18, display: "flex", alignItems: "center", gap: 8,
    color: dark ? "#60a5fa" : "#2563eb",
  }}>
    <span style={{ fontSize: 20 }}>📊</span>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{link}</span>
  </div>
);

// Determine if layout should be compact (for twitter/wide formats)
function isCompact(sizeId?: CardSizeId) {
  return sizeId === "twitter";
}

// ═══════════════════════════════════════════════
// TEMPLATE A — Dark Premium
// ═══════════════════════════════════════════════
export function DarkTradeCard({ trade, tags = [], customLogo, cardSize = "square" }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const profitColor = isProfit ? "#34d399" : "#f87171";
  const rr = computeRR(trade);
  const duration = holdingDuration(trade.entry_time, trade.closed_at);
  const targetsHit = getTargetsHit(trade);
  const targetsTotal = getTargetsTotal(trade);
  const size = getCardSize(cardSize);
  const compact = isCompact(cardSize);
  const tall = cardSize === "story";

  return (
    <div style={{
      width: size.width, height: size.height, background: "#0f172a", color: "#f8fafc",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: compact ? 40 : 56,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 6,
        background: isProfit
          ? "linear-gradient(90deg, #34d399, #06b6d4)"
          : "linear-gradient(90deg, #f87171, #fb923c)",
      }} />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: compact ? 36 : 44, fontWeight: 800, letterSpacing: -1 }}>{trade.symbol}</div>
          <div style={{ fontSize: compact ? 18 : 22, color: "#94a3b8", marginTop: 2 }}>
            {segmentLabel(trade.segment)}
            {trade.holding_period && ` · ${trade.holding_period}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {dirBadge(trade.trade_type, true)}
          {outcomeBadge(trade.pnl ?? 0, { bg: isProfit ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)", color: profitColor })}
        </div>
      </div>

      {/* P&L Hero */}
      <div style={{ margin: tall ? "40px 0 32px" : compact ? "12px 0 10px" : "24px 0 20px", textAlign: "center" }}>
        <div style={{ fontSize: compact ? 60 : 84, fontWeight: 800, color: profitColor, fontFamily: "monospace", letterSpacing: -2 }}>
          {fmt(trade.pnl ?? 0)}
        </div>
        <div style={{ fontSize: compact ? 24 : 32, color: profitColor, marginTop: 4, fontWeight: 600 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      {/* Entry → Exit */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: compact ? 22 : 28, fontWeight: 600, marginBottom: compact ? 8 : 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, color: "#9ca3af", marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: compact ? 14 : 18, color: "#64748b" }}>{dateStr(trade.entry_time)} {timeStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 32, color: "#64748b" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, color: "#9ca3af", marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? (trade.current_price?.toFixed(2) ?? "—")}</div>
          <div style={{ fontSize: compact ? 14 : 18, color: "#64748b" }}>{dateStr(trade.closed_at)} {timeStr(trade.closed_at)}</div>
        </div>
      </div>

      {/* Stats grid — row 1 */}
      <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "4px 12px", marginBottom: 8 }}>
        {miniStat("Qty", `${trade.quantity}`, "#f8fafc", compact)}
        {rr && miniStat("R:R", rr, isProfit ? "#34d399" : "#f87171", compact)}
        {trade.stop_loss && miniStat("SL", `₹${trade.stop_loss.toFixed(1)}`, "#f8fafc", compact)}
        {duration && miniStat("Duration", duration, "#f8fafc", compact)}
      </div>

      {/* Stats grid — row 2 */}
      <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "4px 12px" }}>
        {trade.timeframe && miniStat("Timeframe", trade.timeframe, "#f8fafc", compact)}
        {targetsTotal > 0 && miniStat("Targets", `${targetsHit}/${targetsTotal}`, targetsHit > 0 ? "#34d399" : "#9ca3af", compact)}
        {trade.confidence_score != null && miniStat("Confidence", `${trade.confidence_score}/5`, "#60a5fa", compact)}
        {trade.emotion_tag && miniStat("Emotion", trade.emotion_tag, "#c084fc", compact)}
        {trade.rating != null && miniStat("Rating", `${trade.rating}/5`, "#fbbf24", compact)}
      </div>

      {/* Chart link */}
      {trade.chart_link && chartLinkRow(trade.chart_link, true)}

      {/* Strategy ID indicator */}
      {trade.strategy_id && (
        <div style={{
          marginTop: 8, padding: "8px 16px", borderRadius: 10,
          background: "rgba(168,85,247,0.1)", fontSize: 18,
          color: "#c084fc", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>🔗</span> Multi-Leg Strategy Trade
        </div>
      )}

      {/* Closure reason / notes */}
      {trade.closure_reason && notesRow(trade.closure_reason, true)}
      {!trade.closure_reason && trade.notes && notesRow(trade.notes, true)}

      {/* Review data (if available) */}
      {tall && trade.reviewed_at && (
        <div style={{
          marginTop: 16, display: "flex", gap: 8,
          background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "4px 12px",
        }}>
          {trade.review_rating != null && miniStat("Review", `${trade.review_rating}/5`, "#fbbf24")}
          {trade.review_execution_quality != null && miniStat("Execution", `${trade.review_execution_quality}/5`, "#60a5fa")}
          {trade.review_rules_followed != null && miniStat("Rules", trade.review_rules_followed ? "✓ Yes" : "✗ No", trade.review_rules_followed ? "#34d399" : "#f87171")}
        </div>
      )}
      {tall && trade.review_what_worked && (
        <div style={{ marginTop: 8, padding: "10px 16px", borderRadius: 10, background: "rgba(52,211,153,0.06)", fontSize: 18, color: "#94a3b8" }}>
          <span style={{ color: "#34d399", fontWeight: 600 }}>✓ Worked:</span> {trade.review_what_worked}
        </div>
      )}
      {tall && trade.review_what_failed && (
        <div style={{ marginTop: 8, padding: "10px 16px", borderRadius: 10, background: "rgba(248,113,113,0.06)", fontSize: 18, color: "#94a3b8" }}>
          <span style={{ color: "#f87171", fontWeight: 600 }}>✗ Failed:</span> {trade.review_what_failed}
        </div>
      )}

      {tagsRow(tags, true)}
      {watermark(true, customLogo)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE B — Light Clean
// ═══════════════════════════════════════════════
export function LightTradeCard({ trade, tags = [], customLogo, cardSize = "square" }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const profitColor = isProfit ? "#059669" : "#dc2626";
  const rr = computeRR(trade);
  const duration = holdingDuration(trade.entry_time, trade.closed_at);
  const targetsHit = getTargetsHit(trade);
  const targetsTotal = getTargetsTotal(trade);
  const size = getCardSize(cardSize);
  const compact = isCompact(cardSize);
  const tall = cardSize === "story";

  return (
    <div style={{
      width: size.width, height: size.height, background: "#ffffff", color: "#111827",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: compact ? 40 : 56,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: compact ? 36 : 44, fontWeight: 800, color: "#111827" }}>{trade.symbol}</div>
          <div style={{ fontSize: compact ? 18 : 22, color: "#6b7280", marginTop: 2 }}>
            {segmentLabel(trade.segment)}
            {trade.holding_period && ` · ${trade.holding_period}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {dirBadge(trade.trade_type, false)}
          {outcomeBadge(trade.pnl ?? 0, { bg: isProfit ? "#ecfdf5" : "#fef2f2", color: profitColor })}
        </div>
      </div>

      <div style={{ margin: tall ? "40px 0 32px" : compact ? "12px 0 10px" : "24px 0 20px", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: compact ? "8px 28px" : "12px 40px", borderRadius: 20,
          background: isProfit ? "#ecfdf5" : "#fef2f2",
        }}>
          <div style={{ fontSize: compact ? 56 : 78, fontWeight: 800, color: profitColor, fontFamily: "monospace" }}>
            {fmt(trade.pnl ?? 0)}
          </div>
        </div>
        <div style={{ fontSize: compact ? 22 : 30, color: profitColor, marginTop: 12, fontWeight: 500 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: compact ? 22 : 28, fontWeight: 600, marginBottom: compact ? 8 : 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, color: "#6b7280", marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: compact ? 14 : 18, color: "#9ca3af" }}>{dateStr(trade.entry_time)} {timeStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 32, color: "#9ca3af" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, color: "#6b7280", marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? (trade.current_price?.toFixed(2) ?? "—")}</div>
          <div style={{ fontSize: compact ? 14 : 18, color: "#9ca3af" }}>{dateStr(trade.closed_at)} {timeStr(trade.closed_at)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {miniStat("Qty", `${trade.quantity}`, "#111827", compact)}
        {rr && miniStat("R:R", rr, isProfit ? "#059669" : "#dc2626", compact)}
        {trade.stop_loss && miniStat("SL", `₹${trade.stop_loss.toFixed(1)}`, "#111827", compact)}
        {duration && miniStat("Duration", duration, "#111827", compact)}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {trade.timeframe && miniStat("Timeframe", trade.timeframe, "#111827", compact)}
        {targetsTotal > 0 && miniStat("Targets", `${targetsHit}/${targetsTotal}`, targetsHit > 0 ? "#059669" : "#6b7280", compact)}
        {trade.confidence_score != null && miniStat("Confidence", `${trade.confidence_score}/5`, "#2563eb", compact)}
        {trade.emotion_tag && miniStat("Emotion", trade.emotion_tag, "#7c3aed", compact)}
        {trade.rating != null && miniStat("Rating", `${trade.rating}/5`, "#d97706", compact)}
      </div>

      {trade.chart_link && chartLinkRow(trade.chart_link, false)}
      {trade.strategy_id && (
        <div style={{
          marginTop: 8, padding: "8px 16px", borderRadius: 10,
          background: "rgba(168,85,247,0.06)", fontSize: 18,
          color: "#7c3aed", display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>🔗</span> Multi-Leg Strategy Trade
        </div>
      )}

      {trade.closure_reason && notesRow(trade.closure_reason, false)}
      {!trade.closure_reason && trade.notes && notesRow(trade.notes, false)}

      {tall && trade.reviewed_at && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          {trade.review_rating != null && miniStat("Review", `${trade.review_rating}/5`, "#d97706")}
          {trade.review_execution_quality != null && miniStat("Execution", `${trade.review_execution_quality}/5`, "#2563eb")}
          {trade.review_rules_followed != null && miniStat("Rules", trade.review_rules_followed ? "✓ Yes" : "✗ No", trade.review_rules_followed ? "#059669" : "#dc2626")}
        </div>
      )}

      {tagsRow(tags, false)}
      {watermark(false, customLogo)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE C — Gradient
// ═══════════════════════════════════════════════
export function GradientTradeCard({ trade, tags = [], customLogo, cardSize = "square" }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const bg = isProfit
    ? "linear-gradient(135deg, #059669, #0891b2)"
    : "linear-gradient(135deg, #dc2626, #ea580c)";
  const rr = computeRR(trade);
  const duration = holdingDuration(trade.entry_time, trade.closed_at);
  const targetsHit = getTargetsHit(trade);
  const targetsTotal = getTargetsTotal(trade);
  const size = getCardSize(cardSize);
  const compact = isCompact(cardSize);
  const tall = cardSize === "story";

  return (
    <div style={{
      width: size.width, height: size.height, background: bg, color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: compact ? 40 : 56,
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <div>
          <div style={{ fontSize: compact ? 36 : 44, fontWeight: 800 }}>{trade.symbol}</div>
          <div style={{ fontSize: compact ? 18 : 22, opacity: 0.8, marginTop: 2 }}>
            {segmentLabel(trade.segment)}
            {trade.holding_period && ` · ${trade.holding_period}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{
            display: "inline-block", padding: "6px 20px", borderRadius: 8,
            background: "rgba(255,255,255,0.15)", fontSize: 24, fontWeight: 700,
          }}>
            {dirLabel(trade.trade_type)}
          </div>
          <div style={{
            display: "inline-block", padding: "8px 28px", borderRadius: 12,
            background: "rgba(255,255,255,0.2)", fontSize: 28, fontWeight: 700,
          }}>
            {(trade.pnl ?? 0) >= 0 ? "WIN" : "LOSS"}
          </div>
        </div>
      </div>

      <div style={{ margin: tall ? "40px 0 32px" : compact ? "12px 0 10px" : "24px 0 20px", textAlign: "center" }}>
        <div style={{ fontSize: compact ? 64 : 88, fontWeight: 900, fontFamily: "monospace", letterSpacing: -3, textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          {fmt(trade.pnl ?? 0)}
        </div>
        <div style={{ fontSize: compact ? 24 : 32, fontWeight: 600, opacity: 0.9, marginTop: 4 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: compact ? 22 : 28, fontWeight: 600, marginBottom: compact ? 8 : 16,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, opacity: 0.7, marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: compact ? 14 : 18, opacity: 0.6 }}>{dateStr(trade.entry_time)} {timeStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 32, opacity: 0.6 }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: compact ? 16 : 20, opacity: 0.7, marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? (trade.current_price?.toFixed(2) ?? "—")}</div>
          <div style={{ fontSize: compact ? 14 : 18, opacity: 0.6 }}>{dateStr(trade.closed_at)} {timeStr(trade.closed_at)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "4px 12px", marginBottom: 8 }}>
        {miniStat("Qty", `${trade.quantity}`, "#fff", compact)}
        {rr && miniStat("R:R", rr, "#fff", compact)}
        {trade.stop_loss && miniStat("SL", `₹${trade.stop_loss.toFixed(1)}`, "#fff", compact)}
        {duration && miniStat("Duration", duration, "#fff", compact)}
      </div>

      <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "4px 12px" }}>
        {trade.timeframe && miniStat("Timeframe", trade.timeframe, "#fff", compact)}
        {targetsTotal > 0 && miniStat("Targets", `${targetsHit}/${targetsTotal}`, "#fff", compact)}
        {trade.confidence_score != null && miniStat("Confidence", `${trade.confidence_score}/5`, "#fff", compact)}
        {trade.emotion_tag && miniStat("Emotion", trade.emotion_tag, "#fff", compact)}
        {trade.rating != null && miniStat("Rating", `${trade.rating}/5`, "#fff", compact)}
      </div>

      {trade.chart_link && (
        <div style={{
          marginTop: 8, padding: "8px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.12)", fontSize: 18,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>📊</span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{trade.chart_link}</span>
        </div>
      )}

      {trade.strategy_id && (
        <div style={{
          marginTop: 8, padding: "8px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.12)", fontSize: 18,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>🔗</span> Multi-Leg Strategy Trade
        </div>
      )}

      {trade.closure_reason && (
        <div style={{
          marginTop: 12, padding: "10px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.1)",
          fontSize: 20, lineHeight: 1.5, fontStyle: "italic",
          color: "rgba(255,255,255,0.8)", overflow: "hidden", maxHeight: 60,
        }}>
          "{trade.closure_reason}"
        </div>
      )}
      {!trade.closure_reason && trade.notes && (
        <div style={{
          marginTop: 12, padding: "10px 16px", borderRadius: 10,
          background: "rgba(255,255,255,0.1)",
          fontSize: 20, lineHeight: 1.5, fontStyle: "italic",
          color: "rgba(255,255,255,0.8)", overflow: "hidden", maxHeight: 60,
        }}>
          "{trade.notes}"
        </div>
      )}

      {tall && trade.reviewed_at && (
        <div style={{
          marginTop: 16, display: "flex", gap: 8,
          background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "4px 12px",
        }}>
          {trade.review_rating != null && miniStat("Review", `${trade.review_rating}/5`, "#fff")}
          {trade.review_execution_quality != null && miniStat("Execution", `${trade.review_execution_quality}/5`, "#fff")}
          {trade.review_rules_followed != null && miniStat("Rules", trade.review_rules_followed ? "✓ Yes" : "✗ No", "#fff")}
        </div>
      )}

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          {tags.slice(0, 8).map((t, i) => (
            <div key={i} style={{
              padding: "5px 14px", borderRadius: 8, fontSize: 20, fontWeight: 500,
              background: "rgba(255,255,255,0.15)", color: "#fff",
            }}>
              {t}
            </div>
          ))}
        </div>
      )}

      {watermark(true, customLogo)}
    </div>
  );
}

export const TRADE_TEMPLATE_OPTIONS = [
  { id: "dark" as const, label: "Dark Premium" },
  { id: "light" as const, label: "Light Clean" },
  { id: "gradient" as const, label: "Gradient" },
];

export type TradeTemplateId = (typeof TRADE_TEMPLATE_OPTIONS)[number]["id"];

export function TradeShareCard({ template, data }: { template: TradeTemplateId; data: TradeCardData }) {
  switch (template) {
    case "dark": return <DarkTradeCard {...data} />;
    case "light": return <LightTradeCard {...data} />;
    case "gradient": return <GradientTradeCard {...data} />;
  }
}
