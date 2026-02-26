import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { TrendingUp, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.3)] mx-auto mb-8">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>

        {/* Error */}
        <h1 className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary to-purple-600 mb-3">
          404
        </h1>
        <h2 className="text-xl font-semibold mb-2">Page not found</h2>
        <p className="text-muted-foreground text-sm mb-2">
          The page <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{location.pathname}</code> doesn't exist.
        </p>
        <p className="text-muted-foreground text-sm mb-8">
          It may have been moved or you may have mistyped the URL.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
          <Button onClick={() => navigate("/")} className="gap-2">
            <Home className="w-4 h-4" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
