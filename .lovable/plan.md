

## Calendar Page — Production Polish Plan

### Problems Identified (from screenshot & code)

1. **Calendar grid is cramped** — day cells use `min-h-[80px]` with `aspect-square` which renders tiny on desktop; weekday headers overlap ("MoTuWeThFri" mashed together)
2. **Layout is 3-column but unbalanced** — the `JournalCalendarView` internally renders its own sidebar (trade detail panel) AND the page adds a third column for the journal editor, creating a nested 2+1 layout that wastes space
3. **Day cells lack visual hierarchy** — no P&L heatmap coloring in full mode (only compact mode has it), no "today" highlight, no journal-entry indicator dots
4. **Journal editor doesn't sync with calendar clicks** — clicking a day updates `selectedDate` but the journal editor doesn't visually indicate if an entry already exists for that day
5. **No monthly summary stats** — unlike the compact widget, the full page shows no win/loss day counts or total P&L
6. **Mobile layout breaks** — 3-column grid collapses to single column but calendar cells become unusably small

### Plan

#### 1. Restructure Calendar Page Layout
- Remove the internal sidebar from `JournalCalendarView` in full mode — the page already provides the trade list and journal editor
- New layout: **2-column on desktop** — Left: calendar grid (wide), Right: stacked trade list + journal editor in a scrollable panel
- Mobile: calendar on top, detail panel below

#### 2. Upgrade Calendar Grid Cells
- Add P&L heatmap coloring to full-mode cells (reuse the compact mode's green/red intensity logic)
- Add a small dot indicator for days that have a journal entry (query `daily_journal_entries`)
- Highlight today's date with a ring/accent border
- Increase cell size with proper `gap-2` and `min-h-[90px]` for readability
- Fix weekday header spacing

#### 3. Add Monthly Summary Bar
- Below the month navigation header, show a stats strip: Total P&L | Win Days / Loss Days | Best Day | Worst Day
- Computed from `calendarData` filtered to current month

#### 4. Improve Journal Editor Integration
- Show a small "saved" badge or filled dot on the journal editor when an entry exists for the selected date
- Auto-save debounce (optional enhancement) — for now, keep explicit save but add unsaved-changes indicator

#### 5. Polish & Animations
- Staggered fade-in for day cells on month change
- Smooth transition when switching selected date in the detail panel
- Skeleton loading states that match the actual grid layout (7-column skeleton grid)

### Files to Modify
- `src/pages/Calendar.tsx` — restructure layout, add monthly stats
- `src/components/journal/JournalCalendarView.tsx` — remove internal sidebar from full mode, add heatmap colors + journal dots + today highlight to full cells, fix spacing
- `src/components/journal/DailyJournalEditor.tsx` — add saved-entry indicator
- `src/hooks/useDailyJournal.ts` — expose entries list for dot indicators on calendar

