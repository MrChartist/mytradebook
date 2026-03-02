

# Add Landing Page Floating Island Navbar to Docs Page

## What Changes

Replace the Docs page's current sticky full-width navbar with the same "floating island" pill-shaped navbar used on the Landing and Login pages. This creates visual continuity across all public-facing pages.

## Current vs. After

```text
CURRENT (Docs):
+--full-width-sticky-bar-------------------------------------+
| [Logo TradeBook]                    [ThemeToggle] [Home] [Get Started] |
+------------------------------------------------------------+

AFTER (Docs):
         +--floating-island-pill (max-w-3xl, centered)--+
         | [Logo]  Features  Pricing  Docs  [Theme] [Get Started] |
         +----------------------------------------------+
```

For logged-in users, the right side shows "Dashboard" button instead of "Sign In" + "Get Started" (same logic as now, just in the new shell).

## Technical Changes

### File: `src/pages/Docs.tsx`

1. **Add `motion` import** from `framer-motion` (already used elsewhere in the app)

2. **Replace the navbar block (lines 202-235)** with the floating island navbar:
   - Remove the full-width `sticky top-0` nav and the `h-[3px]` accent bar above it
   - Add a `fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4` motion nav (identical structure to Landing page)
   - Pill-shaped container: `rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg`
   - Center links: "Features" and "Pricing" link to `/#features` and `/#pricing` (navigate to landing page anchors), "Docs" scrolls to top
   - Right side: ThemeToggle + conditional Dashboard/Sign In + Get Started buttons (same logic as current)
   - Entry animation: `initial={{ y: -40, opacity: 0 }}` with spring ease

3. **Add top padding to content** — since the navbar is now `fixed` instead of `sticky`, add `pt-16` to the main content wrapper so the hero isn't hidden behind the navbar

4. **Keep the B&W toggle** in its current position inside the hero section (it's docs-specific, not a navbar concern)

### No other files change. No new dependencies (framer-motion already installed).

