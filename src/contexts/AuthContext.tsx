import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
  allProfiles: Profile[];
  switchUser: (userId: string) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const noop = async () => ({ error: null });

function makeUser(userId: string, email: string, name: string): User {
  return {
    id: userId,
    email,
    app_metadata: {},
    user_metadata: { full_name: name },
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("[Auth] Failed to fetch profiles:", error);
          setLoading(false);
          return;
        }
        const profiles = data || [];
        setAllProfiles(profiles);
        if (profiles.length > 0) {
          const saved = localStorage.getItem("tradebook_active_user");
          const match = profiles.find((p) => p.user_id === saved);
          setActiveUserId(match ? match.user_id : profiles[0].user_id);
        }
        setLoading(false);
      });
  }, []);

  const switchUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    localStorage.setItem("tradebook_active_user", userId);
  }, []);

  const activeProfile = allProfiles.find((p) => p.user_id === activeUserId) || null;

  const user = activeProfile
    ? makeUser(activeProfile.user_id, activeProfile.email || "", activeProfile.name || "User")
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        profile: activeProfile,
        loading,
        allProfiles,
        switchUser,
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
