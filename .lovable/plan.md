

# Phase 4 — Performance, SEO & Accessibility

## Current State
- **Bundle splitting**: Already has manual chunks for react, tanstack-query, framer-motion, recharts, supabase. All pages lazy-loaded.
- **Reduced motion**: CSS `prefers-reduced-motion: reduce` already disables animations globally. No framer-motion integration though.
- **Accessibility**: Skip-to-content link, `:focus-visible` ring, ARIA labels on Alerts/Docs. Missing on many pages.
- **SEO**: JSON-LD in index.html, SEOHead component with OG/Twitter tags, sitemap exists but uses wrong domain (`tradebook.mrchartist.com`).
- **Virtualization**: None — trades list renders all rows.
- **No** `@tanstack/react-virtual` installed.

## Plan (grouped into actionable items)

### 1. Virtualized Trade List
**File:** `src/pages/Trades.tsx`
- Install `@tanstack/react-virtual` 
- Wrap the trade card/row list in a virtualized container (only render visible rows)
- Keep mobile swipeable rows working inside the virtualizer
- Estimated 200-500+ trade lists will benefit significantly

### 2. Additional Bundle Splitting
**File:** `vite.config.ts`
- Add chunks for `konva`/`react-konva` (heavy canvas lib), `date-fns`, `lucide-react`, `@radix-ui/*`
- Split `dnd-kit` into its own chunk

### 3. Framer Motion Reduced Motion
**File:** `src/App.tsx`
- Add `<LazyMotion>` + `MotionConfig reducedMotion="user"` wrapper so framer-motion respects OS preference natively (CSS rule alone doesn't affect JS-driven animations)

### 4. Fix Sitemap Domain
**File:** `public/sitemap.xml`
- Replace all `tradebook.mrchartist.com` URLs with `mytradebook.lovable.app`

### 5. Expanded Structured Data
**File:** `index.html`
- Add `BreadcrumbList` schema for key pages
- Add `FAQPage` schema referencing landing page FAQ content

### 6. ARIA & Landmark Audit
**Files:** `src/pages/Trades.tsx`, `src/pages/Journal.tsx`, `src/pages/Analytics.tsx`, `src/pages/Calendar.tsx`, `src/pages/Dashboard.tsx`
- Add `aria-label` to page sections, filter controls, and interactive cards
- Add `aria-live="polite"` to trade count / summary stats that update dynamically
- Add `role="region"` with labels to major dashboard widget groups

### 7. Image Lazy Loading
**Files:** `src/components/landing/HeroSection.tsx`, `src/components/landing/DashboardPreview.tsx`
- Add `loading="lazy"` to any `<img>` tags not already lazy
- Add `width`/`height` attributes to prevent CLS

### 8. Preload Critical Supabase Connection
**File:** `index.html`
- Add `<link rel="preconnect" href="https://nuilpmoipiazjafpjaft.supabase.co" />` for faster API calls on first load

### 9. Meta Robots for Auth Pages
**File:** `src/pages/Login.tsx`, `src/pages/ResetPassword.tsx`
- Add `<SEOHead noIndex />` to prevent indexing of auth pages (robots.txt already blocks but meta is belt-and-suspenders)

### 10. Color Contrast Check
**File:** `src/index.css`
- Audit `--muted-foreground` values in both light/dark themes — current `hsl(20 8% 46%)` on `hsl(30 20% 98%)` background may be below 4.5:1 ratio
- Adjust if needed for WCAG AA compliance

## Files Summary

| Action | File |
|--------|------|
| Install | `@tanstack/react-virtual` |
| Edit | `src/pages/Trades.tsx` — virtualized list |
| Edit | `vite.config.ts` — additional chunks |
| Edit | `src/App.tsx` — MotionConfig reducedMotion |
| Edit | `public/sitemap.xml` — fix domain |
| Edit | `index.html` — structured data, preconnect |
| Edit | `src/index.css` — contrast fix if needed |
| Edit | `src/pages/Login.tsx`, `ResetPassword.tsx` — noIndex |
| Edit | 5 page files — ARIA landmarks |
| Edit | Landing image components — lazy attrs |

No database changes needed.

