import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Check if an auth attempt is in flight (login button pressed, OAuth redirect)
  const isPending = (() => {
    try { return sessionStorage.getItem("tb-auth-pending") === "1"; } catch { return false; }
  })();

  // While auth is loading OR a pending auth attempt exists, show loader
  if (loading || (!user && isPending)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to /landing");
    return <Navigate to="/landing" replace />;
  }

  // User exists — clear pending flag if lingering
  try { sessionStorage.removeItem("tb-auth-pending"); } catch (_) {}

  return <>{children}</>;
}
