

# Fix Dhan Callback "Missing consentId" Error

## Root Cause

The callback page at `/dhan-callback` receives only `?tokenId=xxx` from Dhan -- Dhan does NOT include the `consentId` in the redirect URL. The code tries two fallbacks:

1. `searchParams.get("consentId")` -- always null (Dhan doesn't send it)
2. `localStorage.getItem("dhan_consent_id")` -- always null in the new tab (different browser context from the preview iframe)

So the page hits the "Missing consentId" error before it ever tries the token exchange.

## Solution

Remove the consentId requirement from the callback page entirely. Instead, use the `tokenId` (which Dhan DOES provide) to look up the pending consent directly from the database.

### 1. New backend action: `resolve-by-token` in `dhan-auth` edge function

Add a new action that finds the user with a pending Dhan connection:
- Query `user_settings` for rows where `dhan_consent_id IS NOT NULL` and `dhan_enabled = false`
- Return the `user_id` and `dhan_consent_id` so the callback can proceed with the token exchange

This works because only one user is in the "pending authorization" state at a time.

### 2. Update `DhanCallback.tsx`

Change the flow:
- Only require `tokenId` from URL params (remove consentId requirement)
- Call the new `resolve-by-token` action to get both `user_id` and `consent_id` from the database
- Then proceed with `exchange-token` as before

### New callback flow

```text
1. Dhan redirects to /dhan-callback?tokenId=xxx
2. Callback reads tokenId from URL
3. Calls backend "resolve-by-token" (no params needed)
4. Backend finds user with pending consent (dhan_consent_id IS NOT NULL, dhan_enabled = false)
5. Returns user_id + consent_id
6. Callback calls "exchange-token" with all three values
7. Success -> redirect to /settings
```

## Files Modified

1. **`supabase/functions/dhan-auth/index.ts`** -- Add `resolve-by-token` action that finds the pending consent user
2. **`src/pages/DhanCallback.tsx`** -- Remove consentId requirement, use new backend lookup instead

## Why Previous Fix Failed

The previous fix added `resolve-consent` which still required knowing the `consent_id` upfront. But the whole problem is that the callback page has no way to get the consent_id -- Dhan doesn't send it and localStorage doesn't work cross-tab. The new approach bypasses this by finding the pending connection directly in the database.
