

# Dashboard Rework -- Quantix-Inspired Redesign

Taking inspiration from the Quantix crypto dashboard screenshot, this plan refines the entire dashboard layout, greeting area, KPI cards, widget cards, and overall visual hierarchy to match that premium dark-mode fintech aesthetic.

## Key Design Principles from Screenshot
- **Large welcome greeting** with user name prominently displayed and "Last login" subtitle
- **Breadcrumb navigation** at the top of the content area (e.g., "Overview / Dashboard")
- **Spacious card layouts** with subtle borders, rounded corners, and inner glow effects
- **Prominent live data indicators** (dot + "Last update: X min ago")
- **Refined typography hierarchy** -- larger headings, more whitespace between sections
- **Cards with icon badges** using colored circular backgrounds (not square panels)
- **Clean segment/filter pills** styled as rounded capsules

## Changes

### 1. Dashboard Header Rework (`Dashboard.tsx`)
- Add a **breadcrumb bar** at the top: "Overview / **Dashboard**" with a search icon
- Replace the compact greeting with a **large welcome block** inspired by the screenshot: "Welcome Back, {Name}" in bold ~2xl text with "Last login: {date}" subtitle below
- Move the live indicator to the breadcrumb area as a dot + "Last update: X min ago" style
- Restyle the month selector pills as rounded capsules with more padding
- Restyle segment filter pills to be softer, rounder capsules with more generous padding

### 2. DashboardGreeting Rework (`DashboardGreeting.tsx`)
- Increase heading size from `text-xl` to `text-2xl` or `text-3xl`
- Display as "Welcome Back, {Name}" (two-line layout like the screenshot)
- Show "Last login: {date}" as a subtitle in muted text instead of market status inline
- Move market status to a separate small badge/chip

### 3. TodaysPnl Card Refinement (`TodaysPnl.tsx`)
- Use **circular icon badges** (round colored circle with icon) instead of square rounded panels
- Add a subtle sparkline or percentage change chip (like the "+1.09%" badge in the screenshot)
- Increase card padding and inner spacing for a more spacious feel
- Add a thin top-border accent line in the card's P&L color

### 4. KPI Cards Refinement (`DashboardKPICards.tsx`)
- Switch icon containers from square `inner-panel` to **circular badges** (w-10 h-10 rounded-full) with colored backgrounds
- Increase card padding from `p-5` to `p-6`
- Add more vertical spacing between the label, value, and sub-metrics
- Remove the dot-pattern decorative element for a cleaner look (matching the screenshot's minimal style)
- Style the sub-stats with slightly larger text and better contrast

### 5. Chart & Widget Cards Refinement
- **DailySectorChart**: Increase heading font weight, add a thin colored top border accent
- **EquityCurve**: Same treatment -- cleaner header, larger title
- **DashboardPositionsTable**: Style the table header row with `text-[11px]` uppercase tracking, add subtle row hover highlights
- **DashboardAlertsPanel**: Add circular icon badge for the bell icon, increase item padding
- **DashboardMonthlyMetrics**: Use rounded-2xl on metric cards, increase padding
- **StreakDiscipline**: Replace emoji heading with an icon badge, increase padding

### 6. RiskGoalWidget Refinement (`RiskGoalWidget.tsx`)
- Use circular icon badges instead of square panels
- Add thicker progress bars (h-3 instead of h-2.5) for more visual weight
- Increase overall card padding

### 7. Global Card Styling (`index.css`)
- Add a new `.dashboard-card` utility class combining: `bg-card rounded-2xl border border-border/60 p-6 shadow-sm`
- Add `.icon-badge` utility: circular colored icon container `w-10 h-10 rounded-full flex items-center justify-center`
- Add `.breadcrumb-bar` utility for the top navigation breadcrumb

### 8. Sidebar Welcome Section (`Sidebar.tsx`)
- In the expanded sidebar profile area, increase the greeting display to show "Welcome Back, {Name}" matching the screenshot's sidebar greeting style
- Add "Last login" text under the profile name

## Files Modified
- **`src/pages/Dashboard.tsx`** -- Breadcrumb bar, restructured header, refined segment pills
- **`src/components/dashboard/DashboardGreeting.tsx`** -- Larger welcome text, last login subtitle
- **`src/components/dashboard/TodaysPnl.tsx`** -- Circular icon badge, accent line, spacious layout
- **`src/components/dashboard/DashboardKPICards.tsx`** -- Circular icon badges, removed dot pattern, more padding
- **`src/components/dashboard/RiskGoalWidget.tsx`** -- Circular badges, thicker progress bars
- **`src/components/dashboard/EquityCurve.tsx`** -- Refined card header styling
- **`src/components/dashboard/DailySectorChart.tsx`** -- Refined card header
- **`src/components/dashboard/DashboardPositionsTable.tsx`** -- Refined table styling
- **`src/components/dashboard/DashboardAlertsPanel.tsx`** -- Circular icon badge
- **`src/components/dashboard/DashboardMonthlyMetrics.tsx`** -- Larger rounded cards, more padding
- **`src/components/dashboard/StreakDiscipline.tsx`** -- Icon badge instead of emoji, padding increase
- **`src/index.css`** -- New utility classes (dashboard-card, icon-badge, breadcrumb)

## No Functional Changes
All changes are purely visual/styling. No business logic, data flow, or API calls are modified.

