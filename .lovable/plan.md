

## Plan: Pallet Ross-Inspired Hero & Navbar Redesign

Taking inspiration from the reference image — clean white/light background, large elegant serif-like heading, minimal navbar with centered links, and a refined editorial feel.

### Changes

**1. Navbar (`src/components/landing/LandingNavbar.tsx`)**
- Increase font size of nav links from `text-[13px]` to `text-sm` (14px)
- Make nav links more spaced out with `gap-2` instead of `gap-1`
- Increase logo size slightly
- Make "Get Started" CTA button use a solid dark pill style (already done) but bump font size

**2. Hero Section (`src/components/landing/HeroSection.tsx`)**
- **Larger heading**: Bump from current sizes to `text-6xl sm:text-7xl lg:text-8xl xl:text-[6.5rem]` — matching the reference's bold, dominating headline
- **Tighter, cleaner layout**: Remove the gradient text effect on "Compound It Daily" — use solid foreground color instead, matching the reference's clean black text
- **Subtitle**: Increase to `text-xl lg:text-2xl` with more breathing room
- **CTA area**: Make the primary button slightly larger, and style the secondary "Watch Demo" / "Read more" as a plain text link (no icon circle) — matching the reference's minimal "Read more" link
- **Reduce visual noise**: Simplify the social proof pill — make it smaller/subtler
- **Stats bar**: Keep but refine spacing

**3. Font sizing summary (hero heading)**
- Current: `text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem]`
- New: `text-6xl sm:text-7xl lg:text-8xl xl:text-[7rem]`
- Tighter letter-spacing: `tracking-[-0.04em]`
- `font-extrabold` stays

### Files Changed
- `src/components/landing/HeroSection.tsx` — larger heading, cleaner subtitle, refined CTAs
- `src/components/landing/LandingNavbar.tsx` — slightly larger nav link font sizes, better spacing

