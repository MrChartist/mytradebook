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
const PENDING_FLAG = "tb-auth-pending";

/** Check if the pending-auth flag is set */
const hasPendingFlag = (): boolean => {
  try { return sessionStorage.getItem(PENDING_FLAG) === "1"; } catch { return false; }
};

/** Clear the pending-auth flag */
const clearPendingFlag = () => {
  try { sessionStorage.removeItem(PENDING_FLAG); } catch (_) {}
};

/** Set the pending-auth flag */
const setPendingFlag = () => {
  try { sessionStorage.setItem(PENDING_FLAG, "1"); } catch (_) {}
};

/** Detect if the current page load is an auth callback */
const detectAuthCallback = (): boolean => {
  const path = window.location.pathname;
  const hash = window.location.hash;
  const search = window.location.search;

  if (path === "/auth/callback") return true;

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
const IS_PENDING = hasPendingFlag();

// Key fix: extend timeout when pending flag is set (Google OAuth may redirect to / not /auth/callback)
const MAX_LOADING_MS = (IS_AUTH_CALLBACK || IS_PENDING) ? 15000 : 1500;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingResolved = useRef(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolveLoading = (reason: string) => {
    if (!loadingResolved.current) {
      loadingResolved.current = true;
      console.log("[Auth] Loading resolved:", reason);
      setLoading(false);
      // Stop polling if running
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
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
    console.log("[Auth] Init | callback:", IS_AUTH_CALLBACK, "| pending:", IS_PENDING, "| timeout:", MAX_LOADING_MS);

    // Safety timeout — NEVER let loading hang forever
    const safetyTimer = setTimeout(() => {
      resolveLoading("safety-timeout");
    }, MAX_LOADING_MS);

    // 1. Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[Auth] onAuthStateChange:", event, currentSession?.user?.email ?? "no-user");

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          // Clear pending flag on successful auth
          clearPendingFlag();
          fetchProfile(currentSession.user.id);
          resolveLoading(`auth-event:${event}`);
        } else if (event === "SIGNED_OUT") {
          setSession(null);
          setUser(null);
          setProfile(null);
          clearPendingFlag();
          resolveLoading("signed-out-event");
        }
      }
    );

    // 2. Check for existing session
    const initSession = async () => {
      try {
        const { data: { session: existingSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("[Auth] getSession error:", error);
          if (!IS_AUTH_CALLBACK && !IS_PENDING) {
            try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
          }
          if (!IS_AUTH_CALLBACK && !IS_PENDING) resolveLoading("getSession-error");
          return;
        }

        if (existingSession?.user) {
          setSession(existingSession);
          setUser(existingSession.user);
          clearPendingFlag();
          console.log("[Auth] Existing session:", existingSession.user.email);
          fetchProfile(existingSession.user.id);
          resolveLoading("existing-session");
        } else if (!IS_AUTH_CALLBACK && !IS_PENDING) {
          setSession(null);
          setUser(null);
          resolveLoading("no-session-no-callback");
        } else {
          // Callback or pending: start polling for session
          console.log("[Auth] No session yet, starting poll...");
          startSessionPolling();
        }
      } catch (err) {
        console.error("[Auth] Session init exception:", err);
        if (!IS_AUTH_CALLBACK && !IS_PENDING) {
          try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch (_) {}
        }
        if (!IS_AUTH_CALLBACK && !IS_PENDING) resolveLoading("init-exception");
      }
    };

    // 3. Session polling: retry getSession() periodically during callback/pending flows
    const startSessionPolling = () => {
      let attempts = 0;
      const MAX_ATTEMPTS = 6; // ~9s of polling
      pollingRef.current = setInterval(async () => {
        attempts++;
        console.log("[Auth] Poll attempt", attempts);
        try {
          const { data: { session: polledSession } } = await supabase.auth.getSession();
          if (polledSession?.user) {
            setSession(polledSession);
            setUser(polledSession.user);
            clearPendingFlag();
            fetchProfile(polledSession.user.id);
            resolveLoading(`poll-success:${attempts}`);
          } else if (attempts >= MAX_ATTEMPTS) {
            console.log("[Auth] Poll exhausted, waiting for safety timeout");
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        } catch (err) {
          console.error("[Auth] Poll error:", err);
        }
      }, 1500);
    };

    initSession();

    return () => {
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setPendingFlag();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        clearPendingFlag();
      }
      return { error };
    } catch (err) {
      clearPendingFlag();
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
    setPendingFlag();
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
      extraParams: { prompt: "select_account" },
    });
    if (error) {
      clearPendingFlag();
    }
    return { error: error ?? null };
  };

  const signOut = async () => {
    clearPendingFlag();
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
