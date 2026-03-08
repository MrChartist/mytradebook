

# Remove How It Works + Comparison Table

## Assessment

**How It Works** — The 3-step timeline (Log → Analyze → Automate) repeats what the Features section already communicates. It adds significant scroll depth (~600px) without new information. The hero already has a "60 seconds to start" message and the Features bento grid covers each capability in detail. Removing it tightens the page flow.

**Comparison Table** — The "How we compare" table below pricing is a common SaaS pattern but feels forced here since TradeBook is in free beta with no real competitor pressure needed. Every row shows TradeBook as "true" and others as "false/limited" — it reads as self-congratulatory rather than informative. The pricing cards already list all features. Removing the table makes the pricing section cleaner and more confident.

## Changes

### 1. Remove How It Works section from Landing.tsx
- Delete the `HowItWorksSection` lazy import and its `<Suspense>` block + preceding `<GradientDivider />`
- Page flow becomes: Hero → Features → Pricing → Testimonials → ...

### 2. Remove comparison table from PricingSection
- Delete the `comparisonFeatures` data array (lines 36-47)
- Delete the comparison table JSX block (lines 298-335) inside `PricingSection`
- Keep the trust badges — they add credibility without clutter
- Remove unused imports (`Trophy`, `Minus`) if no longer referenced

### 3. Clean up HowItWorksSection export
- Remove the `HowItWorksSection` function and `steps` data array from `BelowFoldSections.tsx`
- Remove `ComparisonSection` (already returns null)
- Clean up any unused imports (`BookOpen`, `Eye` if only used there)

**Files:** `Landing.tsx`, `BelowFoldSections.tsx`

**Result:** ~200 lines removed, ~800px less scroll depth, tighter conversion funnel: Hero → Features → Pricing → Social Proof.

