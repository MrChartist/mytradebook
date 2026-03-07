

# P&L Sharing Cards

## Overview
Build a feature that lets users generate beautiful, branded P&L summary cards and download them as images for sharing on Twitter, Instagram, Telegram, etc. We'll render the cards using HTML/CSS within a hidden container, then use the `html-to-image` library to convert them to PNG for download. Konva is installed but unused — `html-to-image` is lighter and lets us reuse our existing Tailwind design system directly.

## Architecture

```text
┌─────────────────────────────────┐
│  PnlShareModal (dialog)        │
│  ┌───────────────────────────┐  │
│  │ Card Preview (live)       │  │  ← Rendered in a fixed-size container
│  │ - Template selector       │  │
│  │ - Period selector         │  │
│  └───────────────────────────┘  │
│  [ Download PNG ] [ Copy ]      │
└─────────────────────────────────┘
```

## New Files

### 1. `src/components/sharing/PnlShareModal.tsx`
- Dialog/sheet modal triggered from Dashboard, Journal, or Reports pages
- **Period selector**: Today / This Week / This Month / Custom range
- **Template selector**: 3 card styles (Dark Premium, Light Clean, Gradient)
- Computes metrics from trades data for selected period: Total P&L, Win Rate, Total Trades, Best Trade, Worst Trade, Streak
- Renders the selected card template inside a fixed 1080x1080 container (Instagram-friendly)
- "Download as PNG" button using `html-to-image` → `toPng()` → triggers download
- "Copy to clipboard" using `ClipboardItem` API
- Watermark: TradeBook logo + "tradebook.app" at bottom of every card

### 2. `src/components/sharing/ShareCardTemplates.tsx`
Three card template components, all receiving the same props:

**Props interface:**
```ts
interface ShareCardData {
  period: string;           // "Today" | "This Week" | "Mar 2026"
  totalPnl: number;
  pnlPercent: number;
  winRate: number;
  totalTrades: number;
  winners: number;
  losers: number;
  bestTrade: { symbol: string; pnl: number } | null;
  worstTrade: { symbol: string; pnl: number } | null;
  streak: number;
  userName?: string;
}
```

**Template A — "Dark Premium"**: Dark bg with gradient accent stripe, large P&L in profit/loss color, grid of stats, subtle dot-grid pattern background, TradeBook watermark.

**Template B — "Light Clean"**: White bg, minimal layout, colored P&L badge, clean stat rows.

**Template C — "Gradient"**: Full gradient background (green→teal for profit, red→orange for loss), white text, bold typography.

All templates: 1080x1080px, use inline styles (not Tailwind classes) for reliable `html-to-image` rendering. Include the TradeBook logo and "Made with TradeBook" footer.

### 3. `src/hooks/useShareCardData.ts`
- Takes `period` filter (today/week/month/custom)
- Queries trades from `useTrades` data
- Computes all metrics for the card
- Returns `ShareCardData` object

## Integration Points

- **Dashboard**: Add a "Share" icon button next to Today's P&L widget header
- **Journal page**: Add "Share" button in the summary cards toolbar
- **Reports page**: Add "Share Card" action on weekly/monthly reports

## New Dependency
- `html-to-image` — lightweight (~4KB), renders DOM nodes to PNG/JPEG via SVG foreignObject. No canvas server needed.

## File Summary
| File | Action |
|------|--------|
| `src/components/sharing/PnlShareModal.tsx` | Create |
| `src/components/sharing/ShareCardTemplates.tsx` | Create |
| `src/hooks/useShareCardData.ts` | Create |
| `src/components/dashboard/TodaysPnl.tsx` | Add share button |
| `src/pages/Journal.tsx` | Add share button |
| `src/pages/Reports.tsx` | Add share button |

