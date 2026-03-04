

## Calendar Page Style Fix

Comparing the screenshot to current code, here are the mismatches and fixes:

### Issues
1. **Page title wastes space** — "Calendar" heading and subtitle not present in the reference
2. **Calendar cells too rounded** — current `rounded-xl` looks blobby; reference shows a clean table-grid with subtle borders
3. **Today highlight wrong** — current uses `ring-1 ring-primary/40`; reference shows an **orange dashed border**
4. **Grid uses gap spacing** — reference uses contiguous cells with border dividers (traditional calendar table look)
5. **Selected date ring too heavy** — reference shows thin dashed orange border, not thick solid ring
6. **Month header styling** — needs to be larger/bolder to match reference

### Changes

#### `src/pages/Calendar.tsx`
- Remove the `<h1>Calendar</h1>` and `<p>` description block — the stats strip is enough context

#### `src/components/journal/JournalCalendarView.tsx` (full grid mode only)
- Change grid from `gap-2` to `gap-0` with `border border-border` on each cell for a table-grid look
- Change cell rounding from `rounded-xl` to `rounded-none` (first/last row cells get corner rounding)
- Change today highlight from `ring-1 ring-primary/40` to `border-2 border-dashed border-primary`
- Change selected highlight from `ring-2 ring-primary` to `border-2 border-primary border-dashed`
- Increase month title to `text-xl font-bold`
- Wrap the grid in a bordered container with rounded outer corners
- Make weekday headers have a bottom border separator

These are purely CSS/className changes — no logic changes needed.

### Files
- `src/pages/Calendar.tsx` — remove heading block
- `src/components/journal/JournalCalendarView.tsx` — restyle full grid cells

