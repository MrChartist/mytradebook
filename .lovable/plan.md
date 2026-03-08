

# Plan: Add 3 Missing Doc Sections + Expand Settings

## Summary
Add documentation for **Notification Center**, **Referral Program**, and **Public Profile** — three features that exist in code but have zero docs coverage. Also expand the Settings section with Subscription/Plans and Data Export subsections.

## Changes

### 1. `src/components/docs/DocsNewMockups.tsx` — Add 3 new mockups
- **`NotificationCenterMockup`** — Bell icon popover with grouped notifications (Today/Yesterday), unread badges, mark-all-read button
- **`ReferralCardMockup`** — Referral link with copy button, stats (total referred, successful signups), 30-day bonus callout
- **`PublicProfileMockup`** — Profile card with display name, bio, monthly stats grid, public/private toggle

### 2. `src/pages/Docs.tsx` — SECTIONS array (line 72-99)
Add 3 new entries after `achievements` (line 90):
```
{ id: "notifications", label: "Notification Center", icon: Bell }
{ id: "referral", label: "Referral Program", icon: Gift }
{ id: "public-profile", label: "Public Profile", icon: Users }
```
Import `Gift` from lucide (already imported in other files).

### 3. `src/pages/Docs.tsx` — SECTION_ANCHORS (after line 209)
Add anchor entries for the 3 new sections:
- `notifications`: Notification Types, Unread Management, Click Actions
- `referral`: Getting Your Link, Sharing, Tracking Rewards
- `public-profile`: Setup, Privacy Controls, Monthly Stats

### 4. `src/pages/Docs.tsx` — sidebarGroups (line 524)
Update "Social & AI" group:
```
ids: ["sharing", "achievements", "notifications", "referral", "public-profile", "trade-coach"]
```

### 5. `src/pages/Docs.tsx` — Section content blocks
Insert 3 new `<motion.section>` blocks between achievements (phase 18, ends ~line 3504) and trade-coach (currently phase 19, starts ~line 3508).

Each section follows the established pattern: `PhaseHeader` → `SectionHeader` → `QuickNav` → content with `FeatureCard`, `StepByStep`, `ProTip`, mockup, `NextStepBlock`.

**Notification Center (Phase 19):**
- How the bell icon works, unread count badge
- Notification types: trade events, alert triggers, system messages, reports
- Date grouping (Today/Yesterday/This Week/Older)
- Click-to-navigate, mark read, mark all read, delete
- Mockup: `NotificationCenterMockup`

**Referral Program (Phase 20):**
- Where to find your referral link (Settings page)
- Copy and share workflow
- Reward: 30 extra trial days per successful signup
- Tracking dashboard: total referred vs completed
- Mockup: `ReferralCardMockup`

**Public Profile (Phase 21):**
- Opt-in public trader page at `/profile/:id`
- Display name, bio, avatar, monthly performance stats
- Privacy: `is_public` toggle, disclaimer field
- What's visible vs hidden (no individual trades exposed)
- Mockup: `PublicProfileMockup`

### 6. `src/pages/Docs.tsx` — Update all PhaseHeader totals and phase numbers
- All `total={26}` → `total={29}` (26 existing + 3 new)
- Trade-coach moves from phase 19 → 22
- All subsequent phases increment by 3 (integrations 20→23, ai-integration 21→24, shortcuts 22→25, pwa 23→26, settings 24→27, faq 25→28, changelog 26→29)

### 7. `src/pages/Docs.tsx` — Expand Settings section (~line 4125)
Add two new subsections within the existing Settings section content:

**Subscription & Plans** (new `SubTopic` + `FeatureCard`):
- Free vs Pro vs Team tier comparison
- 14-day trial mechanics
- Plan-gated features (PlanGate component behavior)
- Upgrade/downgrade flow via Settings → Billing

**Data Export & Backup** (new `SubTopic` + `FeatureCard`):
- JSON full backup via backend function
- CSV export for trades
- What's included in each format
- How to trigger exports

Also update Settings `QuickNav` and `SECTION_ANCHORS` to include these two new sub-topics.

### Files Modified
- `src/components/docs/DocsNewMockups.tsx` — 3 new mockup components
- `src/pages/Docs.tsx` — SECTIONS, SECTION_ANCHORS, sidebarGroups, 3 new section blocks, Settings expansion, all PhaseHeader updates

