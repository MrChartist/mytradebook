import { useState, useEffect } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader2, Eye, EyeOff, Mail, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const isBusy = loading || authLoading;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          const msg = error.message;
          const isNetworkError = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch");
          toast({
            title: "Login failed",
            description: isNetworkError
              ? "Network error — please check your connection and try again."
              : msg,
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        return;
      }

      if (authMode === "signup") {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          const msg = error.message;
          const isNetworkError = msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("fetch");
          toast({
            title: "Signup failed",
            description: isNetworkError
              ? "Network error — please check your connection and try again."
              : msg,
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Check your email", description: "We've sent you a verification link." });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({ title: "Authentication error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Enter your email", description: "Please enter your email address first.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Reset link sent!", description: "Check your email for a password reset link." });
        setAuthMode("login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Google sign-in failed", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEOHead title="Login" description="Sign in or create your TradeBook account to start journaling trades." path="/login" />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-14">
          <Link to="/landing" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--tb-accent))] flex items-center justify-center">
              <TrendingUp className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">TradeBook</span>
          </Link>

          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link to="/landing#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link to="/landing#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link to="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate("/landing")} className="gap-1.5">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Split Panels */}
      <div className="flex flex-1">
        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(var(--primary) / 0.4) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.4) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
          </div>

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-profit/10 rounded-full blur-[100px]" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">

            <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Know Your{" "}
              <span className="font-dancing italic text-[hsl(var(--tb-accent))]">Edge</span>.
              <br />
              Compound It Daily.
            </h2>

            <p className="text-base text-muted-foreground max-w-md mb-8">
              A structured trading journal and analytics platform for Indian
              markets. Log trades, track performance, and build lasting discipline.
            </p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { color: "bg-profit", label: "Trailing Stop Loss" },
                { color: "bg-primary", label: "AI Insights" },
                { color: "bg-[hsl(var(--tb-accent))]", label: "Rules Engine" },
                { color: "bg-profit", label: "Telegram Alerts" },
                { color: "bg-primary", label: "CSV Import / Export" },
                { color: "bg-[hsl(var(--tb-accent))]", label: "Multi-Leg Strategies" },
                { color: "bg-profit", label: "Watchlists & Scanners" },
                { color: "bg-primary", label: "Weekly Reports" },
                { color: "bg-[hsl(var(--tb-accent))]", label: "Daily Journal" },
                { color: "bg-profit", label: "Position Sizing" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", f.color)} />
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--tb-accent))] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">TradeBook</span>
            </div>

            <div className="surface-card p-8">
              {/* Forgot Password View */}
              {authMode === "forgot" ? (
                <>
                  <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-3xl font-bold mb-2">Reset Password</h3>
                    <p className="text-muted-foreground text-base">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        autoComplete="email"
                        inputMode="email"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isBusy}>
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Send Reset Link</>
                      )}
                    </Button>
                  </form>

                  <button
                    onClick={() => setAuthMode("login")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto mt-6"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold mb-2">
                      {authMode === "login" ? "Welcome Back" : "Create Account"}
                    </h3>
                    <p className="text-muted-foreground text-base">
                      {authMode === "login"
                        ? "Sign in to continue to your dashboard"
                        : "Sign up to start tracking your trades"}
                    </p>
                  </div>

                  {/* Auth Mode Tabs */}
                  <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
                    <button
                      onClick={() => setAuthMode("login")}
                      className={cn(
                        "flex-1 py-2 rounded-md text-sm font-medium",
                        authMode === "login"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={cn(
                        "flex-1 py-2 rounded-md text-sm font-medium",
                        authMode === "signup"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {authMode === "signup" && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Full Name</label>
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="h-11"
                          autoComplete="name"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium mb-2 block">Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        autoComplete="email"
                        inputMode="email"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Password</label>
                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => setAuthMode("forgot")}
                            className="text-xs text-primary hover:text-primary/80 font-medium"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          autoComplete={authMode === "login" ? "current-password" : "new-password"}
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isBusy}>
                      {isBusy ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {authMode === "login" ? "Sign In" : "Create Account"}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11"
                    onClick={handleGoogleAuth}
                    disabled={isBusy}
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-6">
                    By signing in, you agree to our{" "}
                    <a href="/terms" className="text-primary hover:underline">Terms</a>{" "}and{" "}
                    <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
