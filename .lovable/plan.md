

# Improve "How It Works" Section + Add Missing Landing Page Sections

## Current State
The "How It Works" section (lines 981-1021) already has a 3-step card layout with step number watermarks, icon badges, and dashed connecting lines. It closely matches the reference image but can be polished further.

## Improvements to "How It Works"

### Visual Polish (lines 995-1018)
- **Step number watermark**: Increase opacity from `0.03` to `0.06` and use the accent color (`text-[hsl(var(--tb-accent))]`) with low opacity so it tints orange like the reference image, not invisible gray
- **Connecting lines**: Replace dashed borders with a proper arrow/chevron connector between cards (using small `ChevronRight` icons positioned between columns)
- **Icon badge ring**: Add a subtle outer ring/glow around the icon badge (`ring-4 ring-[hsl(var(--tb-accent)/0.04)]`) to match the reference's double-circle effect
- **Card background**: Use solid `bg-card` instead of `bg-card/80` for more contrast, matching the crisp white cards in the reference
- **Step label**: Add a small "STEP 01" label above the icon badge for extra clarity

### Content Enhancement
- Add a 4th implicit step or a CTA below: "Ready to start? It takes less than 60 seconds" with a button

## New Sections to Add (below "How It Works", above Comparison)

### 1. **Stats/Social Proof Bar** (new section)
A horizontal strip showing key platform metrics with animated counters:
- "500+ Traders" | "12,000+ Trades Logged" | "98% Uptime" | "4.8/5 Rating"
- Uses the existing `useCountUp` hook already in the file
- Clean single-row layout with dividers, accent-colored numbers

### 2. **"Built for Indian Markets" Section** (new section)
A focused callout highlighting India-specific features:
- NSE, BSE, MCX segment support
- INR currency throughout
- Dhan broker integration
- Indian market hours (9:15 AM - 3:30 PM) awareness
- Layout: Left side text + right side showing segment pills (Equity, F&O, Commodity, Currency)

### 3. **FAQ Accordion** (new section, before footer)
Common questions traders would have:
- "Is my data safe?" -- End-to-end encryption, no sharing
- "Can I import from Zerodha/Angel One?" -- CSV import supports all brokers
- "Is it really free during beta?" -- Yes, all features included
- "Does it work on mobile?" -- PWA, works on any device
- Uses Radix Accordion (already installed)

## Technical Changes

### File: `src/pages/Landing.tsx`

**"How It Works" cards (lines 1000-1018):**
- Update watermark styling: `text-[hsl(var(--tb-accent))] opacity-[0.07]` instead of `text-muted-foreground/[0.03]`
- Add "STEP" label above icon
- Add ring effect to icon badge
- Replace dashed border connectors with chevron icons between cards

**New Stats Bar section (~15 lines, inserted after "How It Works"):**
- 4 metrics in a horizontal flex row with `useCountUp`
- Minimal styling with `text-4xl font-bold text-[hsl(var(--tb-accent))]` for numbers

**New "Built for India" section (~30 lines):**
- Two-column layout: headline + description on left, segment badges on right
- Reuses `SectionBadge` and `fadeUp` animation patterns

**New FAQ section (~40 lines, before footer):**
- Import `Accordion, AccordionItem, AccordionTrigger, AccordionContent` from existing Radix components
- 4-5 FAQ items in a max-w-2xl centered container

**New imports:**
- Add `Accordion` components from `@/components/ui/accordion`

### No other files changed
- Only `src/pages/Landing.tsx` is modified

