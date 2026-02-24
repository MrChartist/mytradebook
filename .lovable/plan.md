

# Add Forgot Password / Reset Password Flow

## Overview

Add a complete password reset flow with two parts:
1. A "Forgot password?" link on the login page that sends a reset email
2. A new `/reset-password` page where users set their new password after clicking the email link

## Changes

### 1. Add `resetPassword` method to AuthContext

**File: `src/contexts/AuthContext.tsx`**

- Add a `resetPassword(email: string)` method that calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Add an `updatePassword(password: string)` method that calls `supabase.auth.updateUser({ password })`
- Export both in the context type interface

### 2. Add "Forgot password?" link to Login page

**File: `src/pages/Login.tsx`**

- Add a "Forgot password?" button below the password field (only visible in "Sign In" mode)
- Clicking it shows an inline form: email input + "Send Reset Link" button (replaces the login form temporarily)
- On success, show a toast confirming the email was sent
- Add a "Back to Sign In" link to return to the login form
- This avoids creating a separate page -- keeps everything on the login page using a new `authMode` value: `"forgot"`

### 3. Create Reset Password page

**File: `src/pages/ResetPassword.tsx`** (new file)

- A public page at `/reset-password`
- Detects the `type=recovery` token in the URL hash (set automatically by the authentication system)
- Shows a form with "New Password" and "Confirm Password" fields
- On submit, calls `supabase.auth.updateUser({ password })` to set the new password
- On success, redirects to `/login` with a toast
- If no recovery token is detected, shows a message explaining the link is invalid or expired

### 4. Add route for Reset Password

**File: `src/App.tsx`**

- Add `<Route path="/reset-password" element={<ResetPassword />} />` as a public route (not behind ProtectedRoute)

## Technical Details

### Auth mode update in Login.tsx

```text
type AuthMode = "login" | "signup" | "phone" | "forgot"
```

The "forgot" mode shows only an email field and a "Send Reset Link" button, with a link back to sign in.

### Reset Password page flow

```text
1. User clicks reset link in email
2. Browser opens /reset-password#access_token=...&type=recovery&...
3. Supabase client auto-detects the recovery token from the hash
4. onAuthStateChange fires with event = "PASSWORD_RECOVERY"
5. Page shows new password form
6. User submits -> updateUser({ password }) is called
7. Redirect to /login with success toast
```

### Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `resetPassword` and `updatePassword` methods |
| `src/pages/Login.tsx` | Add "Forgot password?" link and inline forgot password form |
| `src/pages/ResetPassword.tsx` | New page for setting a new password after clicking the reset email link |
| `src/App.tsx` | Add `/reset-password` public route |

