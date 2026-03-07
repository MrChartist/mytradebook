

## Problem

Several scanner presets use **incorrect proxy filters** instead of proper comparisons. The core issue is that presets like "52W High", "52W Low", "ATH", "ATL", "Above SMA 50", and "Near Day High/Low" can't do cross-field comparisons (e.g., `close ≈ price_52_week_high`) with the current simple `{field, op, value}` filter format.

### Audit of broken/inaccurate presets

| Preset | Current filter | Problem |
|--------|---------------|---------|
| 52W High | `Perf.W > 0` | Just positive weekly return, not near 52W high |
| 52W Low | `Perf.Y < -40` | Down 40% YTD, not at 52W low |
| ATH Zone | `Perf.1M > 5, 3M > 10, Y > 20` | Proxy, not actual ATH proximity |
| ATL Zone | `Perf.Y < -60` | Proxy, not actual ATL proximity |
| Above SMA 50 | `Perf.1M > 0, RSI > 50` | Not comparing price to SMA50 |
| Near Day High | `change > 3%` | Just gainers, not near intraday high |
| Near Day Low | `change < -3%` | Just losers, not near intraday low |

## Solution

### 1. Edge function: Add `rawFilters` support

Add an optional `rawFilters` array to the request body that passes TradingView-native filter objects directly into the filter array. This enables cross-field comparisons and percentage-based operations.

**File**: `supabase/functions/tradingview-scan/index.ts`
- After processing simple `filters`, append any `rawFilters` objects directly to the TV `filter` array
- Include `rawFilters` in the cache key computation

### 2. Frontend: Add `rawFilters` to preset type and hook

**Files**: `src/pages/Fundamentals.tsx`, `src/hooks/useFundamentals.ts`

- Add `rawFilters?: unknown[]` to `ScannerPreset` and `ScanParams` types
- Pass `rawFilters` through `useFundamentals` to the edge function

### 3. Fix all broken presets with proper TV filters

Use TradingView's native percentage-from-value filter syntax:

```text
52W High:  close >= 0.97 * price_52_week_high  (within 3% of 52W high)
52W Low:   close <= 1.03 * price_52_week_low   (within 3% of 52W low)
ATH:       close >= 0.95 * High.All            (within 5% of all-time high)
ATL:       close <= 1.10 * Low.All             (within 10% of all-time low)
Above SMA50: close > SMA50                     (direct field comparison)
```

For cross-field comparisons, use TV's `"egreater"` / `"eless"` operations that compare two column references, or the percentage range syntax.

### 4. Updated preset list after fixes

All ~47 presets audited. Presets using simple numeric thresholds (Top Gainers, Oversold RSI, Volume Spike, etc.) are correct and unchanged. Only the ~7 cross-field presets above get fixed with proper `rawFilters`.

### Files to edit
1. `supabase/functions/tradingview-scan/index.ts` — add `rawFilters` passthrough + cache key update
2. `src/hooks/useFundamentals.ts` — add `rawFilters` to `ScanParams`, pass to edge function
3. `src/pages/Fundamentals.tsx` — fix broken presets with proper `rawFilters`, add `rawFilters` to type

