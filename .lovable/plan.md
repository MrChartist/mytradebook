

# Enhance Features Bento Grid -- Add Missing Features + Match Reference UI

## Overview

The current features section has 6 cards in a bento grid. The app has several more capabilities not showcased. We'll add the missing features, reorganize the grid layout to match the reference image's clean card style, and add mini-preview mockups for the new cards.

## Missing Features to Add

1. **AI Trade Insights** -- AI-powered analysis of trading patterns and behavioral suggestions (exists in `AITradeInsights.tsx`)
2. **Watchlist & Scanner** -- Multi-watchlist instrument monitoring with live prices (exists in `Watchlist.tsx`, `useWatchlists.ts`)
3. **Position Sizing Calculator** -- Risk-based lot/quantity calculator with capital management (exists in `PositionSizingCalculator.tsx`)
4. **Telegram Bot** -- Automated trade notifications, EOD reports, and morning briefings via Telegram (exists in `TelegramSettings.tsx`, `telegram-notify` edge function)
5. **CSV Import/Export** -- Bulk import trades from broker CSVs and export reports (exists in `CsvImportModal.tsx`, `csv-export.ts`)

## Layout Redesign (Matching Reference Image)

The reference image shows a clean bento grid with:
- **Row 1**: Large card (col-span-4) + smaller card (col-span-2) -- like the current layout
- **Row 2**: Three equal cards (col-span-2 each)
- **Row 3**: Repeat the pattern for new features

We'll reorganize to **10-11 features** across 3 rows in a 6-column grid:

```text
Row 1: [Smart Journal (4col)]     [Deep Analytics (2col)]
Row 2: [Alerts (2col)] [TSL (2col)] [Broker (2col)]
Row 3: [AI Insights (4col)]       [Watchlist (2col)]
Row 4: [Telegram (2col)] [Position Sizing (2col)] [CSV Import (2col)]
```

The Rules Engine card moves to a smaller 2-col and is replaced in the large slot by AI Insights.

## UI/UX Improvements per Reference

1. **Card hover** -- Subtle `y: -4` lift with accent border glow (already partially done, polish it)
2. **Icon badges** -- Consistent `w-11 h-11 rounded-xl` with soft color backgrounds matching each feature's theme color
3. **Mini mockups** -- Each feature card (even small ones) gets a mini data preview:
   - **AI Insights**: Show a mini insight card with a lightbulb icon and sample suggestion text
   - **Watchlist**: Show 2-3 ticker rows with live prices and change %
   - **Position Sizing**: Show a mini calculator with lot size output
   - **Telegram**: Show a mini chat bubble with notification preview
   - **CSV Import**: Show a mini file icon with "234 trades imported" badge
4. **Typography** -- Title `text-lg font-bold`, description `text-sm text-muted-foreground leading-relaxed`
5. **Spacing** -- `p-6 sm:p-7` padding, `gap-4 sm:gap-5` grid gap

## New Mini Preview Components

### `WatchlistMiniPreview`
- 2-3 rows: ticker name, price, change % with profit/loss coloring
- Mimics the watchlist table rows

### `AIInsightsMiniPreview`  
- A lightbulb icon with a sample insight: "Your win rate drops 23% after 2 PM. Consider limiting afternoon trades."
- A small "View 3 more insights" link

### `TelegramMiniPreview`
- Mini chat bubble showing: "EOD Report: +Rs 12,450 | 5W-2L | Win Rate 71%"

### `PositionSizingMiniPreview`
- Mini calculator showing: Capital Rs 5L, Risk 2%, Lot Size: 3 lots

### `CSVImportMiniPreview`
- File icon with "trades_feb2026.csv" and "234 trades imported" badge

## Technical Changes

### File: `src/pages/Landing.tsx`

**Data array (lines 94-101):**
- Expand `features` array from 6 to 11 items
- Each item gets: `icon`, `title`, `description`, `color`, `large` (boolean), and `previewKey` (string identifier for which mini preview to render)

**New mini-preview components (around lines 248-350):**
- Add 5 new mini-preview function components: `WatchlistMiniPreview`, `AIInsightsMiniPreview`, `TelegramMiniPreview`, `PositionSizingMiniPreview`, `CSVImportMiniPreview`

**Features grid section (lines 800-854):**
- Update the bento grid rendering to map `previewKey` to the correct mini preview component
- Adjust grid column spans for the new layout
- Polish card styles: consistent padding, hover states, and typography

**New icon imports (line 6-12):**
- Add: `Brain` (AI), `List` (Watchlist), `Calculator` (Position Sizing), `FileSpreadsheet` (CSV), `MessageSquare` (Telegram)

### No other files changed
- Only `src/pages/Landing.tsx` is modified

