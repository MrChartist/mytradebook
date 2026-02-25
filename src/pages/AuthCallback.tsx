import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const handleAuthCallback = async () => {
      try {
        // PKCE flow: extract `code` from URL query params
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          console.log("[AuthCallback] Exchanging code for session...");
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.error("[AuthCallback] Code exchange failed:", exchangeError);
            if (!cancelled) setError(exchangeError.message);
            return;
          }
          console.log("[AuthCallback] Code exchange successful");
          if (!cancelled) navigate("/", { replace: true });
          return;
        }

        // Implicit flow or hash-based redirect (e.g., email confirmation)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        if (accessToken) {
          console.log("[AuthCallback] Hash-based session detected, waiting for auth state...");
          // The Supabase client auto-detects hash fragments and fires onAuthStateChange
        }

        // Listen for auth state changes (covers both flows)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event) => {
            console.log("[AuthCallback] Auth event:", event);
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
              if (!cancelled) navigate("/", { replace: true });
            }
          }
        );

        // Check if there's already a session (user might already be signed in)
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          navigate("/", { replace: true });
          return;
        }

        // Fallback: if nothing happens within 10 seconds, show error
        const timeout = setTimeout(() => {
          if (!cancelled) {
            setError("Authentication timed out. Please try signing in again.");
          }
        }, 10000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      } catch (err) {
        console.error("[AuthCallback] Unexpected error:", err);
        if (!cancelled) setError("An unexpected error occurred. Please try again.");
      }
    };

    handleAuthCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 max-w-md text-center p-6">
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sign-in Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign-in...</p>
      </div>
    </div>
  );
}
