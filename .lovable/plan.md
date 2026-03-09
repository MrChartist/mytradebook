
## Analysis: Dashboard & Telegram Integration

### Dashboard — Current State

**What works well:**
- Widget drag-and-drop reorder with persistence via `useDashboardLayout`
- Focus Mode (shows only `priority: "essential"` or `pinned` widgets)
- Density settings (compact/comfortable/spacious) persisted to DB
- Lazy-loading for heavy widgets (PortfolioHeatMap, AITradeInsights, JournalCalendarView)
- Segment + month filters providing contextual scoping

**Issues / Gaps Found:**

1. **MorningBriefing widget is static hardcoded mock** — shows fake text "Markets are expected to open with a gap up... NIFTY resistance at 22,500". The `morning-briefing` edge function is real and fetches open positions + alerts, but the *dashboard card* doesn't call it — it just renders a static card.

2. **DisciplineScore is fully hardcoded** — always shows `85`. There is a `trading_rules` table and `useTradingRules` hook, but the widget doesn't connect to it. The `DailyScorecard` also has Rules hardcoded at "100%".

3. **RiskMeter uses a fake calculation** — exposure is `openTrades.length * 2`, max risk is hardcoded to `10`. It doesn't read from `user_settings.starting_capital` or per-trade risk amounts.

4. **DailyScorecard mood is a hardcoded emoji** (`😊`) — no real mood tracking integration.

5. **No "riskGoal" widget in DEFAULT_WIDGETS** — `RiskGoalWidget` exists as a case in `renderWidget` but `riskGoal` is missing from `DEFAULT_WIDGETS` array in `useDashboardLayout`, so it never renders.

6. **Focus Mode doesn't highlight which widgets are hidden** — when active, the user gets no feedback on what's been removed.

7. **Dashboard doesn't persist the `focusMode` and `density` columns** — it writes `dashboard_focus_mode` and `dashboard_density` but the `user_settings` DB schema likely doesn't have these columns (they're cast via `as any`). This means they reset on page refresh.

---

### Telegram Integration — Current State

**What works well:**
- Multi-chat routing with per-chat bot tokens (3-tier: per-chat override → user default → system)
- Granular notification type routing (trade/alert/study/report) per segment per chat
- Auto-verification on chat add with friendly error mapping
- Retry logic with exponential backoff (3 retries)
- Delivery log tracking
- RA Public Mode (compliance disclaimer, hides quantity)
- Manual send from trade detail modal (snapshot, P&L, custom note)

**Issues / Gaps Found:**

1. **Morning Briefing is only sent via cron to Telegram** — but the dashboard `MorningBriefing` widget shows fake data. The two are not connected: users can't manually trigger a morning briefing from the dashboard.

2. **Delivery log in `TradeDetailTelegram` uses a separate query** — fetches from `telegram_delivery_log` in the modal directly, but doesn't filter by `trade_id`, just shows last 20 for the user. The table likely doesn't have a `trade_id` column, so per-trade history is not possible.

3. **`useTelegramChats` delivery log query limits to 10 rows** — the settings page shows "Last 10" but a trader with active alerts might want more. The full log stores up to 1000 but only 10 are exposed.

4. **No notification quiet hours (DND) UI** — `morning-briefing` edge function checks `prefs.dnd_enabled / dnd_until` but there is no settings UI to configure this, so users can't set quiet hours.

5. **No Telegram notification preview** — when setting up routing rules, users can't preview what a message will look like.

6. **`manual_custom_note` sends to all chats but doesn't let user pick which chat** — the dropdown in `TradeDetailTelegram` sends to all configured chats with no per-chat targeting.

7. **No "send EOD report" manual trigger** — EOD report edge function exists but there's no button in the UI to trigger it on-demand.

---

## Proposed Improvements Plan

### Priority 1 — Fix broken/mock widgets (High impact, correctness)

**A. Fix DisciplineScore — connect to real data**
- Read `trading_rules` via `useTradingRules` hook
- Score = (active rules that were "followed" / total active rules) × 100
- For now, use daily journal entries if available, otherwise rules-active ratio

**B. Fix RiskMeter — use real capital from settings**
- Read `settings.starting_capital` from `useUserSettings`
- Real exposure = sum of `(entry_price - stop_loss) × quantity` per open trade
- Percentage = `riskAtSL / starting_capital × 100`
- Color thresholds: green <2%, amber 2-5%, red >5%

**C. Fix MorningBriefing — fetch real data**
- Call the `morning-briefing` edge function OR fetch open trades + alerts directly in the component
- Display open positions count, active alerts count, and a "Send to Telegram" button

**D. Add riskGoal to DEFAULT_WIDGETS**
- `RiskGoalWidget` is rendered in `renderWidget("riskGoal")` but `riskGoal` is missing from the `DEFAULT_WIDGETS` array — add it.

### Priority 2 — Telegram UX improvements

**E. Add DND (Quiet Hours) settings UI**
- Add a card in `TelegramSettings` for quiet hours: enable toggle + time range picker (from/to)
- Persist to `user_settings.notification_preferences` JSON column
- The `morning-briefing` function already reads this, just need the UI

**F. Increase delivery log limit + add filter**
- Change `useTelegramChats` query from `.limit(10)` to `.limit(50)`
- Add success/failure filter chips in `DeliveryLogPanel`

**G. Manual "Send Morning Briefing" button**
- In the `MorningBriefing` dashboard widget, add a "Send to Telegram" button that calls `morning-briefing` edge function

### Priority 3 — Dashboard polish

**H. Focus Mode visual feedback**
- When focus mode is active, show a dismissable banner: "Focus mode on — X widgets hidden"
- Add widget count badge to the settings gear icon when focus mode is active

---

## Implementation Plan

### Files to modify:

```
src/components/dashboard/DisciplineScore.tsx     - Connect to useTradingRules (real score)
src/components/dashboard/RiskMeter.tsx           - Connect to useUserSettings (real capital)
src/components/dashboard/MorningBriefing.tsx     - Fetch real open trades + alerts + Telegram button
src/hooks/useDashboardLayout.ts                  - Add riskGoal to DEFAULT_WIDGETS
src/hooks/useTelegramChats.ts                    - Increase log limit to 50
src/components/settings/TelegramSettings.tsx     - Add quiet hours DND UI
src/components/telegram/DeliveryLogPanel.tsx     - Add success/fail filter
src/pages/Dashboard.tsx                          - Focus Mode active banner
```

### Database change needed:
- `user_settings` needs `notification_preferences` JSONB column if not present (for DND)
- Check if `dashboard_focus_mode` and `dashboard_density` columns exist — if not, add them

### No new edge functions needed — all improvements use existing infrastructure.

---

## Summary for User

Here are the improvements I'd implement:

**Dashboard fixes (correctness):**
- Discipline Score will show your real rules-adherence instead of hardcoded 85
- Risk Meter will calculate real capital exposure using your starting capital from settings
- Morning Briefing will display your actual open positions and active alerts (not placeholder text)
- The Risk Goal widget (already built) will be added to the dashboard — it was missing from the widget list

**Telegram improvements:**
- Add Quiet Hours / DND settings so you can stop notifications at night
- Delivery log expanded from 10 to 50 entries with pass/fail filter
- "Send Morning Briefing to Telegram" button directly from the dashboard widget

**Dashboard polish:**
- Focus Mode now shows a banner indicating how many widgets are hidden
