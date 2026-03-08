

# Phase 1 — Landing Page & Conversion Improvements

## Current State
The landing page is well-structured with modular components: HeroSection, FloatingElements, DashboardPreview, FeaturesSection, and multiple below-fold sections (HowItWorks, Comparison, Pricing, Testimonials, IndianMarkets, FAQ, FinalCTA, Footer). The DashboardPreview is a static mockup. The pricing toggle exists but is non-functional (Monthly/Annual buttons don't switch plans). No video embed or enhanced OG image exists.

## Plan (10 Items)

### 1. Interactive Dashboard Preview
**File:** `src/components/landing/DashboardPreview.tsx`
- Add subtle hover interactions to KPI cards (tooltip-style popups showing "Click to explore")
- Add animated number counting effect to P&L values when the preview scrolls into view
- Add a pulsing "Live" indicator with a simulated ticker update (cycling through 2-3 price values every few seconds)
- Wrap the entire preview in a clickable overlay that navigates to `/login?mode=signup` with a "Try it yourself" CTA on hover

### 2. Video Walkthrough Embed
**File:** `src/components/landing/HeroSection.tsx`
- Add a "Watch Demo" button next to the "Start Free" CTA
- Clicking opens a modal (`Dialog`) with an embedded YouTube/video placeholder iframe
- Style the modal with the liquid-glass aesthetic and macOS window chrome to match DashboardPreview
- Create `src/components/landing/VideoModal.tsx` for the dialog component

### 3. Trust Badges Enhancement
**File:** `src/components/landing/HeroSection.tsx` (micro-trust row)
- Replace plain text trust indicators with visual badge cards (icon + label + subtle border glow)
- Add "256-bit SSL", "SOC 2 Compliant", "GDPR Ready" style badges alongside existing ones
- Add a small animated shield icon with a green checkmark pulse

### 4. Functional Pricing Toggle
**File:** `src/components/landing/BelowFoldSections.tsx` (`PricingSection`)
- Make the Monthly/Annual toggle stateful with `useState`
- Switch displayed prices when toggling (Monthly: full price, Annual: discounted price with savings badge)
- Add a smooth transition animation when prices change using framer-motion `AnimatePresence`

### 5. Enhanced OG Image Meta
**File:** `src/components/SEOHead.tsx` + `public/og-image.png` consideration
- Add Twitter-specific large image card meta tags (already partially present)
- Add `og:locale` for `en_IN`
- Add structured data for `SoftwareApplication` with updated rating/review counts
- Note: Actual OG image design (PNG) would need to be created externally and placed in `/public/og-image.png`

### 6. Social Proof Counter Strip
**File:** `src/pages/Landing.tsx` (Trust Strip section)
- Enhance the stat counters with animated "odometer" style using the existing `AnimatedNumber` component
- Add a subtle "Updated live" indicator next to trade count
- Add micro-avatars (colored circles with initials) showing "recent signups"

### 7. Sticky CTA Bar on Scroll
**File:** `src/pages/Landing.tsx`
- Add a sticky bottom bar that appears after scrolling past the hero section
- Contains condensed CTA: "Start Free — No Credit Card" with the accent button
- Auto-hides when user scrolls back to hero or reaches the footer
- Uses `framer-motion` `AnimatePresence` for smooth slide-in/out

### 8. Feature Cards Hover Previews
**File:** `src/components/landing/FeaturesSection.tsx`
- Already has mini-previews for most features — ensure all 11 features have preview content
- Add a subtle "Explore →" link at the bottom of each card that links to the relevant docs section

### 9. Testimonial Carousel for Mobile
**File:** `src/components/landing/BelowFoldSections.tsx` (`TestimonialsSection`)
- On mobile, convert the testimonial grid into a swipeable carousel using `embla-carousel-react` (already installed)
- Add dot indicators at the bottom
- Keep the current grid layout on desktop

### 10. Performance & Loading Polish
**Files:** Multiple landing components
- Add `loading="lazy"` to any images not yet lazy-loaded
- Ensure all below-fold sections use the existing `Suspense` boundaries
- Add a skeleton shimmer to the DashboardPreview while it renders
- Preload the hero font (`Dancing Script`) via a `<link rel="preload">` in `index.html`

## Files to Create
- `src/components/landing/VideoModal.tsx` — Demo video dialog
- `src/components/landing/StickyCTA.tsx` — Scroll-triggered bottom CTA bar

## Files to Edit
- `src/components/landing/HeroSection.tsx` — Video button, trust badges
- `src/components/landing/DashboardPreview.tsx` — Interactive animations, click-to-signup overlay
- `src/components/landing/BelowFoldSections.tsx` — Pricing toggle state, testimonial carousel
- `src/components/landing/FeaturesSection.tsx` — Docs links on cards
- `src/pages/Landing.tsx` — StickyCTA integration, social proof enhancements
- `src/components/SEOHead.tsx` — OG locale, structured data updates
- `index.html` — Font preload link

