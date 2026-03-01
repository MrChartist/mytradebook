

# Fix Dhan OAuth Callback Not Persisting Connection

## Root Cause

After you complete the Dhan one-time login, the redirect comes back to `/dhan-callback` in a **new browser tab**. This fails because:

1. **Auth session missing in new tab**: The callback page requires authentication (`ProtectedRoute`), but the new tab opened by `window.open()` doesn't share the authenticated session from the preview iframe. So `user?.id` is `null`, and the page shows "Missing authorization parameters."

2. **localStorage not shared**: The `dhan_consent_id` stored in localStorage before opening the new tab isn't available in the new tab's context (different origin between preview iframe and the new tab).

3. **Result**: The token exchange never happens. The DB confirms this -- your API key and secret are saved, but `dhan_enabled` is still `false` and there's no access token.

## Solution

### 1. Make `/dhan-callback` a standalone public route (not inside ProtectedRoute)

**File:** `src/App.tsx`

Move the `/dhan-callback` route OUT of the `ProtectedRoute` wrapper so it works even without an active session in the new tab. The callback page will handle auth independently.

### 2. Update DhanCallback to work without pre-existing auth session

**File:** `src/pages/DhanCallback.tsx`

Instead of relying on `useAuth()` for the user ID, pass the `user_id` through the OAuth flow:
- Before opening the Dhan auth window, encode the `user_id` into the redirect URL as a query parameter (or store it server-side with the consent ID)
- The callback page reads `user_id` from the URL or retrieves it from the consent record
- Call `exchange-token` with the user_id from the URL, bypassing the need for an active session

### 3. Store user_id with consent in the backend

**File:** `supabase/functions/dhan-auth/index.ts`

During `generate-consent`, save the consent ID and user_id mapping in `user_settings` (it's already saving the API key/secret there). Then during `exchange-token`, allow looking up the user_id from the consent_id if not provided directly.

### 4. Update IntegrationsSettings to pass user context in redirect URL

**File:** `src/components/settings/IntegrationsSettings.tsx`

Modify the redirect URL to include a state parameter:
```
redirect_url: `${origin}/dhan-callback?state=${user.id}`
```

Or better: store the consent-to-user mapping server-side so the callback only needs `tokenId` and `consentId`.

## Detailed Changes

### A. `src/App.tsx`
- Remove `/dhan-callback` from the protected routes array
- Add it as a separate, standalone `<Route>` without `ProtectedRoute` wrapper (similar to how `/login` is handled)

### B. `src/pages/DhanCallback.tsx`
- Remove dependency on `useAuth()` for getting user_id
- Instead, look up user_id from the consent_id by calling a new backend action `resolve-consent`
- If `consentId` is in the URL params, use it directly; if not, check localStorage as fallback
- Add better error messages for each failure case
- After successful connection, redirect to `/settings?tab=integrations`

### C. `supabase/functions/dhan-auth/index.ts`
- During `generate-consent`: also save `dhan_consent_id` to `user_settings` so we can look up user_id from consent_id later
- Add new action `resolve-consent`: given a consent_id, return the user_id (so the callback page can identify who is connecting)

### D. `src/components/settings/IntegrationsSettings.tsx`
- Save consent_id to user_settings via the backend (already happens in generate-consent)
- No major changes needed here, but ensure the redirect URL is correctly formed

## Flow After Fix

```text
1. User clicks "Authorize with Dhan" in Settings
2. Backend saves API key, secret, AND consent_id to user_settings
3. New tab opens with Dhan login
4. User completes login, Dhan redirects to /dhan-callback?tokenId=xxx
5. Callback page (now PUBLIC route) reads tokenId from URL
6. Callback reads consentId from URL or localStorage
7. Callback calls backend "exchange-token" with consent_id + token_id
8. Backend looks up user from consent_id, exchanges token, saves access_token
9. Callback shows success, redirects to /settings
```

## Files Modified

1. `src/App.tsx` -- Move dhan-callback to public route
2. `src/pages/DhanCallback.tsx` -- Remove auth dependency, use consent-based user lookup
3. `supabase/functions/dhan-auth/index.ts` -- Save consent_id mapping, add resolve-consent action
4. `src/components/settings/IntegrationsSettings.tsx` -- Minor: pass consent_id in redirect URL params

