

# Make Login Smooth and Easy to Use

## Problems Found

1. **Auth loading can hang forever**: The `fetchProfile` call in `AuthContext` uses `await` inside `onAuthStateChange`. If the profile fetch is slow or fails (e.g., new user with no profile row yet), it blocks `setLoading(false)`. This can leave the entire app stuck on a spinner.

2. **Login page shows spinner even when user is already signed in**: If a signed-in user visits `/login`, they see the auth loading spinner instead of being instantly redirected.

3. **No smooth transitions or animations**: The login form switches between modes (Sign In / Sign Up / Phone / Forgot) with no animation -- feels abrupt.

4. **Google Auth UX is fragile**: The 10-second timeout fallback is clunky. If auth completes faster, the spinner hangs unnecessarily.

5. **Phone OTP sets `otpSent` before confirming success**: The OTP form transitions to the "enter code" screen even if the OTP send request fails.

6. **No password strength indicator on signup**: Users get no feedback about password quality.

7. **No "Resend OTP" option**: Users who don't receive the OTP have to go back and start over.

---

## Plan

### 1. Fix Auth Loading Reliability (AuthContext.tsx)

- Don't `await` the profile fetch inside `onAuthStateChange` -- call `setLoading(false)` first, then fetch profile in the background. This ensures the app never hangs waiting for a profile query.
- Add a try/catch around `fetchProfile` so errors don't silently break loading.
- Increase the no-session fallback timeout from 100ms to 500ms for more reliability.

### 2. Fix Login Page Redirect (Login.tsx)

- If user is already authenticated when the login page mounts, immediately redirect to `/` without showing the loading spinner or any form.

### 3. Fix Phone OTP Flow (Login.tsx)

- Only transition to OTP entry screen after confirming the OTP was sent successfully (check for no error).
- Add a "Resend OTP" button with a 30-second cooldown timer so users can retry without going back.

### 4. Add Smooth Transitions (Login.tsx)

- Add CSS transition/animation when switching between auth modes (fade + slight slide).
- Add a subtle entrance animation for the form card on page load.

### 5. Improve Form UX (Login.tsx)

- Add a simple password strength indicator for the signup form (weak/medium/strong bar).
- Auto-focus the first input field when switching auth modes.
- Show inline validation hints (e.g., "Min 6 characters" below password field on signup).
- Improve the Google button with proper brand colors for the Google icon (multi-color SVG).

### 6. Better Loading States (Login.tsx)

- Replace the full-screen spinner with a skeleton of the login form during auth check, so the page feels responsive even while loading.
- For Google auth, show "Connecting to Google..." text with the spinner instead of a generic spinner.

---

## Technical Details

### AuthContext.tsx Changes

```text
// Before (blocks on profile fetch):
if (session?.user) {
  await fetchProfile(session.user.id);
}
setLoading(false);

// After (non-blocking):
setLoading(false);
if (session?.user) {
  fetchProfile(session.user.id); // fire and forget
}
```

### Login.tsx Changes

- New state: `resendCooldown` (number) for OTP resend timer
- New state: `passwordStrength` computed from password value
- PhoneOTPForm: only set `otpSent(true)` inside the success branch (no error)
- Add `useRef` for auto-focusing inputs on mode switch
- Add CSS classes for fade transition between modes
- Add `animate-in` keyframe for card entrance

### Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Non-blocking profile fetch, better error handling, longer fallback timeout |
| `src/pages/Login.tsx` | Fix OTP flow, add resend button, password strength, transitions, auto-focus, better loading states, Google button colors |
| `src/index.css` | Add fade-in transition utility class for auth form switching |

