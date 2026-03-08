

# Landing Page Redesign — Modern AI-Era SaaS Aesthetic

## Vision
Transform the landing page from a traditional SaaS layout with blurred lifestyle photos and serif headings into a clean, modern, dark-hero AI-era SaaS site — think Linear, Vercel, Raycast aesthetic. Crisp typography, gradient accents, subtle grid/dot patterns, glass cards, and generous whitespace.

## Font System Change

**Current**: Libre Bodoni (serif display) + Source Sans 3 (body) + JetBrains Mono
**New**: **Inter** (body/UI, clean geometric sans) + **Sora** (display headings, modern geometric with personality) + JetBrains Mono (unchanged)

- Sora gives a futuristic, techy feel for hero headlines without being generic
- Inter is the gold standard for modern SaaS UI text
- Both are Google Fonts, zero cost

## Files Changed

### 1. `index.html`
- Swap Google Fonts from `Source+Sans+3` and `Libre+Bodoni` → `Inter` and `Sora`

### 2. `tailwind.config.ts`
- Update `fontFamily.sans` → `['Inter', 'system-ui', 'sans-serif']`
- Update `fontFamily.heading` → `['Sora', 'Inter', 'sans-serif']`

### 3. `src/index.css`
- Remove `.accent-serif` class (no more italic serif accents)
- Add `.text-gradient` utility for gradient text highlights (primary → orange-pink)
- Add `.dot-pattern` for subtle background texture
- Add `.glow-line` for animated horizontal line accents
- Keep all design tokens (colors, radii, shadows) — no theme changes

### 4. `src/components/landing/HeroSection.tsx` — Full rewrite
**Current**: Blurred lifestyle photo bg, Bodoni serif headline, avatar social proof pill, stats bar
**New**:
- Clean background with subtle dot grid pattern + radial gradient glow (no photo)
- Bold Sora headline with gradient-highlighted keyword: "Know Your **Edge**" → gradient text
- Tighter subtitle in Inter
- Primary CTA button with subtle glow effect + secondary ghost "Watch Demo"
- Animated badge pill: "✨ Free during beta — no card needed"
- Stats bar remains but gets cleaner styling with monospace numbers
- Dashboard preview stays below with slightly refined framing
- Remove parallax scroll on background image (cleaner, faster)

### 5. `src/components/landing/LandingNavbar.tsx` — Refine
- Update to use Inter font (inherits from body)
- Add subtle frosted glass border glow on scroll
- Keep structure — just font/weight adjustments

### 6. `src/components/landing/FeaturesSection.tsx` — Refine
- Replace `.accent-serif` spans with `.text-gradient` spans
- Tighten category pills styling
- Keep bento grid structure — it's already modern
- Add subtle hover glow effect on feature cards

### 7. `src/components/landing/BelowFoldSections.tsx` — Refine all sections
- **HowItWorks**: Replace serif accent → gradient text. Keep timeline layout.
- **Pricing**: Same structure, update accent styling
- **Testimonials**: Same layout, update fonts
- **IndianMarkets**: Same, update accents
- **FAQ**: Same accordion, update accent
- **FinalCTA**: Bigger gradient text headline, keep structure
- **Footer**: Update font family references

### 8. `src/components/landing/LandingShared.tsx`
- Update `SectionBadge` to have a subtle gradient border or glow dot
- Keep motion variants unchanged

### 9. `src/components/landing/StickyCTA.tsx`
- Minor font update (inherits), add subtle border glow

## What Does NOT Change
- Color system (warm orange primary stays)
- Dark/light theme tokens
- Dashboard preview component internals
- Feature mini-previews
- Page structure and section order
- Routing, auth, SEO metadata
- Any app pages (dashboard, trades, etc.)
- JetBrains Mono usage

## Summary
~10 files touched. Core changes: font swap (Sora + Inter), hero background from photo→pattern+gradient, serif accents→gradient text, minor card/badge glow refinements. No structural or routing changes. The app interior stays untouched.

