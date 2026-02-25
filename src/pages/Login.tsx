import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot";

interface PasswordCheck {
  label: string;
  met: boolean;
}

function getPasswordChecks(pw: string): PasswordCheck[] {
  return [
    { label: "At least 8 characters", met: pw.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "One number", met: /[0-9]/.test(pw) },
    { label: "One special character (!@#$…)", met: /[^A-Za-z0-9]/.test(pw) },
  ];
}

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  const checks = getPasswordChecks(pw);
  const passed = checks.filter((c) => c.met).length;
  if (passed <= 1) return { level: 1, label: "Weak", color: "bg-destructive" };
  if (passed <= 2) return { level: 2, label: "Medium", color: "bg-warning" };
  if (passed <= 3) return { level: 2, label: "Good", color: "bg-warning" };
  return { level: 3, label: "Strong", color: "bg-profit" };
}

function GoogleIcon() {
  return (
    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, user, loading: authLoading } = useAuth();

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);
  const pwChecks = useMemo(() => getPasswordChecks(password), [password]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, [authMode]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast({ title: "Login failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Welcome back!", description: "Successfully signed in." });
        }
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) {
          toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "Check your email", description: "We've sent you a verification link." });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
        setGoogleLoading(false);
      }
    } catch {
      toast({ title: "Google sign-in failed", description: "Something went wrong. Please try again.", variant: "destructive" });
      setGoogleLoading(false);
    }
    setTimeout(() => setGoogleLoading(false), 10000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const headings: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: "Welcome Back", subtitle: "Sign in to continue to your dashboard" },
    signup: { title: "Create Account", subtitle: "Sign up to start tracking your trades" },
    forgot: { title: "Reset Password", subtitle: "Enter your email to receive a reset link" },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">TradeBook</span>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">{headings[authMode].title}</h1>
            <p className="text-muted-foreground text-sm">{headings[authMode].subtitle}</p>
          </div>

          {/* Google Sign In */}
          {authMode !== "forgot" && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 mb-5"
                onClick={handleGoogleAuth}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Connecting…
                  </>
                ) : (
                  <>
                    <GoogleIcon />
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-3 text-muted-foreground">Or</span>
                </div>
              </div>
            </>
          )}

          {/* Forgot Password Form */}
          {authMode === "forgot" ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Send Reset Link <ArrowRight className="w-4 h-4 ml-2" /></>
                )}
              </Button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                ← Back to Sign In
              </button>
            </form>
          ) : (
            /* Login / Signup Form */
            <form onSubmit={handleEmailAuth} className="space-y-4" key={authMode}>
              {authMode === "signup" && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11"
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  ref={emailRef}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  {authMode === "login" && (
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {authMode === "signup" && password.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {/* Strength bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1.5 flex-1 rounded-full transition-all duration-300",
                              i <= pwStrength.level ? pwStrength.color : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      {pwStrength.label && (
                        <span className={cn(
                          "text-xs font-medium transition-colors",
                          pwStrength.level === 3 ? "text-profit" : pwStrength.level >= 2 ? "text-warning" : "text-destructive"
                        )}>
                          {pwStrength.label}
                        </span>
                      )}
                    </div>
                    {/* Individual checks */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {pwChecks.map((check) => (
                        <div key={check.label} className="flex items-center gap-1.5">
                          <div className={cn(
                            "w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all duration-200 text-[9px]",
                            check.met
                              ? "bg-profit text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {check.met ? "✓" : ""}
                          </div>
                          <span className={cn(
                            "text-[11px] transition-colors",
                            check.met ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {check.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>
                    {authMode === "login" ? "Sign In" : "Create Account"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground pt-1">
                {authMode === "login" ? (
                  <>
                    Don't have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("signup")} className="text-primary hover:underline font-medium">
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button type="button" onClick={() => setAuthMode("login")} className="text-primary hover:underline font-medium">
                      Sign In
                    </button>
                  </>
                )}
              </p>
            </form>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-5">
          By signing in, you agree to our{" "}
          <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
