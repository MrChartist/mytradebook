

# Fix Preview Navigation and Google Auth Behavior

## Issues Found

### 1. Preview shows Landing page, not Login page
You're currently on the `/` route, which is a protected page. Since you're not logged in, it redirects you to `/landing` (not `/login`). This might be why you feel the preview isn't working -- you may be seeing the landing page instead of the login page.

### 2. Google Auth -- Popup vs Redirect
Good news: **Google sign-in already opens in a popup window** when you use it from the Lovable preview (the right panel). On the published site (mytradebook.lovable.app), it uses a full-page redirect instead -- this is the standard, secure approach for OAuth on standalone websites and is controlled by the authentication library. This behavior cannot be changed to popup on the published site.

## Plan

### Step 1: Fix the redirect destination
Change the ProtectedRoute to redirect unauthenticated users to `/login` instead of `/landing`, so you always see the login form when not signed in.

**File: `src/components/layout/ProtectedRoute.tsx`**
- Change `Navigate to="/landing"` to `Navigate to="/login"`

### Step 2: Improve Google Auth error handling on Login page
Add better error messages and ensure the loading state always resets properly, so the button never gets permanently stuck in "Connecting..." state.

**File: `src/pages/Login.tsx`**
- Add a timeout safety net that resets `googleLoading` after 10 seconds
- Improve the error toast to suggest opening in a new tab if popup is blocked

### Step 3: Ensure preview loads the login page
The preview should now correctly show the login page when you're not authenticated, instead of showing the landing page.

---

## Technical Details

| Change | File | What |
|--------|------|------|
| Redirect to `/login` | `src/components/layout/ProtectedRoute.tsx` | Line 24: change `/landing` to `/login` |
| Safer Google loading state | `src/pages/Login.tsx` | Reset `googleLoading` with a longer safety timeout and clearer error messages |

