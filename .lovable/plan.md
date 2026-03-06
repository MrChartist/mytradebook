

# Plan: Add Stock Fundamentals via TradingView Scanner API

## Summary
Build a complete fundamentals feature — a new edge function that fetches data from TradingView's India scanner, a React hook to consume it, a dedicated Fundamentals/Screener page, and integration into the existing Watchlist and trade detail views.

## Architecture

```text
┌──────────────┐        ┌──────────────────────────┐        ┌─────────────────────┐
│  React App   │──invoke─▶│ Edge Fn: tradingview-scan │──POST──▶│ scanner.tradingview  │
│  useFundamentals()     │ (5-min in-memory cache)  │◀──JSON──│ .com/india/scan      │
│              │◀─JSON───│                          │        └─────────────────────┘
└──────────────┘        └──────────────────────────┘
```

## What Gets Built

### 1. Edge Function: `tradingview-scan`
- POST endpoint accepting `{ symbols: string[] }` (NSE tickers)
- Calls TradingView scanner API with ~30 fields covering valuation, profitability, financial health, and technicals
- 5-minute in-memory cache keyed by sorted symbol list hash
- No API key needed — TradingView scanner is public
- Fields fetched:

| Category | Fields |
|---|---|
| Identity | name, description, industry, sector |
| Price | close, change, volume, relative_volume_10d_calc, average_volume_10d_calc |
| Valuation | market_cap_basic, price_earnings_ttm, earnings_per_share_basic_ttm, price_book_ratio, price_sales_ratio, enterprise_value_to_ebitda_ttm, dividends_yield |
| Profitability | return_on_equity, return_on_assets, net_margin, operating_margin, gross_margin |
| Financial | debt_to_equity, current_ratio, total_revenue, net_income |
| Technicals | SMA10, SMA20, SMA50, RSI, High.All, Low.All, Perf.W, Perf.1M, Perf.3M, Perf.Y, beta_1_year, ATR |

### 2. React Hook: `useFundamentals`
- New file `src/hooks/useFundamentals.ts`
- Accepts array of symbols, calls edge function, returns typed `FundamentalData` records
- Uses React Query with 5-min stale time
- Exports `FundamentalData` interface with all fields

### 3. New Page: Fundamentals Screener (`src/pages/Fundamentals.tsx`)
- Full-page searchable, sortable table of NSE stocks
- Default load: top 50 by market cap
- Filter presets: "Undervalued" (low P/E + P/B), "High Growth" (high ROE + margins), "Dividend Stocks" (high yield), "Momentum" (positive performance)
- Columns: Symbol, Sector, LTP, Change%, Market Cap, P/E, P/B, ROE, Div Yield, 52W Range
- Click row → popup with full fundamental detail (tabbed)

### 4. Stock Popup Card (`src/components/trade/StockPopupCard.tsx`)
- Modal triggered from Screener row click, Watchlist, or trade detail
- 4 tabs:
  - **Overview** — Price, change, OHLC, key metrics summary
  - **Valuation** — P/E, P/B, P/S, EV/EBITDA, Dividend Yield with visual gauges
  - **Financials** — Revenue, Net Income, ROE, ROA, margins with bar indicators
  - **Technicals** — SMAs, RSI gauge, 52W range bar, performance periods, Beta, ATR

### 5. Integrate into Existing Pages
- **Watchlist** — Add a "Fundamentals" toggle that shows P/E, Market Cap, ROE columns alongside live prices
- **Trade Detail Modal** — Replace or enhance the existing simple view with a "Fundamentals" tab using the new data

### 6. Navigation
- Add "Fundamentals" nav item in sidebar under analytics section with a suitable icon

## Files to Create/Modify

| File | Action |
|---|---|
| `supabase/functions/tradingview-scan/index.ts` | **Create** — Edge function |
| `supabase/config.toml` | Auto-updated (JWT config) |
| `src/hooks/useFundamentals.ts` | **Create** — Hook + types |
| `src/components/trade/StockPopupCard.tsx` | **Create** — Tabbed detail modal |
| `src/pages/Fundamentals.tsx` | **Create** — Screener page |
| `src/App.tsx` | **Modify** — Add route |
| `src/components/layout/Sidebar.tsx` | **Modify** — Add nav item |
| `src/components/layout/MobileBottomNav.tsx` | **Modify** — Add nav if needed |
| `src/pages/Watchlist.tsx` | **Modify** — Add fundamentals toggle columns |

## Implementation Order
1. Edge function (tradingview-scan)
2. Hook (useFundamentals)
3. StockPopupCard component
4. Fundamentals screener page + route + nav
5. Watchlist integration

