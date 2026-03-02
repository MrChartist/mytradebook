import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const PENDING_FLAG = "tb-auth-pending";
const PENDING_TIMEOUT_MS = 12000; // 12s escape hatch

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  const [isPending, setIsPending] = useState(() => {
    try { return sessionStorage.getItem(PENDING_FLAG) === "1"; } catch { return false; }
  });

  // Safety timeout: if pending but no user after 12s, clear flag and stop blocking
  useEffect(() => {
    if (!isPending || user) return;

    const timer = setTimeout(() => {
      console.log("[ProtectedRoute] Pending timeout reached, clearing flag");
      try { sessionStorage.removeItem(PENDING_FLAG); } catch (_) {}
      setIsPending(false);
    }, PENDING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isPending, user]);

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
    console.log("[ProtectedRoute] No user, redirecting to /");
    return <Navigate to="/" replace />;
  }

  // User exists — clear pending flag if lingering
  try { sessionStorage.removeItem(PENDING_FLAG); } catch (_) {}

  return <>{children}</>;
}
