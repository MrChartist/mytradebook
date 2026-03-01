

# Make Telegram Integration Setup Easy and Foolproof

## Current Issues

1. **Confusing Chat ID input** -- Users don't know how to find their Chat ID and enter wrong values (e.g., using bot token number as chat ID)
2. **No guided step-by-step flow** -- The setup dumps all fields at once without walking users through
3. **Bot token validation missing** -- Bot tokens are saved without verifying they're real working bots
4. **Error messages are cryptic** -- "Bad Request: chat not found" doesn't tell users what went wrong or how to fix it
5. **Instructions are too technical** -- "use getUpdates" is not beginner-friendly

## Solution: Guided Setup Wizard with Auto-Validation

### 1. Add Bot Token Validation via Telegram `getMe` API

Before saving a bot token, call `https://api.telegram.org/bot<TOKEN>/getMe` to verify it's valid. This:
- Confirms the token is real
- Auto-fills the bot username (no need for user to type it)
- Shows instant feedback: "Bot verified: @TradeBookUpdateBot"

**Changes:**
- Add a `telegram-verify` edge function update (or handle inline) to call `getMe`
- In `TelegramSettings.tsx`: When user pastes bot token, auto-verify and show bot name
- Remove the "Bot Username" manual input field -- auto-populated from `getMe`

### 2. Improve Chat ID Instructions with Visual Guide

Replace the current terse bullet list with a proper expandable guide:
- **Personal Chat**: "Open Telegram, search for @userinfobot, send /start -- it will reply with your Chat ID"
- **Group**: "Add your bot to the group, then send /start in the group. Forward any group message to @userinfobot"
- **Channel**: "Add your bot as admin to the channel. The Chat ID starts with -100 followed by numbers"
- Add a note: "Chat IDs are numbers only. Personal IDs are positive (e.g., 123456789). Groups/channels start with - (e.g., -1001234567890)"

### 3. Improve Error Messages with Actionable Guidance

Map common Telegram API errors to user-friendly messages:
- "chat not found" -> "This Chat ID doesn't exist or your bot hasn't been added to it. Make sure you've sent /start to the bot first, or added the bot to your group/channel as an admin."
- "bot was blocked by the user" -> "The user has blocked this bot. They need to unblock it and send /start again."
- "Forbidden: bot is not a member" -> "The bot isn't a member of this group/channel. Add it first."

**Changes in `useTelegramChats.ts`**: Add an error mapping function that translates API errors.

### 4. Auto-Verify Bot Token on Save (via `getMe`)

**New logic in `TelegramSettings.tsx`:**
- When user clicks "Save Bot", first call the Telegram `getMe` API (via edge function) to validate
- If valid: auto-fill username, save, show success
- If invalid: show "Invalid bot token -- please check and try again"

**Edge function addition** (`telegram-verify` already exists, enhance it):
- Add a `verify_bot_token` action that calls `getMe` and returns bot info

### 5. Simplify the Add Chat Flow

Currently the "Add Chat" form shows Chat ID + Label + optional custom bot all at once. Simplify:
- Default label auto-generates from Chat ID type (detect if it starts with -100 = "Channel/Group", positive number = "Personal Chat")
- Move the label field to be editable after adding (inline edit on the chat card)
- Keep custom bot as an expandable section (already done)

## Technical Details

### Files Modified

1. **`supabase/functions/telegram-verify/index.ts`** -- Add `getMe` verification endpoint for bot tokens
2. **`src/components/settings/TelegramSettings.tsx`** -- Improved instructions, auto-verify bot token, better error messages, simplified add chat flow, auto-label
3. **`src/hooks/useTelegramChats.ts`** -- Add error mapping for user-friendly messages, auto-label logic

### Bot Token Verification Flow

```text
User pastes token -> Click "Save & Verify"
  -> Edge function calls https://api.telegram.org/bot<TOKEN>/getMe
  -> Success: returns { ok: true, result: { username: "MyBot", first_name: "My Bot" } }
    -> Auto-fill username, save to DB, show green checkmark
  -> Failure: returns { ok: false, description: "Not Found" }
    -> Show "Invalid token" error, don't save
```

### Error Mapping (Chat Add)

```text
"chat not found" -> 
  "Chat ID not found. Tips:
   - For personal chats: Send /start to your bot first
   - For groups: Add the bot to the group
   - For channels: Add the bot as admin
   - Channel IDs start with -100 (e.g., -1001234567890)"

"bot was blocked" -> "This user blocked the bot. They need to unblock and /start again."
"Forbidden: bot is not a member" -> "Bot isn't in this group. Add it as a member first."
"Bad Request: group chat was upgraded" -> "This group was upgraded to a supergroup. Use the new Chat ID (starts with -100)."
```

### Auto-Label Logic

```text
Chat ID starts with "-100" -> "Channel / Supergroup"
Chat ID starts with "-" -> "Group"
Chat ID is positive number -> "Personal Chat"
```

