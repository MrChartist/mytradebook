

# Refine Pricing Section

## Current State
The pricing section has 3 plan cards (Monthly, Quarterly, Yearly) in a simple grid. The highlighted card has a top accent bar and "Most Popular" pill. All cards list the same 9 features with CheckCircle2 icons. It works but feels repetitive and flat -- every card has identical feature lists, and there's no visual storytelling or urgency.

## Improvements

### 1. Add a "Save X%" Badge on Quarterly and Yearly
Show savings relative to monthly pricing to create urgency:
- Quarterly: "Save 17%" pill badge next to the price
- Yearly: "Save 37%" pill badge
- This gives each card a unique value proposition beyond just a different billing cycle

### 2. Differentiate Feature Presentation
Instead of repeating all 9 features on every card:
- Monthly: Show 5 key features + "Everything included" note
- Quarterly (featured): Show all 9 features (full list reinforces "most popular")
- Yearly: Show 5 key features + "Everything in Quarterly, plus..." with a "Priority support" callout and a "Best Value" badge instead of "Most Popular"

### 3. Visual Polish for Cards
- Add a subtle `dot-pattern` background to the highlighted (Quarterly) card for depth
- Add a shimmering gradient border animation on the highlighted card (reuse the `shimmer-cta` pattern)
- Give the Yearly card a subtle premium feel with a crown or sparkle icon next to "Best Value"
- Add a subtle background glow behind the highlighted card using a radial gradient pseudo-element

### 4. Bottom Trust Strip
Below the pricing cards, add a centered trust strip:
- "No credit card required" with Lock icon
- "Cancel anytime" with a refresh icon
- "14-day money-back guarantee" with Shield icon
- Displayed as pill badges in a flex row (matching the testimonials stats strip pattern)

### 5. Toggle for Monthly/Annual Billing (Visual Only)
Add a toggle switch above the cards that says "Monthly / Annual" -- purely cosmetic during beta since all prices are shown. It scrolls/highlights the relevant card when toggled. This is a common SaaS pattern that builds trust.

### 6. Section Background Enhancement
Add `dot-pattern` to the section background for consistency with testimonials and other sections.

## Technical Changes

### File: `src/pages/Landing.tsx`

**Pricing data (lines 137-150):**
- Add `saveBadge` field: `null` for Monthly, `"Save 17%"` for Quarterly, `"Save 37%"` for Yearly
- Add `badge` field: `null` for Monthly, `"Most Popular"` for Quarterly, `"Best Value"` for Yearly
- Add `shortFeatures` array (5 items) for Monthly and Yearly cards
- Add `icon` field: `null` for Monthly, `Zap` for Quarterly, `Crown` (from lucide) for Yearly

**Section wrapper (line 1113):**
- Change to `py-24 lg:py-32 bg-muted/10 dot-pattern`

**Add billing toggle (after line 1125, before the grid):**
- A decorative toggle component: two buttons ("Monthly" / "Annual") in a pill container
- On click, smoothly scrolls the relevant card into view on mobile
- Uses `bg-muted/50 rounded-full p-1` container with `bg-card` active state

**Card rendering (lines 1127-1184):**
- For highlighted card: wrap in a container with `shadow-glow` and radial gradient background
- Add `saveBadge` pill next to the price (green accent, `bg-profit/10 text-profit rounded-full px-2 py-0.5 text-[10px]`)
- For non-highlighted cards: show `shortFeatures` (5 items) + a "All features included" text note
- For highlighted card: keep full 9-feature list
- Add the `badge` (Best Value / Most Popular) with appropriate icon

**Trust strip (after line 1184, before section close):**
- Add a `motion.div` with 3 trust pills:
  - Lock icon + "No credit card required"
  - RefreshCw icon + "Cancel anytime"  
  - Shield icon + "14-day money-back guarantee"
- Style: `bg-muted/40 rounded-full px-4 py-2 text-sm` with dot separators

### No new files or dependencies needed
- `Crown` icon imported from lucide-react (already available)
- `RefreshCw` icon imported from lucide-react (already available)

