

# Update Landing Page Features Section

## What's Changing
Replace the "Trailing Stop Loss" and "CSV Import/Export" feature cards with two new cards reflecting the app's actual standout features: **Stock Screener** (Fundamentals page) and **Smart Scanner Presets**. These are real, built features that deserve landing page spotlight.

## Changes in `src/components/landing/FeaturesSection.tsx`

### 1. Replace feature entries
- **Remove**: "Trailing Stop Loss" (no `previewKey`, generic) and "CSV Import/Export" (low-impact)
- **Add**: 
  - **Stock Screener** — `icon: TrendingUp`, large card (`md:col-span-4`), description: "Screen 500+ NSE stocks with live fundamentals — P/E, ROE, market cap, technicals, and more. One-tap deep dives into any stock.", `previewKey: "screener"`
  - **Smart Scanner** — `icon: Filter`, small card, description: "Pre-built scans for Top Gainers, Losers, 52W Highs, undervalued gems, and momentum plays. Save custom filter combos.", `previewKey: "scanner"`

### 2. Reorder features for better flow
1. Smart Journal (large) — kept
2. Stock Screener (large, NEW) — moved up for impact  
3. Deep Analytics — kept
4. Real-Time Alerts — kept
5. Smart Scanner (NEW)
6. AI Trade Insights (large) — kept
7. Watchlist & Scanner → rename to just "Watchlist" since scanner is now separate
8. Broker Integration — kept
9. Rules Engine — kept
10. Telegram Bot — kept
11. Position Sizing — kept

### 3. Add two new mini-preview components

**ScreenerMiniPreview**: A compact stock table showing 3 rows (RELIANCE, TCS, INFY) with columns for LTP, Change%, and P/E — mimicking the actual Fundamentals page layout.

**ScannerMiniPreview**: Show 3 preset pills (Top Gainers, Undervalued, Momentum) with a "12 custom presets saved" note below.

### 4. Update previewMap
Add `screener` and `scanner` entries.

## File to Edit
- `src/components/landing/FeaturesSection.tsx`

