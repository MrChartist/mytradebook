

# Flexible Telegram Notification Routing + Segment-Wise Daily Reports

## Overview

This plan upgrades the Telegram integration to give you full control over what gets sent where. You will be able to pick exactly which notification types (Trades, Alerts, Studies) and which segments (Options, Futures, Equity Intraday, Positional, MCX) go to each chat destination. The EOD report will also be split per segment so you get separate reports for each category instead of one combined dump.

## Current State

- Each chat destination has a `segments` array (old) and `notification_types` JSON (new, but empty/unused in UI)
- The UI only shows segment toggle chips -- no way to control Trades vs Alerts vs Studies routing
- EOD report sends a single combined report to one legacy chat ID
- No study notification support exists

---

## What Will Change

### 1. Notification Type + Segment Routing UI

Replace the current simple segment chips with a structured routing panel per chat destination:

```text
+---------------------------------------------+
| Derivative Channel   -1003141350480   [Test] |
|---------------------------------------------|
| TRADES                                      |
|   [ ] Equity Intraday  [ ] Positional       |
|   [ ] Futures          [ ] Options           |
|   [ ] MCX                                   |
|                                              |
| ALERTS                                      |
|   [x] All alerts to this chat               |
|                                              |
| STUDIES                                      |
|   [x] All studies to this chat              |
|                                              |
| DAILY REPORT                                 |
|   [ ] Equity Intraday  [ ] Positional       |
|   [ ] Futures          [ ] Options           |
|   [ ] MCX                                   |
+---------------------------------------------+
```

- Default: everything OFF until explicitly enabled
- The `notification_types` JSONB will store the structure:
  ```json
  {
    "trade": ["Equity_Intraday", "Options"],
    "alert": ["*"],
    "study": [],
    "report": ["Futures", "Options"]
  }
  ```

### 2. Study Notifications

- Add `study_created`, `study_updated`, `study_triggered` notification types to the edge function
- Build message templates with symbol, status, tags, and chart image
- Route through the same `notification_types.study` config

### 3. Segment-Wise EOD Reports

Rewrite the `eod-report` edge function to:
- Query each user's `telegram_chats` for report segment preferences
- Generate **separate reports per segment** (e.g., one for Options, one for Equity Intraday)
- Send each segment report to only the chats that opted in for that segment
- Skip segments with zero activity
- Use the multi-chat routing and retry infrastructure from `telegram-notify`

Example output for an Options-only report:
```
 END OF DAY: OPTIONS
 Tuesday, 18 Feb

 Day P&L: +12,500
 Trades: 3 closed | W 2 / L 1 | WR: 66.7%

 Closed Trades:
 NIFTY 23000CE (L) -> +8,200 (4.1%)
 BANKNIFTY 50000PE (S) -> +6,800 (3.4%)
 NIFTY 22500PE (L) -> -2,500 (-5.0%)

 Still open: 1 Options position
```

### 4. Files to Create/Modify

**Database**: Migration to ensure `notification_types` defaults work correctly (no schema change needed -- column already exists)

**Edge Functions**:
- `supabase/functions/telegram-notify/index.ts` -- Add study message templates (`study_created`, `study_updated`, `study_triggered`)
- `supabase/functions/eod-report/index.ts` -- Complete rewrite: segment-wise reports, multi-chat routing, per-user preferences
- `supabase/config.toml` -- No changes needed (eod-report already registered)

**Frontend**:
- `src/hooks/useTelegramChats.ts` -- Add helper to toggle notification type segments, update mutation to save `notification_types` JSONB
- `src/components/settings/TelegramSettings.tsx` -- Replace segment chips with the structured routing panel (Trades/Alerts/Studies/Reports sections with per-segment toggles)
- `src/lib/telegram.ts` -- Add study notification convenience functions

---

## Technical Details

### notification_types JSONB Structure

```typescript
interface NotificationTypeRouting {
  trade: string[];    // segment keys or ["*"] for all
  alert: string[];    // ["*"] for all alerts, or empty
  study: string[];    // ["*"] for all studies, or empty  
  report: string[];   // segment keys for EOD reports
}
```

### EOD Report Flow

```text
1. Cron triggers eod-report function
2. Fetch all users with telegram_chats that have report segments
3. For each user:
   a. Get their telegram_chats with report preferences
   b. For each segment with activity:
      - Build segment-specific report
      - Send to chats that have that segment in notification_types.report
4. Log delivery attempts
```

### Study Notification Templates

Three new types added to telegram-notify:
- `study_created` -- When a new study is saved (Draft/Active)
- `study_updated` -- When status changes (e.g., Triggered, Invalidated)  
- `study_triggered` -- Special template when study hits Triggered status

Message format:
```
 STUDY: TRIGGERED
 RELIANCE (NSE)

 Title: Cup & Handle Breakout
 Pattern: Cup & Handle
 Duration: 6m-2y
 Status: Draft -> Triggered

 Tags: #CupAndHandle #Breakout
 Chart: [View](link)

 18/02/26, 3:30 PM
```

