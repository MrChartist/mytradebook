import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead title="Page Not Found" path={location.pathname} noIndex />
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="surface-card max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-lg text-muted-foreground mb-2">Page not found</p>
          <p className="text-sm text-muted-foreground mb-6">
            The path <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">{location.pathname}</code> doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
