import { createContext, useContext, ReactNode } from "react";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const DUMMY_USER_ID = "00000000-0000-0000-0000-000000000000";

// Create a minimal User-like object that satisfies hooks needing user.id
const dummyUser = {
  id: DUMMY_USER_ID,
  email: "local@tradebook.app",
  app_metadata: {},
  user_metadata: { full_name: "Local User" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

const dummyProfile: Profile = {
  id: DUMMY_USER_ID,
  user_id: DUMMY_USER_ID,
  name: "Local User",
  email: "local@tradebook.app",
  phone: null,
  is_active: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const noop = async () => ({ error: null });

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider
      value={{
        user: dummyUser,
        session: null,
        profile: dummyProfile,
        loading: false,
        signInWithEmail: noop,
        signUpWithEmail: noop,
        signInWithGoogle: noop,
        resetPassword: noop,
        updatePassword: noop,
        signOut: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
