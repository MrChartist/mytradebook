

# UX Polish Improvements Plan

## 1. Global Search (Cmd+K) Enhancement

**Current state**: CommandPalette only searches static nav items and actions. Falls back to `/trades?search=` for unknown queries.

**Changes**:
- **`src/components/CommandPalette.tsx`**: Add dynamic search groups that query live data:
  - **Recent Trades**: Fetch trades via `useTrades`, filter by symbol match on input, show top 5 with P&L badge. On select, open trade detail or navigate to `/trades?search=`.
  - **Alerts**: Fetch alerts via `useAlerts`, filter by symbol, show condition type + threshold. On select, navigate to `/alerts`.
  - **Journal Entries**: Fetch recent journal entries via `useDailyJournal` range query, search across `pre_market_plan`, `post_market_review`, `lessons_learned` text. On select, navigate to `/journal`.
- Add debounced search input state (300ms) to avoid excessive filtering.
- Show groups conditionally only when search query has 2+ chars.
- Add keyboard shortcut hints (`⌘K`) in the search input placeholder.

## 2. Onboarding Checklist Enhancement

**Current state**: `OnboardingWelcome` has 4 steps but only 2 have real completion detection (trades logged, closed trades). Watchlist/alert steps never show as completed.

**Changes to `src/components/dashboard/OnboardingWelcome.tsx`**:
- Add `useWatchlists` hook to detect if user has any watchlists (marks "Create a Watchlist" complete).
- Add `useAlerts` hook to detect if user has any alerts (marks "Set a Price Alert" complete).
- Add 2 new steps:
  - "Connect Your Broker" (completed if `settings?.dhan_verified_at` exists) -- uses `useUserSettings`.
  - "Write Your First Journal Entry" (completed if any `daily_journal_entries` exist) -- uses a simple query.
- Auto-dismiss the widget when all steps are completed (set localStorage flag).
- Update progress bar to reflect actual completion across all 6 steps.

## 3. Mobile PWA: Offline Trade Queue

**Changes**:
- **`src/hooks/useOfflineTradeQueue.ts`** (new): A hook that:
  - Detects online/offline via `navigator.onLine` + event listeners.
  - When offline, `createTrade` calls store trade data in `localStorage` under `tb_offline_trade_queue`.
  - When back online, automatically syncs queued trades via the existing `useTrades.createTrade` mutation, showing a toast per synced trade.
  - Exposes `queuedCount` for UI display.
- **`src/components/modals/CreateTradeModal.tsx`**: When offline, show a subtle banner "You're offline -- trade will be queued and synced when back online" and use the offline queue instead of direct mutation.
- **`src/components/layout/MainLayout.tsx`**: Add an offline indicator bar at the top when `!navigator.onLine`.

## 4. Dark/Light Theme Polish

**Current state**: Theme variables are well-defined in `:root` and `.dark`. Most components use semantic tokens (`bg-card`, `text-foreground`, `border-border`). Need to audit for hardcoded colors.

**Audit & fixes**:
- **`src/components/trade/StockPopupCard.tsx`**: The RSI gauge uses hardcoded `bg-profit/25`, `bg-loss/25`, `bg-muted-foreground/8` -- these are fine (semantic). The `bg-blue-500/10` and `text-blue-500` in `getCapClassification` and `text-amber-500` -- replace with theme-aware alternatives or keep as accent colors (acceptable for data viz).
- **`src/components/dashboard/PortfolioHeatMap.tsx`**: Uses hardcoded HSL strings in `pnlColor()` -- these are intentional for the heat map data viz. The white text on colored tiles is correct. No changes needed.
- **`src/pages/Fundamentals.tsx`**: Audit filter builder for any hardcoded colors. The preset strip uses semantic classes. Likely fine.
- **`src/components/dashboard/DailyReviewWizard.tsx`**: Uses `text-profit`, `text-loss`, `text-warning` -- all semantic. Fine.
- **Global fix in `src/index.css`**: Ensure `::selection` colors, focus rings, and scrollbar thumb colors adapt to both themes. Add dark-mode scrollbar styles if missing.

**Key file-by-file changes**:
- Scan for any `text-white`, `bg-white`, `text-black`, `bg-black`, `text-gray-*`, `bg-gray-*` usage outside of intentional data-viz contexts and replace with semantic tokens.
- Ensure all `Dialog`, `Popover`, `Sheet` backgrounds use `bg-card` or `bg-popover` (already the case via shadcn defaults).

---

## Summary of files to create/modify

| File | Action |
|------|--------|
| `src/components/CommandPalette.tsx` | Add dynamic trade/alert/journal search groups |
| `src/components/dashboard/OnboardingWelcome.tsx` | Add broker + journal steps, real completion detection |
| `src/hooks/useOfflineTradeQueue.ts` | New -- offline trade queue with auto-sync |
| `src/components/modals/CreateTradeModal.tsx` | Offline banner + queue integration |
| `src/components/layout/MainLayout.tsx` | Offline indicator bar |
| `src/index.css` | Scrollbar + selection dark mode fixes |
| Various components | Hardcoded color audit fixes |

No database changes required.

