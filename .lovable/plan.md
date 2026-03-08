

# Docs Page UI/UX Overhaul — Professional, Readable, Modern

## Problems Identified

1. **Logo inconsistency** — Docs navbar uses the raw `logo.png` at `h-[26px]` and the footer uses `favicon-32x32.png`. Neither has a proper text wordmark treatment. The logo should be crisp, consistently sized, and paired with a proper wordmark.

2. **Readability issues** — Content is dense. Section headers blend into content. Body text line-height and paragraph spacing could be more generous. Feature cards have tight padding. The 720px max-width content column is good but some inner elements feel cramped.

3. **Typography hierarchy is flat** — Section titles, topic headings, and sub-topics don't have enough visual differentiation. The `docs-section-title` uses Inter at 30px which looks similar to `docs-topic-heading` at 24px. Section entries need a stronger visual break.

4. **Sidebar UX** — Group labels at `0.65rem` are too small. The search input styling is subtle. Active state could be stronger. Sub-topic links at `0.75rem` are too tiny.

5. **Header area** — The docs header is functional but plain. The "Documentation" title + B&W toggle + meta row feels utilitarian rather than welcoming.

6. **Card and callout spacing** — Feature cards, ProTip callouts, and StepByStep components have inconsistent vertical rhythm. Some have `my-6`, others `my-7`.

7. **Right rail** — "On this page" heading is too faint at `0.45` opacity. Active state could be stronger with a bolder accent.

8. **Mobile topic rail** — Pills are small and the horizontal scroll isn't obvious. Needs edge fade indicators (already has them but styling could be stronger).

9. **Footer** — Uses `favicon-32x32.png` instead of proper logo. Layout is basic.

## Plan

### Phase 1 — Logo & Navbar Polish
**Files:** `DocsNavbar.tsx`, `Docs.tsx` (footer)

- Increase logo height from `h-[26px]` to `h-[30px]` for better visibility
- Add "TradeBook" text wordmark next to logo in navbar (Space Grotesk, 16px, font-weight 600)
- Fix footer to use `logo.png` instead of `favicon-32x32.png`
- Add a subtle bottom border glow to navbar on scroll (match landing page treatment)

### Phase 2 — Typography & Readability Improvements
**File:** `src/index.css`

- Update `.docs-section-title` to use **Space Grotesk** (match landing page heading font) for stronger visual break
- Increase `.docs-body` line-height from 1.72 to 1.78 for better readability
- Increase `.docs-body-lg` line-height from 1.7 to 1.76
- Bump sidebar group labels from `0.65rem` to `0.6875rem` and opacity from `0.4` to `0.5`
- Increase sidebar sub-link font from `0.75rem` to `0.78rem`
- Increase right rail heading opacity from `0.45` to `0.55`
- Add `margin-bottom: 0.5rem` to `.docs-card-content > p` for better paragraph spacing inside cards

### Phase 3 — Section Header Visual Break
**Files:** `Docs.tsx` (SectionHeader component)

- Add a subtle accent line/dot before the section icon to create a stronger visual anchor
- Add top padding/margin to section headers for more breathing room between sections
- Make the section number badge (PhaseHeader) slightly more prominent with a border

### Phase 4 — Card & Callout Spacing Standardization
**File:** `src/index.css`, `DocsEnhancements.tsx`

- Standardize all card/callout vertical margins to `my-6` (24px) consistently
- Add `padding: 1.5rem` minimum to all `.docs-feature-card` inner content areas
- Improve ProTip callout left padding from `pl-7` to `pl-8` for more breathing room from accent bar

### Phase 5 — Sidebar & Right Rail Polish
**Files:** `Docs.tsx`, `src/index.css`

- Make sidebar search input more visible: increase border opacity, add search icon color on focus
- Strengthen active sidebar link: add left accent bar width from `2.5px` to `3px`
- Right rail: increase anchor link font size from `0.78rem` to `0.8125rem`
- Add subtle section dividers between sidebar groups (gradient lines)

### Phase 6 — Header & Footer Refinement
**Files:** `Docs.tsx`

- Add a subtle gradient background or decorative element to the docs header area
- Update footer logo to use `logo.png` with proper sizing
- Add hover states to footer links
- Improve footer spacing and visual hierarchy

### Phase 7 — Mobile Readability Pass
**File:** `src/index.css`

- Increase mobile body font from `0.9375rem` to `0.96875rem` for better mobile readability
- Improve mobile topic rail pill sizing (slightly larger touch targets)
- Add stronger edge fade gradients on mobile topic rail
- Ensure FAQ accordion items have comfortable touch targets on mobile

## What Does NOT Change
- Section content and documentation text
- Sidebar structure and navigation logic
- Color system and theme tokens
- 26-section structure
- Mockup components (DocsMockups.tsx)
- Search functionality
- Right rail scroll-aware behavior

## Summary
~5 files touched. Core changes: logo consistency fix, Space Grotesk for section titles, improved line-heights and spacing, sidebar/right-rail readability improvements, footer logo fix, mobile readability pass. No structural changes — pure UI/UX refinement for professional readability.

