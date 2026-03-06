

# Fundamentals Page UI/UX Improvements

Only `src/pages/Fundamentals.tsx` will be modified. The popup card is already polished.

## Current Issues
- Header area is plain, no visual weight
- Preset buttons are small and cramped with no grouping or description visible
- Table rows lack visual density cues (no alternating rows, no mini sparkline for change)
- Search bar is disconnected from the context
- Pagination footer is basic
- No loading indicator during page transitions (only initial skeleton)
- Empty state is bland

## Changes

### 1. Elevated Header Card
Wrap the title + search in a `rounded-2xl bg-card border p-5` card with a subtle dot-grid or inner-panel background matching the design system. Show the stock count as a bold number, not inline text.

### 2. Grouped Scanner Presets
Organize presets into collapsible categories using small section labels:
- **Market Cap**: All, Large, Mid, Small
- **Fundamental**: Undervalued, Growth, Dividend, Low Debt
- **Technical**: Momentum, Oversold RSI, Overbought RSI, Volume Spike, Near 52W High

Use a horizontal scrollable strip with category dividers (thin `|` separators) instead of a flat wrap. Active preset gets a filled primary badge style with a subtle glow/shadow.

### 3. Better Table Styling
- Add alternating row backgrounds: `even:bg-muted/20`
- Make the symbol column bolder: larger ticker text (text-sm font-bold), description underneath
- Add a tiny inline colored dot before the change % column for quick visual scanning
- Tighter cell padding: `py-2.5 px-3` instead of default `p-4`
- Header row: sticky top with `bg-card` and a bottom shadow for scroll separation
- Sort indicator: show a small up/down chevron (not the ambiguous ArrowUpDown) when sorted

### 4. Inline Change Pill
Replace the plain `TrendingUp/Down + text` with a compact pill: `bg-profit/10 text-profit rounded-full px-2 py-0.5 text-[11px] font-mono` for a cleaner, scannable look.

### 5. Improved Pagination
- Wrap in a `rounded-xl bg-card border p-3` footer card
- Show page numbers as clickable buttons (up to 5 visible) instead of just "Page X of Y"
- Cleaner "Showing X-Y of Z" label

### 6. Loading & Transition States
- Add a thin animated progress bar at the top of the table container during `isFetching` (not just opacity change)
- Better empty state with an icon and suggestion text

### 7. Data Source Footer
Style the "Data from TradingView" note as a subtle badge in the pagination footer rather than a standalone paragraph.

## File Changes

| File | Change |
|---|---|
| `src/pages/Fundamentals.tsx` | Header card, preset grouping, table polish, pagination redesign, loading bar, empty state |

