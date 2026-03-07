import type { Trade } from "@/hooks/useTrades";
import { fmt, pct, CARD_SIZE, statBox, watermark } from "./shareCardUtils";
import type { TradeTarget } from "@/types/trade";

export interface TradeCardData {
  trade: Trade;
  tags?: string[];
}

const segmentLabel = (s: string) => s.replace(/_/g, " ");
const dirLabel = (t: string) => (t === "BUY" ? "LONG" : "SHORT");
const dateStr = (d: string | null) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—";

function computeRR(trade: Trade): string | null {
  if (!trade.entry_price || !trade.stop_loss || !trade.pnl) return null;
  const risk = Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity;
  if (risk === 0) return null;
  const rr = Math.abs(trade.pnl) / risk;
  return `${trade.pnl >= 0 ? "" : "-"}${rr.toFixed(1)}R`;
}

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
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
      {tags.slice(0, 5).map((t, i) => (
        <div key={i} style={{
          padding: "6px 16px", borderRadius: 8, fontSize: 22, fontWeight: 500,
          background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
          color: dark ? "#cbd5e1" : "#6b7280",
        }}>
          {t}
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════
// TEMPLATE A — Dark Premium
// ═══════════════════════════════════════════════
export function DarkTradeCard({ trade, tags = [] }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const profitColor = isProfit ? "#34d399" : "#f87171";
  const rr = computeRR(trade);

  return (
    <div style={{
      ...CARD_SIZE, background: "#0f172a", color: "#f8fafc",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: 72,
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -1 }}>{trade.symbol}</div>
          <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 4 }}>{segmentLabel(trade.segment)}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {dirBadge(trade.trade_type, true)}
          {outcomeBadge(trade.pnl ?? 0, { bg: isProfit ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)", color: profitColor })}
        </div>
      </div>

      {/* P&L Hero */}
      <div style={{ margin: "36px 0", textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 800, color: profitColor, fontFamily: "monospace", letterSpacing: -2 }}>
          {fmt(trade.pnl ?? 0)}
        </div>
        <div style={{ fontSize: 36, color: profitColor, marginTop: 8, fontWeight: 600 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      {/* Entry → Exit */}
      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: 30, fontWeight: 600, marginBottom: 24,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: "#9ca3af", marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: 20, color: "#64748b" }}>{dateStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 36, color: "#64748b" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: "#9ca3af", marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? "—"}</div>
          <div style={{ fontSize: 20, color: "#64748b" }}>{dateStr(trade.closed_at)}</div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "8px 16px" }}>
        {statBox("Qty", `${trade.quantity}`)}
        {rr && statBox("R:R", rr, isProfit ? "#34d399" : "#f87171")}
        {trade.stop_loss && statBox("SL", `₹${trade.stop_loss.toFixed(1)}`)}
        {trade.timeframe && statBox("TF", trade.timeframe)}
      </div>

      {tagsRow(tags, true)}
      {watermark(true)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE B — Light Clean
// ═══════════════════════════════════════════════
export function LightTradeCard({ trade, tags = [] }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const profitColor = isProfit ? "#059669" : "#dc2626";
  const rr = computeRR(trade);

  return (
    <div style={{
      ...CARD_SIZE, background: "#ffffff", color: "#111827",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: 72,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 48, fontWeight: 800, color: "#111827" }}>{trade.symbol}</div>
          <div style={{ fontSize: 24, color: "#6b7280", marginTop: 4 }}>{segmentLabel(trade.segment)}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {dirBadge(trade.trade_type, false)}
          {outcomeBadge(trade.pnl ?? 0, { bg: isProfit ? "#ecfdf5" : "#fef2f2", color: profitColor })}
        </div>
      </div>

      <div style={{ margin: "36px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "16px 48px", borderRadius: 20,
          background: isProfit ? "#ecfdf5" : "#fef2f2",
        }}>
          <div style={{ fontSize: 88, fontWeight: 800, color: profitColor, fontFamily: "monospace" }}>
            {fmt(trade.pnl ?? 0)}
          </div>
        </div>
        <div style={{ fontSize: 32, color: profitColor, marginTop: 16, fontWeight: 500 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: 30, fontWeight: 600, marginBottom: 24,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: "#6b7280", marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: 20, color: "#9ca3af" }}>{dateStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 36, color: "#9ca3af" }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, color: "#6b7280", marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? "—"}</div>
          <div style={{ fontSize: 20, color: "#9ca3af" }}>{dateStr(trade.closed_at)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {statBox("Qty", `${trade.quantity}`, "#111827")}
        {rr && statBox("R:R", rr, isProfit ? "#059669" : "#dc2626")}
        {trade.stop_loss && statBox("SL", `₹${trade.stop_loss.toFixed(1)}`, "#111827")}
        {trade.timeframe && statBox("TF", trade.timeframe, "#111827")}
      </div>

      {tagsRow(tags, false)}
      {watermark(false)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE C — Gradient
// ═══════════════════════════════════════════════
export function GradientTradeCard({ trade, tags = [] }: TradeCardData) {
  const isProfit = (trade.pnl ?? 0) >= 0;
  const bg = isProfit
    ? "linear-gradient(135deg, #059669, #0891b2)"
    : "linear-gradient(135deg, #dc2626, #ea580c)";
  const rr = computeRR(trade);

  return (
    <div style={{
      ...CARD_SIZE, background: bg, color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", padding: 72,
      position: "relative",
    }}>
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{trade.symbol}</div>
          <div style={{ fontSize: 24, opacity: 0.8, marginTop: 4 }}>{segmentLabel(trade.segment)}</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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

      <div style={{ margin: "36px 0", textAlign: "center" }}>
        <div style={{ fontSize: 104, fontWeight: 900, fontFamily: "monospace", letterSpacing: -3, textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          {fmt(trade.pnl ?? 0)}
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, opacity: 0.9, marginTop: 8 }}>
          {pct(trade.pnl_percent ?? 0)}
        </div>
      </div>

      <div style={{
        display: "flex", justifyContent: "center", alignItems: "center", gap: 24,
        fontSize: 30, fontWeight: 600, marginBottom: 24,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, opacity: 0.7, marginBottom: 4 }}>Entry</div>
          <div>₹{trade.entry_price?.toFixed(2)}</div>
          <div style={{ fontSize: 20, opacity: 0.6 }}>{dateStr(trade.entry_time)}</div>
        </div>
        <div style={{ fontSize: 36, opacity: 0.6 }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, opacity: 0.7, marginBottom: 4 }}>Exit</div>
          <div>₹{(trade as any).exit_price?.toFixed(2) ?? "—"}</div>
          <div style={{ fontSize: 20, opacity: 0.6 }}>{dateStr(trade.closed_at)}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "8px 16px" }}>
        {statBox("Qty", `${trade.quantity}`, "#fff")}
        {rr && statBox("R:R", rr, "#fff")}
        {trade.stop_loss && statBox("SL", `₹${trade.stop_loss.toFixed(1)}`, "#fff")}
        {trade.timeframe && statBox("TF", trade.timeframe, "#fff")}
      </div>

      {tags.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          {tags.slice(0, 5).map((t, i) => (
            <div key={i} style={{
              padding: "6px 16px", borderRadius: 8, fontSize: 22, fontWeight: 500,
              background: "rgba(255,255,255,0.15)", color: "#fff",
            }}>
              {t}
            </div>
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 40, opacity: 0.6, fontSize: 24 }}>
        Made with <span style={{ fontWeight: 700 }}>TradeBook</span>
      </div>
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
