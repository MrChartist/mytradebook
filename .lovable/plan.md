

# Improve Final CTA Section

## Current State
The section already has the right structure -- bold headline, subtitle, CTA button, and trust badges. But it can be elevated with more visual depth and emotional impact.

## Improvements

### 1. Add Social Proof Counter Strip
Above the headline, add a small animated strip showing live-feeling stats:
- "1,200+ traders" with a mini avatar stack (3 overlapping colored circles)
- "42,000+ trades logged" with a chart icon
- This adds credibility right before the CTA ask

### 2. Stronger Radial Glow Background
The current radial gradient is very subtle (6% opacity). Increase it slightly and add a second, softer ring to create a warm "spotlight" effect that draws the eye to the CTA button.

### 3. Headline -- Add Word-by-Word Stagger
Instead of the whole heading fading in at once, stagger each line slightly for a cinematic reveal effect using Framer Motion's `staggerChildren`.

### 4. CTA Button -- Add Shimmer Effect
Add a CSS shimmer animation across the button surface to make it feel alive and draw attention, similar to premium SaaS landing pages.

### 5. Trust Badges -- Richer Style
Upgrade the trust badges from plain text to mini pill badges with icons:
- Lock icon + "Bank-grade encryption" in a subtle pill
- Shield icon + "No credit card required" in a subtle pill  
- Clock icon + "Setup in 2 minutes" (new badge)

### 6. Bottom Decorative Element
Add a subtle decorative line or divider between the CTA section and footer -- a thin gradient line (saffron to transparent) that acts as a visual separator.

## Technical Changes

### File: `src/pages/Landing.tsx` (lines 1442-1475)

**Background (line 1446):**
- Increase radial gradient opacity from 0.06 to 0.1
- Add a second larger, softer radial gradient ring

**Social proof strip (before headline, after line 1448):**
- Add a `motion.div` with 3 overlapping colored avatar circles + "1,200+ traders" and "42,000+ trades logged" stats in a flex row

**CTA Button (lines 1460-1468):**
- Add a CSS shimmer pseudo-element via an inline style or a new `shimmer-cta` class
- The shimmer is a diagonal white gradient that slides across the button every 3 seconds

**Trust badges (lines 1469-1473):**
- Upgrade to pill-style badges with `bg-muted/50 rounded-full px-3 py-1.5` styling
- Add a third badge: "Setup in 2 minutes" with a Clock icon
- Use Shield icon instead of the dot separator

**Bottom gradient line (after line 1474):**
- Add a `div` with `h-[1px] bg-gradient-to-r from-transparent via-[hsl(var(--tb-accent)/0.3)] to-transparent max-w-md mx-auto mt-16`

### CSS Addition in `src/index.css`
Add a `shimmer-cta` keyframe animation:
- A diagonal white gradient that translates across the button surface
- `animation: shimmer-cta 3s ease-in-out infinite`

### No new dependencies needed

