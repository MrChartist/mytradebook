

# Premium Stock Insight Card — Popup Redesign

Single file change: `src/components/trade/StockPopupCard.tsx`

## Design Upgrades

### Header (Hero Section)
- Two-row layout: top row has ticker symbol as a large bold heading + a subtle circular close X; bottom row has company name, exchange/sector/industry/cap-class badges in a horizontal strip
- Price block on the right: large price in `font-mono`, change % in a colored pill with icon, and a small "Delayed" timestamp
- Add a thin **market summary strip** below the header divider — a horizontal row of key-at-a-glance stats (Market Cap, Volume, P/E, 52W%) separated by subtle vertical dividers, giving an instant snapshot before diving into tabs

### Tabs
- Tighter tab triggers with slightly bolder active state styling: `data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:font-semibold`
- Add subtle bottom padding to tab content area for scroll breathing room

### Metric Cards (all tabs)
- Upgrade to a layered card with hover micro-interaction: `hover:border-primary/20 hover:shadow-sm transition-all duration-150`
- Label in 10px uppercase tracking-widest muted, value in 15px semibold mono, optional sub-text in 10px muted
- Add a thin left accent bar (2px) on cards with positive/negative sentiment: green for positive, red for negative

### 52-Week Range Block
- Redesign into a "range insight" panel: show Low/Current/High as three labeled columns above the bar
- Gradient bar from red to amber to green with a diamond-shaped current-price marker instead of a circle
- Add percentage labels: "X% from low" and "X% from high" below the bar
- Wrap in a slightly elevated card with `shadow-sm`

### Technicals Tab
- RSI gauge: add a segmented background (red zone >70, green zone <30, neutral middle) behind the progress bar
- Moving Averages: add "Above"/"Below" signal badges next to each SMA value
- Performance row: use colored background pills for each timeframe value

### Bottom Actions
- Frosted glass footer with `backdrop-blur-md bg-card/90`
- Slightly taller buttons (h-10) with rounded-xl, stronger hover states
- Primary button gets a subtle gradient or stronger shadow on hover

### Spacing & Polish
- Consistent `p-5` padding, `gap-3` grids, `space-y-5` between sections
- `max-h-[88vh]` with smooth scroll via `overflow-y-auto scrollbar-thin`
- Modal itself: `rounded-2xl shadow-2xl border border-border/50`

## Files to Modify

| File | Change |
|---|---|
| `src/components/trade/StockPopupCard.tsx` | Full premium polish — header, summary strip, metric cards, range block, tabs, footer |

