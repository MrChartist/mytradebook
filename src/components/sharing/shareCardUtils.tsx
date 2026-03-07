// Shared helpers for all share card templates

export const fmt = (n: number) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(abs);
  return n < 0 ? `-₹${s}` : `₹${s}`;
};

export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

export const CARD_SIZE = { width: 1080, height: 1080 };

export const statBox = (label: string, value: string, color?: string) => (
  <div style={{ flex: 1, textAlign: "center", padding: "24px 0" }}>
    <div style={{ fontSize: 28, color: "#9ca3af", marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 700, color: color || "inherit", fontFamily: "monospace" }}>{value}</div>
  </div>
);

export const watermark = (dark: boolean) => (
  <div style={{ textAlign: "center", marginTop: "auto", paddingTop: 40, opacity: 0.5, fontSize: 24 }}>
    <span style={{ color: dark ? "#fff" : "#374151" }}>Made with </span>
    <span style={{ color: "#ea7b30", fontWeight: 700 }}>TradeBook</span>
  </div>
);
