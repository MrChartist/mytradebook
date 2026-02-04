

# Comprehensive Implementation Plan: Login Fix + Image Notifications + Automated SL/Target Alerts

## Summary

This plan addresses three issues:
1. **Login not working on published app** - The Google OAuth redirect URL needs to include the published domain
2. **Send images with Telegram notifications** - Enhance the telegram-notify edge function to send chart images along with trade messages
3. **Automated alerts for SL/Target/TSL** - Already working via `trade-monitor` cron job, but needs to use user-specific chat IDs

---

## Issue 1: Login Not Working on Published App

### Problem Analysis
The Google OAuth is configured with `redirect_uri: window.location.origin`, which works correctly for both preview and published domains. However, the published domain `mytradebook.lovable.app` needs to be configured in Lovable Cloud's Authentication Settings.

### Solution
Since Lovable Cloud manages Google OAuth automatically, the published domain should already be supported. The issue might be:
1. A caching issue after recent domain setup
2. The redirect URL not being properly set after OAuth callback

### Files to Modify
| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add better error handling and logging for OAuth callback |

### Implementation Details
- Add console logging to track OAuth flow
- Ensure the redirect callback properly handles the published domain
- The managed Google OAuth should automatically support all Lovable domains

---

## Issue 2: Send Chart Images with Telegram Notifications

### Current State
- Chart images are already stored in `trade-charts` Supabase Storage bucket
- Images are stored as public URLs in the `chart_images` JSONB column of trades table
- Telegram supports `sendPhoto` API for sending images with captions

### Solution Architecture
Enhance the `telegram-notify` edge function to:
1. Check if the trade has chart images
2. Use Telegram's `sendPhoto` API for trades with images
3. Include the trade details as caption (with Markdown formatting)
4. Fall back to `sendMessage` for trades without images

### Telegram API for Images

```text
POST https://api.telegram.org/bot{token}/sendPhoto
{
  "chat_id": "-1003109328674",
  "photo": "https://nuilpmoipiazjafpjaft.supabase.co/storage/v1/object/public/trade-charts/user-id/image.jpg",
  "caption": "🚀 *New Research Trade*\n\nBUY RELIANCE at ₹2400...",
  "parse_mode": "Markdown"
}
```

### Files to Modify
| File | Change |
|------|--------|
| `supabase/functions/telegram-notify/index.ts` | Add `sendTelegramPhoto` function and use it for trades with images |

### Implementation Details

**New Helper Function:**
```text
async function sendTelegramPhoto(
  token: string, 
  chatId: string, 
  photoUrl: string, 
  caption: string
): Promise<void>
```

**Modified Notification Logic:**
- For `new_trade`: Check `trade.chart_images` array
- If images exist, send first image with full trade details as caption
- If multiple images, send additional images without caption (media group)
- Telegram caption limit is 1024 characters

### Notification Types That Will Include Images
- New Trade Created (if chart_images exist)
- Trade Closed (if chart_images exist)
- Trade Update (if chart_images exist)

---

## Issue 3: Automated SL/Target/TSL Alerts

### Current State Analysis
The `trade-monitor` edge function already:
- Monitors all open trades every minute (cron job)
- Checks SL hits, TSL hits, Target hits
- Sends Telegram notifications for each event
- Auto-executes exit orders via Dhan API

### The Problem
The `trade-monitor` uses the **global** `TELEGRAM_CHAT_ID` secret instead of the **user-specific** chat ID from `user_settings` table.

### Solution
Update `trade-monitor` to:
1. Fetch each user's `telegram_chat_id` from `user_settings`
2. Use user-specific chat ID for notifications
3. Fall back to global `TELEGRAM_CHAT_ID` if not set

### Files to Modify
| File | Change |
|------|--------|
| `supabase/functions/trade-monitor/index.ts` | Fetch user-specific chat ID for each trade's user |

### Implementation Details

**Add helper function (same as in telegram-notify):**
```text
async function getUserChatId(supabase, userId): Promise<string | null>
```

**Modify notification calls:**
Before:
```text
await sendTelegramMessage(TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, message);
```

After:
```text
const userChatId = await getUserChatId(supabase, trade.user_id);
const chatId = userChatId || TELEGRAM_CHAT_ID;
await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, message);
```

---

## Technical Implementation Summary

### Step 1: Fix trade-monitor User-Specific Chat IDs
Update `supabase/functions/trade-monitor/index.ts`:
- Add `getUserChatId` helper function
- Update all `sendTelegramMessage` calls to use user-specific chat ID
- Keep global `TELEGRAM_CHAT_ID` as fallback

### Step 2: Add Image Support to telegram-notify
Update `supabase/functions/telegram-notify/index.ts`:
- Add `sendTelegramPhoto` function
- Modify `new_trade`, `trade_closed`, `trade_update` cases to send images when available
- Truncate captions to 1024 characters if needed

### Step 3: Improve OAuth Error Handling
Update `src/contexts/AuthContext.tsx`:
- Add better error logging for OAuth callback debugging
- Ensure proper redirect handling for published domain

### Step 4: Deploy and Test
- Deploy both edge functions
- Create a test trade with chart image
- Verify notification includes the image
- Verify automated SL/Target alerts use correct chat ID

---

## Expected Outcome

After implementation:

| Event | Notification Type | Image Included |
|-------|------------------|----------------|
| New Trade Created | Telegram Photo (if images) or Message | Yes (first image) |
| Trade Closed | Telegram Photo (if images) or Message | Yes (first image) |
| SL Hit (automated) | Telegram Message | No (could add) |
| TSL Hit (automated) | Telegram Message | No (could add) |
| TSL Moved (automated) | Telegram Message | No |
| Target Hit (automated) | Telegram Message | No |
| Alert Triggered | Telegram Message | N/A |
| Alert Created/Deleted | Telegram Message | N/A |

---

## Files to be Modified

1. `supabase/functions/trade-monitor/index.ts` - Add user-specific chat ID support
2. `supabase/functions/telegram-notify/index.ts` - Add image sending capability
3. `src/contexts/AuthContext.tsx` - Improve OAuth error handling

---

## Notes

- Telegram photo captions are limited to 1024 characters (vs 4096 for messages)
- For multiple images, Telegram's `sendMediaGroup` could be used (optional enhancement)
- The trade-monitor cron job must be running for automated alerts to work
- The published app login issue may require checking Lovable Cloud's Authentication Settings to ensure the domain is properly configured

