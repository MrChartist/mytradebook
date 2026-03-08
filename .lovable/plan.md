

# Phase 5 — Growth & Monetization

Phase 5 covers 21 items across payments, plan enforcement, community features, notifications, and integrations. Given the scope, this plan focuses on what can be built now and defers items requiring external setup (Zerodha API partnership, email drip campaigns, etc.).

## Current State
- **Billing UI** exists in `BillingSettings.tsx` with 3 plans (Monthly/Quarterly/Yearly), all disabled buttons
- **Subscription table** exists in DB with `plan`, `status`, `payment_provider`, `provider_subscription_id` columns
- **`useSubscription`** hook exists but hardcodes `effectivePlan: "pro"` — no real enforcement
- **`PlanGate`** component wraps 4 areas (Reports, Analytics AI, Analytics segments, Integrations) but always renders children
- **`TrialBanner`** returns null
- **`handle_new_user_subscription`** DB trigger creates a subscription with `plan: 'pro'`, `status: 'trialing'`, `trial_ends_at: now() + 14 days`
- Google OAuth already works

## Prioritized Implementation (10 actionable items)

### 1. Enable Stripe Payments
- Use Lovable's Stripe integration to create products/prices for Monthly (₹199), Quarterly (₹499), Yearly (₹1,499)
- Create checkout edge function + webhook handler for subscription lifecycle
- Update `BillingSettings.tsx` with working checkout buttons + manage subscription link

### 2. Real Plan Enforcement in `useSubscription`
- Remove beta overrides; read actual `subscription.plan` and `subscription.status`
- Define real `PLAN_LIMITS`: Free gets 20 trades/month, 3 watchlists, no advanced analytics/telegram/broker
- Calculate `isTrialing`, `isTrialExpired`, `trialDaysLeft` from `trial_ends_at`
- `canAccess` checks actual plan limits

### 3. PlanGate Upgrade UI
- When feature is gated, render an upgrade card with lock icon, feature name, and "Upgrade to Pro" button linking to `/settings?tab=billing`
- Keep existing wrapper locations (Reports, Analytics, Integrations)

### 4. Trial Banner
- Show countdown in `TrialBanner` when `isTrialing`: "X days left in your Pro trial"
- Show "Trial expired" with upgrade CTA when expired
- Dismiss state stored in sessionStorage

### 5. Usage Tracking (Monthly Trade Count)
- Add a `useMemo` in `useSubscription` that counts trades created this billing period
- Show usage bar in `BillingSettings`: "15/20 trades used this month"
- `PlanGate` for trade creation when limit reached

### 6. Contextual Upgrade Prompts
- Add upgrade nudges at natural friction points: CreateTradeModal (when near limit), Analytics page header, Telegram settings
- Small banners, not modals — non-intrusive

### 7. In-App Notification Center
- **New table**: `notifications` (id, user_id, type, title, message, read, data jsonb, created_at)
- **New component**: `NotificationBell` in sidebar/navbar — bell icon with unread count badge
- **New component**: `NotificationPanel` — slide-out panel listing notifications
- Edge functions (trade-monitor, evaluate-alerts) already send Telegram; add DB insert for in-app notifications
- Enable realtime on notifications table

### 8. Public Trader Profiles
- **New table**: `public_profiles` (user_id, display_name, bio, avatar_url, is_public, disclaimer, monthly_stats jsonb, created_at)
- **New page**: `/trader/:userId` — public profile showing opt-in stats (win rate, streak, equity curve)
- Settings toggle in ProfileSettings to enable/disable public profile
- Uses existing `ra_public_mode` and `ra_disclaimer` from user_settings

### 9. Referral Program
- **New table**: `referrals` (id, referrer_id, referred_user_id, code, status, reward_applied, created_at)
- Add `referral_code` column to profiles table
- Generate unique referral code per user
- Show referral link + stats in Settings → Billing
- On signup, check for referral code in URL params, record referral
- Reward: extend trial by 30 days for referrer when referred user signs up

### 10. PWA Push Notifications (prep)
- Add push subscription registration in service worker
- Store push subscriptions in DB table `push_subscriptions`
- Wire into notification center — when in-app notification created, also send push if subscribed
- Requires VAPID keys (will use secrets tool)

## Deferred Items (require external dependencies)
- **Zerodha Kite integration** — requires Kite Connect API partnership/credentials; defer to separate phase
- **Angel One integration** — same as above
- **Email drip campaigns** — needs email provider (Resend/Postmark); separate initiative
- **Leaderboard** — depends on public profiles being adopted first
- **Comment system** — depends on community adoption
- **Google Sheets export** — low priority, JSON export already exists

## Files Summary

| Action | File | Change |
|--------|------|--------|
| Enable | Stripe integration | Products, prices, webhooks |
| Edit | `useSubscription.ts` | Real plan logic |
| Edit | `PlanGate.tsx` | Upgrade fallback UI |
| Edit | `TrialBanner.tsx` | Trial countdown |
| Edit | `BillingSettings.tsx` | Stripe checkout + usage bar |
| Create | `src/components/NotificationBell.tsx` | Bell icon + panel |
| Create | `src/pages/PublicProfile.tsx` | Public trader page |
| Edit | `src/components/settings/ProfileSettings.tsx` | Public profile toggle |
| Edit | `src/components/layout/Sidebar.tsx` | Add notification bell |
| Migration | `notifications` table | In-app notifications |
| Migration | `public_profiles` table | Public profiles |
| Migration | `referrals` table | Referral tracking |
| Edge fn | `stripe-webhook/index.ts` | Subscription lifecycle |
| Edit | `App.tsx` | Add PublicProfile route |

This is a large phase — recommend implementing in 2-3 sub-batches: (A) Stripe + plan enforcement + trial banner, (B) notification center + referral, (C) public profiles.

