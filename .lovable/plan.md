

## Plan: Remove "Try Yourself" Overlay & Show Real Dashboard in View-Only Mode

### Changes

**1. Remove the hover overlay from `DashboardPreview.tsx`**
- Delete the "Try it yourself →" overlay (`motion.div` with `bg-background/60 backdrop-blur-sm`)
- Remove `hovered` state, `cursor-pointer`, and the `onClick` navigate to signup
- Keep hover pause for auto-cycle but remove the CTA overlay entirely

**2. Make the preview read-only / viewer-access feel**
- Remove `cursor-pointer` from the container
- Keep the auto-cycling tabs, sidebar, and browser chrome — these already look great
- Add a subtle "View Only" badge in the window chrome bar (next to traffic lights) to reinforce it's a preview
- Disable `onClick` navigation so clicking doesn't redirect to signup

**3. Improve the mock dashboard tab to better match the real Dashboard**
- Update `DashboardTab.tsx` to more closely mirror the real dashboard layout:
  - Add a month selector pill group (All / Jan / Feb / Mar) matching the real dashboard's filter bar
  - Add a "Live" status indicator matching the real one
  - Add a floating trade ticker row at the top (matching `FloatingTradeTicker` style)
  - Improve KPI cards to show 5 cards (matching real dashboard's 5-column grid) instead of 4
  - Add a mini equity curve section and streak/calendar placeholder below the chart

### Files Changed
- `src/components/landing/DashboardPreview.tsx` — remove hover overlay, add "View Only" badge
- `src/components/landing/preview-tabs/DashboardTab.tsx` — enhance to closer match real dashboard

