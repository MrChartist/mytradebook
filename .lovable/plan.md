

# Add Yahoo Finance as Secondary Price Source

## Overview

Add Yahoo Finance as a free, always-available fallback price source. When Dhan is not connected, not subscribed, or fails, Yahoo Finance kicks in automatically -- ensuring live prices always work for NSE/BSE stocks without any API key.

## How It Works

```text
get-live-prices edge function receives symbol list
        |
        v
  Try Dhan API (primary)
        |
   +---------+---------+
   | Success |  Fail   |
   +---------+---------+
   | Return  |    v
   | prices  | Yahoo Finance fallback
   |         | (for unfetched symbols)
   |         |    v
   |         | Return prices with source: "yahoo"
   +---------+---------+
        |
        v
  Merge all prices, return to frontend
```

## Key Design Decisions

1. **No API key needed** -- Yahoo Finance's public chart endpoint (`query1.finance.yahoo.com/v8/finance/chart/SYMBOL.NS`) works without authentication
2. **Indian stock symbol mapping** -- Append `.NS` (NSE) or `.BO` (BSE) suffix to trading symbols for Yahoo
3. **Parallel fallback, not replacement** -- Dhan remains primary (faster, more data). Yahoo only fills gaps for symbols Dhan couldn't fetch
4. **Source tracking** -- Each price result carries `source: "dhan" | "yahoo"` so the UI can optionally show which provider is active

## Changes

### 1. Edge Function: `supabase/functions/get-live-prices/index.ts`

Add a Yahoo Finance fallback after the Dhan fetch completes:

- New helper function `fetchYahooPrices(symbols: string[])`:
  - Maps each symbol to Yahoo format (e.g., `RELIANCE` becomes `RELIANCE.NS`)
  - Calls `https://query1.finance.yahoo.com/v8/finance/chart/SYMBOL.NS?interval=1d&range=1d`
  - Extracts `regularMarketPrice`, `previousClose`, `regularMarketOpen`, `regularMarketDayHigh`, `regularMarketDayLow`, `regularMarketVolume` from response
  - Batches requests (up to 5 concurrent) to avoid rate limits
  - Returns prices in the same `PriceResult` format with `source: "yahoo"`

- After Dhan fetch, check for unfetched symbols
- If any symbols remain unfetched AND (Dhan failed OR no Dhan token), call `fetchYahooPrices()` for those symbols
- Merge Yahoo results into the prices map
- Update the `PriceResult` interface to include `"yahoo"` as a valid source

Flow changes in the main handler:
```text
1. Try Dhan (existing logic, unchanged)
2. Collect unfetched symbols
3. If unfetched.length > 0, call fetchYahooPrices(unfetched)
4. Merge into prices map
5. Return combined result with mixed sources
```

### 2. Frontend Hook: `src/hooks/useLivePrices.ts`

- Update the `PriceData` interface to include optional `source` field
- Remove the hard error on Dhan failures when Yahoo fallback succeeds (prices still arrive)
- Show a softer warning like "Using delayed prices (Yahoo)" instead of a blocking error when Dhan is unavailable but Yahoo works

### 3. PriceResult Type Update

Add `"yahoo"` to the source union:
```text
source: "dhan" | "yahoo" | "unavailable"
```

### 4. UI Indicator (optional, lightweight)

In `useLivePrices`, expose a `source` field so pages can optionally show a small badge like "Yahoo (delayed)" when prices come from Yahoo instead of Dhan.

## Yahoo Finance API Details

- **Endpoint**: `https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}.NS`
- **Method**: GET
- **No auth required**
- **Rate limits**: ~2000 requests/hour (generous for polling)
- **Data**: Real-time during market hours, delayed ~15 min for some symbols
- **Indian stocks**: Append `.NS` for NSE, `.BO` for BSE
- **Response fields used**:
  - `meta.regularMarketPrice` -- LTP
  - `meta.previousClose` -- Previous close
  - `meta.regularMarketDayHigh` / `regularMarketDayLow` -- Day range
  - `meta.regularMarketVolume` -- Volume

## Symbol Mapping Logic

```text
exchange_segment mapping:
  NSE_EQ, NSE_FNO -> .NS suffix
  BSE_EQ, BSE_FNO -> .BO suffix  
  Default -> .NS suffix (most Indian stocks are NSE)
```

For F&O instruments (futures/options), Yahoo doesn't support them well, so Yahoo fallback only applies to equity symbols.

## Files Modified

1. `supabase/functions/get-live-prices/index.ts` -- Add `fetchYahooPrices()` helper and fallback logic after Dhan fetch
2. `src/hooks/useLivePrices.ts` -- Handle mixed sources gracefully, expose source info

## What This Enables

- **No Dhan connected**: Prices still work via Yahoo for all equity symbols
- **Dhan subscription issue (806)**: Yahoo fills the gap while user activates Data API
- **Partial Dhan failure**: If Dhan returns some but not all symbols, Yahoo fills the rest
- **Studies, Alerts, Dashboard, Trades**: All get live prices regardless of Dhan status

