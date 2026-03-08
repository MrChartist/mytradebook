// Shared helpers for all share card templates

export const fmt = (n: number) => {
  const abs = Math.abs(n);
  const s = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(abs);
  return n < 0 ? `-₹${s}` : `₹${s}`;
};

export const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

// ─── Card Size Options ───
export const CARD_SIZES = {
  square: { width: 1080, height: 1080, label: "Square", description: "Instagram" },
  story: { width: 1080, height: 1920, label: "Story", description: "IG/WhatsApp" },
  twitter: { width: 1200, height: 675, label: "Twitter", description: "X / Twitter" },
} as const;

export type CardSizeId = keyof typeof CARD_SIZES;

export const CARD_SIZE_OPTIONS = Object.entries(CARD_SIZES).map(([id, s]) => ({
  id: id as CardSizeId,
  label: s.label,
  description: s.description,
}));

/** Legacy default */
export const CARD_SIZE = { width: 1080, height: 1080 };

export const getCardSize = (sizeId: CardSizeId) => ({
  width: CARD_SIZES[sizeId].width,
  height: CARD_SIZES[sizeId].height,
});

export const statBox = (label: string, value: string, color?: string) => (
  <div style={{ flex: 1, textAlign: "center", padding: "24px 0" }}>
    <div style={{ fontSize: 28, color: "#9ca3af", marginBottom: 8, fontWeight: 500 }}>{label}</div>
    <div style={{ fontSize: 40, fontWeight: 700, color: color || "inherit", fontFamily: "monospace" }}>{value}</div>
  </div>
);

// ─── Custom branding watermark ───
const LOGO_STORAGE_KEY = "tradebook_custom_logo";

export function saveCustomLogo(dataUrl: string) {
  try { localStorage.setItem(LOGO_STORAGE_KEY, dataUrl); } catch {}
}

export function getCustomLogo(): string | null {
  try { return localStorage.getItem(LOGO_STORAGE_KEY); } catch { return null; }
}

export function clearCustomLogo() {
  try { localStorage.removeItem(LOGO_STORAGE_KEY); } catch {}
}

export const watermark = (dark: boolean, customLogoUrl?: string | null) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    marginTop: "auto", paddingTop: 40, opacity: 0.6, fontSize: 24,
  }}>
    {customLogoUrl ? (
      <>
        <img src={customLogoUrl} style={{ height: 36, width: "auto", objectFit: "contain", borderRadius: 4 }} alt="" />
      </>
    ) : (
      <>
        <span style={{ color: dark ? "#fff" : "#374151" }}>Made with </span>
        <span style={{ color: "#ea7b30", fontWeight: 700 }}>TradeBook</span>
      </>
    )}
  </div>
);
