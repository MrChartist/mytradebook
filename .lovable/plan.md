

# Final Production Readiness Pass

Your app already has solid foundations (code splitting, SEO, CSP, error boundary, a11y, PWA). This plan addresses the **remaining gaps** found during audit.

---

## What's Already Done (no changes needed)
- Route-level code splitting with React.lazy
- SEOHead component with OG/Twitter tags on Landing, Docs, Login
- Content Security Policy meta tag
- ErrorBoundary with localStorage logging
- Skip-to-content link, focus-visible rings, prefers-reduced-motion
- PWA manifest, service worker update prompt, 5MB cache limit
- Font preloading and preconnect hints
- robots.txt and sitemap.xml

---

## Remaining Items

### 1. Add SEOHead to All Public Pages (noIndex on auth pages)

Add `<SEOHead>` to pages that are currently missing it:

| Page | Title | noIndex? |
|------|-------|----------|
| NotFound | "Page Not Found" | yes |
| Terms | "Terms of Service" | no |
| Privacy | "Privacy Policy" | no |
| ResetPassword | "Reset Password" | yes |

Protected pages (Dashboard, Trades, etc.) don't need SEO since they're behind auth, but the 404 page should have `noIndex` to prevent search engines from indexing error pages.

### 2. Upgrade 404 Page

The current NotFound page is very basic. Improve it with:
- SEOHead with `noIndex: true`
- Branded styling consistent with the rest of the app (use the ErrorBoundary card pattern)
- A proper "Go Home" button instead of a plain link
- HTTP status awareness (show the attempted path)

### 3. Web Vitals Monitoring

Add lightweight **Core Web Vitals** reporting in `main.tsx` using the browser's native `PerformanceObserver` API (no new dependencies). Log LCP, FID, and CLS to `localStorage` under `tb_perf_log` for diagnostics.

### 4. Image Lazy Loading Utility

Create a reusable `LazyImage` component that uses `loading="lazy"` and `decoding="async"` HTML attributes, plus a fade-in transition on load. This benefits the Landing page which has several decorative elements.

### 5. Security: Fix RLS "Always True" Warning

The database linter flagged an overly permissive RLS policy using `USING (true)` for write operations. Audit and tighten the affected policy to scope writes to the authenticated user (`auth.uid() = user_id`).

### 6. Add `lastmod` to Sitemap

Update `sitemap.xml` entries with `<lastmod>` dates so search engines know when content was last updated.

---

## Technical Details

### Files Created:
- `src/components/ui/lazy-image.tsx` -- reusable LazyImage component

### Files Modified:
- `src/pages/NotFound.tsx` -- branded 404 with SEOHead
- `src/pages/Terms.tsx` -- add SEOHead
- `src/pages/Privacy.tsx` -- add SEOHead
- `src/pages/ResetPassword.tsx` -- add SEOHead with noIndex
- `src/main.tsx` -- add Web Vitals observer (15 lines)
- `public/sitemap.xml` -- add lastmod dates

### Database Migration:
- Tighten the flagged RLS policy from `USING (true)` to proper user-scoped conditions

### No new dependencies required.

