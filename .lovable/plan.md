

# Polish Navigation Across All Pages

## Current State
There are 5 distinct navigation components across the app:
1. **Landing Navbar** — floating island, rounded-full, `bg-card/80 backdrop-blur-xl` (Landing.tsx)
2. **Docs Navbar** — similar floating island but slightly different styling (Docs.tsx)
3. **Dashboard Sidebar** — desktop fixed sidebar with collapse (Sidebar.tsx)
4. **Mobile Top Header** — fixed `h-14` bar with logo + search + hamburger (Sidebar.tsx)
5. **Mobile Bottom Nav** — 4 tabs + More button (MobileBottomNav.tsx)
6. **Mobile Drawer** — Sheet-based full nav (MobileDrawer.tsx)

## Issues to Fix
- Landing and Docs navbars are inconsistent — Docs lacks inner-highlight shadow, different link styling, no FAQ link
- Desktop sidebar missing glass inner-highlight on border-right side, logo area lacks polish
- Mobile top header feels flat — no gradient, no subtle inner highlight
- Mobile bottom nav lacks the glass depth other components have
- Mobile drawer profile card lacks the premium glass treatment
- Breadcrumbs feel disconnected from the nav system

## Changes

### 1. Landing Navbar (`Landing.tsx` lines 64-100)
- Add `FAQ` to desktop nav links (Features, Pricing, FAQ, Docs)
- Active link indicator: add a subtle dot under the current section on hover via `after:` pseudo
- Increase "Get Started" button shadow intensity for more CTA pop
- Mobile menu items: add left accent bar on hover matching sidebar pattern

### 2. Docs Navbar (`Docs.tsx` lines 267-310)
- Add inner-highlight `boxShadow` matching the landing navbar exactly
- Add `FAQ` anchor link to center links
- Match "Get Started" button shadow to landing page CTA
- Active "Docs" link: add accent dot indicator below it
- Increase h-14 consistency and px-4 padding to match landing

### 3. Desktop Sidebar (`Sidebar.tsx` lines 119-233)
- Add inner-highlight shadow to the sidebar container: `boxShadow: "inset -1px 0 0 0 hsl(0 0% 100% / 0.04)"`
- Logo area: add subtle bottom gradient fade instead of hard border-b
- Active nav items: increase the accent bar width from 3px to 3.5px and add subtle glow `shadow-[0_0_8px_hsl(var(--tb-accent)/0.15)]`
- Section labels ("Main", "Analytics"): bump to `text-[11px]` with `font-bold` for more visual weight
- Profile card: add `backdrop-blur-sm` and ring treatment to avatar
- Bottom section: soften border-t with `border-border/50` and add gradient fade
- Collapse button: add `hover:shadow-sm` for depth feedback

### 4. Mobile Top Header (`Sidebar.tsx` lines 104-115)
- Add gradient background: `bg-gradient-to-b from-card/95 to-card/85`
- Increase backdrop blur from `backdrop-blur-lg` to `backdrop-blur-xl`
- Add inner-highlight shadow matching the glass system
- Logo: add subtle `drop-shadow-sm`
- Buttons: increase to `h-10 w-10` for better touch targets, add `rounded-xl`

### 5. Mobile Bottom Nav (`MobileBottomNav.tsx`)
- Increase backdrop blur: already `backdrop-blur-xl`, keep
- Add gradient background: `bg-gradient-to-t from-card/90 to-card/70`
- Active indicator bar: increase width from `w-8` to `w-10` and add glow `shadow-[0_0_6px_hsl(var(--tb-accent)/0.3)]`
- Add subtle top gradient fade instead of hard border-t
- Increase nav height from `h-14` to `h-[58px]` for breathing room
- Icon labels: bump from `text-[10px]` to `text-[11px]`

### 6. Mobile Drawer (`MobileDrawer.tsx`)
- Sheet content: add inner-highlight shadow
- Profile avatar: add `ring-2 ring-background` and gradient background matching sidebar
- Nav items active state: add left accent bar (3px) matching desktop sidebar
- Section dividers: soften with `border-border/30`
- Add "Fundamentals" icon change from `BarChart3` to `Building2` for consistency with sidebar

### 7. Breadcrumbs (`PageBreadcrumbs.tsx`)
- Add glass pill container: wrap breadcrumbs in a subtle `bg-muted/30 rounded-full px-3 py-1.5 inline-flex` for a polished look
- Home icon: use accent color on hover
- Separators: use `opacity-40` chevrons for softer appearance

## Files to Edit
1. `src/pages/Landing.tsx`
2. `src/pages/Docs.tsx` (lines 267-310)
3. `src/components/layout/Sidebar.tsx`
4. `src/components/layout/MobileBottomNav.tsx`
5. `src/components/layout/MobileDrawer.tsx`
6. `src/components/layout/PageBreadcrumbs.tsx`

