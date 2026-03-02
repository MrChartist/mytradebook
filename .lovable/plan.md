

# Docs Page -- Add Visuals Everywhere

## What's Missing

Currently, 5 sections have no visual mockups at all:
- **Studies & Research** -- text-only bullet lists
- **Mistakes Review** -- no visual despite having Kanban in Journal section
- **Weekly Reports** -- no visual
- **Calendar & Daily Journal** -- no visual (calendar heatmap is in Journal section only)
- **Integrations** -- has Dhan flow but no Telegram visual in that section

Additionally, existing sections could benefit from more visuals based on the actual dashboard components:
- **Dashboard** -- missing Streak & Discipline mockup, widget customization mockup
- **Trade Management** -- missing CSV import/template visual
- **Analytics** -- missing Streak Tracker, Risk of Ruin, and Segment Performance visuals

## New Mockup Components to Add (in DocsMockups.tsx)

1. **StudyCardMockup** -- A research study card showing symbol, category badge (Technical), status flow (Draft to Active), pattern tags (Double Bottom, Breakout), and live price indicator

2. **StreakDisciplineMockup** -- Mirrors the real dashboard widget: 2x2 grid with current streak (5W), Avg R:R (1:1.8), Best Trade (+Rs 8,200), Worst Trade (-Rs 3,400), plus a discipline progress bar at 78%

3. **WeeklyReportMockup** -- A mini report card showing "Week of Feb 17-21, 2026" with segment rows (Intraday: +Rs 12K, 68% WR; Options: -Rs 3K, 42% WR), top setup, worst mistake, and PDF/Telegram action buttons

4. **MistakeTrendMockup** -- A mini SVG bar chart showing 6-month mistake count trend (decreasing bars) with severity color coding

5. **DailyJournalMockup** -- A journal entry card showing date, pre-market plan text, post-market review, mood indicator, and linked trades count

6. **TelegramChannelsMockup** -- Shows multiple Telegram channels with segment routing (Alerts channel, EOD channel, Intraday channel) with toggle indicators

7. **WidgetCustomizerMockup** -- A mini settings panel showing widget list with eye/reorder icons, mimicking the dashboard's widget customization popover

8. **CsvImportMockup** -- A mini file upload card with column mapping preview (Symbol to symbol, Entry to entry_price)

9. **SegmentPerformanceMockup** -- A mini table showing per-segment stats (Intraday: 68% WR, 1.4 Sharpe; Options: 52% WR, 0.8 Sharpe)

10. **RiskOfRuinMockup** -- A mini gauge/stat showing "Risk of Ruin: 2.3%" with a colored indicator

## Where Each Visual Goes in Docs.tsx

### Studies Section (currently 0 visuals)
- Add `StudyCardMockup` above the feature cards

### Dashboard Section (has DashboardMockup, needs more)
- Add `StreakDisciplineMockup` after the existing feature cards for the Streak & Discipline description
- Add `WidgetCustomizerMockup` next to the Widget Customization feature card

### Trade Management (has TradeCard + Lifecycle)
- Add `CsvImportMockup` next to the CSV Import & Export feature card

### Mistakes Review Section (currently 0 visuals)
- Add `MistakeTrendMockup` as a visual above the feature card

### Weekly Reports Section (currently 0 visuals)
- Add `WeeklyReportMockup` above the feature card

### Calendar & Daily Journal Section (currently 0 visuals)
- Add `DailyJournalMockup` above the feature card

### Analytics Section (has EquityCurve + Heatmap)
- Add `SegmentPerformanceMockup` and `RiskOfRuinMockup` as an additional visual row

### Integrations Section (has DhanFlow)
- Add `TelegramChannelsMockup` alongside TelegramNotifMockup (move it here from Alerts)

## Technical Details

### File Changes:
1. **`src/components/docs/DocsMockups.tsx`** -- Add 10 new mockup components (approximately 300-400 lines added). Each uses the same `MockupFrame` wrapper, Tailwind styling, inline SVG where needed, and the app's color tokens (profit green, loss red, accent orange).

2. **`src/pages/Docs.tsx`** -- Import new mockups and place them in their respective sections. Rearrange some sections to integrate visuals inline with feature descriptions rather than always above.

### Design Consistency
- All new mockups use the existing `MockupFrame` component with `dot-pattern` background
- Same color tokens: `hsl(var(--profit))`, `hsl(var(--loss))`, `hsl(var(--tb-accent))`, `hsl(var(--warning))`
- Same `font-mono` for financial numbers
- Same hover scale effect (`hover:scale-[1.01]`)
- Responsive: mockups stack on mobile, side-by-side on desktop
- No new dependencies -- pure CSS/JSX/SVG

