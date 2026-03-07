

# Landing Page Full Polish Pass

A comprehensive refinement across every section — improving card depth, visual consistency, micro-interactions, and overall premium feel.

## Changes

### 1. Feature Cards (`FeaturesSection.tsx`)
- Add `backdrop-blur-sm` and subtle inner highlight (`inset 0 1px 0 0 hsl(0 0% 100% / 0.06)`) to match the liquid-glass system
- Mini-preview containers: upgrade from `bg-muted/15` to `bg-muted/10` with a softer `border-border/15` for less visual noise
- Add a subtle gradient overlay on hover: `from-[hsl(var(--tb-accent)/0.03)]` instead of `0.02`
- Icon container: add `shadow-sm` for depth
- Gap between cards: `gap-4 sm:gap-5` → `gap-5 sm:gap-6` for more breathing room

### 2. How It Works Cards (`BelowFoldSections.tsx`)
- Step number watermark: increase opacity from `0.07` to `0.05` (softer) and add blur: `text-8xl` → `text-7xl` with `opacity-[0.04]`
- Step badge ("Step 01"): wrap in a pill with `bg-[hsl(var(--tb-accent)/0.06)] rounded-full px-3 py-1` for a polished look
- Add inner highlight shadow to cards for consistency with feature cards
- Connector chevron: increase opacity from `0.4` to `0.5`

### 3. Comparison Table (`BelowFoldSections.tsx`)
- Add inner highlight shadow to the table container
- Header row: increase padding to `py-5` and add `font-bold` to "Feature" column
- Row hover: soften to `hover:bg-muted/30` instead of accent-tinted hover for better readability
- Checkmarks: add subtle `drop-shadow` to profit checkmarks

### 4. Pricing Cards (`BelowFoldSections.tsx`)
- All cards: add inner highlight shadow (`inset 0 1px 0 0 hsl(0 0% 100% / 0.06)`)
- Highlighted card: add `backdrop-blur-sm` and increase ring from `ring-1` to `ring-2` for stronger emphasis
- Price number: increase to `text-5xl` for more impact
- Feature list checkmarks: slightly larger `w-4.5 h-4.5`
- Beta badge: add subtle pulse animation on the "Free During Beta" pill

### 5. Testimonial Cards (`BelowFoldSections.tsx`)
- Dark featured cards: add subtle noise/grain texture via `dot-pattern` (already present, keep)
- Light cards: add inner highlight shadow for consistency
- Quote icon: increase size slightly and use accent color at low opacity
- Avatar circles: add a subtle ring `ring-2 ring-background` for depth
- Star ratings: add `drop-shadow-[0_0_3px_hsl(var(--tb-accent)/0.3)]` for glow

### 6. FAQ Accordion (`BelowFoldSections.tsx`)
- Active state: add subtle `shadow-sm` when open
- Number badges: wrap in a `bg-muted/30 rounded-md px-1.5 py-0.5` container
- "Want to dive deeper?" card: add inner highlight shadow and slightly increase padding

### 7. Indian Markets Section (`BelowFoldSections.tsx`)
- Market segment grid cards: add inner highlight shadow
- Tricolor bar: increase height from `3px` to `4px`
- "Market Open" indicator: add `ring-4 ring-profit/10` to the ping dot for more emphasis
- List items: add subtle left border on hover via `hover:border-l-2 hover:border-l-[hsl(var(--tb-accent))]`

### 8. Final CTA Section (`BelowFoldSections.tsx`)
- Increase heading gap between lines: add `space-y-2`
- Trust pills at bottom: add inner highlight shadow
- Glow effect: increase radial gradient intensity slightly from `0.12` to `0.15`
- Avatar stack: add `ring-2 ring-background` and slightly larger `w-7 h-7`

### 9. Footer (`BelowFoldSections.tsx`)
- Column headers: increase from `text-[11px]` to `text-xs` for readability
- Links: increase from `text-sm` to `text-[15px]`
- SEBI disclaimer pill: add subtle border `border border-border/30`
- Add hover lift on "Get Started" footer CTA

### 10. Dashboard Preview (`DashboardPreview.tsx`)
- Window chrome: add subtle gradient `bg-gradient-to-b from-muted/20 to-muted/10` instead of flat bg
- KPI cards: add subtle hover effect `hover:scale-[1.02]` with transition
- Chart bars: add `rx="5"` for slightly rounder corners
- Overall: increase border radius from `rounded-xl sm:rounded-2xl` to `rounded-2xl sm:rounded-3xl`

### 11. Trust Strip (`Landing.tsx`)
- Logo icons: add subtle hover color transition to accent color
- Stats divider line: increase max-width and soften opacity
- Section background: reduce dot-pattern opacity

### 12. Navbar (`Landing.tsx`)
- Add subtle inner highlight shadow to the floating navbar
- Mobile menu: add `shadow-xl` for more depth
- Nav links: add active indicator dot on hover

## Files to Edit
1. `src/components/landing/FeaturesSection.tsx`
2. `src/components/landing/BelowFoldSections.tsx`
3. `src/components/landing/DashboardPreview.tsx`
4. `src/pages/Landing.tsx`

