import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, ArrowRight, Loader2, Eye, EyeOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "phone";

function LoginBranding() {
  return (
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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <TrendingUp className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">TradeBook</h1>
            <p className="text-muted-foreground text-sm">Trading Journal</p>
          </div>
        </div>

        <h2 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
          Master Your Trades.
          <br />
          <span className="gradient-text">Track Your Edge.</span>
        </h2>

        <p className="text-base text-muted-foreground max-w-md mb-8">
          A structured trading journal and analytics platform for Indian
          markets. Log trades, track performance, and improve discipline.
        </p>

        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-profit" />
            <span className="text-sm text-muted-foreground">Real-time alerts</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Broker integration</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Telegram notifications</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneOTPForm({
  loading,
  onSendOtp,
  onVerifyOtp,
}: {
  loading: boolean;
  onSendOtp: (phone: string) => Promise<void>;
  onVerifyOtp: (phone: string, otp: string) => Promise<void>;
}) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    await onSendOtp(fullPhone);
    setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    const fullPhone = phone.startsWith("+") ? phone : `+91${phone}`;
    await onVerifyOtp(fullPhone, otp);
  };

  if (!otpSent) {
    return (
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Mobile Number</label>
          <div className="flex gap-2">
            <div className="flex items-center justify-center px-3 h-11 rounded-md border border-input bg-muted text-sm text-muted-foreground shrink-0">
              +91
            </div>
            <Input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="h-11"
              maxLength={10}
            />
          </div>
        </div>
        <Button
          className="w-full h-11"
          onClick={handleSendOtp}
          disabled={loading || phone.length !== 10}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Smartphone className="w-4 h-4 mr-2" />
              Send OTP
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-center">
        OTP sent to <span className="font-medium text-foreground">+91{phone}</span>
      </p>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button
        className="w-full h-11"
        onClick={handleVerifyOtp}
        disabled={loading || otp.length !== 6}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Verify OTP <ArrowRight className="w-4 h-4 ml-2" /></>}
      </Button>
      <button
        type="button"
        onClick={() => { setOtpSent(false); setOtp(""); }}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Change number
      </button>
    </div>
  );
}

export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInWithPhone, verifyPhoneOtp, user, loading: authLoading } = useAuth();

  // Fix: reset local loading when auth completes (covers Google popup flow)
  useEffect(() => {
    if (!authLoading && user) {
      setLoading(false);
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

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
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" });
      setLoading(false);
    }
    // Fallback: if popup closes without completing, reset after 10s
    setTimeout(() => setLoading(false), 10000);
  };

  const handleSendOtp = async (phone: string) => {
    setLoading(true);
    try {
      const { error } = await signInWithPhone(phone);
      if (error) {
        toast({ title: "Failed to send OTP", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "OTP Sent", description: "Check your phone for the verification code." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const { error } = await verifyPhoneOtp(phone, otp);
      if (error) {
        toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Welcome!", description: "Successfully signed in." });
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
    phone: { title: "Phone Login", subtitle: "Sign in with your mobile number" },
  };

  return (
    <div className="min-h-screen flex">
      <LoginBranding />

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">TradeBook</span>
          </div>

          <div className="surface-card p-8 gradient-border-top">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{headings[authMode].title}</h3>
              <p className="text-muted-foreground text-sm">{headings[authMode].subtitle}</p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg mb-6">
              {([["login", "Sign In"], ["signup", "Sign Up"], ["phone", "Phone"]] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => setAuthMode(mode)}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-medium transition-all",
                    authMode === mode
                      ? "bg-background shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {authMode === "phone" ? (
              <PhoneOTPForm loading={loading} onSendOtp={handleSendOtp} onVerifyOtp={handleVerifyOtp} />
            ) : (
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
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10"
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

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      {authMode === "login" ? "Sign In" : "Create Account"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

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
              disabled={loading}
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
              <a href="#" className="text-primary hover:underline">Terms</a>{" "}and{" "}
              <a href="#" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
