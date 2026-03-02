

# Permanent Auth Fix: Eliminate Published-Site Login Issues

## Root Cause Analysis

After reviewing the code, there are **two specific gaps** causing the persistent issues on the published site:

### Gap 1: Timeout doesn't consider the pending-auth flag
When Google OAuth redirects back to the published site, the browser may land at `/` (not `/auth/callback`) because the Lovable Cloud OAuth handler controls the final redirect destination. In this case:
- `IS_AUTH_CALLBACK` is `false` (no tokens in URL, not on `/auth/callback`)
- The 1.5-second timeout fires and resolves `loading: false` with `user: null`
- The `tb-auth-pending` sessionStorage flag IS still set, so `ProtectedRoute` shows a loader...
- ...but nothing ever resolves the session or clears the flag, creating an **infinite loader** that eventually feels like a hang

### Gap 2: No timeout on the pending-auth guard
`ProtectedRoute` shows a loader forever when `isPending` is true but user never arrives. There's no escape hatch, so users see loading indefinitely until they manually refresh.

## Fix (3 targeted changes)

### 1. AuthContext: Use `tb-auth-pending` flag to extend timeout
When the pending flag exists in sessionStorage (set before Google redirect or email login), treat it the same as a callback -- use the longer 15-second timeout instead of 1.5 seconds. This gives the session time to establish even when the return URL doesn't contain tokens.

Additionally, when `tb-auth-pending` is set and no session is found initially, actively retry `getSession()` a few times (polling every 1.5s for up to 10s) to catch sessions that establish with a slight delay.

### 2. ProtectedRoute: Add a safety timeout to the pending state
If `isPending` is true but no user appears within 12 seconds, clear the flag and redirect to `/landing`. This prevents infinite loaders. The timeout is generous enough to allow normal auth flows to complete.

### 3. AuthContext: Clear `tb-auth-pending` on successful auth resolution
When `onAuthStateChange` fires with a valid user, explicitly clear the `tb-auth-pending` flag. This ensures the flag doesn't linger and cause stale behavior on subsequent navigations.

## Files to modify

### `src/contexts/AuthContext.tsx`
- Change `MAX_LOADING_MS` calculation to also check `sessionStorage` for `tb-auth-pending`
- Add a session polling retry loop when pending flag is detected but no initial session found
- Clear `tb-auth-pending` in `onAuthStateChange` when user is confirmed

### `src/components/layout/ProtectedRoute.tsx`
- Add a `useEffect` with a 12-second timeout that clears `tb-auth-pending` and stops showing the loader
- This provides a clean escape from the infinite-loader scenario

## Expected behavior after fix

| Scenario | Current behavior | Fixed behavior |
|----------|-----------------|----------------|
| Google login (published) | Hangs on loader, then redirects to landing | Waits up to 15s for session, lands on dashboard |
| Google login (editor) | Works fine | No change |
| Email login (published) | Sometimes shows long loading | Pending flag extends timeout, session polling catches it |
| Email signup | "Failed to fetch" intermittently | Network error handling already in place; timeout extension prevents premature resolution |
| Any auth timeout | Infinite loader possible | 12s safety timeout in ProtectedRoute shows landing page |

## Technical details

The session polling in AuthContext will work like this:
```text
1. detectAuthCallback() OR tb-auth-pending flag -> use 15s timeout
2. getSession() returns null but pending flag is set
3. Poll getSession() every 1.5s, up to 4 retries
4. If session found during polling -> set user, resolve loading
5. If all retries fail -> let safety timeout resolve loading
6. ProtectedRoute 12s timeout -> clear flag, redirect to landing
```

This creates a layered safety net: auth listener catches fast events, polling catches delayed sessions, and the ProtectedRoute timeout prevents any infinite-loader scenario.
