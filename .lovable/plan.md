
Goal: fix why preview shows old UI and why data feels “not real-time,” so updates become reliable and visible immediately.

What I found (from code + your answers):
1) You’re seeing this in editor preview (not the published site), and hard refresh didn’t fix it.
2) The app has PWA caching enabled globally (`vite-plugin-pwa` in `vite.config.ts`) with precache for JS/CSS/HTML.
3) There is no explicit in-app “new version available, reload now” handling.
4) Most app data hooks use React Query fetch + invalidate, but no database realtime subscriptions are implemented (except live prices polling with `setInterval` in `useLivePrices`).
5) This combination can produce exactly your symptoms:
   - “old UI” from service-worker cached app shell/assets
   - “not updating in real time” for trades/settings/alerts changed in another tab/process

Implementation plan

Phase 1 — Stabilize preview update behavior (highest priority)
- Update PWA strategy so preview never stays stuck on old cached bundles.
- Add environment-aware behavior:
  - In preview/editor origins: disable or aggressively unregister service worker.
  - In published production origin: keep PWA, but use controlled update flow.
- Reduce over-aggressive precaching in Workbox (avoid caching patterns that preserve stale HTML shell too long).

Files:
- `vite.config.ts`
- `src/main.tsx`

Phase 2 — Add deterministic app-version refresh UX
- Register update listener on app boot:
  - when a new build is available, show toast/banner: “New version available — Refresh”.
  - one-click refresh should call service-worker update + reload.
- Add a lightweight build/version marker in UI (e.g., footer or settings) so you can confirm immediately that new code is loaded.

Files:
- `src/main.tsx`
- `src/components/ui/sonner.tsx` (or existing toast entry point)
- `src/components/settings/PreferencesSettings.tsx` (optional version display)

Phase 3 — Make key data actually realtime (not just refetch on mutation)
- Add realtime subscriptions for user-scoped tables that must update instantly across tabs/sessions:
  - `trades`
  - `alerts`
  - `user_settings` (important for integration states like Dhan/Telegram)
- On subscription events, invalidate relevant React Query keys.

Files:
- `src/hooks/useTrades.ts`
- `src/hooks/useAlerts.ts`
- `src/hooks/useUserSettings.ts`
- (optional shared utility) `src/hooks/useRealtimeInvalidate.ts`

Phase 4 — Prevent stale auth/integration state perception
- After callback-driven state changes (like Dhan connect), avoid full page reload as primary sync mechanism.
- Use query invalidation + realtime updates so original tab reflects changes immediately without manual refresh.
- Keep fallback reload only for hard recovery.

Files:
- `src/components/settings/IntegrationsSettings.tsx`
- `src/pages/DhanCallback.tsx`

Phase 5 — Verification checklist (end-to-end)
1) Preview update test:
   - make a visible UI text change
   - confirm preview reflects it without stale old shell
   - verify version marker increments/changes.
2) Multi-tab realtime test:
   - open two tabs, create/update trade in tab A
   - verify tab B updates within seconds without manual refresh.
3) Integration state test:
   - complete Dhan flow
   - settings page reflects connected state immediately.
4) Regression test:
   - published site still supports PWA install + offline basics.

Technical notes and trade-offs
- Keeping PWA in production is fine; the issue is uncontrolled update behavior in preview/editor plus no user-visible update prompt.
- Realtime subscriptions will slightly increase client event traffic but are the correct UX model for “instant” cross-tab updates.
- Query invalidation remains useful; realtime should trigger invalidations, not replace existing query hooks.

Expected outcome
- No more “old UI” lingering in preview after changes.
- Clear “new version available” refresh path when a new build is ready.
- Trades/alerts/settings reflect cross-tab and backend-triggered changes in near real-time.
