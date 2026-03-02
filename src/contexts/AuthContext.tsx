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

/** Detect if the current page load is an auth callback (OAuth redirect, email verification, etc.) */
const detectAuthCallback = (): boolean => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  // Path-based detection (our dedicated callback route)
  if (path === "/auth/callback") return true;

  // Token/param-based detection (Supabase redirects tokens in hash)
  return (
    hash.includes("access_token") ||
    hash.includes("refresh_token") ||
    hash.includes("type=recovery") ||
    hash.includes("type=signup") ||
    hash.includes("type=magiclink") ||
    search.includes("code=")
  );
};

const IS_AUTH_CALLBACK = detectAuthCallback();
// Normal page loads: resolve fast. Auth callbacks: generous timeout.
const MAX_LOADING_MS = IS_AUTH_CALLBACK ? 15000 : 1500;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingResolved = useRef(false);

  const resolveLoading = (reason: string) => {
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      console.log("[Auth] Loading resolved:", reason);
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
    console.log("[Auth] Init | origin:", window.location.origin, "| callback:", IS_AUTH_CALLBACK, "| path:", window.location.pathname);

    // Safety timeout — NEVER let loading hang forever
    const safetyTimer = setTimeout(() => {
      resolveLoading("safety-timeout");
    }, MAX_LOADING_MS);

    // 1. Set up auth state listener FIRST (before getSession)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[Auth] onAuthStateChange:", event, currentSession?.user?.email ?? "no-user");

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          fetchProfile(currentSession.user.id);
          resolveLoading(`auth-event:${event}`);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          resolveLoading("signed-out-event");
        }
        // For other events without a session (e.g. TOKEN_REFRESHED failure during callback),
        // do NOT resolve — let the safety timeout or a subsequent event handle it.
      }
    );

    // 2. Check for existing session
    const initSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] getSession error:", error);
          // Only clear storage for non-callback flows to avoid destroying in-flight token exchange
          if (!IS_AUTH_CALLBACK) {
            try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
          }
          if (!IS_AUTH_CALLBACK) resolveLoading("getSession-error");
          return;
        }

        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          console.log("[Auth] Existing session:", existingSession.user.email);
          fetchProfile(existingSession.user.id);
          resolveLoading("existing-session");
        } else if (!IS_AUTH_CALLBACK) {
          // No session AND not a callback — safe to declare "no user"
          setSession(null);
          setUser(null);
          resolveLoading("no-session-no-callback");
        }
        // If IS_AUTH_CALLBACK but no session yet: wait for onAuthStateChange or safety timeout
      } catch (err) {
        console.error("[Auth] Session init exception:", err);
        if (!IS_AUTH_CALLBACK) {
          try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
        }
        if (!IS_AUTH_CALLBACK) resolveLoading("init-exception");
      }
    };

    initSession();

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    // Set pending flag so route guard shows loader instead of redirecting
    try { sessionStorage.setItem("tb-auth-pending", "1"); } catch (_) {}
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}
      }
      return { error };
    } catch (err) {
      try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    // Set pending flag
    try { sessionStorage.setItem("tb-auth-pending", "1"); } catch (_) {}
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    if (error) {
      try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}
    }
    return { error: error ?? null };
  };

  const signOut = async () => {
    try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}
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
      value={{ user, session, profile, loading, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut }}
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
