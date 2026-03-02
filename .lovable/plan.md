

# Landing Page Visual Overhaul + Docs Page

## Issues Identified from Screenshot Review

1. **Dark theme kills the "clean SaaS" feel** -- The page renders in dark mode which makes it feel heavy. The inspiration screenshots all use light/white backgrounds. The landing page should force a light theme regardless of user preference.
2. **Too much empty space between hero CTA and dashboard preview** -- There's a large gap with no content.
3. **Dashboard preview is cut off at the bottom** -- The preview needs to be fully visible with stronger visual impact.
4. **Trust strip and stats section feel bland** -- Just text and numbers, no visual richness.
5. **Features section lacks embedded visuals** -- The bento cards need more visual contrast and illustration-style previews.
6. **No Docs page exists** -- User wants a dedicated documentation/about page.

## Plan

### 1. Force Light Theme on Landing Page
- Add a wrapper div with `class="light"` and explicit light background colors on the landing page so it always renders in the light aesthetic regardless of system/user theme.
- This single change will dramatically improve the visual quality to match the inspiration screenshots.

### 2. Hero Section Polish
- Reduce the gap between the CTA trust badges and the dashboard preview.
- Add a subtle animated gradient mesh background (pink/orange/purple pastels) that's visible in light mode.
- Make floating elements more colorful and visible against the light background.

### 3. Dashboard Preview Enhancement
- Add a stronger drop shadow and slight scale-up for more visual dominance.
- Add a subtle light-themed window chrome (white/gray instead of dark).
- Ensure the full dashboard preview is visible without scrolling too far.

### 4. Features Bento Cards -- Visual Richness
- Add colored background tints to each bento card (light pastel versions of each feature's color).
- Add small illustration-style SVG graphics inside cards that don't have mini-previews.
- Increase card padding and add subtle gradient overlays.

### 5. Testimonials Section -- Add Photos/Visual Weight
- Replace single-letter avatars with gradient-colored circles with initials.
- Add a background pattern or subtle gradient behind the testimonials section.

### 6. Pricing Cards -- More Visual Differentiation
- Add a gradient background to the highlighted Pro card.
- Add an animated "Popular" badge with a subtle glow.

### 7. Final CTA -- Add Visual Impact
- Add a full-width gradient background (light orange/pink wash).
- Add floating decorative elements around the CTA.

### 8. New Docs Page (`/docs`)
- Create a new `src/pages/Docs.tsx` page with comprehensive product documentation.
- Sections: Getting Started, Features Overview, Segments Explained, Broker Integration, Alerts & Automation, Analytics Deep Dive, Keyboard Shortcuts, FAQ.
- Clean documentation layout with sidebar navigation and content sections.
- Add route to `App.tsx` (public, no auth required).
- Add "Docs" link to landing page navbar and footer.

## Technical Details

### Files to Create
- `src/pages/Docs.tsx` -- Full documentation page with sidebar nav and multiple content sections

### Files to Modify
- `src/pages/Landing.tsx` -- Force light theme wrapper, visual polish across all sections, reduce gaps, add color tints to bento cards, enhance dashboard preview styling, add Docs link to navbar/footer
- `src/App.tsx` -- Add `/docs` route (public)
- `src/index.css` -- Add `.landing-light` utility class for forced light theme on landing

### Key Visual Changes
- Force light background on entire landing page (white cards, light borders, visible gradients)
- Colored pastel tints on bento feature cards
- Stronger dashboard preview shadow and scale
- Gradient wash on CTA section
- Better floating element visibility
- Docs link in navbar between FAQ and Sign In

### Docs Page Structure
- Hero banner with "Documentation" title
- Sidebar with section links (sticky)
- Content sections: Getting Started, Trade Journaling, Analytics, Alerts, Broker Integration, Keyboard Shortcuts, Segments, FAQ
- Each section with clear headings, descriptions, and feature lists
- Responsive -- sidebar collapses to top nav on mobile
- Uses existing design system components (cards, badges)

