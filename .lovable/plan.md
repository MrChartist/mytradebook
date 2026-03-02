
Objective: deliver a permanent fix so published auth behaves like editor auth, specifically eliminating (1) Google login landing-page fallback after long loading and (2) intermittent signup “failed / fetch” behavior.

What the evidence says
- Backend auth is succeeding for Google: token exchange requests are returning 200.
- Client-side auth transitions show a delayed sequence (`SIGNED_OUT` then `SIGNED_IN`), which can create a temporary “no user” window.
- Your current route guard redirects unauthenticated users from protected routes to `/landing`, so any temporary null session during callback can bounce users away from dashboard.
- Current improvements (longer timeout + callback detection) helped but are not sufficient alone because routing behavior and callback handoff are still fragile in published flow.

Permanent fix approach (multi-layer hardening)

1) Introduce a dedicated auth callback route (remove reliance on `/` during callback)
- Add a public route like `/auth/callback` in `src/App.tsx`.
- Create `src/pages/AuthCallback.tsx` that:
  - Shows “Completing sign-in…” state.
  - Waits for auth context to settle.
  - Navigates to `/` only when `user` exists.
  - If timeout occurs, shows explicit retry + “Back to login”.
- Update redirect targets to this route:
  - Google OAuth redirect URI in `AuthContext.signInWithGoogle`.
  - Email signup verification redirect (`emailRedirectTo`) in `signUpWithEmail`.
- Why: callback processing should happen on a non-protected, deterministic route, not on `/` which is guarded.

2) Convert auth bootstrap to a stronger callback-aware state machine
- In `src/contexts/AuthContext.tsx`:
  - Replace module-level callback constant with runtime callback detection per load:
    - Path-based detection (`/auth/callback`) plus hash/search token detection.
  - Keep listener-first setup (`onAuthStateChange`) but add callback grace logic:
    - In callback flows, do not resolve loading to “unauthenticated” until a longer grace window is exhausted.
  - Add controlled session recheck loop during callback (short polling for a few seconds) before declaring failure.
  - Stop clearing local storage on generic transient errors during callback; only clear for clearly corrupted session states.
- Why: published redirect flow has variable timing and needs deterministic auth resolution rules.

3) Prevent premature redirects in route guard
- In `src/components/layout/ProtectedRoute.tsx`:
  - Add short grace behavior when callback/login is in progress (e.g., a pending-auth flag in sessionStorage).
  - During grace, keep loader instead of redirecting to `/landing`.
  - Redirect only when auth is definitively resolved unauthenticated.
- Why: this removes the “blink to landing” failure mode caused by transient null user.

4) Remove optimistic navigation from email login and harden signup/login network handling
- In `src/pages/Login.tsx`:
  - Remove immediate `navigate("/")` after `signInWithEmail`; rely on auth state effect only.
  - Set/clear a pending-auth flag for login/signup attempts.
  - Add clearer network-failure handling for `TypeError: Failed to fetch` with retry guidance.
  - Optionally add one retry for transient network errors before surfacing failure.
- Why: optimistic navigation can race with session establishment and trigger guard redirects in production latency conditions.

5) Finalize PWA callback safety for published app
- In `vite.config.ts`, keep existing `/~oauth` denylist and extend denylist for the new callback route:
  - `/auth/callback` should never be served from stale app shell fallback.
- In `src/main.tsx`, keep preview SW unregister behavior and preserve production update prompt.
- Why: callback endpoints must always hit network path and fresh runtime behavior.

6) Observability to make this truly permanent
- Add concise structured auth logs (client-side) around:
  - Callback start/end
  - Loading resolution reason
  - Guard redirect reason
- This allows fast diagnosis if any edge case reappears.

Files planned for implementation
- `src/App.tsx` (new callback route)
- `src/pages/AuthCallback.tsx` (new)
- `src/contexts/AuthContext.tsx` (state machine hardening)
- `src/components/layout/ProtectedRoute.tsx` (graceful redirect logic)
- `src/pages/Login.tsx` (remove optimistic nav + network hardening)
- `vite.config.ts` (callback route denylist update)

Acceptance criteria (must pass on published domain)
1) Google sign-in:
- User returns from Google and lands on dashboard, not landing.
- No indefinite loading spinner.
2) Email login:
- Successful login consistently lands on dashboard.
3) Email signup:
- Signup request returns cleanly (or deterministic error), no ambiguous fetch failure loop.
- Verification link returns to callback flow and reaches authenticated app.
4) Regression:
- Editor auth still works.
- PWA update prompt remains functional.
- Reset-password flow remains intact.

Technical notes
- This plan focuses on frontend auth orchestration and callback routing; no database schema changes are required.
- Backend provider configuration is likely not the blocker here (token exchanges are already succeeding), so we should prioritize eliminating client-side race conditions and callback routing ambiguity first.
