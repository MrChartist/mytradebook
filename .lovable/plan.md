

# Premium Grid & Theme Overhaul

## Overview
Redesign all grid cards (InsightCard, StatCard, Dashboard KPI Cards, EmptyState) to match the premium, rich UI style from the reference images. Also audit and finalize the full theme system (colors, fonts, shadows, radii) for consistency across the app.

## Design Direction (from Reference Images)
- **Cards**: Extra-large rounded corners (20-24px), generous padding, soft shadows with layered depth
- **Inner content zones**: Nested card-like elements within the main card to create visual depth (frosted inner panels)
- **Backgrounds**: Subtle dot-grid or gradient texture patterns inside cards for visual richness
- **Typography**: Stronger hierarchy -- bold titles, lighter descriptions, monospaced numbers
- **Hover**: Gentle lift with shadow increase, no harsh border changes
- **Spacing**: More generous whitespace between card sections

---

## Technical Plan

### 1. Theme Finalization (`src/index.css`)
- Increase `--radius` from `0.875rem` to `1.25rem` (20px) for premium feel
- Add new CSS utility classes:
  - `.premium-card` -- rounded-[20px], larger padding (p-6), layered shadow, subtle inner border shine
  - `.inner-panel` -- nested content area with slightly darker/lighter bg, smaller radius, used inside cards for visual depth
  - `.dot-pattern` -- subtle repeating dot background texture (CSS `radial-gradient`) for card decoration areas
- Refine shadow tokens for more layered, softer shadows (matching the gentle elevation in references)
- Add `--card-inner` CSS variable for the nested panel background color (light: slightly gray, dark: slightly lighter)

### 2. InsightCard Redesign (`src/components/ui/insight-card.tsx`)
**Grid mode changes:**
- Outer card: `rounded-[20px] p-5` with refined shadow and border
- Top section (symbol + badges): Wrap in an `inner-panel` with dot-pattern background to create the layered look from reference
- Sparkline area: Contained within its own inner panel with subtle bg
- Levels grid: Better spacing, use pill-style containers for each level value
- Metrics row: Larger font weight, pill badges for potential %
- Action bar: More refined with subtle separator, icons slightly larger
- Tags: Rounded-full pills instead of square badges

**List mode changes:**
- Increase row height to 56px minimum for better tap targets
- Add subtle left border accent based on direction (green/red 3px bar)
- Better column alignment with fixed widths

### 3. StatCard / KPI Cards Update
- `StatCard` (`src/components/dashboard/StatCard.tsx`): Apply premium-card styling, add inner-panel for the icon area, increase padding
- `DashboardKPICards` (`src/components/dashboard/DashboardKPICards.tsx`): Apply same premium styling to inline cards, add subtle decorative elements (dot patterns in top-right corner)

### 4. Dashboard Stat Boxes (Trades, Alerts pages)
- Replace inline `<div>` stat cards on Trades page (`src/pages/Trades.tsx` lines 259-341) and Alerts page (`src/pages/Alerts.tsx` lines 199-244) with the updated `StatCard` component or apply premium-card class
- Add decorative inner panels and consistent spacing

### 5. EmptyState Enhancement (`src/components/ui/empty-state.tsx`)
- Larger icon container with dot-pattern background
- Add subtle decorative floating elements (small badge-like shapes) for visual richness
- Better spacing and typography hierarchy

### 6. Sort/View Controls Polish
- `ViewToggle`: Slightly larger (h-8 w-8 buttons), smoother active state transition
- `SortSelect`: Match card border radius, consistent with premium theme

### 7. Font & Color Audit
- Ensure Inter font is loaded properly (add Google Fonts link in `index.html` if missing)
- Ensure JetBrains Mono is loaded for monospace numbers
- Verify profit green (#22c55e / hsl 152 60% 42%) and loss red are consistent across all card types
- Check dark mode variables maintain proper contrast with new premium styling

---

## Files to Modify
1. `src/index.css` -- New CSS utilities, adjusted variables
2. `src/components/ui/insight-card.tsx` -- Premium grid/list redesign
3. `src/components/dashboard/StatCard.tsx` -- Premium styling
4. `src/components/dashboard/DashboardKPICards.tsx` -- Apply premium card patterns
5. `src/components/ui/empty-state.tsx` -- Enhanced empty state
6. `src/components/ui/view-toggle.tsx` -- Polish sizing
7. `src/pages/Trades.tsx` -- Stat boxes use premium styling
8. `src/pages/Alerts.tsx` -- Stat boxes use premium styling
9. `index.html` -- Verify font imports (Inter + JetBrains Mono)
10. `tailwind.config.ts` -- Add extended border radius tokens if needed

## What Will NOT Change
- No database changes
- No routing changes
- No functional logic changes
- All existing click handlers, filters, and data flows remain intact

