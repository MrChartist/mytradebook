

# Improve Telegram Connection Transparency and Reliability

## Problem

The current system silently falls back to the system-wide bot token (`TELEGRAM_BOT_TOKEN` env secret) even when the user hasn't configured their own bot. This creates confusion:

- The UI shows "No personal bot configured" but messages still send via the hidden system bot
- The "Test" button on chat destinations uses the system bot silently -- user thinks *their* setup works
- Legacy fallback to `DEFAULT_CHAT_ID` means notifications could go to the admin's chat instead of the user's
- No "Connect & Verify" step when adding a chat -- broken IDs are saved silently

## Solution

### 1. Remove Silent System Fallback for User Notifications

The system bot token should only be used as an explicit opt-in, not a silent fallback for user-specific notifications.

**Edge function changes (`telegram-notify`):**
- Remove the `DEFAULT_CHAT_ID` fallback for user notifications (lines 1102-1105) -- if a user has no chats configured, return `skipped` instead of sending to the admin's default chat
- When handling `custom` type with explicit `chat_id`, resolve the bot token using the 3-tier chain: `payload.bot_token` > user's `telegram_bot_token` > system token (this already partially works but needs the user context)
- Remove the `test` type's hardcoded system bot usage -- route it through the same 3-tier resolution

### 2. Add "Connect & Verify" on Chat Add

When a user adds a new chat destination, automatically send a test message to verify the bot can reach that chat before saving.

**Hook changes (`useTelegramChats`):**
- In `addChat` mutation: after inserting the chat, immediately call the test endpoint
- If the test fails, delete the just-inserted chat and show the error
- Show a "Verifying..." loading state during this process

### 3. Show Bot Source Indicator in UI

Make it crystal clear which bot is being used for each chat destination.

**UI changes (`TelegramSettings`):**
- Next to each chat destination, show a small badge: "Your Bot", "Personal Default", or "System Bot" based on which token tier would be used
- If no bot is available at all (no per-chat, no personal, no system), show a red warning "No bot available -- notifications will fail"
- In the "No personal bot configured" banner, change the wording to clarify: "Messages are currently sent via the shared system bot. For independent delivery, configure your own bot."

### 4. Add Connection Status Indicator

Show real-time connection health per chat destination.

**Database change:**
- Add `last_verified_at` and `verification_status` columns to `telegram_chats` table
- Updated on every successful test or notification delivery

**UI changes:**
- Show a green/red dot next to each chat: green if verified within 24h, yellow if older, red if last delivery failed
- The test button updates this status

### 5. Prevent Notifications Without Explicit Setup

**Edge function changes:**
- For auto-notifications (trade monitor, alerts), require at least one `telegram_chats` entry with matching notification types enabled -- don't fall back to legacy `telegram_chat_id` or system defaults
- Keep the legacy fallback only for the `custom` direct-send type (used by manual sends from Trade Detail Modal)

## Technical Details

### Database Migration

```sql
ALTER TABLE public.telegram_chats
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified';
```

### Files Modified

1. **Database migration** -- add `last_verified_at`, `verification_status` to `telegram_chats`
2. **`supabase/functions/telegram-notify/index.ts`** -- remove silent fallbacks, fix `test`/`custom` type token resolution, update verification status on success
3. **`src/hooks/useTelegramChats.ts`** -- add verify-on-add logic, update verification status after test
4. **`src/components/settings/TelegramSettings.tsx`** -- add bot source badges, connection status dots, improved "no bot" messaging
5. **`src/hooks/useUserSettings.ts`** -- no changes needed (already supports the fields)

### Edge Function Token Resolution (After Fix)

```text
custom + explicit chat_id:
  Token: payload.bot_token > user.telegram_bot_token > SYSTEM_BOT_TOKEN
  (requires auth context to resolve user token)

auto notifications (trade/alert/study/report):
  Chats: telegram_chats table filtered by notification_types
  Token per chat: chat.bot_token > user.telegram_bot_token > SYSTEM_BOT_TOKEN
  No fallback to DEFAULT_CHAT_ID

test (via Settings UI):
  Token: payload.bot_token > user.telegram_bot_token > SYSTEM_BOT_TOKEN
  Chat: explicit chat_id from payload
```

### UI Bot Source Badge Logic

```text
For each chat destination:
  if chat.bot_token exists -> "Custom Bot" (blue badge)
  else if user_settings.telegram_bot_token exists -> "Your Default Bot" (green badge)
  else if SYSTEM_BOT_TOKEN exists -> "System Bot" (yellow badge with warning)
  else -> "No Bot" (red badge)
```

The system token availability can be inferred: if a test message succeeds without any user/chat token, the system token exists.

