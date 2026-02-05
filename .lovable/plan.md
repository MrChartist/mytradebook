
## What’s going wrong (root causes from the current code)

### 1) “Less stocks / missing symbols”
Right now, both Trade + Alert symbol pickers still rely on **hardcoded arrays** (ex: `NSE_EQUITY`, `NFO_UNDERLYINGS`) inside UI components (`UnifiedInstrumentSearch.tsx`, `CreateAlertModal.tsx`).  
That will always be incomplete and will fall behind whenever NSE adds new stocks / F&O list changes.

### 2) “Wrong expiry / wrong stock data fetch”
Your current expiry + derivative pricing flows are **mock-generated on the frontend**:
- `generateExpiryDates()` (weekly Thursdays) and `generateFuturesExpiries()` (monthly last Thursday) are not guaranteed to match real tradable contracts.
- Live price function `get-live-prices` calls Dhan LTP endpoint with **symbols**, but Dhan’s LTP/feeds are designed around **SecurityId + ExchangeSegment**.  
This is why logs show “Dhan API request failed, using mock prices” and users get wrong/missing LTPs.

### 3) “Not able to add trade / NaN errors”
Even with some frontend sanitization, the app can still hit `NaN` at validation time for numeric inputs (especially when React Hook Form produces `NaN` for empty number fields). When the resolver fails, the submit handler won’t run, and it can feel like a “silent failure”.

Additionally, the DB currently requires `entry_price` (not nullable). The UI tries to “force” it to 0 for drafts, which can later break calculations (PnL%, etc.) if anything tries to compute using 0.

## Goal-aligned approach (reduce UI if needed, but make it 100% working)
To make this production-reliable, we need to:
1) Move “instrument universe” to the backend as a real **Instrument Master table** (updated daily)
2) Make the UI search the database (fast + complete)
3) Make create-trade / create-alert go through a single validated path that never sends NaN
4) For Options/Futures expiry: drive expiry/strike lists from Instrument Master, not mock dates

---

## Implementation Plan (sequenced for reliability first)

### Phase 0 — Reproduce + add “no silent failures” diagnostics (same day)
1) Add explicit error surfacing for Trade + Alert creation:
   - Always show a visible inline error block if submit fails.
   - Ensure Create buttons are only disabled during actual submit, and re-enabled after error.
2) Add lightweight client logging for create payload just before submit (dev-only) so we can see which field becomes NaN.

Outcome: user always sees “what failed” instead of nothing happening.

---

### Phase 1 — Backend Instrument Master (Cash + NFO first; MCX included as well)
#### 1.1 Database schema (Lovable Cloud database)
Create table (name example): `instrument_master`

Recommended columns (kept minimal but future-proof):
- `security_id` (text, primary key)  ← Dhan SecurityId
- `exchange_segment` (text)          ← ex: `NSE_EQ`, `NSE_FNO`, `MCX_COMM`
- `exchange` (text)                  ← `NSE` / `NFO` / `MCX` (derived)
- `instrument_type` (text)           ← `EQ` / `FUT` / `OPT` / `INDEX` / `COMMODITY`
- `trading_symbol` (text)            ← tradable symbol string
- `display_name` (text)
- `underlying_symbol` (text, nullable)
- `expiry` (date, nullable)
- `strike` (numeric, nullable)
- `option_type` (`CE`/`PE`, nullable)
- `lot_size` (int, nullable)
- `tick_size` (numeric, nullable)
- `updated_at` (timestamptz)

Indexes for speed:
- trigram / ILIKE indexes on `trading_symbol` and `display_name`
- composite indexes for derivatives lookup:
  - (`underlying_symbol`, `expiry`, `instrument_type`)
  - (`underlying_symbol`, `expiry`, `strike`, `option_type`)

Security (RLS):
- Enable RLS
- Allow **authenticated users** to `SELECT`
- Block all client `INSERT/UPDATE/DELETE` (sync happens via backend function)

#### 1.2 Instrument sync backend function
Create a backend function (edge function) like: `instrument-sync`
- Downloads Dhan scrip master CSV (compact or detailed) from Dhan’s published URL
- Parses rows and upserts into `instrument_master` in batches
- Writes a small `instrument_sync_log` entry (time, row count, success/failure)

Access control:
- Only allow admin users to trigger manually (or protected with a server key and role check)

#### 1.3 Daily update job + manual refresh
- Add a “Refresh Instrument Master” endpoint (manual trigger).
- Attempt to set up an automatic daily sync:
  - If scheduling tools are available in your Lovable Cloud DB, create a daily schedule that calls `instrument-sync`
  - If not available, we’ll add a small Admin-only button in Settings to run it manually (still reliable)

Acceptance for Phase 1:
- Searching `RECLTD` returns from DB (not UI arrays)
- Newly added symbols appear after sync

---

### Phase 2 — Instrument Search API (single universal search used everywhere)
Create backend function `instrument-search`:
Inputs:
- `query` (string)
- `exchange` filter (`NSE`/`NFO`/`MCX` or `ALL`)
- `instrument_type` filter (`EQ`/`FUT`/`OPT`/`INDEX`/`COMMODITY` or `ALL`)
- `limit` (default 50)

Outputs:
- `security_id`, `trading_symbol`, `display_name`, `exchange`, `exchange_segment`, `instrument_type`,
  plus `expiry/strike/option_type/underlying_symbol/lot_size/tick_size` when present.

Frontend work:
1) Replace the hardcoded lists in:
   - `src/components/trade/UnifiedInstrumentSearch.tsx`
   - `src/components/modals/CreateAlertModal.tsx`
2) Add:
   - debounce (150–300ms)
   - loading spinner
   - “No results” state
3) Keep Recent/Favourites:
   - still localStorage-based, but store `security_id` + `trading_symbol` (not just symbol string)

Acceptance:
- `RELIANCE` shows in NSE Cash
- `NIFTY` shows index + NFO instruments correctly
- All / Recent / Favourites tabs work even with empty search

---

### Phase 3 — Fix trade creation (100% reliable, minimal required fields, no NaN)
#### 3.1 Stop NaN at the source (frontend)
- Update numeric inputs to never store NaN:
  - Prefer string-state or manual parsing instead of relying on `valueAsNumber` alone
- Ensure targets always become `number[]` and never include NaN
- Ensure empty numeric fields are sent as `null` (never `""`, never `NaN`)

#### 3.2 Make “only these required” true
Required:
- Segment
- Trade Type
- Selected instrument (must include `security_id`, `exchange_segment`, `trading_symbol`)

Optional:
- entry/sl/targets/timeframe/holding/tags/images/notes/automation

Status rules:
- If entry price is missing → create as `PENDING` (draft)
- If entry exists → create as `OPEN`
- If Auto Track is ON but entry is missing:
  - Option A (recommended): set entry automatically to current LTP on create
  - Option B: keep it PENDING and track only `current_price` without PnL until entry is set  
  (We’ll pick one and keep it consistent across UI + backend monitor.)

#### 3.3 Trade creation “single backend path” (recommended)
Create backend function `trade-create`:
- Validates input server-side (zod)
- Sanitizes numeric fields (`null` if missing)
- Inserts trade + returns the created record or a clear error
- Logs full technical error on server logs (no silent failures)

Then update `useTrades.createTrade` to call `trade-create` instead of direct DB insert.

Acceptance:
- Create trade with only Segment + Trade Type + Instrument succeeds
- No “Expected number, received nan”
- On failure, user sees a clear message

---

### Phase 4 — Fix Alerts end-to-end (symbol master + Telegram + correct LTP)
1) Update Create Alert instrument picker to use `instrument-search` and store:
   - `security_id` + `exchange_segment` + `trading_symbol`
2) Update alert evaluation backend:
   - Evaluate alerts using `security_id` grouped by `exchange_segment`
   - Fetch LTPs correctly (not by plain symbol)
3) Telegram reliability:
   - Centralize Telegram sends via `telegram-notify`
   - Add retry (ex: 3 attempts with short backoff) + structured logs

Acceptance:
- Alert creation works reliably
- Trigger evaluation fetches correct LTP for NSE Cash (and later NFO)
- Telegram message includes notes only when present

---

### Phase 5 — Options/Futures expiry correctness (remove mock expiry generation)
Replace “generated expiries” with DB-driven expiries:
- For Options/Futures flows:
  - Underlying selection pulls from instrument master
  - Expiry dropdown = distinct expiries from instrument master for that underlying
  - Strike dropdown = strikes for (underlying + expiry)
  - CE/PE toggle filters option_type
- If the instrument master doesn’t have data for that underlying/expiry:
  - Show “Data unavailable” and allow direct contract search fallback (never break submit)

Acceptance:
- No “wrong expiry”
- Selected contract always maps to a real `security_id` + `exchange_segment`

---

## Testing / QA checklist (what we will verify end-to-end)
1) Login → Create Trade:
   - Minimal fields only → saved
   - Optional numeric fields blank → no NaN
2) Search:
   - `RECLTD` shows in NSE Cash results
   - NFO search shows underlyings and contracts appropriately
3) Options:
   - Underlying → expiry → strike → CE/PE → creates trade with correct contract id
4) Alerts:
   - Create alert with notes + Telegram ON → saved
   - Trigger evaluation runs without API errors and sends Telegram with notes

---

## What I will simplify (to reduce UI but increase reliability)
- Keep the modal clean by default:
  - Show only required inputs + Instrument picker + Create button
  - Put everything else (SL/targets/TSL/images/tags/notes) under an “Advanced” collapsible section
- For derivatives, keep “Direct search for contract” as a fallback even if chain UI exists

---

## Critical dependencies / risks
- Instrument master CSV is large; sync must be batched and may take a little time on first run.
- We must move price-fetching to SecurityId + ExchangeSegment; otherwise “wrong LTP” will continue.
- Database schema changes must be backwards-safe (no data loss) and code must handle nulls everywhere.

If you approve, I’ll implement starting from Phase 1 + Phase 3 (instrument master + trade creation reliability) because those two unlock everything else.
