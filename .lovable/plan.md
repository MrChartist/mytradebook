

## Plan: Fix Login, Page Loading, and PWA Install Issues

### Root Causes Identified

**1. Login/Signup not working — `bad_jwt` / `missing sub claim` errors**

The auth logs show repeated 403 errors with `missing sub claim` when calling `/user`. This happens when a stale or corrupted JWT is stored in localStorage. The current code only clears the token on `getSession` errors when NOT in a callback/pending state. If a user has a corrupted token from a previous session, every page load tries to use it, fails with 403, and the app gets stuck in a loading state.

**Fix**: Add explicit stale token recovery — when `onAuthStateChange` fires with no user and `getSession` returns a 403/bad_jwt error, proactively clear the stored auth token and resolve loading. Also add a `TOKEN_REFRESHED` event handler.

**2. Pages not loading — consequence of auth issue**

Protected pages show an infinite loading spinner because:
- Auth loading never resolves when the stale JWT keeps failing
- The safety timeout is only 1.5s for non-callback flows, but `resolveLoading` may not fire if the auth state change listener gets stuck

**Fix**: Handle the `TOKEN_REFRESHED` event in `onAuthStateChange`, and ensure `INITIAL_SESSION` event (which fires once) always resolves loading even without a user. Also increase robustness of the safety timeout path.

**3. PWA install not working**

The manifest lacks `scope` and `id` fields. Without `id`, the browser can't consistently identify the app across domains. Without `scope`, navigations may fall outside the PWA boundary.

**Fix**: Add `id: "/"` and `scope: "/"` to the PWA manifest in `vite.config.ts`.

### Implementation

#### File 1: `src/contexts/AuthContext.tsx`
- In `onAuthStateChange` handler, add handling for when `event` is `INITIAL_SESSION` with no user — call `resolveLoading("initial-no-session")` (unless callback/pending)
- Add a catch for `TOKEN_REFRESHED` event to update session
- After `getSession()` returns an error, always clear the stale token from localStorage regardless of callback state, and attempt `signOut()` to fully clear corrupted state
- Add a `try/catch` wrapper around the initial `getSession` that catches network errors gracefully

#### File 2: `vite.config.ts`
- Add `id: "/"` and `scope: "/"` to the PWA manifest object

#### File 3: `index.html`
- Add `https://tradebook.mrchartist.com` to CSP `connect-src` to prevent any self-origin request blocks on the custom domain

### Summary of Changes
- 3 files modified
- Fixes stale JWT recovery loop that blocks login and page loading
- Enables PWA installability on custom domain

