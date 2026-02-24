

# Fix Google Auth & Add Mobile OTP Login

## Problems Identified

1. **Google Auth hanging after popup**: The `handleGoogleAuth` sets `loading = true` but the Lovable Cloud OAuth flow uses a popup/token exchange (not a redirect). After the popup closes and `setSession` is called internally, the `onAuthStateChange` listener fires -- but the Login component's local `loading` state is never reset on success, leaving the button stuck in a spinner. The `authLoading` from context does resolve, but the local `loading` blocks the UI.

2. **No mobile number OTP login**: Currently only email/password and Google OAuth are supported. Need to add phone-based OTP authentication.

---

## Plan

### 1. Fix Google Auth Loading State (Login.tsx)

- Reset local `loading` state when `user` changes (via the existing `useEffect`), so that after Google auth completes and `onAuthStateChange` fires, the spinner stops and navigation occurs.
- Add a `finally` block equivalent: reset `loading` after a timeout fallback (e.g., 10 seconds) to prevent infinite spinners if something fails silently.

### 2. Add Phone OTP Login (Login.tsx + AuthContext.tsx)

**AuthContext changes:**
- Add `signInWithPhone(phone: string)` method that calls `supabase.auth.signInWithOtp({ phone })`
- Add `verifyPhoneOtp(phone: string, token: string)` method that calls `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`
- Export both in the context type

**Login.tsx UI changes:**
- Add a third auth mode tab: "Phone" alongside "Sign In" and "Sign Up"
- Phone mode shows:
  - Phone number input with +91 prefix (Indian market focus)
  - "Send OTP" button
  - After OTP is sent, show 6-digit OTP input (using the existing `InputOTP` component)
  - "Verify OTP" button
- Handle loading, error, and success states with toasts

### 3. Fix Auth Mode Tabs

- Restructure the tab bar to support 3 modes: "Sign In" | "Sign Up" | "Phone"
- Phone tab shows a simplified flow without password fields

---

## Technical Details

### AuthContext additions

```text
signInWithPhone: (phone: string) => Promise<{ error: Error | null }>
verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: Error | null }>
```

These use the Supabase client directly (not Lovable OAuth module) since phone OTP is a standard Supabase auth feature.

### Login.tsx state additions

```text
authMode: "login" | "signup" | "phone"
phone: string (phone number input)
otpSent: boolean (tracks if OTP has been sent)
otp: string (6-digit OTP value)
```

### Google Auth fix

```text
// In the useEffect watching user:
useEffect(() => {
  if (!authLoading && user) {
    setLoading(false); // Reset local loading
    navigate("/", { replace: true });
  }
}, [user, authLoading, navigate]);
```

### Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add `signInWithPhone` and `verifyPhoneOtp` methods |
| `src/pages/Login.tsx` | Fix Google auth loading state, add Phone OTP tab with send/verify flow, restructure tabs to 3 modes |

