

# Dashboard Refinement Plan

## Current State Analysis

The dashboard currently has 11 widgets rendered in a vertical stack with `space-y-6`. While feature-rich, there are several areas that can be tightened for a more polished trading desk experience:

**Issues Identified:**
- **Visual monotony**: Every widget is a full-width `dashboard-card` stacked vertically -- no visual hierarchy distinguishing "glanceable" vs "deep-dive" content
- **Redundant data**: Today's P&L widget and KPI cards both show today's realized/unrealized breakdown separately, duplicating queries and screen space
- **Header area is busy**: Breadcrumb bar, greeting, month selector, segment pills, and settings popover spread across 4 separate rows before any data appears
- **Chart + Alerts pairing is rigid**: The 2/3 + 1/3 layout hardcodes chart and alerts together -- if user hides alerts, chart still only takes 2/3
- **Empty states are plain**: "No open positions" and "No closed trades" just show text links with no visual warmth
- **Monthly Metrics grid**: 8 metrics in a 2x4 grid all look the same -- no visual emphasis on the most important ones (Win Rate, Profit Factor)

---

## Proposed Refinements

### 1. Consolidate the Header into 2 Rows (from 4)

**Row 1**: Greeting (left) + Live status indicator + Settings gear (right)
**Row 2**: Month selector pills + Segment filter pills (combined into one horizontal bar)

This removes the breadcrumb bar entirely (it's redundant -- the user knows they're on the dashboard) and merges month + segment selectors into a single controls row.

### 2. Merge Today's P&L into the KPI Row

Instead of a separate full-width `TodaysPnl` card followed by 4 KPI cards, make it a **5-column hero strip**:

```text
[ Today's P&L (wider, accent-bordered) ][ MTD P&L ][ Open Pos ][ Win Rate ][ Alerts ]
```

The Today's P&L card becomes the first KPI card with the accent top-bar treatment, eliminating the standalone widget. On mobile, this becomes a 2-column grid with Today's P&L spanning full width on top.

### 3. Make Chart Expand When Alerts Are Hidden

When the `alerts` widget is toggled off in settings, the chart should span `lg:col-span-3` (full width) instead of staying at `lg:col-span-2`. Simple conditional class.

### 4. Enhance Empty States

Replace plain text empty states with illustrated empty states using the existing `empty-state` component pattern:
- Open Positions: Show a subtle dashed-border card with "No positions yet" and a primary CTA button
- Charts: Show a muted chart skeleton placeholder instead of plain text

### 5. Visual Hierarchy for Monthly Metrics

Highlight the 2 most important metrics (Win Rate, Profit Factor) with the `bg-primary/5 border border-primary/10` treatment, and keep the rest in `bg-muted/50`. Currently only "Closed Trades" is highlighted.

### 6. Streak + Calendar Grid Balance

The Streak card is much shorter than the Calendar card, creating visual imbalance. Add a "Trading Tip of the Day" or "Market Quote" micro-card below the Streak card to fill the vertical space, OR make both cards `min-h-[360px]` so they align.

---

## Technical Changes

### File: `src/pages/Dashboard.tsx`

1. **Remove breadcrumb bar** (lines 182-205) -- the sidebar already shows active page
2. **Merge greeting + controls into one flex row**: Greeting left, month pills + segment pills + settings right
3. **Remove `todayPnl` from widget render** -- merge into KPI cards
4. **Update chart widget render**: Check if alerts widget is visible before setting col-span

### File: `src/components/dashboard/DashboardKPICards.tsx`

1. Change grid from `grid-cols-4` to `grid-cols-2 lg:grid-cols-5`
2. Add a "Today's P&L" card as the first item (pull logic from `TodaysPnl.tsx`)
3. Give Today's card the accent top-bar (`border-t-[3px] border-primary`) and slightly wider span on desktop

### File: `src/components/dashboard/DashboardMonthlyMetrics.tsx`

1. Change `highlight` to apply to Win Rate and Profit Factor instead of just Closed Trades

### File: `src/components/dashboard/DashboardGreeting.tsx`

1. Simplify: Remove "Last login" line (low-value info), keep greeting + market status only
2. Make it more compact (single line)

### File: `src/hooks/useDashboardLayout.ts`

1. Remove `todayPnl` from `DEFAULT_WIDGETS` array (merged into KPI)
2. Renumber order indices

### File: `src/components/dashboard/DashboardPositionsTable.tsx`

1. Enhance empty state with a bordered dashed card + icon + CTA button

### File: `src/components/dashboard/DailySectorChart.tsx`

1. Accept an optional `fullWidth` prop to conditionally render at full width

---

## Summary of Impact

| Change | Before | After |
|--------|--------|-------|
| Rows before data | 4 (breadcrumb, greeting, controls, segments) | 2 (greeting+controls, segments) |
| Today's P&L | Standalone full-width card | Merged into KPI strip |
| Widget count | 11 | 10 (one merged) |
| Chart when alerts hidden | Still 2/3 width | Expands to full width |
| Monthly metrics emphasis | Only "Closed Trades" | Win Rate + Profit Factor highlighted |
| Empty states | Plain text | Visual cards with icons + CTAs |

No new dependencies. No database changes. Pure frontend refinement.

