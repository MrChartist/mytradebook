

# Dashboard Polish — Full Component-by-Component Upgrade

## Current State Assessment

The dashboard has solid functionality but inconsistent visual treatment across widgets. Some use `dashboard-card`, others use `Card` (PortfolioHeatMap), and the overall spacing/hierarchy could be tighter and more cohesive. The reference aesthetic calls for richer depth, smoother transitions, and better visual rhythm.

## Changes

### 1. Dashboard Page (`src/pages/Dashboard.tsx`)

**Greeting row polish:**
- Wrap the live status indicator in a subtle pill (`bg-muted/50 rounded-full px-3 py-1.5`) for better visual containment
- Add a thin `separator` between greeting and filters row

**Filter row polish:**
- Month selector: smoother active state with `shadow-sm` and slight scale
- Segment pills: use `inner-panel` style for active state instead of flat `bg-primary`

**Widget spacing:** Change `space-y-6` to `space-y-5` for tighter rhythm. Add `[&>*]:animate-fade-in` with staggered delays per widget.

**Skeleton polish:** Add `shimmer` animation overlay to skeletons, match card border-radius

### 2. DashboardGreeting (`src/components/dashboard/DashboardGreeting.tsx`)

- Increase heading to `text-2xl` consistently
- Add a subtle subtitle line: current date formatted as "Saturday, 7 March 2026"
- Market status pill: wrap in a small badge-style container with dot + text

### 3. DashboardKPICards (`src/components/dashboard/DashboardKPICards.tsx`)

- Today's P&L hero card: Add `card-glow-profit`/`card-glow-loss` class dynamically. Increase the corner gradient from `w-32 h-32` to `w-40 h-40` for richer glow
- All 5 cards: Use `premium-card-hover` instead of `dashboard-card-hover` for richer depth
- Sub-values (Realized/Unrealized): wrap in `inner-panel` styled containers instead of plain divs
- Active Alerts card: Add a pulsing dot next to triggered count
- Win Rate card: Add a tiny circular progress indicator (CSS-only) next to the percentage

### 4. RiskGoalWidget (`src/components/dashboard/RiskGoalWidget.tsx`)

- Upgrade both cards to `premium-card-hover`
- Progress bars: Add gradient fills instead of flat colors. Add a subtle shine animation on the filled portion
- Risk gauge: Add a small "danger zone" marker at the 2% threshold with a red dashed line
- Goal tracker: Show a checkmark icon when goal is met (progress >= 100%)

### 5. PortfolioHeatMap (`src/components/dashboard/PortfolioHeatMap.tsx`)

- Replace `Card`/`CardHeader`/`CardContent` with `dashboard-card` pattern for consistency
- Add `icon-badge-sm` for the header icon
- Tiles: Add `backdrop-blur-sm` and subtle inner shadow for depth. Smoother `transition-all duration-300`
- Add a legend bar below the tiles showing the color scale (deep red → light red → light green → deep green)

### 6. DailySectorChart (`src/components/dashboard/DailySectorChart.tsx`)

- Tooltip: Use `premium-card` styling with `backdrop-blur-lg` and the liquid shine effect
- Range toggle pills: Increase size slightly, add `font-mono` for the period labels
- Add a subtle gradient overlay at the bottom of the chart area for depth
- Empty state: Use the standard dashed-border empty state pattern with a CTA

### 7. DashboardAlertsPanel (`src/components/dashboard/DashboardAlertsPanel.tsx`)

- Use `premium-card` base instead of `dashboard-card`
- Alert items: Add `inner-panel` styling. Triggered-today items get a subtle animated left-border pulse
- Empty state: Match the dashed-border pattern used in positions table
- "New" button: Style as a small pill with primary gradient background

### 8. EquityCurve (`src/components/dashboard/EquityCurve.tsx`)

- Tooltip: Match the premium tooltip styling (rounded-xl, inner highlight shadow, backdrop-blur)
- Increase gradient opacity from 0.15 to 0.25 for richer fill
- Add a subtle "Starting Capital" label at the first data point
- Chart area: Add a very subtle grid pattern using CSS for depth

### 9. DashboardPositionsTable (`src/components/dashboard/DashboardPositionsTable.tsx`)

- Summary stat boxes: Upgrade from `bg-muted/50` to `inner-panel` with proper border
- Table header: Add a subtle bottom gradient border instead of plain divide
- Row hover: Smoother `bg-primary/3` with left border accent on hover
- Profit/loss cells: Add a tiny colored dot indicator before the value

### 10. StreakDiscipline (`src/components/dashboard/StreakDiscipline.tsx`)

- Streak card: Add `card-glow-profit`/`card-glow-loss` based on streak type
- Stat cells: Upgrade to `inner-panel` styling
- Discipline bar: Add gradient fill and percentage label inside the bar when > 30%
- Add a small flame emoji/icon for win streaks > 3

### 11. DashboardMonthlyMetrics (`src/components/dashboard/DashboardMonthlyMetrics.tsx`)

- Metric cells: Upgrade highlighted cells to use `card-glow-primary` with subtle corner glow
- Non-highlighted: Use `inner-panel` instead of `bg-muted/50`
- Delta indicators: Wrap in a tiny pill badge for better readability
- Values: Add `font-mono` to all numeric values for consistency

### 12. QuickActions (`src/components/dashboard/QuickActions.tsx`)

- FAB button: Add a subtle `shadow-glow` pulsing animation when collapsed
- Action buttons: Use `premium-card` styling with `backdrop-blur-xl`
- Add labels below icons and smooth stagger animation with `framer-motion` spring

### 13. OnboardingWelcome (`src/components/dashboard/OnboardingWelcome.tsx`)

- Upgrade to `premium-card` base with corner glow
- Step cards: Use `inner-panel` styling with smoother hover lift
- Progress bar: Add gradient fill matching primary color

## Files to Edit

1. `src/index.css` — Add shimmer skeleton animation, inner-panel gradient variant
2. `src/pages/Dashboard.tsx` — Layout spacing, filter styling, skeleton polish
3. `src/components/dashboard/DashboardGreeting.tsx` — Date subtitle, market badge
4. `src/components/dashboard/DashboardKPICards.tsx` — Premium cards, inner panels, glows
5. `src/components/dashboard/RiskGoalWidget.tsx` — Gradient bars, premium cards
6. `src/components/dashboard/PortfolioHeatMap.tsx` — Consistent card pattern, legend
7. `src/components/dashboard/DailySectorChart.tsx` — Tooltip, empty state
8. `src/components/dashboard/DashboardAlertsPanel.tsx` — Premium card, alert items
9. `src/components/dashboard/EquityCurve.tsx` — Tooltip, gradient richness
10. `src/components/dashboard/DashboardPositionsTable.tsx` — Inner panels, row hover
11. `src/components/dashboard/StreakDiscipline.tsx` — Glows, inner panels
12. `src/components/dashboard/DashboardMonthlyMetrics.tsx` — Inner panels, mono values
13. `src/components/dashboard/QuickActions.tsx` — FAB glow, premium actions
14. `src/components/dashboard/OnboardingWelcome.tsx` — Premium card, step styling

