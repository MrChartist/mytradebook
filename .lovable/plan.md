

# Fix Dashboard Crash: "Cannot destructure property 'trades' of useDashboard(...) as it is null"

## Problem

The `useDashboard()` hook uses a non-null assertion (`!`) on a context that can be `null`. When the Dashboard context provider hasn't mounted yet (during error recovery, route transitions, or HMR), all child components crash with "Cannot destructure property X of useDashboard(...) as it is null."

This affects: `DashboardMonthlyMetrics`, `DashboardKPICards`, `RiskGoalWidget`, `DailySectorChart`, `EquityCurve`, `DashboardPositionsTable`, and others.

## Solution

Make `useDashboard()` return safe default values instead of crashing when the context is null.

### File: `src/pages/Dashboard.tsx`

Change the `useDashboard` hook from:

```typescript
export const useDashboard = () => useContext(DashboardContext)!;
```

To a version that returns sensible defaults when context is null:

```typescript
const DASHBOARD_DEFAULTS: DashboardContextValue = {
  selectedMonth: new Date(),
  setSelectedMonth: () => {},
  segment: "All",
  trades: [],
  monthTrades: [],
  openTrades: [],
  prices: {},
  isPolling: false,
  lastUpdated: null,
};

export const useDashboard = () => {
  const ctx = useContext(DashboardContext);
  return ctx ?? DASHBOARD_DEFAULTS;
};
```

This is a single-file, surgical fix. No other files need changes. All dashboard widgets will safely receive empty arrays/defaults instead of crashing when rendered outside the provider context.

## Technical Details

- The `DASHBOARD_DEFAULTS` constant is created once outside the component to avoid re-creating on every render
- `setSelectedMonth` is a no-op function since it would have no provider to update
- All array properties default to `[]`, so `.filter()`, `.map()`, `.reduce()` calls in child components work without errors
- This matches the architectural note in the memory about "Dashboard context includes safety logic to return valid default values"

