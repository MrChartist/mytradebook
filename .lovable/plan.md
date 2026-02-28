
# Expand F&O Stocks in Option Strategy Builder

## Problem
Both `MultiLegStrategyModal.tsx` and `OptionChainSelector.tsx` use a hardcoded `POPULAR_UNDERLYINGS` array with only 11-15 symbols. The actual `instrument_master` database has 180+ F&O underlying symbols.

## Solution
Replace the hardcoded list with a database-driven approach that fetches all F&O underlyings, organized into Indices and Stocks, with search filtering.

## Changes

### 1. Create a shared hook: `src/hooks/useFnoUnderlyings.ts`
- Query `instrument_master` for distinct `underlying_symbol` where `exchange = 'NFO'`
- Filter out test symbols (e.g., those ending in "NSETEST")
- Categorize into **Indices** (NIFTY, BANKNIFTY, FINNIFTY, SENSEX, MIDCPNIFTY, NIFTYNXT50, BANKEX) and **Stocks** (everything else)
- Cache the result using React Query so it loads once and stays fast
- Return `{ indices, stocks, all, isLoading }` 

### 2. Update `src/components/trade/MultiLegStrategyModal.tsx`
- Remove hardcoded `POPULAR_UNDERLYINGS`
- Use the new `useFnoUnderlyings` hook
- Show Indices first as a row of badges (always visible)
- Show Stocks below, filtered by the search input
- Display a small loading spinner while fetching
- Cap the visible stock badges to ~30 at a time with the search narrowing results

### 3. Update `src/components/trade/OptionChainSelector.tsx`
- Same change: replace hardcoded `POPULAR_UNDERLYINGS` with the shared hook
- Show Indices as a pinned row, Stocks searchable below

### 4. Strike step logic
- Update `getStrikeStep()` to default to a sensible value for stock options (currently returns 10, which is correct for most stocks, but larger stocks like RELIANCE may need larger steps)
- Add a lookup: if price > 5000 use step 50, if > 2000 use step 25, else step 10

## Technical Details

**Database query** (inside the hook):
```sql
SELECT DISTINCT underlying_symbol 
FROM instrument_master 
WHERE exchange = 'NFO' 
  AND underlying_symbol IS NOT NULL
ORDER BY underlying_symbol
```

**Known indices to pin at top:**
NIFTY, BANKNIFTY, FINNIFTY, SENSEX, MIDCPNIFTY, NIFTYNXT50, BANKEX

**UI layout change:**
```
Indices:  [NIFTY] [BANKNIFTY] [FINNIFTY] [SENSEX] [MIDCPNIFTY]
─────────────────────────────────────────
Stocks:   Search: [________]
          [RELIANCE] [TCS] [INFY] [HDFCBANK] ...
          (scrollable, filtered by search)
```

No database migration needed -- all data already exists in `instrument_master`.
