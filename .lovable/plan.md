
# Add Navbar and Visual Refinements to Login Page

## Problem
1. The login page has no navigation bar or back button -- users are trapped with no way to return to the landing page.
2. The login page visual style (plain card layout, basic typography) doesn't match the polished hero section of the landing page.

## Changes (all in `src/pages/Login.tsx`)

### 1. Add Landing-Style Navbar at the Top
Add a sticky top navbar matching the landing page design:
- Logo (TrendingUp icon + "TradeBook" text) linking back to `/`
- Navigation links: Features (#features), Pricing (#pricing), Docs (/docs)
- ThemeToggle component
- "Home" ghost button navigating to `/`
- Same styling: `sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl`

### 2. Update Left Panel Branding to Match Hero
- Use the hero's accent color styling: `bg-[hsl(var(--tb-accent))]` for the logo icon instead of `bg-gradient-primary`
- Add the italic cursive "Edge" accent from the hero: heading becomes "Know Your *Edge*." with Dancing Script font
- Update subtitle to match the hero's description tone
- Update the feature bullet points to mention newer features (Trailing Stop Loss, AI Insights, Rules Engine)

### 3. Improve Right Panel Typography and Contrast
- Increase heading size from `text-2xl` to `text-3xl` for better hierarchy
- Bump description text from `text-sm` to `text-base` for readability
- Ensure proper `text-muted-foreground` without opacity modifiers
- Style the mobile logo to match the accent color scheme

### 4. Update Mobile Experience
- On mobile (where left panel is hidden), the navbar provides the back navigation
- Mobile logo block updated to use the accent color scheme matching the landing page

## Technical Details

### Imports to Add
- `ThemeToggle` from `@/components/ui/theme-toggle`
- `Link` or use `navigate` for logo click

### Navbar Structure (matching Landing.tsx)
```text
[Logo + TradeBook] --- [Features | Pricing | Docs] --- [ThemeToggle] [Home btn]
```

### Left Panel Heading Update
```text
Current:  "Master Your Trades. Track Your Edge."
Updated:  "Know Your Edge. Compound It Daily." (matching hero)
          with "Edge" in Dancing Script italic + accent color
```

### Layout Change
- Change outer wrapper from `flex` to `flex-col` so navbar sits above the split panels
- The split panels remain as a `flex flex-1` row below the navbar

## Files Modified
- **`src/pages/Login.tsx`** -- Add navbar, update branding typography, improve contrast
