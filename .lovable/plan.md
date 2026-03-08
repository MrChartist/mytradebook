

## Plan: Improve Navbar & Headings for Landing + Docs Pages

Taking inspiration from the dashboard preview's clean, premium aesthetic — the crisp typography, accent-colored active states, and well-spaced layout — we'll elevate the shared floating island navbar and page headings on both Landing and Docs pages.

### What Changes

**1. Extract Shared Navbar Component** (`src/components/landing/LandingNavbar.tsx`)
- Currently, Landing and Docs duplicate nearly identical navbar code. Extract into one reusable component.
- Props: `activePage` ("home" | "docs"), `isInsideApp` (for Docs when accessed from dashboard).
- Improvements inspired by the reference:
  - Slightly taller pill (h-14 consistent) with better internal spacing
  - Nav links get a subtle active underline bar (2px accent bottom border, not just a dot) for the current page
  - Logo area gets a thin separator pipe `|` followed by page context label ("Docs" on docs page) — similar to how the dashboard shows "MAIN" section label
  - "Get Started" CTA button gets a subtle arrow icon (`ArrowRight`) for better affordance
  - Mobile hamburger menu gets smoother slide-down animation with section icons

**2. Landing Page Hero Heading** (`src/components/landing/HeroSection.tsx`)
- No major changes needed — already polished. Minor tweak: ensure the `accent-script` class is used consistently (no inline fontFamily).

**3. Docs Page Hero Heading** (`src/pages/Docs.tsx`)
- Replace inline `fontFamily: "'Dancing Script'"` with the shared `accent-script` CSS class
- Make the hero heading larger on desktop (`text-5xl lg:text-6xl`) to match landing page scale
- Add a subtle gradient text effect on "TradeBook" similar to hero's "Compound It Daily"

**4. Update Landing.tsx and Docs.tsx** to use the shared `LandingNavbar` component, removing duplicate navbar code.

### Files Changed
- **New**: `src/components/landing/LandingNavbar.tsx` — shared navbar component
- **Edit**: `src/pages/Landing.tsx` — replace inline navbar with `<LandingNavbar activePage="home" />`
- **Edit**: `src/pages/Docs.tsx` — replace inline navbar with `<LandingNavbar activePage="docs" />`, update hero heading styles

