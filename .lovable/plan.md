

# Make Landing Page the Home Page

## Overview
Change the routing so that `/` shows the Landing page for unauthenticated users, and `/dashboard` is the authenticated dashboard. Currently `/` is the protected dashboard and `/landing` is a separate route.

## Changes

### 1. Update Routes (`src/App.tsx`)
- Change `"/"` route from the protected `<Index />` to `<Landing />`
- Add a new `/dashboard` route that wraps `<Index />` in `<ProtectedRoute>`
- Keep `/landing` as an alias that also renders `<Landing />` (for backward compatibility), or remove it
- Add `/dashboard` to the protected routes array

### 2. Update `ProtectedRoute.tsx`
- Change the unauthenticated redirect from `/landing` to `/` (since Landing is now at `/`)

### 3. Update All `/landing` References
- **`src/pages/Docs.tsx`**: Change all `navigate("/landing")` and `href="/landing"` to `"/"` 
- **`src/pages/Landing.tsx`**: Update SEO `path` from `/landing` to `/`
- **`src/pages/AuthCallback.tsx`**: Change `href="/landing"` to `"/"`
- **`src/pages/Docs.tsx`** navbar: Update logo click for standalone mode from `/landing` to `/`

### 4. Update Landing Page Internal Links
- Any "Dashboard" or post-login redirect that goes to `/` should now go to `/dashboard`
- The Docs navbar "Dashboard" button already navigates to `/dashboard` -- no change needed there

## Files Modified
- `src/App.tsx` -- Reroute `/` to Landing, add `/dashboard` as protected route
- `src/components/layout/ProtectedRoute.tsx` -- Redirect to `/` instead of `/landing`
- `src/pages/Docs.tsx` -- Replace `/landing` references with `/`
- `src/pages/Landing.tsx` -- Update SEO path
- `src/pages/AuthCallback.tsx` -- Update fallback link
- `src/pages/Index.tsx` -- No changes needed (still renders Dashboard inside MainLayout)
