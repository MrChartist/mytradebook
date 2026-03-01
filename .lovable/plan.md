

# Deep Research: SaaS Transformation Plan for TradeBook

## Current State Assessment

TradeBook is a feature-rich trading journal for Indian markets (NSE, MCX) with:
- 10 core pages (Dashboard, Trades, Alerts, Watchlist, Studies, Calendar, Mistakes, Analytics, Reports, Settings)
- Dhan broker integration with live prices
- Telegram notifications
- Multi-segment support (Equity Intraday/Positional, Futures, Options, Commodities)
- Google OAuth + Email/Password auth
- Weekly report generation
- Trailing stop-loss engine

**However, it lacks critical SaaS infrastructure** -- no subscription management, no usage limits enforcement, no billing, no plan gating, and no admin panel. The pricing section on the landing page is purely decorative.

---

## SaaS Gaps Identified (Priority Order)

### 1. No Subscription/Billing System (Critical)
The landing page shows Free/Pro/Team pricing (₹0/₹499/₹1,499) but there is zero billing infrastructure. All users get unlimited access to every feature. This is the single biggest gap preventing monetization.

**Fix**: Integrate Stripe for subscription management with plan-based feature gating.

### 2. No Feature Gating / Plan Enforcement
Every user can create unlimited trades, watchlists, alerts, and access all analytics. The pricing page promises limits (e.g., "50 trades/month" on Free) but nothing is enforced.

**Fix**: Create a `subscriptions` table, a `useSubscription` hook, and gate features behind plan checks (e.g., trade count limits, watchlist limits, analytics access).

### 3. No Admin Dashboard
There is no way to view users, monitor usage, manage subscriptions, or see platform metrics. The `user_roles` table and `has_role()` function exist but are unused in the frontend.

**Fix**: Build an `/admin` page behind role-based access showing user count, active subscriptions, trade volume, and revenue metrics.

### 4. No Usage Analytics / Metering
No tracking of per-user usage (trades logged, alerts created, API calls made). This is needed both for plan enforcement and for understanding user engagement.

**Fix**: Add usage counters either via database queries or a lightweight `usage_metrics` table.

### 5. No Onboarding Funnel / Trial Flow
The landing page CTA goes to `/login` which is a generic auth form. There is no trial activation, no welcome email sequence, and no guided first-trade experience beyond the basic onboarding checklist.

**Fix**: Add a 14-day Pro trial on signup, with a trial banner and upgrade prompts when limits are hit.

### 6. Landing Page Missing Trust Signals
- No testimonials or social proof (the "2,500+ traders" stat is fabricated)
- No product screenshots or demo video
- No FAQ section
- Footer links (Privacy, Terms, Docs) all point to `#`

**Fix**: Add testimonials section, FAQ accordion, product screenshots, and proper legal pages.

### 7. Reports Download is a Text File, Not PDF
The "Download PDF" button generates a `.txt` file. This looks unprofessional for a paid SaaS product.

**Fix**: Generate proper PDF reports using a library or server-side rendering.

### 8. No CSV Import Feature
Active traders need to bulk-import historical trades. Currently, every trade must be logged manually or synced from Dhan only.

**Fix**: Add a CSV import wizard with column mapping and preview.

### 9. No Email Notifications
The platform relies entirely on Telegram for notifications. There is no email notification system (trade alerts, weekly digest, account events).

**Fix**: Add email notification support via backend functions using the configured email domain.

### 10. No Public Sharing / Social Features
No way to share a trade idea, study, or performance report publicly. The `ra_public_mode` field exists in settings but is not implemented.

**Fix**: Add shareable public profile pages and trade idea cards with unique URLs.

---

## Recommended Implementation Phases

### Phase 1: Billing + Plan Gating (Highest Impact)
1. Enable Stripe integration
2. Create `subscriptions` table with plan details
3. Build `useSubscription` hook to check plan limits
4. Add upgrade prompts when Free users hit limits (50 trades, 1 watchlist, no Telegram)
5. Add billing settings tab with plan management
6. Implement 14-day Pro trial on signup

### Phase 2: SaaS Polish
1. Add FAQ section to landing page
2. Add testimonial cards (placeholder data)
3. Create proper Terms of Service and Privacy Policy pages
4. Add product screenshot/mockup to hero section
5. Fix PDF report generation (use proper formatting)
6. Add CSV trade import wizard

### Phase 3: Admin + Metrics
1. Build `/admin` route (role-gated)
2. Show platform metrics: total users, MRR, active subscriptions, trade volume
3. User management table with plan info
4. Usage monitoring per user

### Phase 4: Growth Features
1. Email notifications (weekly digest, alert triggers)
2. Public trade sharing / RA mode
3. Referral system
4. API access for Pro/Team plans

---

## Technical Details

### Stripe Integration
- Use Lovable's built-in Stripe connector
- Create products for Free, Pro (₹499/mo), and Team (₹1,499/mo) plans
- Webhook edge function to handle subscription lifecycle events
- Store subscription status in a `subscriptions` table

### Plan Gating Logic
```text
Free Plan Limits:
  - 50 trades/month
  - 1 watchlist
  - Basic analytics (no segment breakdown, no time analysis)
  - No Telegram notifications
  - No broker integration
  - No weekly reports

Pro Plan:
  - Unlimited trades
  - 10 watchlists
  - Full analytics
  - Telegram + alerts
  - Broker integration
  - Weekly reports
  - Trailing SL engine

Team Plan:
  - Everything in Pro
  - 5 team members
  - Shared studies
  - RA compliance mode
  - API access
```

### Database Changes
- New `subscriptions` table: `user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_start, current_period_end, trial_ends_at`
- RLS: Users can only view their own subscription
- Trigger: Auto-create Free subscription on signup

### Feature Gate Component
A `<PlanGate plan="pro">` wrapper component that shows an upgrade prompt instead of the gated content for free users.

