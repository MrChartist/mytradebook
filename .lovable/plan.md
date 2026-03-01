
# Link Calendar Heatmap to Analytics Calendar

## Problem
The `CalendarHeatmap` on the Dashboard and the `JournalCalendarView` on the Calendar page are two completely separate components with duplicated P&L computation logic. The heatmap doesn't link to the full Calendar page, and both fetch trades independently.

## Solution

### 1. Make CalendarHeatmap a shared, reusable component
- Move `src/components/dashboard/CalendarHeatmap.tsx` to accept **external data via props** instead of calling `useTrades()` internally
- Props: `dailyPnl` (record of date-to-pnl), optional `month` (Date), optional `onDayClick` callback
- This eliminates duplicate trade fetching and makes it lightweight

### 2. Add "View Full Calendar" link on Dashboard
- Add a clickable header/link on the heatmap card that navigates to `/calendar`
- Use `react-router-dom`'s `Link` component so clicking the heatmap title opens the full Calendar page

### 3. Embed the heatmap as a mini-widget inside the Calendar page
- On `src/pages/Calendar.tsx`, render the `CalendarHeatmap` above the full `JournalCalendarView` as a compact month-overview strip
- Both share the same trade data already fetched by the Calendar page, passed down as props

### 4. Make individual days clickable on Dashboard heatmap
- When a user clicks a day cell on the Dashboard heatmap, navigate to `/calendar` (the full calendar page) so they can see trade details for that date

---

## Technical Details

### File changes

**`src/components/dashboard/CalendarHeatmap.tsx`** (refactor)
- Remove internal `useTrades()` hook call
- Accept props: `dailyPnl: Record<string, number>`, `month?: Date`, `onDayClick?: (date: string) => void`, `showLink?: boolean`
- When `showLink` is true, render a `Link to="/calendar"` on the header
- When `onDayClick` is provided, make day cells clickable buttons

**`src/pages/Dashboard.tsx`** (update)
- Compute `dailyPnl` from the existing `trades` in `DashboardContext`
- Pass it as a prop to `CalendarHeatmap`
- Pass `onDayClick` that navigates to `/calendar`
- Pass `showLink={true}`

**`src/pages/Calendar.tsx`** (update)
- Reuse the same `dailyPnl` computation already done for `calendarData`
- Render `CalendarHeatmap` as a compact overview widget above the main calendar grid
- Pass `onDayClick` to select the date in `JournalCalendarView`

This approach:
- Eliminates one redundant `useTrades()` call (less load)
- Creates a single source of truth for the heatmap rendering
- Links Dashboard heatmap directly to the full Calendar page
