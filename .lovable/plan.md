

# Fix: Stale Session Blocking Login

## Root Cause

The browser has a stale refresh token stored in localStorage (`cs533bqljyja`). When the app loads, the auth client tries to refresh this token, which fails repeatedly with `AuthRetryableFetchError: Failed to fetch`. This corrupted session prevents new logins (including Google) from completing properly because:

1. The auth client keeps retrying the stale token refresh in the background
2. Even after a successful Google OAuth redirect, the old broken session can interfere with setting the new session

## Fix

### File: `src/contexts/AuthContext.tsx`

**Change the `getSession` error handling** to explicitly sign out (clear localStorage) when `getSession` fails. This ensures stale/corrupted sessions are wiped so users get a clean login experience.

```text
// Current code:
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error("[Auth] getSession error:", error);
  }
  setTimeout(() => {
    if (!listenerFired.current) {
      setLoading(false);
    }
  }, 500);
});

// Fixed code:
supabase.auth.getSession().then(({ error }) => {
  if (error) {
    console.error("[Auth] getSession error, clearing stale session:", error);
    supabase.auth.signOut().catch(() => {});  // Clear corrupted tokens
    setLoading(false);
    return;
  }
  setTimeout(() => {
    if (!listenerFired.current) {
      setLoading(false);
    }
  }, 500);
});
```

This single change:
- Detects when `getSession` fails (stale token, network error, etc.)
- Clears the corrupted session from localStorage via `signOut()`
- Immediately sets `loading = false` so the login form appears
- Prevents the auth client from endlessly retrying with a bad token

### Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Clear stale session on getSession error instead of ignoring it |

