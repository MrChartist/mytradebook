

# Telegram Messages, Alerts & Notifications — 10-Phase Improvement Plan

## Current System Overview

TradeBook has a comprehensive notification system with:
- **In-App Notifications**: Real-time bell icon with `notifications` table + Supabase realtime
- **Telegram Integration**: Multi-chat routing, custom bots, segment-based filtering, delivery logging
- **Alert Evaluation**: Edge function running on pg_cron (every 5 min), checks price conditions via Dhan API
- **Message Templates**: 15+ template types for trades, alerts, studies, reports

---

## PHASE 1 — Message Template Refinement

**Goal**: Make Telegram messages cleaner, more scannable, and consistent

**Changes**:
1. Standardize emoji header system across all message types
2. Add visual separator lines (`━━━━━━━━━━━`) for better section grouping
3. Reduce redundant timestamp lines
4. Add inline P&L indicators with colored emoji (🟢 🔴)
5. Improve markdown formatting consistency
6. Add "via TradeBook" footer with optional watermark setting

**Files**: `supabase/functions/telegram-notify/index.ts`

---

## PHASE 2 — Alert Message Enhancement

**Goal**: Make alert triggered messages more actionable

**Changes**:
1. Add "Distance to SL/Target" calculation for price alerts
2. Include price change % from trigger threshold
3. Add quick action hints ("Consider entry if pattern confirms")
4. Show historical trigger count ("3rd time crossing this level")
5. Add chart timeframe context when available
6. Include "Next Check" countdown for recurring alerts

**Files**: `supabase/functions/telegram-notify/index.ts`, `supabase/functions/evaluate-alerts/index.ts`

---

## PHASE 3 — In-App Notification Center Upgrade

**Goal**: Make the notification bell more useful and informative

**Changes**:
1. Add notification type icons (trades 📊, alerts 🔔, studies 📚)
2. Group notifications by date ("Today", "Yesterday", "This Week")
3. Add click-to-navigate to relevant item (trade, alert, study)
4. Add notification sound toggle in settings
5. Add "Clear All" button
6. Show notification preview on hover for desktop
7. Add notification filter tabs (All, Trades, Alerts, Studies)

**Files**: `src/components/NotificationBell.tsx`, `src/hooks/useNotifications.ts`

---

## PHASE 4 — Alert Evaluation Engine Improvements

**Goal**: More reliable and intelligent alert checking

**Changes**:
1. Add proper `last_checked_at` column separate from `last_triggered`
2. Implement staggered check intervals (not all alerts at once)
3. Add alert priority system (high-priority = more frequent checks)
4. Improve cross-detection with proper candle close confirmation option
5. Add alert batch processing with rate limit handling
6. Log evaluation metrics (avg latency, success rate)

**Files**: `supabase/functions/evaluate-alerts/index.ts`, database migration

---

## PHASE 5 — Telegram Delivery Reliability

**Goal**: Ensure messages always reach users

**Changes**:
1. Add message queue with dead-letter handling for failed sends
2. Implement circuit breaker for repeated failures (pause → alert user)
3. Add webhook fallback option for critical alerts
4. Show delivery status on each notification item
5. Add "Resend" button for failed messages
6. Implement daily delivery health summary

**Files**: `supabase/functions/telegram-notify/index.ts`, `src/components/telegram/DeliveryLogPanel.tsx`

---

## PHASE 6 — Smart Alert Suggestions V2

**Goal**: Proactively suggest useful alerts based on trading patterns

**Changes**:
1. Suggest support/resistance alerts from recent trade entry/exit prices
2. Suggest moving average cross alerts for frequently traded symbols
3. Add "Set Alert" quick action on trade close ("Alert me if price revisits entry")
4. Surface suggestions in dashboard with one-click creation
5. Add smart alert templates based on trading style

**Files**: `supabase/functions/suggest-alerts/index.ts`, new dashboard widget

---

## PHASE 7 — Notification Preferences & Quiet Hours

**Goal**: Give users control over notification volume

**Changes**:
1. Add quiet hours setting (e.g., no notifications after market close)
2. Add notification consolidation (batch similar alerts into digest)
3. Add per-notification-type toggle (mute trade updates but keep alerts)
4. Add "Do Not Disturb" toggle with auto-resume
5. Add notification importance levels (Critical, Normal, Low)

**Files**: `src/components/settings/PreferencesSettings.tsx`, edge function updates

---

## PHASE 8 — Daily & Weekly Report Notifications

**Goal**: Automated performance summaries via Telegram

**Changes**:
1. Add EOD summary notification option (P&L, trades, alerts triggered)
2. Add weekly performance digest with win rate, best/worst trade
3. Add morning briefing with watchlist price changes
4. Make report timing configurable (6 PM, 8 PM, etc.)
5. Add report template customization (compact vs detailed)

**Files**: `supabase/functions/eod-report/index.ts`, `supabase/functions/morning-briefing/index.ts`

---

## PHASE 9 — Alert Chains & Workflows

**Goal**: Enable multi-step alert automation

**Changes**:
1. UI for creating chained alerts ("If NIFTY crosses 22000, create alert for BANKNIFTY at 48000")
2. Add alert groups with AND/OR conditions
3. Add auto-actions on alert trigger (auto-create trade template, auto-snooze related alerts)
4. Visualize alert chains in UI with flowchart
5. Add alert templates for common patterns (breakout, breakdown, range)

**Files**: `src/pages/Alerts.tsx`, new `AlertChainBuilder.tsx` component

---

## PHASE 10 — Analytics & Observability Dashboard

**Goal**: Understand notification system health and usage

**Changes**:
1. Add notification analytics (sent/delivered/failed by type)
2. Add alert trigger analytics (most triggered, time-to-trigger distribution)
3. Add Telegram health dashboard (bot status, rate limit usage)
4. Add user engagement metrics (notification open rate, action rate)
5. Add system health alerts (edge function errors, delivery failures)

**Files**: New `src/pages/NotificationAnalytics.tsx`, edge function telemetry

---

## Summary

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 1 | Message Templates | Cleaner, scannable Telegram messages |
| 2 | Alert Messages | Actionable context in alert notifications |
| 3 | In-App Bell | Better notification center UX |
| 4 | Evaluation Engine | More reliable alert checking |
| 5 | Delivery | Retry, queue, and status tracking |
| 6 | Smart Suggestions | AI-powered alert recommendations |
| 7 | User Preferences | Quiet hours, digest, DND |
| 8 | Reports | Automated daily/weekly summaries |
| 9 | Alert Chains | Multi-step automation |
| 10 | Analytics | System health and usage metrics |

