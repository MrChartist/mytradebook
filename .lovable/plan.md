

# Plan: Restore Authentication, Landing Page, and User-Based Journal

## Overview
Re-enable the full authentication system so each user has their own private trading journal. This brings back the Login page, Landing page, password reset, route protection, and re-enables Row Level Security on all tables.

---

## What Changes

### 1. Database Migration -- Re-enable RLS on All Tables
Create a migration that runs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all 28 tables that were previously disabled. The existing RLS policies (e.g., "Users can view own trades") are still in the database -- they just need RLS turned back on to take effect.

### 2. Restore AuthContext (`src/contexts/AuthContext.tsx`)
Replace the current dummy profile-fetcher with real Supabase Auth:
- Use `supabase.auth.onAuthStateChange` as the single source of truth
- Implement real `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `resetPassword`, `updatePassword`, and `signOut`
- Fetch the user's profile from the `profiles` table after authentication
- Remove the `allProfiles` / `switchUser` multi-user concept (each user only sees their own data)

### 3. Update Routing (`src/App.tsx`)
- Wrap all app routes with `ProtectedRoute` so unauthenticated users are redirected to `/login`
- Add public routes:
  - `/landing` -- the marketing landing page
  - `/login` -- the login/signup page
  - `/reset-password` -- the password reset page
- Root `/` shows `Landing` for unauthenticated users, `Dashboard` for authenticated users (via Index page update)

### 4. Update Index Page (`src/pages/Index.tsx`)
- If user is authenticated, show Dashboard inside MainLayout
- If not authenticated, redirect to `/landing`

### 5. Update Landing Page (`src/pages/Landing.tsx`)
- Already exists with full content (hero, features, pricing, testimonials, footer)
- Update navigation links to point to `/login` (already does)
- If user is already logged in, redirect to `/`

### 6. Login Page (`src/pages/Login.tsx`)
- Already exists with login/signup/forgot-password modes, Google OAuth, password strength indicator
- Will work once AuthContext provides real auth functions

### 7. Reset Password Page (`src/pages/ResetPassword.tsx`)
- Already exists and functional
- Will work once AuthContext provides real `updatePassword`

### 8. Update Sidebar (`src/components/layout/Sidebar.tsx`)
- Add back the Logout button in the bottom section
- Call `signOut()` from AuthContext and redirect to `/landing`

### 9. Update ProfileSettings (`src/components/settings/ProfileSettings.tsx`)
- Remove the user-switcher dropdown (no longer needed)
- Show the authenticated user's profile info instead

---

## Technical Details

### RLS Migration SQL
```sql
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_events ENABLE ROW LEVEL SECURITY;
-- ... (all 28 tables)
```

### AuthContext Core Logic
```typescript
// Real Supabase auth using onAuthStateChange
supabase.auth.onAuthStateChange((event, session) => {
  setUser(session?.user ?? null);
  if (session?.user) fetchProfile(session.user.id);
});
```

### Route Structure
```text
/landing        -- Public: Landing page (marketing)
/login          -- Public: Login/Signup
/reset-password -- Public: Password reset
/               -- Protected: Dashboard
/trades         -- Protected: Trades
/journal        -- Protected: Journal
... (all other app routes)
```

### Sequencing
1. Database migration (re-enable RLS) -- must happen first
2. AuthContext restoration -- core dependency
3. App.tsx routing + Index.tsx update
4. Sidebar logout button
5. ProfileSettings cleanup

