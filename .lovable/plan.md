

# Docs Page — UI/UX Issues & Improvements

## Issues Found

### 1. Stale "FAQ" footer link
The docs footer (line 4360) has `{ label: "FAQ", href: "#faq" }` which scrolls to the FAQ section. This section still exists in the docs page itself (it's a docs FAQ, separate from the landing FAQ we removed). This is fine — **no change needed here**.

### 2. Mobile content hidden behind fixed topic rail
The main content has `pt-[7rem]` (line 843) on mobile to clear both the navbar (3.25rem) and the fixed mobile topic rail. However, the mobile topic rail sits at `top-[3.25rem]` and adds ~44px. The `pt-[7rem]` (112px) should be sufficient, but on smaller phones this can clip. The `scroll-mt-28` on section headers (112px) may not fully clear both bars.

### 3. 26 sections in mobile horizontal scroll is overwhelming
The mobile topic rail shows all 26 sections as horizontal pills — users have to scroll extensively to find anything. This is a significant UX issue on mobile.

### 4. No search on mobile
The docs sidebar search is desktop-only. Mobile users have no way to quickly find a section beyond scrolling the 26-pill topic rail. The navbar search button exists but it tries to focus a sidebar input that doesn't exist on mobile.

### 5. Page is 4,389 lines — massive single file
This causes slow initial render and poor code maintainability. Not a user-visible bug but impacts performance.

### 6. Footer still shows "FAQ" in Resources — points to #faq which exists, so this is OK.

### 7. Back-to-top button overlaps mobile bottom nav
The button is `bottom-20 lg:bottom-6` which is 80px on mobile. This should clear the mobile bottom nav but the docs page doesn't use MainLayout/MobileBottomNav, so this padding is unnecessary — not a bug but wasted space.

### 8. Mobile topic rail lacks visual feedback for scroll position
No indicator showing there are more items to the left/right beyond the edge fade gradients.

### 9. Content padding inconsistency
Desktop content max-width is 720px inside a 1440px container with sidebar + right rail. On tablet (lg breakpoint), when sidebar is 250px + right rail 210px, the content area can get quite cramped.

## Plan — Priority Fixes

### Fix 1: Add mobile search modal (DocsNavbar)
- Wire the `onSearchOpen` callback from DocsNavbar to open a simple search dialog on mobile
- In `Docs.tsx`, add state for search modal open, pass `onSearchOpen` prop to `DocsNavbar`
- Create a lightweight search modal that filters SECTIONS and scrolls to the selected one

### Fix 2: Group mobile topic rail into categories
- Instead of 26 flat pills, show the 6 group labels (Getting Started, Core Features, Advanced, Social & AI, Settings & Tools, Help) as primary pills
- Tapping a group scrolls to its first section
- Reduces cognitive load from 26 → 6 items

### Fix 3: Fix scroll-mt on section headers for mobile
- Change `scroll-mt-28` (112px) to `scroll-mt-32` (128px) on `SectionHeader` to properly clear navbar + topic rail on mobile

### Fix 4: Fix back-to-top positioning
- Since docs page has no MobileBottomNav, change `bottom-20` to `bottom-6` for all breakpoints

### Fix 5: Footer — replace "FAQ" with "Support" linking to mailto
- The FAQ section on docs is at the very bottom and not the most useful footer link. Replace with a more useful link.

**Files:** `src/pages/Docs.tsx`, `src/components/docs/DocsNavbar.tsx`

**Impact:** Mobile usability significantly improved — searchable docs, simpler navigation, correct scroll offsets.

