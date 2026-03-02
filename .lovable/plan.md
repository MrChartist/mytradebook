

# Add Navbar to Docs + Theme Toggle on Landing & Docs

## Problem
1. The Docs page hides the top navbar when the user is logged in, making it feel disconnected from the rest of the app.
2. Neither the Landing page nor the Docs page has a light/dark theme toggle, so visitors cannot switch themes.

## Changes

### 1. Docs Page -- Always Show Navbar (`src/pages/Docs.tsx`)
- Remove the `{!isInsideApp && (...)}` condition around the navbar so it always renders.
- When inside the app (`isInsideApp`), the navbar shows: Logo + "Dashboard" button (goes to `/dashboard`) + Theme Toggle.
- When standalone (not logged in), the navbar shows: Logo + "Home" link + "Get Started" button + Theme Toggle.
- Add the `ThemeToggle` component (from `src/components/ui/theme-toggle.tsx`) to the navbar's right side, next to the existing action buttons.

### 2. Landing Page Navbar -- Add Theme Toggle (`src/pages/Landing.tsx`)
- Import the existing `ThemeToggle` component.
- Add it to the navbar between the nav links and the "Sign In" / "Get Started" buttons.
- Note: The landing page currently forces a light theme. The toggle will allow users to switch freely, which means removing or relaxing the forced-light-theme behavior so the toggle actually works.

### 3. Landing Page Theme Handling
- Currently the Landing page may force light mode. We will allow the theme toggle to work naturally, respecting the user's stored preference and letting them switch freely on the landing page as well.

## Files Modified
- **`src/pages/Docs.tsx`** -- Remove `isInsideApp` condition on navbar, add ThemeToggle, adjust navbar buttons for logged-in vs standalone
- **`src/pages/Landing.tsx`** -- Import and add ThemeToggle to navbar

## No Functional Changes
Only visual/navigation changes. No business logic or data flow is affected.

