

# TradeBook -- Complete App Overhaul Plan

This is a large-scale restructuring of the existing TradeSync app into the full "TradeBook" vision. The core backend (database, edge functions, auth, integrations) stays intact. The changes focus on **UI restructuring, new pages/modules, sidebar reorganization, and feature completions**.

---

## What Already Exists (Keep Intact)

- Authentication (email + Google OAuth)
- Database schema (trades, alerts, studies, profiles, user_settings, weekly_reports, instrument_master, etc.)
- Edge functions (telegram-notify, dhan-verify, instrument-sync, trade-monitor, evaluate-alerts, etc.)
- Core hooks (useTrades, useAlerts, useStudies, useJournalAnalytics, useLivePrices, useDhanIntegration, etc.)
- Settings page with Profile, Preferences, Security, Integrations tabs
- Trade creation modal with instrument picker, automation controls
- Reports page with weekly report generation

---

## Phase 1: Theme + Design System Switch

**Current**: Dark glassmorphism theme
**Target**: Light theme with soft shadows, rounded cards (clean SaaS look)

Changes:
- Update `index.css` CSS variables to define a light-first theme (white/gray backgrounds, soft shadows instead of glass/blur effects)
- Keep dark mode as an option (the `.dark` class already exists) but make light the default
- Replace `html { @apply dark }` with no default (or light)
- Update glass-card classes to use soft-shadow card styles (`bg-white border border-gray-200 shadow-sm rounded-xl`)
- Rename app from "TradeSync" to "TradeBook" throughout UI (sidebar logo, login page, page titles)

---

## Phase 2: Sidebar Reorganization

**Current sidebar**: Dashboard, Studies, Alerts, Trades, Journal, Reports, Settings
**Target sidebar**:
- Dashboard
- Trades
- Alerts
- Studies
- Watchlist (NEW)
- Section divider: "ANALYTICS"
- Calendar (extracted from Journal)
- Mistakes (extracted from Journal)
- Analytics (NEW -- dedicated page)
- Reports
- Settings
- Bottom: user profile info, plan badge, logout, collapse

Changes:
- Update `Sidebar.tsx` and `MobileDrawer.tsx` nav items to match new structure
- Add section divider support for "ANALYTICS" label
- Add user profile avatar + name at bottom of sidebar
- Add plan badge placeholder (Free/Premium)
- Update `App.tsx` routes to add new routes: `/watchlist`, `/calendar`, `/mistakes`, `/analytics`

---

## Phase 3: New Pages

### 3a. Watchlist Page (`/watchlist`) -- NEW
- Multiple named lists (tabs or sidebar within page)
- Add symbols from instrument master
- Show LTP, % change, sparkline per symbol
- Quick actions: Create Alert, Create Study, Create Trade
- Optional 1-line rationale per symbol
- Database: New `watchlists` and `watchlist_items` tables with RLS

### 3b. Calendar Page (`/calendar`) -- Extracted from Journal
- Move `JournalCalendarView` to its own page
- Left: month grid calendar
- Right: selected day panel with tabs (Trades, Alerts, Daily Journal)
- Daily Journal: structured log (Mood, Discipline Score, Key Lesson, Market Summary)
- Database: New `daily_journal` table with RLS

### 3c. Mistakes Page (`/mistakes`) -- Extracted from Journal
- Move `JournalKanbanBoard` to its own page
- 3-column layout: Low / Medium / High severity
- Show impact amount per severity column
- Trade cards with symbol, P&L, mistake tags

### 3d. Analytics Page (`/analytics`) -- NEW
- Top KPI cards: Win rate, Total P&L, Avg win, Avg loss, Expectancy, Profit factor, Best trade, Worst trade
- Streak tracker: Current streak, longest win/loss, recent trade dots
- Monthly performance table: Month | Trades | Wins | Losses | Win Rate | P&L | Best | Worst
- Filters: Date range, Segment, Setup type
- Reuse computation logic from `useJournalAnalytics` and `useTrades`

---

## Phase 4: Dashboard Redesign

Update `Dashboard.tsx` to match the spec:
- Top 4 KPI cards: Total P&L (month), Open Positions (with risk at risk), Win Rate (month), Best Trade
- "Daily P&L by Segment" stacked bar chart (replace current equity curve or add alongside)
- Active Alerts widget (top 3 alerts with manage link)
- Open Positions list (top 5)
- Performance Metrics card
- Month selector control (top right)
- Segment filter

Keep existing widgets (TodaysPnl, CalendarHeatmap, StreakDiscipline, QuickActions) but rearrange layout.

---

## Phase 5: Trades Page Enhancements

- Add "Planned" status tab (PENDING maps to Planned)
- Add Import buttons row: Sync, Import CSV, Import from Dhan (placeholders)
- Add grid/list view toggle
- Trade cards in grid view showing: symbol, segment tag, status badge, P&L, entry/SL/target, RR badge
- Keep existing table as list view

---

## Phase 6: Alerts Page Enhancements

- Add "Snoozed" stat card
- Add alert builder improvements: multiple alert levels via "+ Add Alert Level", cooldown dropdown, market hours toggle, expiry dropdown, test trigger button
- These are modal changes in `CreateAlertModal`

---

## Phase 7: Studies Page Enhancements

- Remove glossary/random notes concept
- Add structured fields: key levels, bias, hypothesis, plan, status (Open/Triggered/Invalidated/Completed)
- Add "Convert to Alert" and "Convert to Trade" actions
- Keep existing category tabs (Technical/Fundamental/News)

---

## Phase 8: Settings Enhancements

- Add to Integrations tab:
  - Telegram: segment-based chat destinations (assign segments to chat IDs)
  - RA Public Mode toggle (hide qty, add compliance disclaimer)
  - Scheduled reports section
- These build on the existing `IntegrationsSettings.tsx`

---

## Phase 9: Auth Routes

- Add dedicated routes: `/auth/login`, `/auth/signup`, `/auth/forgot-password`
- Current `/login` page already handles login/signup toggle -- refactor to separate routes
- Add forgot password flow using Supabase `resetPasswordForEmail`
- Keep existing two-column layout but update branding to "TradeBook"

---

## Phase 10: Quality Polish

- Empty states with "Load Sample Data" button on Dashboard, Trades, Studies
- Skeleton loaders on all pages (mostly already done)
- Consistent currency formatting (INR with commas)
- IST timezone default
- Mobile responsive: sidebar collapses to bottom nav or hamburger (already partially done)
- Fix any NaN display issues

---

## Database Changes Required

New tables needed:
1. **`watchlists`** -- id, user_id, name, created_at
2. **`watchlist_items`** -- id, watchlist_id, symbol, security_id, exchange_segment, rationale, sort_order, created_at
3. **`daily_journal`** -- id, user_id, date, mood, discipline_score, key_lesson, market_summary, created_at

All with proper RLS policies (user can only access own data).

---

## Implementation Order

1. Theme switch (light default) + rename to TradeBook
2. Sidebar reorganization + new routes
3. Database migrations (watchlists, daily_journal)
4. New pages: Watchlist, Calendar, Mistakes, Analytics
5. Dashboard redesign
6. Trades page enhancements
7. Alerts/Studies enhancements
8. Settings enhancements (RA mode, scheduled reports)
9. Auth route refactor (forgot password)
10. Quality polish + sample data

This is a significant amount of work. Due to the scope, it will be implemented incrementally across multiple iterations, starting with the structural changes (theme, sidebar, routes) and progressing through each module.

