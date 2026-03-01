
# TradeBook — Improvement & SaaS Hardening Plan (v2)

## Current State (Post Phase 1)
- ✅ Subscriptions table + 14-day Pro trial on signup
- ✅ `useSubscription` hook + `PlanGate` component
- ✅ Billing settings tab with plan comparison
- ✅ Trial banner in MainLayout
- ✅ Advanced analytics gated behind Pro
- ⏳ Razorpay payment integration (user will add later)

---

## 🐛 Bugs & Issues Found

### B1: Console Warning — Select ref in PreferencesSettings
`Function components cannot be given refs` warning from Radix Select in PreferencesSettings. Needs `forwardRef` wrapping or prop fix.

### B2: Landing Page Stats Are Fabricated
"2,500+ Traders" and "10,000+ Trades Logged" are hardcoded fake numbers. Should either pull real counts (privacy-safe aggregates) or remove them.

### B3: Footer Links Are Dead
Privacy Policy, Terms of Service, Refund Policy, Documentation, Contact Us, Status Page — all link to `#`.

### B4: Reports "Download PDF" Generates .txt
The download function creates a plain text file, not a real PDF. Unprofessional for a paid SaaS.

### B5: No Feature Gating on Telegram/Dhan/Reports
Only Analytics has PlanGate. Telegram notifications, Dhan broker integration, and weekly reports are not gated per the plan limits.

---

## 🚀 Improvements (Prioritized)

### Priority 1: Complete Feature Gating
| Feature | Gate Level | Where |
|---|---|---|
| Telegram notifications | Pro | TelegramSettings, CreateTradeModal |
| Dhan broker integration | Pro | IntegrationsSettings |
| Weekly reports | Pro | Reports page |
| Trailing SL engine | Pro | CreateTradeModal, TradeAutomation |
| Watchlist creation (>1) | Pro | Watchlist page |
| Trade creation (>50/mo) | Free limit | CreateTradeModal |
| Team features | Team | Future |

### Priority 2: Landing Page Trust & Conversion
1. **FAQ Accordion** — Add 6-8 common questions below pricing
2. **Testimonial Cards** — 3 placeholder testimonials with avatars
3. **Product Screenshot** — Real dashboard screenshot in hero section
4. **Remove fake stats** or replace with real aggregated counts
5. **Proper legal pages** — /terms, /privacy, /refund routes with real content

### Priority 3: Functional Improvements
1. **CSV Trade Import** — Already built per memory, verify it's working
2. **PDF Report Generation** — Use html-to-canvas or a proper PDF library
3. **Forgot Password Flow** — No password reset link on login page
4. **Loading States** — Some pages show blank during data fetch
5. **Empty States** — Improve empty state illustrations across pages

### Priority 4: Dashboard Enhancements
1. **Subscription-aware dashboard** — Show plan badge, trial countdown in sidebar
2. **Usage meter** — Show "X/50 trades used this month" for free users
3. **Quick upgrade CTA** — Contextual upgrade prompts when hitting limits

### Priority 5: Admin Dashboard
1. **Role-gated /admin route** — Using existing `user_roles` table + `has_role()` function
2. **Platform metrics** — Total users, active trials, trade volume
3. **User management table** — View users, their plans, activity
4. **Subscription overview** — MRR tracking (once Razorpay is added)

### Priority 6: Technical Debt
1. **Fix Select ref warning** in PreferencesSettings
2. **Add proper error boundaries** per page
3. **Optimize bundle size** — Lazy load routes with React.lazy
4. **Add meta tags** — SEO title/description per page
5. **PWA improvements** — Offline support, better manifest
6. **Rate limiting** — Add per-user API rate limits in edge functions

### Priority 7: Growth Features
1. **Email notifications** — Welcome email, weekly digest, alert triggers
2. **Public trade sharing** — Shareable trade cards with unique URLs
3. **Referral system** — Invite friends for free Pro days
4. **API access** — REST API for Pro/Team users
5. **Mobile responsiveness audit** — Fix any responsive issues

---

## Implementation Order (Next Steps)

### Immediate (This Session)
1. Gate Telegram, Dhan, Reports, Watchlists, Trade limits behind PlanGate
2. Add usage meter to sidebar/dashboard for free users
3. Add FAQ section to landing page
4. Fix dead footer links with proper legal pages

### Next Session
1. Add testimonials to landing page
2. Build admin dashboard
3. Fix PDF report generation
4. Add forgot password flow
5. Route-level code splitting

### Future Sessions
1. Email notifications (requires email domain setup)
2. Public sharing features
3. Razorpay integration (user-driven)
4. API access for Team plan
