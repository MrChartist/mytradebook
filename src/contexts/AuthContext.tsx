import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

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
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth] Initializing auth context, origin:", window.location.origin);

    // Create AbortController for cleanup
    const abortController = new AbortController();
    let isMounted = true;

    // Helper function to fetch profile (consolidated logic)
    const fetchProfile = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("[Auth] Profile fetch error:", error);
          return null;
        }

        // Only update state if component is still mounted
        if (isMounted && !abortController.signal.aborted) {
          setProfile(data);
        }

        return data;
      } catch (error) {
        console.error("[Auth] Profile fetch exception:", error);
        return null;
      }
    };

    // Initialize auth state
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] getSession error:", error);
        }

        // Check if still mounted before updating state
        if (!isMounted || abortController.signal.aborted) return;

        console.log("[Auth] Initial session check:", session ? "session exists" : "no session");

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log("[Auth] Existing user found:", session.user.email);
          await fetchProfile(session.user.id);
        }
      } finally {
        // Always set loading to false after initialization
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[Auth] Auth state changed:", event, newSession ? "session exists" : "no session");

        // Only update if still mounted
        if (!isMounted || abortController.signal.aborted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          console.log("[Auth] User authenticated:", newSession.user.email);
          await fetchProfile(newSession.user.id);
        } else {
          console.log("[Auth] No user session");
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Start initialization
    initAuth();

    // Cleanup function
    return () => {
      console.log("[Auth] Cleaning up auth context");
      isMounted = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: name,
        },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    return { error: error ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
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
