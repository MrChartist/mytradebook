

# TrueData as Secondary Market Data Provider

## Overview

Add TrueData as a fallback/secondary live market data provider alongside the existing Dhan primary feed. The system will automatically switch to TrueData when Dhan fails or returns stale data, and switch back when Dhan recovers. The rest of the app remains unchanged -- same `useLivePrices` hook, same `PriceData` shape.

---

## Architecture

### Important Design Decision: Edge Function + HTTP Polling

The current system uses **HTTP polling** (not browser WebSockets): the `useLivePrices` hook calls the `get-live-prices` edge function every 30 seconds, which in turn calls Dhan's REST API. This is the correct pattern for Lovable Cloud because:

- Edge functions are stateless/short-lived -- they cannot maintain persistent WebSocket connections
- Trading API credentials (Dhan tokens, TrueData auth) must stay server-side for security
- The browser cannot connect directly to TrueData's WebSocket API without exposing credentials

Therefore, the architecture will be:

```text
Browser (useLivePrices hook)
   |
   | HTTP poll every 30s
   v
Edge Function: get-live-prices
   |
   |--- Try Dhan REST API (primary)
   |       |
   |       |--- Success? Return prices with source: "dhan"
   |       |--- Fail (401/timeout/error)?
   |                |
   |                v
   |--- Try TrueData REST API (secondary/fallback)
   |       |
   |       |--- Success? Return prices with source: "truedata"
   |       |--- Fail? Return error
   |
   v
Response includes: prices, source, failover_active flag
```

### Client-Side Abstraction Layer

Even though the actual fetching happens in edge functions, a clean client-side abstraction will be added for:
- Stale tick detection (if no new prices for N seconds, show warning)
- Provider status tracking (which provider is active)
- Failover event notifications (Telegram alert on switch)

---

## Deliverables

### A. Standardized Tick Model

**New file: `src/marketdata/models/Tick.ts`**

```text
Tick {
  symbol: string           // e.g., "RELIANCE"
  ltp: number
  bid?: number
  ask?: number
  open?: number
  high?: number
  low?: number
  prevClose?: number
  volume?: number
  oi?: number
  change: number
  changePercent: number
  timestamp: number        // epoch ms
  provider: "dhan" | "truedata"
}
```

### B. Market Data Config

**New file: `src/marketdata/config.ts`**

```text
MarketDataConfig {
  primaryProvider: "dhan"
  secondaryProvider: "truedata"
  enableFailover: true
  staleTickSeconds: 90       // 3 missed polls = stale
  maxRetries: 3
  pollIntervalMs: 30000
}
```

### C. Provider Interface

**New file: `src/marketdata/MarketDataProvider.ts`**

TypeScript interface defining the contract for any market data provider. Used by the edge function internally.

```text
MarketDataProvider {
  name: string
  fetchQuotes(instruments): Promise<Record<string, Tick>>
  isAvailable(): boolean
}
```

### D. Edge Function Update: `get-live-prices`

**Modified file: `supabase/functions/get-live-prices/index.ts`**

This is where the core logic changes happen:

1. **Add TrueData fetcher**: New function `fetchFromTrueData()` that calls TrueData's REST API (`/getquotes` or similar endpoint) with user's TrueData credentials
2. **Resolve TrueData credentials**: Read `truedata_username`, `truedata_password` from `user_settings` (new columns) or from environment secrets
3. **Failover logic in the edge function**:
   - Try Dhan first (existing logic)
   - If Dhan fails (401, 429 exhausted, timeout, empty response), try TrueData
   - Return `source` field indicating which provider served the data
   - Return `failover_active: true` when secondary was used
4. **Symbol mapping**: TrueData uses different symbol format (e.g., `NSE:RELIANCE` vs Dhan's `security_id`). Add a mapping layer.

### E. TrueData Credentials Storage

**Database migration**: Add columns to `user_settings`:

```text
truedata_username    text    nullable
truedata_password    text    nullable
truedata_enabled     boolean default false
truedata_verified_at timestamptz nullable
```

### F. Settings UI: TrueData Section

**Modified file: `src/components/settings/IntegrationsSettings.tsx`**

Add a new "TrueData Market Data" card below the Dhan section:
- Username and Password fields
- "Test Connection" button (calls a verify endpoint)
- Toggle to enable/disable as fallback
- Status indicator showing if TrueData is currently active as fallback

### G. Client-Side Failover Awareness

**Modified file: `src/hooks/useLivePrices.ts`**

- Track `activeProvider` from the edge function response's `source` field
- Track `failoverActive` boolean
- Expose these in the hook return value
- When `failoverActive` flips to `true`, send a one-time Telegram notification

**Modified file: `src/hooks/useUserSettings.ts`**

- Add TrueData fields to the `UserSettings` interface

### H. Dashboard Provider Indicator

**Modified file: `src/pages/Dashboard.tsx`** (and Trades, Watchlist)

- Show a small badge next to the live price indicator showing "Dhan" or "TrueData" as the active source
- When failover is active, show a subtle amber warning badge

### I. Environment Secrets

Add optional server-side secrets for global TrueData fallback:
- `TRUEDATA_USERNAME`
- `TRUEDATA_PASSWORD`

Per-user credentials in `user_settings` take priority over global secrets.

---

## Files Summary

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/marketdata/models/Tick.ts` | Standardized tick type |
| Create | `src/marketdata/config.ts` | Market data configuration constants |
| Create | `src/marketdata/MarketDataProvider.ts` | Provider interface type |
| Create | `src/marketdata/index.ts` | Barrel exports |
| Modify | `supabase/functions/get-live-prices/index.ts` | Add TrueData fallback fetcher, failover logic |
| Modify | `src/hooks/useLivePrices.ts` | Track active provider, failover state |
| Modify | `src/hooks/useUserSettings.ts` | Add TrueData settings fields |
| Modify | `src/components/settings/IntegrationsSettings.tsx` | TrueData credentials UI section |
| Modify | `src/pages/Dashboard.tsx` | Provider status badge |
| Modify | `src/pages/Trades.tsx` | Provider status badge |
| Modify | `src/pages/Watchlist.tsx` | Provider status badge |
| Migration | `user_settings` table | Add truedata columns |

---

## What This Does NOT Change

- No changes to order execution (Dhan-only)
- No changes to trade CRUD, alerts, journal, analytics
- No new dependencies needed
- The `PriceData` interface consumed by components remains identical
- Dhan remains the primary and default provider

---

## Credential Note

TrueData requires a paid subscription. Their REST API authentication typically uses username + password for token generation. Since the exact API endpoints and auth flow may vary by plan, the TrueData fetcher will be implemented with clear placeholders for the API URL and auth payload, documented with comments so you can adjust to your specific TrueData plan.

