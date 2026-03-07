

# Polish the Landing Page Footer

## Current State
The footer is functional but basic — a 4-column grid with text links, a gradient divider, and a copyright line. It lacks the premium glass depth, social proof, and visual polish present in the rest of the landing page.

## Changes to `src/components/landing/BelowFoldSections.tsx` (FooterSection)

### 1. Glass container treatment
- Add inner-highlight shadow and `backdrop-blur-sm` to the footer wrapper for consistency with the rest of the page

### 2. Brand column upgrade
- Add the app tagline in a bolder style below the logo
- Add social links row (Twitter/X, Telegram, Email) using Lucide icons in subtle pill buttons
- "Get Started" CTA: add `shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]` and hover lift

### 3. Add a 4th link column — "Resources"
- Move "Changelog" and "FAQ" here, add "Blog" placeholder
- Rename existing columns for clarity: Product, Resources, Support, Legal

### 4. Bottom bar upgrade
- Wrap copyright + SEBI disclaimer in a glass pill bar with `bg-muted/20 rounded-2xl px-6 py-4`
- Add a "Back to top" button on the right side with smooth scroll
- Tricolor India dots: increase size slightly to `w-2 h-2`

### 5. Visual refinements
- Column headers: add accent-colored left bar (`border-l-2 border-[hsl(var(--tb-accent))] pl-2`) for visual rhythm
- Links: add subtle left-slide transition on hover via `hover:translate-x-0.5`
- Add a subtle radial glow behind the logo in the brand column
- Increase overall vertical padding from `py-16` to `py-20`

## File to Edit
- `src/components/landing/BelowFoldSections.tsx` (lines 446-492)

