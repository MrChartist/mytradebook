

# Fix Live Prices & Add LTP to Studies and Alerts

## Root Cause: "Data APIs not Subscribed" (Error 806)

The edge function logs reveal the real issue:

```
Dhan quote error: 401 {"data":{"806":"Data APIs not Subscribed"},"status":"failed"}
```

Your Dhan account token is valid and connected, but the **Market Data API plan is not active** on your Dhan account. The current code treats ALL 401 errors as "token expired", which is wrong -- error 806 means you need to subscribe to Dhan's data API plan (it's free for basic use, but needs activation).

## Plan

### 1. Fix error handling in `get-live-prices` edge function

**File:** `supabase/functions/get-live-prices/index.ts`

Currently, all 401 responses return `"token_expired"`. We need to parse the response body and distinguish:
- **Error 806** ("Data APIs not Subscribed") -- Show: "Dhan Data API plan not active. Go to web.dhan.co > My Profile > Access DhanHQ APIs and subscribe to a Data API plan (free tier available)."
- **Actual 401** (invalid token) -- Keep existing "token expired" message

Changes:
- Parse the JSON error body from Dhan's 401 response
- Check for error code 806 specifically
- Return a distinct error type `"data_api_not_subscribed"` so the frontend can show the right message

### 2. Show proper error message in Dashboard/UI

**File:** `src/hooks/useLivePrices.ts`

- Handle the new `"data_api_not_subscribed"` error type alongside `"token_expired"`
- Show actionable guidance: "Activate Data API plan on Dhan"

### 3. Add live LTP to Studies page

**File:** `src/pages/Studies.tsx`

The `InsightCard` component already supports `ltp` and `dayChangePercent` props -- they're just not being passed from the Studies page.

Changes:
- Import and use `useLivePrices` hook with the unique symbols from studies
- Pass `ltp` and `dayChangePercent` to each `InsightCard`
- Only fetch prices for studies with status "Active" or "Draft" (not Archived/Invalidated)

### 4. Add live LTP to Alerts page

**File:** `src/pages/Alerts.tsx`

Same pattern as Studies:
- Import `useLivePrices` with unique symbols from active alerts
- Pass `ltp` and `dayChangePercent` to each alert's `InsightCard`
- This lets users see current price vs their alert threshold at a glance

### 5. Show LTP alongside alert threshold on cards

For each alert card, show the current LTP next to the trigger price so users can see how close the price is to triggering. Example: "Price Above: target 1,461 | LTP 1,445 (1.1% away)"

## Technical Details

### Edge function error parsing (get-live-prices)

```text
Current: if (quoteRes.status === 401) -> return "token_expired"
Fixed:   if (quoteRes.status === 401) -> parse body -> 
           if body contains "806" or "not Subscribed" -> return "data_api_not_subscribed"
           else -> return "token_expired"
```

### Live price integration pattern (Studies & Alerts)

```text
// Extract unique symbols with security_id/exchange_segment
const instruments = useMemo(() => 
  uniqueSymbols.map(s => ({ symbol: s.symbol, security_id: s.security_id, exchange_segment: s.exchange_segment }))
, [studies/alerts]);

const { prices } = useLivePrices(instruments);

// Pass to InsightCard
<InsightCard 
  ltp={prices[study.symbol]?.ltp}
  dayChangePercent={prices[study.symbol]?.changePercent}
  ...
/>
```

## Files Modified

1. `supabase/functions/get-live-prices/index.ts` -- Parse 806 error, return distinct error type
2. `src/hooks/useLivePrices.ts` -- Handle "data_api_not_subscribed" error with actionable message
3. `src/pages/Studies.tsx` -- Add useLivePrices, pass LTP to InsightCards
4. `src/pages/Alerts.tsx` -- Add useLivePrices, pass LTP to InsightCards

## Important Note for User

You need to activate the Dhan Data API plan:
1. Go to web.dhan.co
2. My Profile > Access DhanHQ APIs
3. Subscribe to a Data API plan (free tier is available)
4. Once activated, live prices will start flowing immediately

