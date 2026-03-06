

# Fix: Fundamentals Page Not Loading

## Root Cause
The `tradingview-scan` edge function includes the field `enterprise_value_to_ebitda_ttm` which TradingView's India scanner does not recognize. This causes a 400 error on every request, returning zero data.

From the logs:
```
TradingView error: 400 {"totalCount":0,"error":"Unknown field \"enterprise_value_to_ebitda_ttm\"","data":null}
```

Several other fields may also be invalid for the India scanner (e.g., `price_sales_ratio`, `price_book_ratio`, `return_on_equity`, `return_on_assets`, `net_margin`, `operating_margin`, `gross_margin`, `debt_to_equity`, `current_ratio`, `total_revenue`, `net_income`, `beta_1_year`, `ATR`). The safest fix is to remove `enterprise_value_to_ebitda_ttm` and any other fields that TradingView India doesn't support, then re-align the array index mapping.

## Plan

### 1. Fix edge function (`supabase/functions/tradingview-scan/index.ts`)
- Remove `enterprise_value_to_ebitda_ttm` from the FIELDS array
- Potentially remove other unsupported fields (or keep and test — the key blocker is `enterprise_value_to_ebitda_ttm`)
- Re-align the `d[index]` mapping in the response mapper since removing a field shifts all subsequent indices
- Use a name-to-index map approach instead of hardcoded indices to prevent future breakage

### 2. Update hook interface (`src/hooks/useFundamentals.ts`)
- Remove `ev_ebitda` from `FundamentalData` interface (or mark it removed)

### 3. Update StockPopupCard (`src/components/trade/StockPopupCard.tsx`)
- Remove any reference to `ev_ebitda` in the Valuation tab

### 4. Update Fundamentals page (`src/pages/Fundamentals.tsx`)
- No changes needed unless `ev_ebitda` is referenced in filter presets (it's not currently)

## Files to Modify
| File | Change |
|---|---|
| `supabase/functions/tradingview-scan/index.ts` | Remove `enterprise_value_to_ebitda_ttm`, fix index mapping |
| `src/hooks/useFundamentals.ts` | Remove `ev_ebitda` from interface |
| `src/components/trade/StockPopupCard.tsx` | Remove EV/EBITDA display |

