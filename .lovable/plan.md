
# Fix Duplicate Sign In / Get Started Buttons

## Problem
Both "Sign In" and "Get Started" in the landing page navbar navigate to `/login` and land on the same sign-in form. They should serve different intents:
- **Sign In** = existing users logging in
- **Get Started** = new users creating an account

## Solution
Use a query parameter to differentiate the two flows:

- **Sign In** navigates to `/login` (defaults to sign-in tab)
- **Get Started** navigates to `/login?mode=signup` (opens on sign-up tab)

The Login page will read the `mode` query param on mount and set `authMode` accordingly.

## Changes

### 1. `src/pages/Landing.tsx`
- Change the "Get Started" button's `onClick` from `navigate("/login")` to `navigate("/login?mode=signup")`
- Apply the same change to the bottom CTA "Get Started -- It's Free" button
- Keep "Sign In" pointing to `/login` (no param needed, defaults to login)

### 2. `src/pages/Login.tsx`
- Read `mode` from URL search params on mount using `useSearchParams` (or `useLocation`)
- If `mode=signup`, initialize `authMode` to `"signup"` instead of `"login"`
- This way, clicking "Get Started" lands users directly on the sign-up tab

## Technical Details
- Import `useSearchParams` from `react-router-dom` in Login.tsx
- Add a `useEffect` or initial state logic: `const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login"`
- Use that as the default for `useState<"login" | "signup" | "forgot">(initialMode)`

## Files Modified
- `src/pages/Landing.tsx` -- Update "Get Started" button navigation targets
- `src/pages/Login.tsx` -- Read query param to set initial auth mode
