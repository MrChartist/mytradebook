

# Landing Page Redesign — Modern AI-Era Animated SaaS

## Current State
The landing page uses **Sora + Inter** — clean but conventional. Animations are basic fade-ups. The layout is standard section-after-section. It needs more personality, movement, and a premium "new-age" feel.

## Font Upgrade

**Replace Sora with Space Grotesk** — a sharper, more geometric display font with distinctive character shapes (open apertures, squared curves). It reads more "tech/AI product" than Sora while staying highly legible.

- **Space Grotesk** → all display headings, hero, section titles (weights: 500, 600, 700)
- **Inter** → stays for body/UI (unchanged)
- **JetBrains Mono** → stays for code/numbers (unchanged)

Files: `index.html` (swap font link), `tailwind.config.ts` (update `fontFamily.heading`)

## Phase-by-Phase Implementation

### Phase 1 — Font Swap + CSS Animation System
**Files:** `index.html`, `tailwind.config.ts`, `src/index.css`, `src/components/landing/LandingShared.tsx`

1. Swap Sora → Space Grotesk in `index.html` Google Fonts link
2. Update `tailwind.config.ts` heading font family
3. Add new CSS animations to `index.css`:
   - `@keyframes float` — gentle Y bobbing for floating elements
   - `@keyframes gradient-shift` — moving gradient backgrounds
   - `@keyframes blur-in` — blur→sharp entrance
   - `@keyframes grain` — subtle noise texture overlay
   - `.aurora-bg` — animated aurora gradient for hero background
   - `.glass-card` — standardized glass morphism card with hover lift
   - `.text-shimmer` — animated gradient text that shifts
4. Update `LandingShared.tsx`:
   - Add new motion variants: `blurIn`, `slideFromLeft`, `slideFromRight`, `popIn`
   - Enhance `MotionSection` with optional parallax offset
   - Update `SectionBadge` with animated border gradient

### Phase 2 — Hero Section Redesign
**File:** `src/components/landing/HeroSection.tsx`

- Replace static dot-pattern with animated aurora gradient mesh background (CSS-only, performant)
- Add floating glassmorphic elements (trade card, win-rate badge, streak counter) that bob independently using `float` animation with staggered delays — brings the hero to life
- Hero headline uses Space Grotesk with `.text-shimmer` gradient on the accent word
- Subtitle entrance uses `blurIn` variant (blurred→sharp with Y movement)
- CTA button gets a moving gradient border on hover (not just opacity change)
- Stats bar cards get individual `popIn` entrances with stagger
- Dashboard preview section: add a subtle mouse-follow tilt effect using `useMotionValue` + `useTransform` for 3D perspective that responds to cursor position

### Phase 3 — Features Section
**File:** `src/components/landing/FeaturesSection.tsx`

- Category pills get an animated underline on hover instead of static bg
- Bento grid cards: add animated gradient border on hover (the border color shifts), replace static `boxShadow` hover with a moving glow that follows card edges
- Hero card (Smart Journal) gets a subtle animated background pattern
- Each card icon gets a micro-bounce on card hover
- Section heading uses `slideFromLeft` for title, `slideFromRight` for subtitle (split entrance)

### Phase 4 — How It Works + Testimonials
**File:** `src/components/landing/BelowFoldSections.tsx`

**How It Works:**
- Timeline connector line becomes animated — a gradient dot that travels down the line as you scroll (using `useScroll` + `useTransform`)
- Step cards enter from alternating sides (`slideFromLeft` / `slideFromRight`) instead of uniform `fadeUp`
- Step numbers get a count-up animation as they enter viewport

**Testimonials:**
- Hero testimonial card gets a subtle animated gradient border
- Secondary cards enter with staggered `popIn` instead of uniform `fadeUp`
- Add auto-rotating quote highlight — the highlighted text portion pulses gently

### Phase 5 — Pricing + Indian Markets + FAQ
**File:** `src/components/landing/BelowFoldSections.tsx`

**Pricing:**
- Free Beta card gets an animated "shine" sweep (like the existing `liquid-shine` but refined)
- Comparison table rows animate in with stagger as they enter viewport
- Check/cross icons get micro-scale-in animation

**Indian Markets:**
- Segment grid items get a sequential reveal animation (cascade from top-left)
- Exchange badges get animated pulse borders
- The tricolor stripe becomes an animated gradient that shifts

**FAQ:**
- Accordion items get smooth height + blur transition (content blurs in as it expands)

### Phase 6 — Final CTA + Footer + Global Polish
**Files:** `BelowFoldSections.tsx`, `StickyCTA.tsx`, `LandingNavbar.tsx`

**Final CTA:**
- Background gets animated aurora mesh (reuse from hero but different colors)
- CTA button gets magnetic hover effect (button moves slightly toward cursor)
- Trust badges fade in sequentially

**Navbar:**
- Active link indicator becomes animated (sliding pill that moves between items using `layoutId`)
- On scroll: navbar border becomes an animated gradient line

**StickyCTA:**
- Entry animation becomes a spring bounce instead of simple slide
- Add subtle pulsing glow on the CTA button

### Phase 7 — Responsive + Performance Pass
- Disable heavy animations on mobile (reduce `float` elements, simplify aurora to static gradient)
- Add `prefers-reduced-motion` media query checks — fall back to simple fades
- Ensure all new animations use `transform` and `opacity` only (GPU-composited, no layout thrash)
- Test all sections at 320px, 375px, 768px, 1024px, 1440px

## What Does NOT Change
- Color system (warm orange primary)
- Section order and content
- Dashboard preview internals
- Feature mini-previews content
- Routing, auth, SEO
- App interior pages
- Footer content/links

## Summary
7 phases, ~8 files. Core changes: Space Grotesk font, aurora backgrounds, floating glassmorphic elements, animated gradient borders, scroll-driven timeline, parallax effects, magnetic buttons, staggered reveals. All CSS/framer-motion — no new dependencies.

