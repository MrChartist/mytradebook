

## Plan: Rebuild Dashboard Preview to 4K-Quality Fidelity

The current preview looks cramped and doesn't match the real dashboard's premium aesthetic. We'll rebuild `DashboardTab.tsx` from scratch to create a pixel-perfect, high-fidelity replica that mirrors the real `DashboardKPICards`, `DashboardGreeting`, and widget structure — with proper spacing, inner panels, premium card styling, and crisp typography at all resolutions.

### Key Problems to Fix
- KPI cards too small, lack the real dashboard's inner panels (Realized/Unrealized sub-panels)
- Text sizes too tiny — looks blurry/cramped, not "4K ready"
- Missing the premium card aesthetic (accent bars, gradient overlays, glow effects)
- Spacing between widgets is too tight
- Equity curve and chart sections need more height/breathing room
- Win Rate card missing the circular progress indicator from real dashboard

### Changes to `src/components/landing/preview-tabs/DashboardTab.tsx`

**Complete rewrite** matching the real dashboard structure:

1. **Greeting Row** — Larger text, proper hierarchy. "Good morning, Mr. Chartist 👋" with date + market status. Right-aligned Live indicator with proper sizing.

2. **Filters Row** — Month pills + segment pills with proper padding and sizing (bump up from 7-8px text to 9-10px).

3. **Trade Ticker** — Keep but increase padding and text sizes for clarity.

4. **KPI Cards (5-column grid)** — Mirror real `DashboardKPICards` exactly:
   - Each card gets `premium-card` class styling with `inset 0 1px 0 0 white/6` shadow
   - Today's P&L: accent top bar (3px gradient), corner glow overlay, **inner-panel** sub-cards for Realized + Unrealized
   - MTD P&L: Same inner-panel structure
   - Open Positions: Inner panel for "Risk to SL"
   - Win Rate: Mini SVG circular progress ring + expectancy badge
   - Active Alerts: Warning-colored icon badge + "Create alert" CTA
   - All values use proper `font-mono` sizing (text-lg to text-xl range, not text-sm)

5. **Chart + Alerts Row** — Taller chart (h-20+), proper bar proportions, legend with dot indicators. Alerts panel with better item spacing.

6. **Equity Curve** — Full width, taller SVG (h-16+), gradient fill, end-dot marker, proper label sizing.

7. **Positions + Streak Grid** — Wider table columns, proper row height, streak section with circular discipline gauge.

### Also update `src/components/landing/DashboardPreview.tsx`
- Increase main content padding from `p-3 sm:p-5` to `p-4 sm:p-6` for more breathing room
- Bump up container `max-w-6xl` to `max-w-7xl` for wider preview on large screens

### Files Changed
- `src/components/landing/preview-tabs/DashboardTab.tsx` — Full rewrite with premium styling
- `src/components/landing/DashboardPreview.tsx` — Spacing + width adjustments

