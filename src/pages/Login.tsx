import { useState, useEffect, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader2, Eye, EyeOff, Mail, ArrowLeft, Home, Check, X as XIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { BrandLogo, BrandLogoInline } from "@/components/ui/brand-logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/* ── Password strength helper ─────────────── */
function getPasswordStrength(pw: string) {
  let score = 0;
  const checks = {
    length: pw.length >= 8,
    uppercase: /[A-Z]/.test(pw),
    lowercase: /[a-z]/.test(pw),
    number: /\d/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  score = Object.values(checks).filter(Boolean).length;
  const label = score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";
  const color = score <= 1 ? "bg-destructive" : score <= 3 ? "bg-yellow-500" : "bg-profit";
  return { score, label, color, checks };
}

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
  const [emailTouched, setEmailTouched] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const isBusy = loading || authLoading;

  /* ── Derived validation ─────────────── */
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const emailError = emailTouched && email.length > 0 && !emailValid;
  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
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
              : msg === "Invalid login credentials" ? "Incorrect email or password. Please try again." : msg,
            variant: "destructive",
          });
          return;
        }
        toast({ title: "Welcome back!", description: "Successfully signed in." });
        return;
      }

      if (authMode === "signup") {
        if (pwStrength.score < 3) {
          toast({ title: "Weak password", description: "Add uppercase, lowercase, numbers, and special characters.", variant: "destructive" });
          return;
        }
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
    if (!email || !emailValid) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
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
    <div className="min-h-screen flex flex-col pt-16">
      <SEOHead title="Sign In or Sign Up" description="Sign in or create your free TradeBook account. Start journaling trades, tracking performance, and building your edge in NSE, BSE & MCX markets." path="/login" noIndex />

      {/* Navbar — Floating Island (matches Landing) */}
      <motion.nav
        initial={{ y: -40, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      >
        <div className="flex items-center justify-between px-3 pl-4 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-foreground/[0.03]">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.03 }}>
            <Link to="/" className="flex items-center gap-2">
              <BrandLogoInline size="md" />
            </Link>
          </motion.div>

          <div className="hidden md:flex items-center gap-0.5 text-sm text-muted-foreground">
            {["Features", "Pricing", "Docs"].map((item) => (
              <motion.a
                key={item}
                href={item === "Docs" ? "/docs" : `/#${item.toLowerCase()}`}
                className="px-3.5 py-1.5 rounded-full hover:bg-muted/60 hover:text-foreground transition-colors duration-200 text-[13px] font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
              <Button
                size="sm"
                onClick={() => navigate("/")}
                variant="ghost"
                className="text-muted-foreground hover:text-foreground text-[13px] h-8 px-3 rounded-full gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

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

          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-profit/10 rounded-full blur-[100px] animate-pulse-slow" />

          <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
            <h2 className="text-4xl xl:text-5xl font-heading font-bold leading-tight mb-6 tracking-tight">
              Know Your{" "}
              <span className="accent-serif text-[hsl(var(--tb-accent))]">Edge</span>.
              <br />
              Compound It Daily.
            </h2>

            <p className="text-base text-muted-foreground max-w-md mb-8">
              A structured trading journal and analytics platform for Indian
              markets. Log trades, track performance, and build lasting discipline.
            </p>

            <motion.div
              className="grid grid-cols-2 gap-x-6 gap-y-3"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.3 } } }}
            >
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
                <motion.div
                  key={f.label}
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={cn("w-2 h-2 rounded-full shrink-0", f.color)} />
                  <span className="text-sm text-muted-foreground">{f.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-background relative overflow-hidden">
          {/* Subtle gradient orb behind form */}
          <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
              <BrandLogo size="lg" />
            </div>

            <div className="liquid-glass p-6 sm:p-8 rounded-2xl">
              {/* Forgot Password View */}
              {authMode === "forgot" ? (
                <>
                  <div className="text-center mb-7">
                    <div className="w-12 h-12 rounded-xl bg-primary/8 flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold mb-2 tracking-tight">Reset Password</h3>
                    <p className="text-muted-foreground text-[13px] leading-relaxed">
                      Enter your email and we'll send you a reset link.
                    </p>
                  </div>

                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div>
                      <label className="text-[13px] font-medium mb-2 block">Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        className="h-11"
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
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mx-auto mt-6 py-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-heading font-bold mb-2 tracking-tight">
                      {authMode === "login" ? "Welcome Back" : "Create Account"}
                    </h3>
                    <p className="text-muted-foreground text-[13px] leading-relaxed">
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
                        "flex-1 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all",
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
                        "flex-1 py-2.5 sm:py-2 rounded-md text-sm font-medium transition-all",
                        authMode === "signup"
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-5">
                    {authMode === "signup" && (
                      <div>
                        <label className="text-[13px] font-medium mb-2 block">Full Name</label>
                        <Input
                          type="text"
                          placeholder="Enter your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          className="h-11"
                        />
                      </div>
                    )}

                    <div>
                      <label className="text-[13px] font-medium mb-2 block">Email Address</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={() => setEmailTouched(true)}
                        className={cn(
                          "h-11",
                          emailError && "border-destructive focus-visible:ring-destructive"
                        )}
                        autoComplete="email"
                        inputMode="email"
                        required
                      />
                      {emailError && (
                        <p className="text-[11px] text-destructive mt-1.5">Please enter a valid email address</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[13px] font-medium">Password</label>
                        {authMode === "login" && (
                          <button
                            type="button"
                            onClick={() => setAuthMode("forgot")}
                            className="text-[12px] text-primary hover:text-primary/80 font-medium py-1"
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength indicator — signup only */}
                      {authMode === "signup" && password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                              <motion.div
                                className={cn("h-full rounded-full", pwStrength.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${(pwStrength.score / 5) * 100}%` }}
                                transition={{ duration: 0.3 }}
                              />
                            </div>
                            <span className={cn(
                              "text-xs font-medium min-w-[42px] text-right",
                              pwStrength.score <= 1 ? "text-destructive" : pwStrength.score <= 3 ? "text-warning" : "text-profit"
                            )}>
                              {pwStrength.label}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                            {[
                              { key: "length", label: "8+ characters" },
                              { key: "uppercase", label: "Uppercase" },
                              { key: "lowercase", label: "Lowercase" },
                              { key: "number", label: "Number" },
                              { key: "special", label: "Special char" },
                            ].map((rule) => (
                              <div key={rule.key} className="flex items-center gap-1.5">
                                {pwStrength.checks[rule.key as keyof typeof pwStrength.checks] ? (
                                  <Check className="w-3 h-3 text-profit shrink-0" />
                                ) : (
                                  <XIcon className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                                )}
                                <span className={cn(
                                  "text-[11px]",
                                  pwStrength.checks[rule.key as keyof typeof pwStrength.checks] ? "text-muted-foreground" : "text-muted-foreground/50"
                                )}>
                                  {rule.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
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
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                      <span className="bg-card px-3 text-muted-foreground/60">Or continue with</span>
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

                  <p className="text-[11px] text-muted-foreground/60 text-center mt-6">
                    By signing in, you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>{" "}and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
