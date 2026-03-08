# TradeBook — 5-Phase Improvement Plan

> Master roadmap covering website, docs, missing features, and polish.
> Last updated: March 2026

---

## Phase 1: Landing Page & Conversion Optimization
**Goal:** Make the first impression unforgettable and maximize sign-up conversions.

### Missing / To Improve
- [ ] **Live Dashboard Preview** — replace static mockup with an animated, interactive mini-dashboard on the hero section (show real-looking equity curve, P&L ticking up, alerts firing)
- [ ] **Feature comparison table** — detailed TradeBook vs Excel vs other journals (currently basic)
- [ ] **Video walkthrough embed** — hero section "Watch Demo" button currently has no video; record and embed a 90-second Loom/YouTube
- [ ] **Social proof counter** — "1,200+ traders" is hardcoded; connect to real user count from DB
- [ ] **Trust badges** — add SSL, data encryption, "Made in India" trust strip below hero
- [ ] **Pricing toggle** — add Monthly/Annual toggle with discount badge (currently static)
- [ ] **Mobile landing navbar** — hamburger menu items need better spacing and CTA prominence
- [ ] **Exit-intent popup** — show "Start free trial" modal when user is about to leave (desktop)
- [ ] **Loading skeleton** — below-fold lazy sections show a spinner; replace with content skeletons
- [ ] **OG image update** — current og-image.png may be outdated; regenerate with latest branding

### Files to Touch
- `src/pages/Landing.tsx`
- `src/components/landing/HeroSection.tsx`
- `src/components/landing/BelowFoldSections.tsx`
- `src/components/landing/DashboardPreview.tsx`
- `public/og-image.png`

---

## Phase 2: Documentation Completeness & Quality
**Goal:** Every feature documented with visual mockups, zero gaps.

### Missing Docs Sections (not yet in docs)
- [ ] **Sharing & Social Cards** — P&L Share Modal, Trade Share Modal, Streak Share Card (components exist but no dedicated docs section)
- [ ] **Achievements & Gamification** — Badge grid, unlock conditions, progress tracking (component exists: `AchievementsBadgeGrid.tsx`)
- [ ] **Position Sizing Calculator** — risk-per-trade calculator built into trade creation (component exists: `PositionSizingCalculator.tsx`)
- [ ] **Trading Rules Checklist** — pre-trade discipline checklist (component exists: `TradingRulesChecklist.tsx`)
- [ ] **Trade Coach Panel** — AI-powered coaching per trade (component exists: `TradeCoachPanel.tsx`)
- [ ] **Multi-Leg Strategies** — options strategy builder (component exists: `MultiLegStrategyModal.tsx`)
- [ ] **Smart Alert Suggestions** — AI-suggested alerts based on portfolio (component exists: `SmartAlertSuggestions.tsx`)
- [ ] **Drawdown Recovery Analysis** — how long to recover from max drawdown (mentioned in roadmap but not documented)
- [ ] **Risk-Reward scatter charts** — actual R:R vs planned R:R visualization
- [ ] **Day of Week Analysis** — separate detailed section (currently bundled in "Time-Based Heatmaps")

### Docs UX Improvements
- [ ] **Search across docs content** — current sidebar search only filters section names, not body text
- [ ] **Deep-link anchors** — clicking a FeatureCard title should update URL hash for sharing
- [ ] **Print/PDF export** — "Download as PDF" button for offline reading
- [ ] **Reading time estimate** — show estimated reading time per section
- [ ] **Interactive mockups** — some mockups should have hover states or click interactions
- [ ] **Video placeholders** — all 3 video placeholders still say "Coming Soon"; record or remove
- [ ] **Mobile docs sidebar** — horizontal scroll tabs are hard to use with 21 items; add a dropdown

### Files to Touch
- `src/pages/Docs.tsx`
- `src/components/docs/DocsMockups.tsx`

---

## Phase 3: Core Feature Gaps & Polish
**Goal:** Ship missing functionality that users expect but doesn't exist yet.

### Missing Features
- [ ] **Drawdown Recovery Analysis widget** — chart showing recovery time from each drawdown period (analytics page)
- [ ] **Trade Similarity Engine** — "This trade looks like 5 previous trades where you won 4/5" (requires vector embeddings or simple feature matching)
- [ ] **Streak share from dashboard** — direct "Share Streak" button on the StreakDiscipline widget
- [ ] **Bulk trade actions** — select multiple trades → bulk close, bulk tag, bulk delete
- [ ] **Trade duplication** — "Clone this trade" for similar setups
- [ ] **Alert → Trade conversion** — when an alert triggers, one-click to create a trade with pre-filled data
- [ ] **Study → Trade linking improvements** — show linked trades inside study detail, not just the other way
- [ ] **Journal streak tracking** — track consecutive days with journal entries written
- [ ] **Custom dashboard widgets** — user-created KPI cards with custom formulas
- [ ] **Instrument favorites** — star instruments across the app for quick access everywhere
- [ ] **Option Greeks display** — show delta, gamma, theta, vega for F&O trades
- [ ] **P&L by broker** — if multiple brokers connected, show performance per broker
- [ ] **Trade notes markdown** — support basic markdown in trade notes (bold, lists, links)
- [ ] **Data backup/restore** — one-click full account backup to JSON

### UX Polish
- [ ] **Instrument Picker UX** — implement the combobox pattern, keyboard nav, chip-style selection (from existing plan)
- [ ] **Loading states consistency** — some pages use skeletons, others use spinners; standardize
- [ ] **Empty states** — some pages lack good empty states (e.g., first visit to Analytics with no trades)
- [ ] **Error boundary improvements** — current ErrorBoundary is basic; add retry button and error reporting
- [ ] **Form validation feedback** — some forms show errors only on submit; add real-time validation
- [ ] **Confirmation dialogs** — some destructive actions lack confirmation (e.g., deleting watchlist items)

### Files to Touch
- `src/pages/Analytics.tsx` (drawdown recovery)
- `src/components/trade/InstrumentPicker.tsx` (combobox refactor)
- `src/pages/Trades.tsx` (bulk actions)
- `src/components/dashboard/StreakDiscipline.tsx` (share button)
- New components as needed

---

## Phase 4: Performance, SEO & Accessibility
**Goal:** Fast load times, great SEO, and WCAG-compliant accessibility.

### Performance
- [ ] **Bundle analysis** — audit bundle size; the app has 100+ components, many may be loaded eagerly
- [ ] **Code splitting** — lazy-load analytics components (recharts is heavy), modal components, and settings tabs
- [ ] **Image optimization** — convert PNGs to WebP, add width/height attributes, lazy-load below-fold images
- [ ] **React Query optimization** — review stale times, add proper prefetching for likely navigations
- [ ] **Virtualized lists** — trades list and watchlist items should use virtualization for 500+ items
- [ ] **Service Worker caching** — PWA service worker should cache API responses for offline analytics viewing
- [ ] **Font optimization** — preload critical fonts, use `font-display: swap`

### SEO
- [ ] **Structured data** — add FAQ schema to landing page FAQ section, BreadcrumbList to docs
- [ ] **Sitemap update** — `public/sitemap.xml` may be missing newer pages (Docs, Fundamentals, etc.)
- [ ] **Canonical URLs** — ensure all pages have proper canonical tags
- [ ] **Meta descriptions** — audit all pages for unique, keyword-rich meta descriptions
- [ ] **robots.txt review** — ensure crawl directives are correct
- [ ] **Internal linking** — docs should link to relevant app pages, landing should deep-link to docs sections
- [ ] **Alt text audit** — ensure all images have descriptive alt text

### Accessibility
- [ ] **ARIA labels** — audit all interactive elements for proper ARIA attributes
- [ ] **Keyboard navigation** — ensure all modals, popovers, and dropdowns are fully keyboard-navigable
- [ ] **Color contrast** — verify all text meets WCAG AA contrast ratios in both light and dark modes
- [ ] **Focus indicators** — ensure visible focus rings on all interactive elements
- [ ] **Screen reader testing** — test critical flows (create trade, set alert) with screen readers
- [ ] **Skip navigation link** — add "Skip to main content" link for keyboard users
- [ ] **Reduced motion** — respect `prefers-reduced-motion` for all animations

### Files to Touch
- `src/App.tsx` (lazy loading)
- `src/main.tsx` (font preloading)
- `public/sitemap.xml`
- `public/robots.txt`
- `index.html` (meta, preloads)
- All component files (a11y audit)

---

## Phase 5: Growth, Monetization & Community
**Goal:** Activate monetization, build community features, and enable viral growth.

### Monetization
- [ ] **Stripe/Razorpay integration** — connect payment provider for Pro plan subscriptions
- [ ] **Plan enforcement** — actually gate features behind plan limits (currently all unlocked in beta)
- [ ] **Usage tracking** — track trade count per month for plan limit enforcement
- [ ] **Upgrade prompts** — contextual "Upgrade to Pro" prompts when users hit free limits
- [ ] **Trial expiry flow** — email reminders at 3 days, 1 day before trial ends
- [ ] **Referral program** — "Invite a trader, get 1 month free" referral system
- [ ] **Annual billing discount** — 20% off for annual subscriptions

### Community & Social
- [ ] **Public trader profiles** — opt-in public journal with RA-compliant disclaimer
- [ ] **Leaderboard** — anonymous win-rate / streak leaderboard (opt-in)
- [ ] **Trade idea sharing** — share studies/trade ideas with the community
- [ ] **Comment system** — allow comments on shared studies/trades
- [ ] **Social login** — Google OAuth for faster signup (infrastructure exists in Supabase)

### Notifications & Engagement
- [ ] **Email notifications** — weekly summary email with P&L, win rate, and insights
- [ ] **Push notifications** — PWA push notifications for alerts (requires service worker updates)
- [ ] **In-app notification center** — bell icon with unread count, notification history
- [ ] **Onboarding email drip** — 5-email sequence for new users (Day 1, 3, 5, 7, 14)

### Integrations
- [ ] **Zerodha Kite integration** — auto-sync trades and live prices from Zerodha
- [ ] **Angel One integration** — third broker option for wider market coverage
- [ ] **TradingView webhook** — receive TradingView alerts directly into TradeBook alerts
- [ ] **Google Sheets export** — one-click sync trade data to a Google Sheet
- [ ] **Webhook API** — public API for custom integrations (zapier, custom bots)

### Files to Touch
- New edge functions for payments, notifications
- `src/hooks/useSubscription.ts` (plan enforcement)
- `src/components/PlanGate.tsx` (gate improvements)
- New pages: PublicProfile, Leaderboard, NotificationCenter
- `supabase/functions/` (new functions for webhooks, emails)

---

## Priority Matrix

| Priority | Phase | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 P0 | Phase 3 | Instrument Picker UX refactor | Medium |
| 🔴 P0 | Phase 2 | Document all missing features | Low |
| 🟡 P1 | Phase 1 | Landing page video + social proof | Medium |
| 🟡 P1 | Phase 4 | Bundle optimization + code splitting | Medium |
| 🟡 P1 | Phase 3 | Bulk trade actions | Medium |
| 🟢 P2 | Phase 5 | Payment integration | High |
| 🟢 P2 | Phase 4 | Full a11y audit | Medium |
| 🟢 P2 | Phase 5 | Zerodha integration | High |
| 🔵 P3 | Phase 5 | Public profiles & leaderboard | High |
| 🔵 P3 | Phase 3 | Trade Similarity Engine | Very High |

---

## Completed ✅
- [x] AI Pattern Detection — behavioral insights (v3.0)
- [x] Sector Rotation Heatmap (v3.0)
- [x] Setup Win-Rate Matrix (v3.0)
- [x] Emotional P&L Correlation (v3.0)
- [x] Dashboard drag-and-drop reordering (v2.9)
- [x] Floating Trade Ticker (v2.9)
- [x] Animated KPI numbers (v2.9)
- [x] Mobile swipe-to-act on trades (v2.9)
- [x] Quick Trade Entry via Command Palette (v2.9)
- [x] Stock Screener with 47 presets (v2.8)
- [x] Portfolio Heat Map widget (v2.7)
- [x] Daily Review Wizard (v2.7)
- [x] Multi-leg strategy support (v2.6)
- [x] TSL profiles per segment (v2.6)
- [x] AI Trade Insights (v2.6)
- [x] Trade Templates & Smart Suggestions (v2.5)
- [x] CSV Import/Export (v2.5)
- [x] Offline trade queue (v2.5)
- [x] Docs: AI Pattern Detection, Sector Rotation, Win-Rate Matrix, Emotional P&L documented
- [x] Docs: Share Cards, Achievements, Floating Ticker, Animated Numbers documented
- [x] Docs: Changelog updated with v2.9 and v3.0
