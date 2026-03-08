import { fmt, getCardSize, watermark, type CardSizeId } from "./shareCardUtils";

export interface StreakCardData {
  streakCount: number;
  streakType: "win" | "loss";
  totalPnl: number;
  trades: { symbol: string; pnl: number }[];
  customLogo?: string | null;
  cardSize?: CardSizeId;
}

export function StreakShareCard({ data }: { data: StreakCardData }) {
  const { streakCount, streakType, totalPnl, trades, customLogo, cardSize = "square" } = data;
  const size = getCardSize(cardSize);
  const isWin = streakType === "win";

  const bg = isWin
    ? "linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%)"
    : "linear-gradient(135deg, #1a0a0a 0%, #2d1b1b 50%, #1a0505 100%)";

  const accentColor = isWin ? "#f59e0b" : "#ef4444";
  const glowColor = isWin ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";

  const flames = streakCount >= 10 ? "🔥🔥🔥" : streakCount >= 5 ? "🔥🔥" : "🔥";

  return (
    <div style={{
      width: size.width, height: size.height, background: bg, color: "#ffffff",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", position: "relative", overflow: "hidden",
      padding: 56,
    }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
      }} />

      {/* Animated ring effects */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -55%)",
        width: 500, height: 500, borderRadius: "50%",
        border: `3px solid ${isWin ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)"}`,
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -55%)",
        width: 650, height: 650, borderRadius: "50%",
        border: `2px solid ${isWin ? "rgba(245,158,11,0.05)" : "rgba(239,68,68,0.05)"}`,
      }} />

      {/* Flames */}
      <div style={{ fontSize: 80, marginBottom: 12, position: "relative", zIndex: 1 }}>
        {flames}
      </div>

      {/* Streak count */}
      <div style={{
        fontSize: 160, fontWeight: 900, fontFamily: "monospace",
        color: accentColor, lineHeight: 1,
        textShadow: `0 0 60px ${glowColor}, 0 4px 20px rgba(0,0,0,0.5)`,
        position: "relative", zIndex: 1,
      }}>
        {streakCount}
      </div>

      <div style={{
        fontSize: 48, fontWeight: 800, letterSpacing: 6,
        textTransform: "uppercase" as const,
        color: isWin ? "#fbbf24" : "#f87171",
        marginTop: 8, position: "relative", zIndex: 1,
      }}>
        {isWin ? "WINS IN A ROW" : "LOSSES IN A ROW"}
      </div>

      {/* Total P&L */}
      <div style={{
        marginTop: 40, padding: "16px 48px", borderRadius: 20,
        background: isWin ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
        border: `1px solid ${isWin ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}`,
        position: "relative", zIndex: 1,
      }}>
        <div style={{ fontSize: 22, color: "#9ca3af", textAlign: "center", marginBottom: 4 }}>
          Streak P&L
        </div>
        <div style={{
          fontSize: 64, fontWeight: 800, fontFamily: "monospace",
          color: totalPnl >= 0 ? "#34d399" : "#f87171", textAlign: "center",
        }}>
          {fmt(totalPnl)}
        </div>
      </div>

      {/* Recent trades */}
      {trades.length > 0 && (
        <div style={{
          marginTop: 32, width: "100%", maxWidth: 700,
          position: "relative", zIndex: 1,
        }}>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {trades.slice(0, 8).map((t, i) => (
              <div key={i} style={{
                padding: "10px 20px", borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center", minWidth: 120,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f8fafc" }}>{t.symbol}</div>
                <div style={{
                  fontSize: 22, fontWeight: 700, fontFamily: "monospace",
                  color: t.pnl >= 0 ? "#34d399" : "#f87171", marginTop: 4,
                }}>
                  {fmt(t.pnl)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {watermark(true, customLogo)}
    </div>
  );
}
