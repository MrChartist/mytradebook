

## DashboardPreview — Responsive & Visual Polish Plan

Comparing the current mockup against the reference screenshots, here are the improvements:

### 1. Better Mobile Responsiveness

**Current**: Sidebar hidden on mobile, content cramped, chart/alerts stack awkwardly.
**Fix**:
- On mobile (`< sm`): Hide ticker bar, simplify greeting to single line, stack KPI cards as 2×2 grid with smaller padding
- On mobile: P&L hero card gets compact layout (realized/unrealized side by side with smaller text)
- Chart + Alerts section: Already stacks on mobile, but reduce padding and font sizes for tighter fit
- Add `overflow-hidden` and `min-h-0` to prevent content overflow on small screens

### 2. Sidebar — Match Reference (image-84)

**Current**: Icons only, no labels, no section dividers.
**Fix**:
- Add section labels "MAIN" and "ANALYTICS" as tiny `text-[6px]` uppercase dividers (visible in wider preview)
- Add `FileText` (Reports) and `AlertTriangle` (Mistakes) icons to match the full sidebar from the reference
- Increase sidebar width slightly to `w-16` for better icon breathing room
- Add the settings icon at bottom with a thin `border-t` separator

### 3. Segment Pills — Better Active State

**Current**: Active pill uses solid primary fill.
**Fix**: Match reference — active pill gets a slightly more rounded, glowing look with `shadow-[0_0_8px_hsl(var(--tb-accent)/0.3)]` for a subtle glow effect

### 4. KPI Cards — Inner Glass Depth

**Current**: Basic border cards with flat background.
**Fix**:
- Add `liquid-glass-sm` inner highlight to each KPI card
- Make the icon containers slightly larger (`w-7 h-7`) with softer rounded corners
- Add subtle hover effect `hover:border-border/40` for interactivity feel

### 5. Chart Bars — Smoother & More Realistic

**Current**: Bars are evenly spaced with fixed widths.
**Fix**:
- Add rounded tops (`rx="4"`) for softer look
- Reduce opacity variation — green bars at 0.8, red at 0.65 for better contrast
- Add a subtle grid line (horizontal dashed line at y=35) for chart realism

### 6. Overall Container — Responsive Breakpoints

**Current**: `perspective(1200px) rotateX(2deg)` on all screens.
**Fix**:
- Remove perspective transform on mobile (flat view looks better on small screens)
- Add responsive padding: `p-3` on mobile → `p-5` on desktop
- Ensure the entire preview fits within viewport width with `max-w-full overflow-hidden`

### Files to Edit
- `src/components/landing/DashboardPreview.tsx` — all changes in this single file

