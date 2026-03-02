import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

const CALLBACK_TIMEOUT_MS = 15000;

export default function AuthCallback() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timedOut, setTimedOut] = useState(false);
  const [progress, setProgress] = useState(0);

  // Navigate to dashboard once user is confirmed
  useEffect(() => {
    if (user) {
      console.log("[AuthCallback] User confirmed, navigating to dashboard");
      // Clear the pending-auth flag
      try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  // If auth loading finishes with no user and not timed out, wait a beat then timeout
  useEffect(() => {
    if (!loading && !user && !timedOut) {
      // Auth resolved with no user — give a small grace then show error
      const t = setTimeout(() => setTimedOut(true), 2000);
      return () => clearTimeout(t);
    }
  }, [loading, user, timedOut]);

  // Progress bar + hard timeout
  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / CALLBACK_TIMEOUT_MS) * 100, 100);
      setProgress(pct);
      if (elapsed >= CALLBACK_TIMEOUT_MS) {
        setTimedOut(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  if (timedOut && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-14 h-14 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Sign-in couldn't complete</h2>
            <p className="text-muted-foreground text-sm">
              The authentication process took too long or encountered an error. Please try again.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => { window.location.href = "/login"; }} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/landing"; }} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-xs w-full text-center space-y-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
        <div>
          <h2 className="text-lg font-semibold mb-1">Completing sign-in…</h2>
          <p className="text-muted-foreground text-sm">Please wait while we verify your credentials.</p>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
    </div>
  );
}
