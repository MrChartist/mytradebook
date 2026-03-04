

## Security Remediation Plan — 3 Error-Level Findings

The three issues all stem from the same root cause: **sensitive credentials and PII are stored in tables where the `authenticated` role has full SELECT access**, meaning client-side `SELECT *` queries return plaintext API keys, tokens, and contact info.

### Current State

| Table | Sensitive Columns | Client Query |
|-------|------------------|-------------|
| `user_settings` | `dhan_access_token`, `dhan_api_key`, `dhan_api_secret`, `ai_api_key`, `truedata_password`, `webhook_secret`, `telegram_bot_token` | `select("*")` in `useUserSettings.ts` |
| `telegram_chats` | `bot_token` | `select("*")` in `useTelegramChats.ts` |
| `profiles` | `email`, `phone` | Used for display (lower risk, but flagged) |

### Fix Strategy

**Approach: Column-level REVOKE + explicit SELECT lists**

This is the simplest, most effective fix. REVOKE SELECT on sensitive columns from the `authenticated` and `anon` roles. Edge functions using the service role bypass these restrictions and can still read credentials. Client code switches from `SELECT *` to explicit column lists.

### Changes

#### 1. Database Migration — REVOKE sensitive column access

```sql
-- Revoke SELECT on sensitive columns from user_settings
REVOKE SELECT (dhan_access_token, dhan_api_key, dhan_api_secret, 
               ai_api_key, truedata_password, webhook_secret,
               telegram_bot_token, telegram_link_code) 
ON public.user_settings FROM authenticated, anon;

-- Revoke SELECT on bot_token from telegram_chats
REVOKE SELECT (bot_token) ON public.telegram_chats FROM authenticated, anon;

-- Revoke SELECT on sensitive profile fields
REVOKE SELECT (phone) ON public.profiles FROM authenticated, anon;
```

#### 2. `src/hooks/useUserSettings.ts` — Replace `SELECT *` with explicit safe columns

Replace `.select("*")` with a list excluding revoked columns:
```typescript
.select("id, user_id, default_sl_percent, alert_frequency_minutes, auto_sync_portfolio, theme, timezone, telegram_chat_id, telegram_verified_at, telegram_enabled, dhan_client_id, dhan_verified_at, dhan_enabled, dhan_account_name, dhan_token_expiry, ai_provider, ra_public_mode, ra_disclaimer, starting_capital, dashboard_layout, tsl_profiles, truedata_enabled, truedata_verified_at, truedata_username, webhook_url, dhan_consent_id, telegram_link_expires_at, telegram_bot_username, auto_sync_portfolio, created_at, updated_at")
```

Update the `UserSettings` interface to remove the revoked fields (they were never needed client-side for display — only indicators like `dhan_verified_at` and `dhan_enabled` are used).

#### 3. `src/hooks/useTelegramChats.ts` — Exclude `bot_token` from SELECT

Replace `.select("*")` with explicit columns, excluding `bot_token`. The `bot_token` is only needed server-side in edge functions. For the `addChat` mutation, the bot_token is passed to the edge function directly, not read back from the DB.

Update the `TelegramChat` interface to remove `bot_token`. Adjust `testChat` to not pass `chat.bot_token` (it's already stored server-side).

#### 4. Mark findings as resolved

After migration and code changes, delete the three security findings.

### Files Modified
- **New migration SQL** — REVOKE column privileges
- `src/hooks/useUserSettings.ts` — explicit SELECT, updated interface
- `src/hooks/useTelegramChats.ts` — explicit SELECT, remove bot_token from interface
- `src/components/settings/TelegramSettings.tsx` — remove any bot_token references in display/test calls (pass chat ID only, let edge function look up token)

### Technical Detail

- Column-level REVOKE is enforced at the PostgreSQL level — even if client code tries `SELECT *`, the revoked columns return `null` or are omitted
- Edge functions using `SUPABASE_SERVICE_ROLE_KEY` bypass column restrictions, so credential reads in `dhan-verify`, `telegram-notify`, etc. continue working unchanged
- RLS policies remain intact — this is additive security
- The `email` field on `profiles` is kept readable (needed for display); only `phone` is revoked

