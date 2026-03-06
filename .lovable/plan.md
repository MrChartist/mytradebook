

# Implementation Plan: 4 Features

## 1. Portfolio Heat Map (Dashboard Widget)

**What**: A new dashboard widget showing a treemap-style heat map of the user's open positions, grouped by sector/symbol, color-coded by P&L (green/red), and sized by position value.

**Files**:
- `src/components/dashboard/PortfolioHeatMap.tsx` (new) -- Treemap grid using CSS grid with `flex-grow` tiles. Each tile shows symbol, P&L %, and value. Colors range from deep red (big loss) to deep green (big profit) using interpolation. Falls back to an empty state if no open positions.
- `src/pages/Dashboard.tsx` -- Add `"heatMap"` to `DEFAULT_WIDGETS` in `useDashboardLayout`, render `<PortfolioHeatMap />` in `renderWidget`.
- `src/hooks/useDashboardLayout.ts` -- Add `{ id: "heatMap", label: "Portfolio Heat Map", visible: true, order: 5 }` to `DEFAULT_WIDGETS`.

**Data source**: Reuses `openTrades` + `prices` from `DashboardContext`. Computes position value as `quantity * ltp` and unrealized P&L per trade. Groups by symbol (or sector if available from trade notes/tags).

**Design**: CSS grid of rounded tiles with dynamic `background-color` (hsl-based gradient from red through neutral to green). Tile size proportional to position value via `flex-grow`. Hover shows tooltip with full details. Mobile: 2-column grid with smaller tiles.

---

## 2. Smart Trade Templates

**What**: When opening the Create Trade modal, show a "Suggested Templates" section that analyzes the user's past closed trades and surfaces the most common setups (segment + trade_type + timeframe combos) as one-click pre-fill options.

**Files**:
- `src/components/modals/CreateTradeModal.tsx` -- Add a collapsible "Suggested Setups" section at the top. Query closed trades, compute the top 3 most frequent (segment, trade_type, timeframe, avg SL) combos, display as clickable chips. On click, pre-fill the form fields. Also show existing saved templates from `useTradeTemplates`.
- `src/hooks/useSmartTemplates.ts` (new) -- Hook that takes all closed trades, groups by (segment, trade_type, timeframe), computes frequency + avg entry metrics (SL%, typical targets), returns top 3 suggestions with friendly labels like "NIFTY Options Scalp (used 23 times)".

**No DB changes needed** -- derived from existing trades data + existing `trade_templates` table.

---

## 3. Daily Review Wizard

**What**: A guided end-of-day review flow accessible from Dashboard (via Quick Actions or a floating prompt after market hours). Steps through: discipline rating, best/worst trade tagging, mood, lessons learned. Saves to `daily_journal_entries`.

**Files**:
- `src/components/dashboard/DailyReviewWizard.tsx` (new) -- Multi-step dialog/sheet:
  - **Step 1**: Mood selector (reuse MOODS from DailyJournalEditor) + discipline rating (1-5 stars)
  - **Step 2**: Auto-lists today's closed trades, lets user tag best/worst trade with one tap
  - **Step 3**: Text areas for "What worked?", "What to improve?", "Lessons learned"
  - **Step 4**: Summary + Save. Upserts into `daily_journal_entries` via `useDailyJournal`.
- `src/pages/Dashboard.tsx` -- Add a "Review Day" button in QuickActions or as a floating CTA that appears after 3:30 PM IST if no journal entry exists for today.
- `src/components/dashboard/QuickActions.tsx` -- Add "Daily Review" action card.

**DB**: Uses existing `daily_journal_entries` table. The best/worst trade tags and discipline rating can be stored in `post_market_review` and `lessons_learned` fields (JSON-stringified or plain text). No schema changes needed.

---

## 4. Save & Load Custom Scanner Presets

**What**: Let users name and save their custom filter combinations to the database. Add a "My Presets" section in the scanner preset strip.

**DB Migration**:
```sql
CREATE TABLE public.saved_scanner_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '[]',
  sort_by text,
  sort_order text DEFAULT 'desc',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.saved_scanner_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presets" ON public.saved_scanner_presets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own presets" ON public.saved_scanner_presets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own presets" ON public.saved_scanner_presets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

**Files**:
- `src/hooks/useSavedScannerPresets.ts` (new) -- CRUD hook for `saved_scanner_presets` table (query, create, delete mutations).
- `src/pages/Fundamentals.tsx` -- Add "Save" button in the filter builder that opens a name input dialog. Add "My Presets" group in the preset strip (after the existing groups) showing saved presets as clickable chips with delete option. Loading a saved preset populates `appliedFilters` and switches to custom mode.

