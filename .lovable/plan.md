

# Fix F&O Underlyings + Add Strategy Builder to Trade Creation

## Problem 1: Missing F&O Stocks

The `useFnoUnderlyings` hook queries `instrument_master` for `underlying_symbol` where `exchange = 'NFO'`. However, Supabase has a **default 1000-row limit** per query. Since there are thousands of NFO rows (one per contract), the query returns only ~1000 rows and after deduplication, you get a partial list of underlyings.

**Fix**: Use a Postgres RPC function (database function) that does `SELECT DISTINCT underlying_symbol` server-side, returning only the ~185 unique symbols instead of thousands of raw rows.

## Problem 2: Strategy Builder in Trade Creation

When the user selects "Options" segment in the Create Trade modal, add an inline option to build a multi-leg strategy right there instead of requiring a separate modal.

---

## Changes

### 1. Database Migration -- Create RPC function

Create a Postgres function `get_fno_underlyings()` that returns distinct underlying symbols efficiently:

```sql
CREATE OR REPLACE FUNCTION get_fno_underlyings()
RETURNS TABLE(underlying_symbol text) AS $$
  SELECT DISTINCT im.underlying_symbol
  FROM instrument_master im
  WHERE im.exchange = 'NFO'
    AND im.underlying_symbol IS NOT NULL
    AND im.underlying_symbol NOT LIKE '%NSETEST%'
  ORDER BY im.underlying_symbol;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

### 2. Update `src/hooks/useFnoUnderlyings.ts`

Replace the current query with an RPC call:

```typescript
const { data, error } = await supabase.rpc("get_fno_underlyings");
```

This returns all ~185 symbols in one call with no row-limit issues.

### 3. Update `src/components/trade/MultiLegStrategyModal.tsx`

No changes needed beyond what already exists -- once the hook returns all symbols, the modal will show them all.

### 4. Add Strategy Builder shortcut in `src/components/modals/CreateTradeModal.tsx`

When the user selects "Options" as the segment, show a button/link: **"Build Multi-Leg Strategy"** that opens the `MultiLegStrategyModal` inline. This saves the user from navigating to the Trades page and clicking Multi-Leg separately.

- Add a state `showStrategyBuilder` toggled by a button
- Import and render `MultiLegStrategyModal` inside the CreateTradeModal
- When a strategy is created from there, close both modals

### 5. Update `src/components/trade/OptionChainSelector.tsx`

Same RPC-based hook is already imported -- it will automatically benefit from the fix.

---

## Summary of Files

| File | Action |
|------|--------|
| Database migration (RPC function) | Create `get_fno_underlyings()` |
| `src/hooks/useFnoUnderlyings.ts` | Switch to `supabase.rpc()` call |
| `src/components/modals/CreateTradeModal.tsx` | Add "Build Multi-Leg Strategy" button for Options segment |
| `src/components/trade/MultiLegStrategyModal.tsx` | No changes (auto-fixed by hook) |
| `src/components/trade/OptionChainSelector.tsx` | No changes (auto-fixed by hook) |

