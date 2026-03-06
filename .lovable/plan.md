

# Premium Stock Detail Modal Redesign

## What Changes
Completely redesign `StockPopupCard.tsx` with a premium editorial SaaS aesthetic matching the TradeBook design system.

## Key Design Elements

### Header
- **Left**: Bold stock symbol (e.g. "RELIANCE"), company name below in muted text, meta line with exchange badge ("NSE"), sector badge, and market-cap classification badge (Large/Mid/Small Cap)
- **Right**: Large current price in JetBrains Mono, daily change % with green/red pill badge, small "Delayed · HH:MM" timestamp below
- **Close button**: Circular ghost button with subtle hover state (already handled by Dialog's built-in close)

### Tab Bar
- Compact segmented control with `bg-muted` track and active tab gets `bg-card` with subtle shadow — already close to what we have, just refine sizing and spacing

### Overview Tab
- 2×3 grid of metric cards with white bg, soft border, 14px radius — each card has muted label (11px), bold value (14px), optional sub-context text
- Dedicated 52W Range section with labeled low/high/current + gradient range bar with circular price marker (refine existing `RangeBar`)

### Valuation Tab
- Fix duplicate Dividend Yield card (line 131-132 bug)
- Clean 2×3 grid

### Financials Tab
- 3×3 grid, same card style

### Technicals Tab
- RSI gauge, Beta/ATR card, SMA section, Performance section, 52W range — keep structure, upgrade card styling

### Bottom Actions
- Sticky footer with two buttons: "View Full Details" (outline) and "Add to Watchlist" (primary) — new addition

### Styling Upgrades
- Modal: `rounded-2xl` with clean shadow, max-w-2xl
- Metric cards: `bg-card border border-border rounded-[14px] p-3.5` instead of `bg-muted/50`
- Stronger spacing between sections
- Font: financial values in `font-mono` for the numbers

## Files to Modify

| File | Change |
|---|---|
| `src/components/trade/StockPopupCard.tsx` | Full redesign with premium styling, fix duplicate card bug, add bottom actions, add meta badges, add timestamp |

## Implementation Notes
- Single file change — all modifications in `StockPopupCard.tsx`
- Fix the duplicate Dividend Yield MetricCard on line 131-132
- Add market-cap classification helper: Large Cap (>₹20K Cr), Mid Cap (₹5K-20K Cr), Small Cap (<₹5K Cr)
- Keep all existing data fields and tab structure

