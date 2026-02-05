
# Comprehensive Fix Plan: Integrations + Instrument Master + Search/LTP

## Current Issues Analysis

### 1. Instrument Sync Failures
- **Equity CSV returns 403**: The URL `https://images.dhan.co/api-data/api-scrip-master-equity.csv` is being blocked
- **CPU Time exceeded**: Processing 172,906 F&O rows exceeds edge function limits
- **Garbage data in DB**: ISINs stored as instrument_type, fake security IDs like "NSE_EQ_113"
- **Sync stuck at "running"**: Logs show 2 syncs never completed

### 2. LTP Fetch Failures
- Security IDs in DB are fake (e.g., "NSE_EQ_113") instead of real Dhan IDs (e.g., "11536")
- Without real security_id, Dhan API cannot return prices
- Logs show "Price unavailable for RELIANCE - not in Dhan response"

### 3. Single-Tenant Integration Design
- Dhan credentials stored as global secrets, not per-user
- Telegram chat ID stored per-user but no verification flow
- Missing user-specific dhan_access_token storage

---

## Solution Architecture

### Phase A: Per-User Telegram Integration with Verification

#### A.1 Database Schema Update
Add new columns to `user_settings`:

```text
telegram_link_code: VARCHAR(12) - temporary verification code
telegram_link_expires_at: TIMESTAMPTZ - code expiry (5 min)
telegram_verified_at: TIMESTAMPTZ - when verified
telegram_enabled: BOOLEAN - master on/off
```

#### A.2 Verification Flow
1. User clicks "Connect Telegram"
2. System generates unique code: `TS-XXXXXX` (6 random alphanumeric)
3. Code stored in DB with 5-minute expiry
4. User sends `/verify TS-XXXXXX` to bot OR clicks deep link
5. Bot calls verification endpoint matching code to user
6. On match: set `telegram_chat_id`, `telegram_verified_at`, clear code
7. UI shows "Connected" with verified timestamp

#### A.3 Bot Webhook Enhancement
Create new edge function `telegram-webhook` that:
- Handles `/start` and `/verify CODE` commands
- Matches code to user_settings.telegram_link_code
- Updates chat_id and marks verified
- Responds with success/failure message

---

### Phase B: Per-User Dhan API Integration

#### B.1 Database Schema Update
Add new columns to `user_settings`:

```text
dhan_access_token: TEXT (encrypted in future) - per-user token
dhan_verified_at: TIMESTAMPTZ
dhan_enabled: BOOLEAN
dhan_account_name: VARCHAR - display label
```

Note: For MVP, tokens stored as plain text. Future: use Supabase Vault.

#### B.2 Connection Flow
1. User enters Client ID + Access Token
2. Click "Verify Connection"
3. Backend calls Dhan profile API with user's token
4. On success: store credentials, show account name
5. Edge functions that need Dhan access will:
   - First check user's dhan_access_token
   - Fall back to global DHAN_ACCESS_TOKEN if not set (admin use)

#### B.3 LTP Function Update
Modify `get-live-prices` to:
- Accept optional `user_id` parameter
- Look up user's dhan_access_token from user_settings
- Use user's token if available, else fall back to global

---

### Phase C: Fix Instrument Master Sync

#### C.1 Root Cause Fix
The current sync uses wrong CSV URL that returns 403. Dhan's correct URLs are:
- **Compact (all instruments)**: `https://images.dhan.co/api-data/api-scrip-master.csv`
- **Detailed (all instruments)**: `https://images.dhan.co/api-data/api-scrip-master-detailed.csv`

The `api-scrip-master-equity.csv` URL appears deprecated/blocked.

#### C.2 New Sync Strategy
Since the full CSV has 172K+ rows and causes CPU timeout:

1. **Use compact CSV** (`api-scrip-master.csv`) - smaller, faster to parse
2. **Filter aggressively** during parse:
   - Only NSE_EQ, NSE_FNO, MCX_COMM segments
   - Skip expired derivatives (expiry < today)
   - Skip dummy/test instruments
3. **Batch smaller** (200 rows per upsert)
4. **Add timeout protection** - if approaching limit, save progress and complete

#### C.3 Column Mapping Fix (Critical)
The Compact CSV columns are:

```text
SEM_EXM_EXCH_ID, SEM_SEGMENT, SEM_SMST_SECURITY_ID, SEM_INSTRUMENT_NAME,
SEM_EXPIRY_CODE, SEM_EXPIRY_DATE, SEM_STRIKE_PRICE, SEM_OPTION_TYPE,
SEM_TRADING_SYMBOL, SEM_CUSTOM_SYMBOL, SEM_LOT_UNITS, SEM_TICK_SIZE
```

Key mapping:
- `SEM_SMST_SECURITY_ID` = Dhan Security ID (the real one for API calls)
- `SEM_TRADING_SYMBOL` = Trading symbol
- `SEM_SEGMENT` = E (Equity), D (Derivatives), M (Commodity), C (Currency)

#### C.4 Clear Bad Data
Before sync, delete garbage rows:
- instrument_type containing ISINs or "DUMMY"
- security_id starting with "NSE_EQ_" (fake generated IDs)

#### C.5 Sync Logging Enhancement
- Always update sync log to "completed" or "failed" (never leave "running")
- Store actual error messages
- Show detailed status in UI

---

### Phase D: Reliable LTP Fetch

#### D.1 Security ID Resolution
With correct security_id from Dhan CSV:
1. Search returns instruments with real `security_id` (e.g., "1333" for HDFC)
2. LTP fetch uses these IDs grouped by exchange_segment
3. Dhan API returns correct prices

#### D.2 Manual Symbol Resolution
When user enters symbol manually (no security_id):
1. Try to resolve from instrument_master by trading_symbol + exchange
2. If found: use the resolved security_id
3. If not found: return "Price unavailable" (no fake data)

#### D.3 LTP Response Enhancement
Return comprehensive data:

```text
{
  ltp: 1234.50,
  change: +15.30,
  changePercent: +1.25,
  source: "dhan",
  timestamp: "2026-02-05T10:05:00Z",
  security_id: "1333",
  exchange_segment: "NSE_EQ"
}
```

#### D.4 Mismatch Detection
Add sanity check:
- If LTP differs >50% from previous close, flag as potential mismatch
- Log for debugging
- Show warning in UI

---

### Phase E: UI Improvements

#### E.1 IntegrationsSettings Redesign
Three distinct cards:

1. **Telegram Integration**
   - Generate Verification Code button
   - Show code with instructions
   - Status: Connected/Pending/Disconnected
   - Test Send / Disconnect buttons

2. **Dhan API Integration**
   - Client ID input
   - Access Token input (password field)
   - Verify Connection button
   - Status with account name if verified
   - Disconnect button

3. **Instrument Master**
   - Total count by segment (NSE EQ: X, NFO: Y, MCX: Z)
   - Last sync status with timestamp
   - Error message if failed
   - Sync Now button with progress

#### E.2 InstrumentPicker Enhancement
- Show "Last updated: X ago" for search results
- Display LTP with source and timestamp
- Better error messages for unavailable prices

---

## Implementation Files

### Edge Functions
1. **supabase/functions/instrument-sync/index.ts** - Complete rewrite
   - Use correct CSV URL
   - Proper column parsing
   - Aggressive filtering
   - Better error handling

2. **supabase/functions/get-live-prices/index.ts** - Update
   - Support per-user Dhan tokens
   - Better logging
   - Mismatch detection

3. **supabase/functions/telegram-webhook/index.ts** - New
   - Handle bot commands
   - Verification flow

4. **supabase/functions/dhan-verify/index.ts** - New
   - Verify user's Dhan credentials
   - Return account info

### Database Migration
1. Add columns to user_settings:
   - telegram_link_code, telegram_link_expires_at, telegram_verified_at, telegram_enabled
   - dhan_access_token, dhan_verified_at, dhan_enabled, dhan_account_name

2. Clean up instrument_master:
   - Delete rows with garbage data

### Frontend Components
1. **src/components/settings/IntegrationsSettings.tsx** - Major update
   - Separate cards for each integration
   - Telegram verification flow UI
   - Dhan per-user connection UI
   - Better sync status display

2. **src/hooks/useUserSettings.ts** - Update
   - Add methods for Telegram verification
   - Add methods for Dhan verification

---

## Technical Details

### Instrument Sync Optimization
To avoid CPU timeout with large CSV:

```text
1. Stream parse: Read CSV line by line (not load entire file)
2. Early filter: Skip rows immediately if segment not in [E, D, M]
3. Skip expired: If expiry date < today, skip
4. Batch 200: Smaller batches = more checkpoints
5. Progress save: Update log every 5000 rows
```

### Telegram Verification Code Format
- Format: `TS-XXXXXX` (6 chars: uppercase letters + digits)
- Example: `TS-A7K3M9`
- Expires: 5 minutes
- One-time use

### Dhan Token Storage
For MVP: Plain text in user_settings
Future enhancement: Use pg_crypto or Supabase Vault for encryption

---

## Acceptance Criteria

### Telegram
- [ ] User can generate verification code
- [ ] Sending code to bot connects their chat
- [ ] Notifications go to user's personal chat, not global
- [ ] Disconnect clears chat_id

### Dhan
- [ ] User can enter their own API credentials
- [ ] Verify shows account name on success
- [ ] LTP fetch uses user's token when available
- [ ] Multiple users can have separate Dhan accounts

### Instrument Master
- [ ] Sync Now completes without timeout
- [ ] NSE equities have real Dhan security_id
- [ ] NFO contracts appear with correct expiry
- [ ] Search finds RELIANCE, NIFTY, BANKNIFTY correctly
- [ ] Last sync shows actual timestamp, not "Never"

### LTP
- [ ] RELIANCE LTP matches real market price
- [ ] Source and timestamp displayed
- [ ] "Price unavailable" for unresolved symbols (no fake data)
