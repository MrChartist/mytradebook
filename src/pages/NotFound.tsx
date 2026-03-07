import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { FileQuestion, Home, BookOpen, LogIn, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/SEOHead";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const popularLinks = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Documentation", href: "/docs", icon: BookOpen },
  { label: "Login", href: "/login", icon: LogIn },
];

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <SEOHead title="Page Not Found" path={location.pathname} noIndex />
      <div className="flex min-h-screen items-center justify-center bg-background p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-destructive/8 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-lg w-full text-center"
        >
          {/* Logo */}
          <Link to="/" className="inline-block mb-8">
            <img src={logo} alt="TradeBook" className="h-10 object-contain mx-auto" />
          </Link>

          {/* 404 Hero */}
          <div className="liquid-glass p-8 sm:p-10 mb-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6"
            >
              <FileQuestion className="w-10 h-10 text-destructive" />
            </motion.div>

            <h1 className="text-6xl font-bold mb-2 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
              404
            </h1>
            <p className="text-lg font-medium text-foreground mb-2">Page not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              The path{" "}
              <code className="px-1.5 py-0.5 rounded-md bg-muted text-xs font-mono">
                {location.pathname}
              </code>{" "}
              doesn't exist or has been moved.
            </p>

            <Button asChild size="lg" className="gap-2">
              <Link to={user ? "/dashboard" : "/"}>
                <Home className="w-4 h-4" />
                {user ? "Go to Dashboard" : "Go Home"}
              </Link>
            </Button>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3">
            {popularLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  to={link.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-card/80 transition-all text-sm text-muted-foreground hover:text-foreground"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{link.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
