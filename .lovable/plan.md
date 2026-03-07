

## Card Visual Upgrade — Smooth, Rich, Easy to Read

Inspired by the reference images: dark glassmorphic cards with **gradient corner glows**, smoother surfaces, richer depth, and cleaner typography hierarchy.

### Changes

#### 1. CSS Card System Overhaul (`src/index.css`)

Upgrade all card utility classes to match the reference aesthetic:

- **`surface-card`**: Add subtle inner top-edge highlight (`inset 0 1px 0 0 white/8`), increase border-radius to `1.25rem`, smoother shadow layering
- **`premium-card`**: Add a `::before` pseudo-element for a **gradient corner glow** effect (subtle colored radial gradient in top-right corner that shifts color based on context). Smoother `transition-all duration-300 ease-out`
- **`premium-card-hover`**: Richer hover with lift (`translateY(-3px)`), intensified glow, border brightening
- **`dashboard-card`**: Inherit the new premium surface treatment — inner highlight + softer shadow stack
- New utility: **`.card-glow-profit`**, **`.card-glow-loss`**, **`.card-glow-primary`** — applies a colored radial gradient glow in the top-right corner (like the green/gold/rose/blue glows in the reference)
- Add `::after` pseudo for a subtle **top-edge liquid shine** line on all premium cards

#### 2. Base Card Component (`src/components/ui/card.tsx`)

- Upgrade default className: `rounded-2xl` (from `rounded-lg`), add inner highlight via box-shadow, smoother border color
- Better spacing defaults in `CardHeader` (`p-5` instead of `p-6` for tighter, modern feel)
- `CardTitle`: Slightly smaller default (`text-xl` from `text-2xl`) for better hierarchy

#### 3. StatCard Polish (`src/components/dashboard/StatCard.tsx`)

- Replace `dot-pattern` decorative element with a **radial gradient glow** in the corner that matches `changeType` color (green for profit, red for loss, orange for neutral) — matching the reference card style
- Smoother value typography: `text-[28px]` with tighter tracking
- Add subtle `backdrop-blur-sm` for depth when used on complex backgrounds

#### 4. InsightCard Refinement (`src/components/ui/insight-card.tsx`)

- Replace `dot-pattern` with the same corner gradient glow
- Softer `inner-panel` sections with reduced border opacity
- Smoother action row transition (fade in from below on hover)

### Files to Edit
1. `src/index.css` — card CSS classes + new glow utilities
2. `src/components/ui/card.tsx` — base component defaults
3. `src/components/dashboard/StatCard.tsx` — gradient glow + typography
4. `src/components/ui/insight-card.tsx` — gradient glow + smoother panels

