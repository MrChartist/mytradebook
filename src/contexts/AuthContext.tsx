import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
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

const AUTH_STORAGE_KEY = `sb-nuilpmoipiazjafpjaft-auth-token`;
const MAX_LOADING_MS = 8000; // 8 second max loading time

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingResolved = useRef(false);

  const resolveLoading = () => {
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("[Auth] Profile fetch error:", error);
      }
      setProfile(data);
    } catch (err) {
      console.error("[Auth] Profile fetch exception:", err);
    }
  };

  useEffect(() => {
    console.log("[Auth] Initializing auth context, origin:", window.location.origin);

    // Safety timeout — NEVER let loading hang forever
    const safetyTimer = setTimeout(() => {
      if (!loadingResolved.current) {
        console.warn("[Auth] Safety timeout reached, resolving loading state");
        resolveLoading();
      }
    }, MAX_LOADING_MS);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[Auth] Auth state changed:", event, currentSession ? "session exists" : "no session");

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          console.log("[Auth] User authenticated:", currentSession.user.email);
          // Fetch profile non-blocking
          fetchProfile(currentSession.user.id);
        } else {
          console.log("[Auth] No user session");
          setProfile(null);
        }

        resolveLoading();
      }
    );

    // THEN check for existing session
    const initSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] getSession error:", error);
          // If session is corrupted, clear it
          try {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          } catch (_) {}
          resolveLoading();
          return;
        }

        console.log("[Auth] Initial session check:", existingSession ? "session exists" : "no session");

        setSession(existingSession);
        setUser(existingSession?.user ?? null);

        if (existingSession?.user) {
          console.log("[Auth] Existing user found:", existingSession.user.email);
          await fetchProfile(existingSession.user.id);
        }

        resolveLoading();
      } catch (err) {
        console.error("[Auth] Session init exception:", err);
        // Clear potentially corrupted session data
        try {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        } catch (_) {}
        resolveLoading();
      }
    };

    initSession();

    return () => {
      clearTimeout(safetyTimer);
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
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("[Auth] Sign out error:", err);
    }
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