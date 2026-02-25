

# Rebuild Login Page and Fix Auth Initialization

## Problem

The core issue is that a **stale refresh token** (`cs533bqljyja`) is stuck in the browser's localStorage. The previous fix tried calling `supabase.auth.signOut()` to clear it, but `signOut()` itself makes a network request to revoke the token on the server -- and that request also fails with "Failed to fetch", so the corrupted token is **never actually removed**.

This means the Supabase client's internal `autoRefreshToken` mechanism keeps retrying the bad token in an infinite loop, blocking everything including Google sign-in.

## Solution

Rebuild the Login page from scratch with a clean, simple design, and fix the AuthContext to properly clear corrupted sessions by writing directly to localStorage instead of relying on network calls.

---

## Changes

### 1. Fix AuthContext (`src/contexts/AuthContext.tsx`)

The critical fix: when `getSession` fails, **directly remove the Supabase auth keys from localStorage** instead of calling `signOut()` (which itself fails). This is the only way to break the infinite retry loop.

```text
// Before (broken - signOut also fails with "Failed to fetch"):
supabase.auth.signOut().catch(() => {});

// After (works - directly clears localStorage):
const storageKey = `sb-nuilpmoipiazjafpjaft-auth-token`;
localStorage.removeItem(storageKey);
```

Also simplify the initialization to be more robust:
- Remove the `listenerFired` ref pattern
- Use a cleaner flow: set up listener, call getSession, handle errors directly

### 2. Rebuild Login Page (`src/pages/Login.tsx`)

Complete rewrite with:
- **Clean, centered single-column layout** (no split-screen branding panel)
- **Google Sign-In button** prominently at the top
- **Email/Password form** below with divider
- **Password strength indicator** on signup
- **Forgot password flow** inline
- **Toggle between Login / Signup** at the bottom
- Proper loading states that auto-reset
- No unnecessary animations or complex CSS classes

### 3. Files Unchanged

No files need to be deleted -- the previous cleanup already removed unused components. The CSS utility classes (`surface-card`, `gradient-border-top`, etc.) are used across the app so they stay.

---

## Technical Details

### AuthContext Changes

| What | Why |
|------|-----|
| Replace `signOut()` with direct `localStorage.removeItem()` on error | `signOut()` makes a network call that also fails, so the token is never cleared |
| Use the exact storage key format `sb-{project_id}-auth-token` | This is the key Supabase uses internally to store the session |
| Keep `onAuthStateChange` as the single source of truth | This pattern is correct and should not change |
| Keep 150ms fallback timeout | Already optimized in previous edit |

### Login Page Rebuild

| What | Details |
|------|---------|
| Layout | Single centered card, max-width 400px, works on all screens |
| Google button | Full-width at top, with proper loading/error reset |
| Email form | Simple email + password fields |
| Signup extras | Name field + password strength meter |
| Forgot password | Inline mode switch (no separate page needed) |
| No branding panel | Removes the left-side panel for a cleaner, faster-loading page |
| Mobile-first | No separate mobile logo needed since layout is already centered |

