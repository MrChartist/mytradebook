

# Per-User Telegram Bot Token Configuration

## Problem
Currently, the system **requires** a centralized `TELEGRAM_BOT_TOKEN` environment secret. Every user shares this single bot. If it gets rate-limited, blocked, or misconfigured, all users are affected. Users can override per-chat, but this is buried in an "optional" toggle and there's no way to set a **default personal bot** that applies to all their chats.

## Solution
Allow each user to configure their **own default Bot Token** in Settings, stored in `user_settings`. The edge function will use this priority chain:

```text
Per-chat bot_token  >  User's default bot_token  >  System TELEGRAM_BOT_TOKEN
```

This means:
- Users who set their own bot token are fully independent
- The system bot token becomes a **fallback**, not a requirement
- Per-chat overrides still work on top of everything

## Changes

### 1. Database: Add `telegram_bot_token` and `telegram_bot_username` to `user_settings`
- Add two new nullable columns to `user_settings`
- These store the user's default bot credentials
- No RLS changes needed (table already has user-scoped RLS)

### 2. Settings UI: Add "Your Bot Token" section (`src/components/settings/TelegramSettings.tsx`)
- Replace the current "Bot is configured via environment" static banner with an interactive section
- Show a form to enter/update the user's personal Bot Token and Bot Username
- If user has their own token: show green badge "Your Bot: @username"
- If user has no token: show info that the system default bot will be used
- Add a "Test Bot" button that verifies the token works
- Include clear instructions linking to @BotFather

### 3. Edge Function: Use per-user bot token (`supabase/functions/telegram-notify/index.ts`)
- In `getUserSettings()`, also fetch `telegram_bot_token`
- When resolving the bot token for sending, use priority: chat-level > user-level > system-level
- Make the system `TELEGRAM_BOT_TOKEN` non-fatal if missing (warn instead of throw) — allows deployments where every user brings their own bot
- Pass user's default bot token through the `sendToMultipleChats` flow

### 4. Hook: Add bot token management to `useUserSettings` (`src/hooks/useUserSettings.ts`)
- Add `telegram_bot_token` and `telegram_bot_username` to the `UserSettings` interface
- The existing `updateSettings` mutation already handles arbitrary field updates

## Technical Details

### Database Migration
```sql
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS telegram_bot_token text,
  ADD COLUMN IF NOT EXISTS telegram_bot_username text;
```

### Edge Function Token Resolution (telegram-notify)
```text
// Current: TELEGRAM_BOT_TOKEN (env) is required, per-chat overrides it
// New priority chain:
1. chat.bot_token (per-chat override, already exists)
2. userSettings.telegram_bot_token (NEW - user's default)
3. TELEGRAM_BOT_TOKEN (env - system fallback, now optional)
```

Key change in `sendToMultipleChats`: accept a `userBotToken` parameter that sits between per-chat and system-level.

### Settings UI Flow
- Step 1 section becomes interactive: "Set Up Your Bot"
  - If user has token: shows masked token + bot username + Edit/Remove buttons
  - If no token: shows input fields with "Save & Test" button
  - Below: note about system fallback bot
- Per-chat custom bot toggle remains as an additional override

### Files Modified
1. **Database migration** -- add 2 columns to `user_settings`
2. `src/components/settings/TelegramSettings.tsx` -- interactive bot setup section
3. `src/hooks/useUserSettings.ts` -- add new fields to interface
4. `supabase/functions/telegram-notify/index.ts` -- 3-tier token resolution
5. `supabase/functions/trade-monitor/index.ts` -- pass user token when calling notify

