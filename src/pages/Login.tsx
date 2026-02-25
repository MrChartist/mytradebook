import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot";

function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string; color: string } {
  if (!pw) return { level: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "bg-loss" };
  if (score <= 2) return { level: 2, label: "Medium", color: "bg-warning" };
  return { level: 3, label: "Strong", color: "bg-profit" };
}

export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, resetPassword, user, loading: authLoading } = useAuth();

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);

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
                    minLength={6}
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
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-1 flex-1 rounded-full transition-colors",
                            i <= pwStrength.level ? pwStrength.color : "bg-muted"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pwStrength.label}{pwStrength.level < 3 && " · Min 6 chars, mix letters, numbers & symbols"}
                    </p>
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
