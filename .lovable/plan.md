

# Whole-Site Improvement Audit — Findings & Plan

After reviewing every page, component, and configuration file, here are the actionable improvements grouped by category.

---

## 1. Landing Page & Conversion

| Issue | Where | Fix |
|-------|-------|-----|
| Newsletter form is fake — shows a DOM-injected toast, doesn't save email anywhere | `FooterSection` in `BelowFoldSections.tsx` | Store email in a `newsletter_subscribers` table |
| "1,200+ traders · 42,000+ trades" is hardcoded | `FinalCTASection` line 505, `HeroSection` statsConfig | Pull real counts from DB or at minimum make configurable |
| Footer "Resources" duplicates "Documentation" from "Product" column | `FooterSection` lines 628-639 | Replace duplicate with Blog, Changelog, or API links |
| Footer social links only has email — no Twitter/X, no Discord, no YouTube | `FooterSection` line 601 | Add social media links |
| No FAQ section on the landing page (only in structured data) | Landing page | Add a visible FAQ accordion section before Final CTA |
| Missing "Testimonials" section `id` for anchor navigation | `TestimonialsSection` | Add `id="testimonials"` |

## 2. SEO & Technical

| Issue | Where | Fix |
|-------|-------|-----|
| Sitemap missing `/landing` redirect page (minor) but more importantly missing crawlable public pages like `/trader/:userId` pattern | `sitemap.xml` | Not critical since public profiles are dynamic, but add a note |
| Login page is in sitemap but also has `noIndex` — contradictory | `sitemap.xml` line 21 + `Login.tsx` | Remove `/login` from sitemap since it's noIndexed |
| No `twitter:site` or `twitter:creator` meta tags | `SEOHead.tsx` | Add Twitter handle if available |
| `index.html` has duplicate JSON-LD with `Landing.tsx` SEOHead — same FAQPage schema rendered twice on `/` | `index.html` + `Landing.tsx` | Remove FAQ JSON-LD from `index.html` (let Landing handle it) or remove from Landing |
| PWA manifest `start_url` is `/` (landing) — should be `/dashboard` for logged-in users | `vite.config.ts` | Change to `/dashboard` since PWA users are logged in |
| Missing `apple-touch-icon` at 180x180 — currently using 192x192 as fallback | `index.html` | Generate proper 180x180 icon or note limitation |
| CSP blocks connections to Google auth, YouTube embeds, and external image sources users might paste | `index.html` line 29 | Add `accounts.google.com` to connect-src, `youtube.com` to frame-src |

## 3. UX & Functional Gaps

| Issue | Where | Fix |
|-------|-------|-----|
| Dashboard eagerly imports ALL widget components — no code splitting for heavy widgets like `AITradeInsights`, `PortfolioHeatMap` | `Dashboard.tsx` | Lazy-load individual widgets |
| `Trades` page calls `useTrades()` twice — once with filters, once without for counts — doubles the data fetch | `Trades.tsx` lines 114, 118 | Use a single fetch and compute counts client-side |
| `handleCalendarDayClick` in Dashboard navigates to `/calendar` but ignores the clicked date | `Dashboard.tsx` line 137-139 | Pass date as query param: `/calendar?date={dateStr}` |
| Empty state missing on Analytics page when no closed trades exist | `Analytics.tsx` | Already has `EmptyState` import — verify it's used for zero-trade scenario |
| Watchlist, Reports, Mistakes pages lack `SEOHead` | Multiple pages | Add SEOHead with noIndex (protected routes) |
| Mobile bottom nav doesn't highlight active route for all pages (Fundamentals, Calendar, Mistakes) | `MobileBottomNav.tsx` | Verify coverage |
| Keyboard shortcuts use bare number keys (1-6) for navigation — conflicts with typing in search or any text field that isn't input/textarea | `useKeyboardShortcuts.ts` | Already checks for input/textarea — but contentEditable divs in journal might not be caught |

## 4. Performance

| Issue | Where | Fix |
|-------|-------|-----|
| CSS file is 2,081 lines — contains landing page animations, docs styles, and app styles all bundled | `index.css` | Split critical CSS or rely on Vite's cssCodeSplit |
| `vendor-canvas` chunk (konva + react-konva) loaded even if user never visits share card feature | `vite.config.ts` | Make share card modal lazy-import konva |
| `html-to-image` and `canvas-confetti` are in the main bundle | `package.json` | Dynamically import only when needed |
| Dashboard loads `JournalCalendarView` component even when widget is hidden | `Dashboard.tsx` | Conditionally render only when `streakCalendar` widget is visible |

## 5. Security & Auth

| Issue | Where | Fix |
|-------|-------|-----|
| CSP `script-src 'unsafe-inline'` weakens XSS protection | `index.html` | Move inline scripts to external files, use nonce-based CSP |
| `ErrorBoundary` stores errors in localStorage with no size limit beyond 10 entries — could store sensitive data | `ErrorBoundary.tsx` | Strip any user data from error payload |
| Password minimum length is only 6 characters (line 67 of Login) | `Login.tsx` | Increase to 8 minimum |

## 6. Content & Polish

| Issue | Where | Fix |
|-------|-------|-----|
| Footer "Not SEBI registered · For educational purposes only" disclaimer should also appear on public profile pages | `PublicProfile.tsx` | Add disclaimer |
| Terms and Privacy pages — verify `lastmod` dates in sitemap match actual content dates | `sitemap.xml` | Update dates when content changes |
| `VideoModal` component exists but no actual video content — "Watch Demo" button leads to an empty modal | `VideoModal.tsx` | Either add a demo video or remove the button |

---

## Recommended Implementation Priority

**High Impact, Low Effort:**
1. Remove `/login` from sitemap (contradicts noIndex)
2. Fix duplicate `useTrades()` call on Trades page
3. Pass date to Calendar when clicking Dashboard calendar
4. Add visible FAQ section to landing page
5. Fix CSP to allow Google OAuth and YouTube embeds
6. Change PWA `start_url` to `/dashboard`

**Medium Impact, Medium Effort:**
7. Make newsletter form functional (save to DB)
8. Lazy-load Dashboard widgets
9. Dynamic import for konva/canvas-confetti/html-to-image
10. Add social links to footer
11. De-duplicate FAQ JSON-LD (index.html vs Landing.tsx)

**Lower Priority:**
12. Replace hardcoded social proof numbers
13. Split CSS
14. Add SEOHead to all protected pages
15. Remove or populate VideoModal with real content

