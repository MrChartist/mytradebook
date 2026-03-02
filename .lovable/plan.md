

# Landing Page Visual Refinement -- Manila-Inspired Redesign

## Current Issues
The landing page exists but the user is authenticated, so it redirects to dashboard. The code is ~1000 lines with all the right sections but needs visual refinement to match the Manila screenshot's clean, airy aesthetic more closely.

## Key Visual Improvements (Inspired by Screenshot)

### 1. Hero Section -- Cleaner Typography & Layout
- Make the headline use a mix of regular weight and **italic cursive** for the accent word (like Manila's "performance" in italic)
- Add a subtle **gradient background wash** (soft pink/orange/purple like Manila's top gradient)
- Increase whitespace above and below the hero
- Make the email input + CTA more prominent with a clean pill shape and proper contrast

### 2. Trust Strip -- Logo Row Polish
- Match Manila's clean horizontal logo strip with more spacing
- Add "Trusted by top-tier product companies" style subtitle text
- Increase logo opacity and add a subtle separator line

### 3. Dashboard Preview -- More Realistic & Polished
- Add subtle rotation/perspective like Manila's floating dashboard screenshots
- Add decorative shadow layers underneath for depth
- Clean the "Dashboard" text watermark effect like Manila's faded "Manila" text behind the preview

### 4. Features Bento Grid -- Manila's Card Style
- Redesign bento cards to match Manila's style: white cards with clear titles, descriptions, and embedded mini-UI previews inside the cards
- Add avatar groups, tag chips, and mini form elements inside feature cards for visual richness
- Use varied card heights and content types (some with images, some with stats, some with UI mockups)

### 5. Section Headers -- "Get your money's worth" Style
- Use the Manila-style large serif/bold headline with a cursive accent word
- Add descriptive subtitle underneath
- Remove the pill badge above sections (or make it more subtle)

### 6. Overall Polish
- Increase `max-w` containers slightly for more breathing room
- Soften the radial glow behind the hero (more pastel, less orange)
- Add subtle noise/grain texture overlay for depth
- Ensure dark mode still looks great with all changes

## Technical Plan

### File: `src/pages/Landing.tsx` (full rewrite of JSX layout)
- Rework the hero gradient to use a soft multi-color radial wash (pink, orange, purple blended)
- Increase hero heading to `text-6xl lg:text-8xl` with tighter line-height
- Redesign bento grid cards to include inline UI mockups (avatar stacks, tag chips, mini progress bars)
- Add a faded watermark text behind the dashboard preview ("Dashboard" in large faded text, like Manila's approach)
- Polish the trust strip with better spacing and a descriptive tagline
- Refine pricing cards with more whitespace and cleaner typography
- Polish footer with slightly more padding

### File: `src/index.css` (minor additions)
- Add a `.gradient-hero-bg` utility class for the soft multi-color hero gradient
- Add subtle text-shadow utilities for watermark effects

## Section-by-Section Changes

### Hero
- Soft gradient background (pink-to-orange-to-purple radial gradient, very subtle)
- Larger, bolder headline with cursive accent word
- Email input pill with "Get Access" button side-by-side
- Micro trust badges below CTA (checkmarks with text)
- Floating decorative elements remain but with softer opacity

### Dashboard Preview
- Add large faded text "Dashboard" behind the preview (watermark effect like Manila)
- Keep the perspective tilt but soften the shadow
- Slightly wider container for the preview

### Features Section ("Get your money's worth" style heading)
- Large bold heading with cursive accent word
- Bento grid with varied card content:
  - Card 1 (large): Trade journal with mini UI preview inside showing tags, hourly rate selector style elements
  - Card 2: Analytics with avatar stack showing team/user badges
  - Card 3: Progress tracking with mini progress bar inside
  - Card 4: Alerts with a mini notification card preview
  - Card 5-6: Smaller utility cards

### Stats, How It Works, Comparison, Pricing, Testimonials, FAQ, Footer
- Keep existing structure but apply Manila's cleaner typography and spacing
- Reduce visual noise, increase whitespace
- Softer borders and shadows throughout

