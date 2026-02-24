

# Fix Login Flow for Smooth Authentication

## Problems Identified

1. **Race condition in AuthContext**: Both `onAuthStateChange` and `getSession()` independently set state, causing duplicate renders and potential flicker. The `loading` flag can be set to `false` prematurely by whichever resolves first, before profile data is loaded.

2. **Google OAuth redirect lands on `/` but ProtectedRoute redirects to `/landing`**: After Google sign-in, the OAuth callback sets the session via `onAuthStateChange`. But if `loading` flips to `false` before the session is fully set (race condition), ProtectedRoute briefly sees `user = null` and redirects to `/landing`, breaking the flow.

3. **Login page redundant navigation**: `handleEmailAuth` calls `navigate("/")` after successful login, but the `useEffect` watching `user` also calls `navigate("/")`. This can cause double navigation or a flash.

4. **Google sign-in loading state never resets on success**: `handleGoogleAuth` sets `loading = true` but only resets it on error. On success (redirect happens), the button stays in loading state -- fine for redirect, but if using popup/token flow (Lovable Cloud), the page stays stuck.

5. **`useNavigate` imported but unused in AuthContext**: Minor cleanup -- `useNavigate` is imported but never used.

---

## Plan

### 1. Fix AuthContext race condition

**File: `src/contexts/AuthContext.tsx`**

- Remove the duplicate state-setting from `getSession()` -- let `onAuthStateChange` be the single source of truth for session state
- `getSession()` should only be used as a trigger to ensure the listener fires; if it doesn't fire (no session), set `loading = false` there
- Add a `ref` to track if `onAuthStateChange` has already fired, to avoid the double-set
- Remove unused `useNavigate` import
- Move profile fetch into a separate `fetchProfile` function to avoid code duplication
- Ensure `loading` stays `true` until profile is fetched (not just session)

### 2. Fix Login page navigation

**File: `src/pages/Login.tsx`**

- Remove the manual `navigate("/")` from `handleEmailAuth` success path -- the `useEffect` already handles redirect when `user` changes
- Ensure `handleGoogleAuth` resets loading state properly by listening to auth state changes rather than relying on manual reset
- Add `replace` to the navigate call in `useEffect` to prevent back-button issues

### 3. Fix Landing page redirect

**File: `src/pages/Landing.tsx`**

- Add `replace` to the navigate call to prevent back-button loop

---

## Technical Details

### AuthContext rewrite (core fix)

The key change is making `onAuthStateChange` the **sole authority** for setting `user`/`session`/`loading`:

```text
1. Initialize: loading = true
2. Set up onAuthStateChange listener
3. Call getSession()
   - If getSession returns a session, onAuthStateChange will fire with INITIAL_SESSION
   - If no session, set loading = false via a timeout guard
4. onAuthStateChange fires:
   - Set user/session
   - If user exists, fetch profile THEN set loading = false
   - If no user, set loading = false immediately
```

This eliminates the race where both paths independently set state.

### Login page simplification

- Remove `navigate("/")` from email login success handler (the useEffect handles it)
- The useEffect redirect with `{ replace: true }` ensures clean browser history

### Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Fix race condition, single source of truth for auth state, remove unused import |
| `src/pages/Login.tsx` | Remove redundant navigation, fix loading state for Google auth |
| `src/pages/Landing.tsx` | Add `replace` to redirect navigate call |

