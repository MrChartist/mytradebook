

# Remove FAQ Section + Enhance Docs CTA

## Changes

### 1. `src/pages/Landing.tsx`
- Remove `FAQSection` lazy import (line 20)
- Remove the `<GradientDivider />` + `<Suspense><FAQSection /></Suspense>` block (lines 84-88)
- The Docs CTA that was inside FAQSection will be relocated into its own standalone section before `FinalCTASection`

### 2. `src/components/landing/BelowFoldSections.tsx`
- Delete the entire `FAQSection` component and the `faqs` data array
- Remove `Accordion` imports if no longer used
- Create a new **`DocsCTASection`** export — a standalone, larger section replacing the small card that was inside FAQ:
  - Full-width section with centered layout
  - Larger heading: "Explore the Documentation" with a shimmer accent
  - Descriptive subtitle listing what docs cover (visual guides, feature walkthroughs, analytics tutorials, setup instructions)
  - Prominent "Browse Documentation" button (large, rounded-full, with BookOpen icon + ArrowRight)
  - Feature pills/chips below the button showing doc topics (e.g. "26 Feature Guides", "Visual Mockups", "Step-by-Step Tutorials", "Analytics Deep-Dives")
  - Subtle background glow treatment matching other sections

### 3. `src/pages/Landing.tsx` — add DocsCTASection
- Add lazy import for `DocsCTASection`
- Place it between `IndianMarketsSection` and `FinalCTASection` with a `GradientDivider`

**Flow after changes:** Hero → Features → Pricing → Testimonials → Indian Markets → Docs CTA → Final CTA → Footer

**~60 lines removed** (FAQ + faqs array), **~40 lines added** (DocsCTASection). Net reduction in scroll depth.

