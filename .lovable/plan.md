

# Docs Page — Comprehensive UI/UX Improvements

## Issues Identified

1. **Mobile: Content still clips under fixed bars** — `pt-[7rem]` (112px) on the main content area isn't enough on all devices when navbar (52px) + topic rail (~44px) stack. Some content gets hidden.

2. **Mobile: Topic rail groups lack section expansion** — The 6 grouped pills are better than 26, but tapping a group only scrolls to the first section. Users can't see or jump to specific sections within a group without scrolling through everything.

3. **Mobile: No progress indicator** — On a 4500-line page, users have no sense of where they are or how far through the docs they've read. No visual progress bar.

4. **Mobile: Search modal lacks keyboard navigation** — Arrow keys don't cycle through results. Only Enter selects the first match. No hover/focus highlight on results.

5. **Tablet (md-lg breakpoint):** Content area gets cramped between sidebar (250px) and right rail (210px) on ~1024px screens. Right rail should hide at `xl` (it does), but sidebar still eats into narrow screens.

6. **All devices: 26 `motion.section` components with `whileInView`** — Each section creates an IntersectionObserver. Combined with the main scroll observer and right-rail observer, that's ~30+ observers. This causes scroll jank on lower-end devices.

7. **Mobile: Back-to-top button is small (40px)** and positioned at `bottom-6 right-4` — hard to tap on mobile while scrolling a long page.

8. **Desktop: Sidebar "Navigation" label and collapse button** feel disconnected — when collapsed, there's no visual cue that search exists (it's hidden).

9. **Content: PhaseHeader shows "Phase X of 26"** — useful but adds vertical space before every section. On mobile this compounds significantly across 26 sections.

10. **Mobile: No way to jump between adjacent sections** — no "Next Section" / "Previous Section" navigation at the bottom of each section.

## Plan — Prioritized Fixes

### Fix 1: Add reading progress bar (all devices)
- Add a thin (2px) fixed progress bar at the very top of the page (above navbar, `z-[60]`)
- Uses `scrollY / (documentHeight - windowHeight)` to calculate percentage
- Accent-colored gradient, subtle but visible

### Fix 2: Expand mobile topic rail with section drill-down
- When a group pill is tapped, show a secondary row below it with the individual sections in that group
- Animate the secondary row in/out with height transition
- This keeps the primary rail at 6 items but gives access to all 26 sections
- Active section's parent group auto-expands

### Fix 3: Add inter-section navigation on mobile
- At the bottom of each `motion.section`, add a compact "Next: [Section Name] →" link
- On mobile only (`lg:hidden`), helps users progress through docs linearly without scrolling back to the topic rail

### Fix 4: Improve search modal UX
- Add arrow-key navigation through results with visual highlight
- Show section type badge (Section vs Sub-topic) for clarity
- Add result count indicator ("12 results")

### Fix 5: Fix mobile content padding
- Change `pt-[7rem]` to `pt-[8rem]` (128px) on mobile to properly clear navbar + expanded topic rail
- Ensure scroll-mt matches at `scroll-mt-36` (144px) to account for the new two-row topic rail

### Fix 6: Optimize scroll performance
- Remove `whileInView` animation from individual sections — use a single observer + CSS class toggle instead
- Replace 26 `motion.section` wrappers with plain `section` elements that get `.docs-section-visible` class via a shared IntersectionObserver
- Add CSS: `.docs-section-visible { animation: fadeInUp 0.4s ease forwards }`
- This reduces from ~30 observers to 2 (section tracking + right rail anchor tracking)

### Fix 7: Improve back-to-top for mobile
- Increase size to `w-11 h-11` on mobile
- Add a progress percentage label inside the button (tiny text)
- Position at `bottom-5 right-5`

### Fix 8: Hide PhaseHeader on mobile
- Add `hidden sm:block` to `PhaseHeader` to reduce vertical noise on small screens
- The section header with icon is sufficient context on mobile

**Files to edit:** `src/pages/Docs.tsx`

**Impact:** Significantly better mobile navigation with drill-down topic rail, reading progress awareness, smoother scrolling performance, and inter-section navigation. Tablet and desktop also benefit from performance optimizations and search improvements.

