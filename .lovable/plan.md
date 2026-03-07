

# Landing Page Readability & Polish Refinements

Light touch-ups inspired by the reference images — cleaner spacing, better typography hierarchy, softer card treatments, and improved scanability. No structural changes.

## Changes

### 1. Hero Section (`src/components/landing/HeroSection.tsx`)
- Reduce heading from `text-8xl` max to `text-7xl` for better readability on large screens
- Increase subtitle line-height from `leading-relaxed` to `leading-[1.7]` and bump to `text-lg` minimum
- Add more breathing room: `mb-14` on subtitle (from `mb-12`), `mb-10` on email CTA (from `mb-7`)
- Soften the pastel gradient blobs — reduce opacity from `0.25/0.2/0.15` to `0.15/0.12/0.08`
- Trust badges below CTA: increase gap from `gap-4` to `gap-5`, bump font to `text-[13px]`

### 2. Trust Strip (`src/pages/Landing.tsx`)
- Reduce vertical padding from `py-20` to `py-16` — less dead space
- Increase stat label size from `text-[10px]` to `text-[11px]` for readability
- Add `font-mono` to stat numbers for consistency
- Soften `dot-pattern` with lower opacity

### 3. Features Section (`src/components/landing/FeaturesSection.tsx`)
- Feature card descriptions: bump from `text-sm` to `text-[15px]` with `leading-relaxed`
- Feature card titles: increase from `text-lg` to `text-xl`
- Add `text-foreground/90` to descriptions instead of plain `text-muted-foreground` for better contrast
- Increase card padding from `p-6 sm:p-7` to `p-7 sm:p-8`
- Section subtitle: increase from `text-base` to `text-lg`

### 4. How It Works (`BelowFoldSections.tsx` — `HowItWorksSection`)
- Step descriptions: bump to `text-[15px]` with `leading-relaxed`
- Step titles: keep `text-xl` but add `tracking-tight`
- Step number badge: increase slightly, add softer bg treatment
- Card padding increase: `p-8` → `p-9`

### 5. Comparison Table (`BelowFoldSections.tsx` — `ComparisonSection`)
- Feature text: increase from `text-base` to `text-[15px]`
- Add more vertical padding per row: `py-4` → `py-5`
- Header: bump font size slightly for "Feature" label

### 6. Pricing Cards (`BelowFoldSections.tsx` — `PricingSection`)
- Feature list items: bump from `text-sm` to `text-[15px]` with `leading-relaxed`
- Description: increase to `text-[15px]`
- Add more spacing between price and features: `mb-7` → `mb-8`

### 7. Testimonials (`BelowFoldSections.tsx` — `TestimonialsSection`)
- Featured quote: increase from `text-lg` to `text-xl` with `leading-[1.7]`
- Smaller quotes: bump from `text-sm` to `text-[15px]`
- Add more padding in cards: `p-7` → `p-8`, `p-9` → `p-10`

### 8. FAQ Section (`BelowFoldSections.tsx` — `FAQSection`)
- Question text: increase from `text-sm` to `text-[15px]`
- Answer text: increase to `text-[15px]` with `leading-[1.7]`
- Accordion item padding: `px-5` → `px-6`

### 9. Indian Markets & Final CTA
- Body text: bump to `text-[15px] leading-[1.7]`
- List items: bump to `text-[15px]`
- Final CTA subtitle: `text-lg` → `text-xl`

### 10. Section Badge (`LandingShared.tsx`)
- Increase from `text-xs` to `text-[13px]` and soften tracking to `tracking-[0.12em]`
- Add slightly more bottom margin: `mb-5` → `mb-6`

### 11. Global Section Headings
- All `text-4xl lg:text-6xl` headings: add `leading-[1.1]` for tighter but readable line height on multi-line headings
- Increase subtitle bottom margin from `mb-5` to `mb-6`

## Files to Edit
1. `src/components/landing/HeroSection.tsx` — hero typography + spacing
2. `src/pages/Landing.tsx` — trust strip refinements
3. `src/components/landing/FeaturesSection.tsx` — card readability
4. `src/components/landing/BelowFoldSections.tsx` — all below-fold sections
5. `src/components/landing/LandingShared.tsx` — SectionBadge sizing

