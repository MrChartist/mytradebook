

# Restructure Pricing: Monthly / Quarterly / Yearly

Replace the current Free/Pro/Team tier model with a single plan offering **all features**, sold across three billing cycles. During the current testing rollout, Monthly and Quarterly are free (100% discount), while Yearly is at full price.

---

## Pricing Structure

| Billing Cycle | Regular Price | Current Discount | Displayed Price |
|--------------|---------------|-----------------|-----------------|
| Monthly      | ~~₹199/mo~~   | 100% off        | **₹0/mo** (Free during beta) |
| Quarterly    | ~~₹499/quarter~~ | 100% off     | **₹0/quarter** (Free during beta) |
| Yearly       | ₹1,499/year   | None            | **₹1,499/year** |

All plans include the **same full feature set**: unlimited trades, advanced analytics, Telegram notifications, broker integration, trailing SL, watchlists, reports, pattern tracking, etc.

---

## Changes

### 1. Landing Page Pricing Section (`src/pages/Landing.tsx`)
- Replace `pricingPlans` array (3 tiers) with 3 billing-cycle cards: Monthly, Quarterly, Yearly
- Monthly card: show ~~₹199~~ crossed out, ₹0, badge "Free During Beta"
- Quarterly card (highlighted/popular): show ~~₹499~~ crossed out, ₹0, badge "Free During Beta"
- Yearly card: show ₹1,499/year, no discount badge
- All three cards share the same feature list
- Update section subtitle to something like "One plan. All features. Pick your billing cycle."
- CTAs: Monthly/Quarterly say "Start Free", Yearly says "Subscribe"

### 2. Billing Settings Page (`src/components/settings/BillingSettings.tsx`)
- Replace Free/Pro/Team plan cards with Monthly/Quarterly/Yearly cards matching the same structure
- Show strikethrough pricing and "Free During Beta" badges on Monthly and Quarterly
- Keep the "Payment integration coming soon" notice
- Remove trial-related banners (no longer relevant with this model)

### 3. Subscription Hook (`src/hooks/useSubscription.ts`)
- Update `PlanType` from `"free" | "pro" | "team"` to a single type (e.g., keep `"pro"` as the active plan type) since all features are now included
- Update `PLAN_LIMITS` so the default/active plan has all features unlocked (unlimited trades, unlimited watchlists, all flags true)
- This effectively removes feature gating during the beta period

### 4. PlanGate Component (`src/components/PlanGate.tsx`)
- Since all features are unlocked, update logic so `hasAccess` always returns true (or simplify the gate to always render children)
- Keep the component structure for future use when paid enforcement returns

### 5. Trial Banner (`src/components/TrialBanner.tsx`)
- Hide the banner entirely during beta (return null) since there's no trial concept in this model
- Keep the component file for future reactivation

---

## Technical Notes

- No database changes needed -- this is purely a UI/pricing display update
- The subscription hook will default everyone to full access, removing feature gating during beta
- The component structure (PlanGate, TrialBanner, BillingSettings) is preserved so paid enforcement can be re-enabled later by simply updating the pricing values and restoring gating logic
- 4 files modified, 0 files created

