

# Phase 3 — Core Feature Gaps Implementation Plan

## Current State Summary
After auditing the codebase, here's what already exists vs what needs building:

**Already implemented:** Bulk select/cancel/close (Trades.tsx lines 195-216), EquityCurveDrawdown component (268 lines), bulk mode toggle, CSV import/export.

**Not yet implemented:** Trade duplication, trade notes markdown rendering, streak share button, alert→trade conversion, bulk tagging, data backup/restore, journal streak tracking, instrument favorites.

## Implementation Scope (prioritized by impact)

### 1. Trade Duplication ("Clone Trade")
**File:** `src/components/modals/TradeDetailActions.tsx`
- Add a "Clone Trade" button next to Share/Delete
- On click, open CreateTradeModal pre-filled with the source trade's symbol, segment, trade_type, stop_loss, targets, timeframe, holding_period, notes (reset P&L, status to PENDING, timestamps to now)
- Pass pre-fill data via a callback prop up through TradeDetailModal

**File:** `src/components/modals/TradeDetailModal.tsx`
- Add `onDuplicate` handler that closes detail modal, opens CreateTradeModal with pre-filled data

**File:** `src/pages/Trades.tsx`
- Add state for `duplicateData` that feeds into CreateTradeModal's initial values

**File:** `src/components/modals/CreateTradeModal.tsx`
- Accept optional `initialData` prop to pre-fill form fields on mount

### 2. Bulk Tag Assignment
**File:** `src/pages/Trades.tsx`
- Add "Tag Selected" button to the existing bulk actions bar (line 280-292)
- Show a popover with available tags (from `useAvailableTags` hook) on click
- Apply selected tags to all selected trades via `useTradeTags` hook

### 3. Streak Share from Dashboard
**File:** `src/components/dashboard/StreakDiscipline.tsx`
- Add a Share2 icon button in the header
- On click, open the existing `StreakShareCard` modal (component already exists at `src/components/sharing/StreakShareCard.tsx`)

### 4. Alert → Trade Conversion
**File:** `src/pages/Alerts.tsx`
- Add "Create Trade" action on triggered alerts
- Opens CreateTradeModal pre-filled with the alert's symbol, exchange, and instrument data

### 5. Trade Notes Markdown Rendering
**File:** `src/components/modals/TradeDetailModal.tsx` (notes display section)
- Replace plain text notes display with `react-markdown` (already installed)
- Keep the `<Textarea>` for editing, render markdown in read mode

### 6. Data Backup/Restore
**File:** `src/pages/Settings.tsx` or `src/components/settings/PreferencesSettings.tsx`
- Add "Export All Data" button that calls an edge function to fetch trades, alerts, journal entries, studies, watchlists as a single JSON blob
- Add "Import Data" with file picker and validation

**File:** `supabase/functions/export-data/index.ts` (already exists — verify it exports all tables, extend if needed)

### 7. Journal Streak Tracking
**File:** `src/hooks/useJournalAnalytics.ts`
- Add journal streak calculation (consecutive days with entries) to the existing analytics hook

**File:** `src/pages/Journal.tsx`
- Display current journal streak badge in the header area

### 8. Empty States for Analytics
**File:** `src/pages/Analytics.tsx`
- Add meaningful empty states for each analytics widget when there are zero closed trades
- Use the existing `EmptyState` component with contextual messages like "Close your first trade to see analytics"

## Files Summary

| Action | File | Change |
|--------|------|--------|
| Edit | `TradeDetailActions.tsx` | Add Clone button |
| Edit | `TradeDetailModal.tsx` | Add duplicate handler + markdown notes |
| Edit | `CreateTradeModal.tsx` | Accept `initialData` prop |
| Edit | `Trades.tsx` | Duplicate state + bulk tag button |
| Edit | `StreakDiscipline.tsx` | Add share button |
| Edit | `Alerts.tsx` | Alert→Trade action |
| Edit | `PreferencesSettings.tsx` | Backup/restore UI |
| Edit | `useJournalAnalytics.ts` | Journal streak calc |
| Edit | `Journal.tsx` | Display journal streak |
| Edit | `Analytics.tsx` | Better empty states |
| Verify | `export-data/index.ts` | Ensure comprehensive export |

No database migrations needed — all features use existing tables and hooks.

