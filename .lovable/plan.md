
# Watchlist Enhancement: Live Market Data + Rich Row UI

## Overview
Transform the watchlist from a simple symbol list into a live market data terminal. Each row will show LTP, day change, OHLC, volume, and quick actions -- all auto-refreshing with a "Live" indicator.

## What Changes

### 1. Enhanced Edge Function (`supabase/functions/get-live-prices/index.ts`)
- Add a second Dhan API call to `/v2/marketfeed/ohlc` alongside the existing `/v2/marketfeed/ltp` call
- Return additional fields per symbol: `open`, `high`, `low`, `prevClose`, `volume`
- Both calls use the same security ID mapping already built

### 2. Enhanced Price Hook (`src/hooks/useLivePrices.ts`)
- Expand the `PriceData` interface to include `open`, `high`, `low`, `prevClose`, `volume` fields
- No polling logic changes needed -- same 30s interval works

### 3. Watchlist Detail Row Redesign (`src/pages/Watchlist.tsx`)
The `WatchlistDetail` component gets a full makeover:

**Row layout (desktop):**
```text
[Avatar] Symbol   LTP (bold)   +28.10 (+0.96%)   O 2920  H 2960  L 2905  C 2917   Vol 68.4L   [Bell] [Trade] [X]
         NSE      large mono   green/red pill     compact OHLC chips               Indian fmt    actions
```

**Row layout (mobile):**
```text
[Avatar] Symbol    LTP          +0.96%
         NSE       2,945.50     green pill
         O 2920 H 2960 L 2905 C 2917 Vol 68.4L
```

**Key UI elements:**
- LTP in bold monospace font, large size
- Day change as a colored pill (green/red) showing both absolute and percent
- OHLC in compact, muted chip format
- Volume formatted in Indian units (K / L / Cr)
- Missing data shows "--" instead of 0/NaN
- "Live" pulsing green dot + "Last updated" timestamp in header
- Sort dropdown: % Change, Volume, LTP, A-Z
- Premium card styling consistent with the rest of the app

### 4. Sorting
- Add sort state to `WatchlistDetail`
- Options: `change_pct` (default), `volume`, `ltp`, `alphabetical`
- Uses `SortSelect` component already built

### 5. Quick Actions per Row
- **Bell icon** -- Create alert (already exists, keep it)
- **Plus icon** -- Create trade prefilled with symbol (new)
- **X icon** -- Remove from watchlist (already exists, keep it)
- Clicking the row itself does nothing extra for now (keeps it simple)

### 6. Market Closed State
- When all LTP values return as unavailable, show a subtle "Market Closed" badge in the header
- Keep last known OHLC/volume values displayed

---

## Technical Details

### Edge Function Changes
Add OHLC fetch after existing LTP fetch:

```typescript
// After LTP call, also fetch OHLC
const ohlcResponse = await fetch(`${DHAN_API_URL}/marketfeed/ohlc`, {
  method: "POST",
  headers: { ... same headers ... },
  body: JSON.stringify(requestBody), // same security IDs
});

// Merge OHLC data into prices
if (ohlcResponse.ok) {
  const ohlcData = await ohlcResponse.json();
  // Merge open, high, low, close, volume into each price entry
}
```

### Volume Formatting Utility
```typescript
function formatVolume(vol: number): string {
  if (vol >= 10000000) return `${(vol / 10000000).toFixed(1)}Cr`;
  if (vol >= 100000) return `${(vol / 100000).toFixed(1)}L`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`;
  return vol.toString();
}
```

### Files to Modify
1. `supabase/functions/get-live-prices/index.ts` -- Add OHLC endpoint call, merge data
2. `src/hooks/useLivePrices.ts` -- Expand PriceData interface with OHLC + volume
3. `src/pages/Watchlist.tsx` -- Redesign WatchlistDetail rows, add sorting, integrate live prices, add "Create Trade" action

### Files Unchanged
- No database changes needed
- No new tables or migrations
- Watchlist CRUD logic stays the same
