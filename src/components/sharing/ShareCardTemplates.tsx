import type { ShareCardData } from "@/hooks/useShareCardData";

const fmt = (n: number) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(abs);
  return n < 0 ? `-₹${s}` : `₹${s}`;
};

const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

// ─── Shared inline style helpers (for html-to-image reliability) ───

const CARD_SIZE = { width: 1080, height: 1080 };

const statBox = (label: string, value: string, color?: string) => (
  <div style={{ flex: 1, textAlign: "center", padding: "24px 0" }}>
    <div style={{ fontSize: 28, color: "#9ca3af", marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 700, color: color || "inherit", fontFamily: "monospace" }}>{value}</div>
  </div>
);

const watermark = (dark: boolean) => (
  <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 40, opacity: 0.5, fontSize: 24 }}>
    <span style={{ color: dark ? "#fff" : "#374151" }}>Made with </span>
    <span style={{ color: "#ea7b30", fontWeight: 700 }}>TradeBook</span>
  </div>
);

// ═══════════════════════════════════════════════
// TEMPLATE A — Dark Premium
// ═══════════════════════════════════════════════
export function DarkPremiumCard({ data }: { data: ShareCardData }) {
  const profitColor = data.totalPnl >= 0 ? "#34d399" : "#f87171";
  return (
    <div
      style={{
        ...CARD_SIZE,
        background: "#0f172a",
        color: "#f8fafc",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dot grid bg */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />
      {/* Top accent stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 6,
        background: data.totalPnl >= 0
          ? "linear-gradient(90deg, #34d399, #06b6d4)"
          : "linear-gradient(90deg, #f87171, #fb923c)",
      }} />

      <div style={{ fontSize: 32, fontWeight: 600, color: "#94a3b8", marginBottom: 8 }}>{data.period} Performance</div>
      {data.userName && <div style={{ fontSize: 26, color: "#64748b", marginBottom: 16 }}>{data.userName}</div>}

      {/* Main P&L */}
      <div style={{ margin: "40px 0", textAlign: "center" }}>
        <div style={{ fontSize: 96, fontWeight: 800, color: profitColor, fontFamily: "monospace", letterSpacing: -2 }}>
          {fmt(data.totalPnl)}
        </div>
        <div style={{ fontSize: 36, color: profitColor, marginTop: 8, fontWeight: 600 }}>
          {pct(data.pnlPercent)} avg per trade
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "8px 16px" }}>
        {statBox("Win Rate", `${data.winRate.toFixed(0)}%`, "#60a5fa")}
        {statBox("Trades", `${data.totalTrades}`)}
        {statBox("W / L", `${data.winners} / ${data.losers}`)}
        {statBox("Streak", `${data.streak > 0 ? "🔥" : ""}${Math.abs(data.streak)}`, data.streak >= 0 ? "#34d399" : "#f87171")}
      </div>

      {/* Best / Worst */}
      {(data.bestTrade || data.worstTrade) && (
        <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
          {data.bestTrade && (
            <div style={{ flex: 1, background: "rgba(52,211,153,0.08)", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, color: "#9ca3af" }}>Best Trade</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#34d399", marginTop: 4 }}>{data.bestTrade.symbol} · {fmt(data.bestTrade.pnl)}</div>
            </div>
          )}
          {data.worstTrade && (
            <div style={{ flex: 1, background: "rgba(248,113,113,0.08)", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, color: "#9ca3af" }}>Worst Trade</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#f87171", marginTop: 4 }}>{data.worstTrade.symbol} · {fmt(data.worstTrade.pnl)}</div>
            </div>
          )}
        </div>
      )}

      {watermark(true)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE B — Light Clean
// ═══════════════════════════════════════════════
export function LightCleanCard({ data }: { data: ShareCardData }) {
  const profitColor = data.totalPnl >= 0 ? "#059669" : "#dc2626";
  return (
    <div
      style={{
        ...CARD_SIZE,
        background: "#ffffff",
        color: "#111827",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 72,
      }}
    >
      <div style={{ fontSize: 32, fontWeight: 600, color: "#6b7280" }}>{data.period} Performance</div>

      <div style={{ margin: "48px 0", textAlign: "center" }}>
        <div style={{
          display: "inline-block", padding: "16px 48px", borderRadius: 20,
          background: data.totalPnl >= 0 ? "#ecfdf5" : "#fef2f2",
        }}>
          <div style={{ fontSize: 88, fontWeight: 800, color: profitColor, fontFamily: "monospace" }}>
            {fmt(data.totalPnl)}
          </div>
        </div>
        <div style={{ fontSize: 32, color: profitColor, marginTop: 16, fontWeight: 500 }}>
          {pct(data.pnlPercent)} avg return
        </div>
      </div>

      <div style={{ display: "flex", gap: 16 }}>
        {statBox("Win Rate", `${data.winRate.toFixed(0)}%`, "#2563eb")}
        {statBox("Trades", `${data.totalTrades}`, "#111827")}
        {statBox("W / L", `${data.winners} / ${data.losers}`, "#111827")}
        {statBox("Streak", `${Math.abs(data.streak)}${data.streak > 0 ? " 🔥" : ""}`, data.streak >= 0 ? "#059669" : "#dc2626")}
      </div>

      {(data.bestTrade || data.worstTrade) && (
        <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
          {data.bestTrade && (
            <div style={{ flex: 1, border: "2px solid #d1fae5", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, color: "#6b7280" }}>Best Trade</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#059669", marginTop: 4 }}>{data.bestTrade.symbol} · {fmt(data.bestTrade.pnl)}</div>
            </div>
          )}
          {data.worstTrade && (
            <div style={{ flex: 1, border: "2px solid #fecaca", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, color: "#6b7280" }}>Worst Trade</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: "#dc2626", marginTop: 4 }}>{data.worstTrade.symbol} · {fmt(data.worstTrade.pnl)}</div>
            </div>
          )}
        </div>
      )}

      {watermark(false)}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TEMPLATE C — Gradient
// ═══════════════════════════════════════════════
export function GradientCard({ data }: { data: ShareCardData }) {
  const bg = data.totalPnl >= 0
    ? "linear-gradient(135deg, #059669, #0891b2)"
    : "linear-gradient(135deg, #dc2626, #ea580c)";

  return (
    <div
      style={{
        ...CARD_SIZE,
        background: bg,
        color: "#ffffff",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        display: "flex",
        flexDirection: "column",
        padding: 72,
        position: "relative",
      }}
    >
      {/* Subtle overlay circles */}
      <div style={{ position: "absolute", top: -120, right: -120, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

      <div style={{ fontSize: 34, fontWeight: 600, opacity: 0.85 }}>{data.period} Performance</div>

      <div style={{ margin: "56px 0", textAlign: "center" }}>
        <div style={{ fontSize: 104, fontWeight: 900, fontFamily: "monospace", letterSpacing: -3, textShadow: "0 4px 24px rgba(0,0,0,0.2)" }}>
          {fmt(data.totalPnl)}
        </div>
        <div style={{ fontSize: 36, fontWeight: 600, opacity: 0.9, marginTop: 8 }}>
          {pct(data.pnlPercent)} avg return
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "8px 16px" }}>
        {statBox("Win Rate", `${data.winRate.toFixed(0)}%`, "#fff")}
        {statBox("Trades", `${data.totalTrades}`, "#fff")}
        {statBox("W / L", `${data.winners} / ${data.losers}`, "#fff")}
        {statBox("Streak", `${data.streak > 0 ? "🔥" : ""}${Math.abs(data.streak)}`, "#fff")}
      </div>

      {(data.bestTrade || data.worstTrade) && (
        <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
          {data.bestTrade && (
            <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, opacity: 0.7 }}>Best Trade</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{data.bestTrade.symbol} · {fmt(data.bestTrade.pnl)}</div>
            </div>
          )}
          {data.worstTrade && (
            <div style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 16, padding: "20px 28px" }}>
              <div style={{ fontSize: 24, opacity: 0.7 }}>Worst Trade</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{data.worstTrade.symbol} · {fmt(data.worstTrade.pnl)}</div>
            </div>
          )}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 40, opacity: 0.6, fontSize: 24 }}>
        Made with <span style={{ fontWeight: 700 }}>TradeBook</span>
      </div>
    </div>
  );
}

export const TEMPLATE_OPTIONS = [
  { id: "dark" as const, label: "Dark Premium" },
  { id: "light" as const, label: "Light Clean" },
  { id: "gradient" as const, label: "Gradient" },
];

export type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

export function ShareCard({ template, data }: { template: TemplateId; data: ShareCardData }) {
  switch (template) {
    case "dark":
      return <DarkPremiumCard data={data} />;
    case "light":
      return <LightCleanCard data={data} />;
    case "gradient":
      return <GradientCard data={data} />;
  }
}
