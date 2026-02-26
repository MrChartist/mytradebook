import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, ArrowRight, Loader2, Eye, EyeOff, Check, X,
  BarChart3, Shield, Bell, BookOpen, Target, ChevronLeft, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot";

/* ── Password helpers ─────────────────────────────── */
interface PasswordCriteria { label: string; met: boolean; }
function getPasswordCriteria(pw: string): PasswordCriteria[] {
  return [
    { label: "At least 8 characters", met: pw.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(pw) },
    { label: "Number", met: /[0-9]/.test(pw) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(pw) },
  ];
}
function getPasswordStrength(pw: string) {
  if (!pw) return { level: 0, label: "", color: "" };
  const met = getPasswordCriteria(pw).filter(c => c.met).length;
  if (met <= 1) return { level: 1, label: "Very Weak", color: "bg-red-500" };
  if (met === 2) return { level: 2, label: "Weak", color: "bg-orange-500" };
  if (met === 3) return { level: 3, label: "Good", color: "bg-amber-400" };
  return { level: 4, label: "Strong", color: "bg-emerald-500" };
}
function validateEmail(email: string): string | null {
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : "Please enter a valid email";
}

/* ── Google Icon ──────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

/* ── Animated Glass Input ─────────────────────────── */
function GlassInput({
  label, id, type = "text", placeholder, value, onChange, onBlur,
  error, required, minLength, rightElement, inputRef,
}: {
  label?: string; id?: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; onBlur?: () => void; error?: string | null;
  required?: boolean; minLength?: number; rightElement?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label htmlFor={id} className={cn(
          "block text-xs font-medium uppercase tracking-wider mb-2 transition-colors duration-200",
          focused ? "text-primary/80" : "text-white/40"
        )}>{label}</label>
      )}
      <div className={cn(
        "relative rounded-xl transition-all duration-300",
        focused && "drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]"
      )}>
        <input
          id={id}
          ref={inputRef}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          required={required}
          minLength={minLength}
          className={cn(
            "w-full h-11 px-4 rounded-xl bg-white/[0.04] border text-white text-sm",
            "placeholder:text-white/15 transition-all duration-300 outline-none",
            error
              ? "border-red-500/50 bg-red-500/5"
              : focused
                ? "border-primary/50 bg-primary/5"
                : "border-white/8 hover:border-white/15",
            rightElement && "pr-11"
          )}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 animate-[fade-in_0.2s_ease-out]">
          <X className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Floating mini stat card ──────────────────────── */
function FloatCard({ label, value, color, style }: { label: string; value: string; color: string; style?: React.CSSProperties }) {
  return (
    <div
      className="absolute rounded-xl border border-white/10 bg-black/50 backdrop-blur-md px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      style={style}
    >
      <p className="text-[10px] text-white/35 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn("text-base font-bold font-mono", color)}>{value}</p>
    </div>
  );
}

/* ── Left Panel ───────────────────────────────────── */
const sideFeatures = [
  { icon: BarChart3, text: "Equity curves, drawdown & segment analytics" },
  { icon: Bell, text: "Price alerts with instant Telegram notifications" },
  { icon: Target, text: "Automated trailing stop-loss engine" },
  { icon: BookOpen, text: "Multi-segment journaling with pattern tags" },
  { icon: Shield, text: "Pre-trade checklists & mistake tracking" },
];

function LeftPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute top-[-15%] left-[-15%] w-[55%] h-[55%] rounded-full bg-primary/25 blur-[120px] opacity-70 animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-purple-600/25 blur-[100px] opacity-60 animate-[pulse_8s_ease-in-out_infinite_2s]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay pointer-events-none" />
      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />

      <div className="relative z-10">
        {/* Logo with glow */}
        <div className={cn("flex items-center gap-2.5 mb-16 transition-all duration-700", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.5)]">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">TradeBook</span>
          <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Free</span>
        </div>

        {/* Headline */}
        <div className={cn("mb-10 transition-all duration-700 delay-100", mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
          <h2 className="text-3xl font-bold tracking-tight leading-snug mb-3 text-white">
            Trade with data.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary animate-[shimmer_3s_ease-in-out_infinite] bg-[length:200%_auto]">
              Not intuition.
            </span>
          </h2>
          <p className="text-white/35 text-sm leading-relaxed max-w-[280px]">
            The OS for quantified retail trading — journal, analytics, alerts & broker sync in one place.
          </p>
        </div>

        {/* Feature list with staggered animation */}
        <div className="space-y-3.5">
          {sideFeatures.map((f, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 group transition-all duration-500",
                mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}
              style={{ transitionDelay: `${200 + i * 80}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-200">
                <f.icon className="w-3.5 h-3.5 text-white/40 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-sm text-white/40 group-hover:text-white/70 transition-colors duration-200">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating mini cards — animated */}
      <div className="relative z-10 h-[180px] mt-10">
        <FloatCard label="Net P&L" value="+₹34,250" color="text-emerald-400"
          style={{ top: "0%", left: "0%", animation: "float 6s ease-in-out infinite" }} />
        <FloatCard label="Win Rate" value="72.4%" color="text-blue-400"
          style={{ top: "30%", right: "5%", animation: "float 7s ease-in-out infinite 1s" }} />
        <FloatCard label="Profit Factor" value="2.8×" color="text-purple-400"
          style={{ bottom: "0%", left: "20%", animation: "float 5s ease-in-out infinite 2s" }} />
      </div>

      {/* Testimonial */}
      <div className={cn(
        "relative z-10 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )} style={{ transitionDelay: "700ms" }}>
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] backdrop-blur-sm p-5">
          <div className="flex gap-0.5 mb-3">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-white/45 text-sm leading-relaxed italic">
            "Win rate went from 51% to 67% in 3 months. Segment analytics showed me exactly where I was losing."
          </p>
          <div className="flex items-center gap-2.5 mt-4">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">R</div>
            <div>
              <p className="text-xs font-semibold text-white/65">Rahul M.</p>
              <p className="text-[10px] text-white/30">Options Trader · Mumbai</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main ─────────────────────────────────────────── */
export default function Login() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formVisible, setFormVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, resetPassword, user, loading: authLoading } = useAuth();

  const pwStrength = useMemo(() => getPasswordStrength(password), [password]);
  const pwCriteria = useMemo(() => getPasswordCriteria(password), [password]);
  const emailError = useMemo(() => emailTouched ? validateEmail(email) : null, [email, emailTouched]);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const switchMode = (mode: AuthMode) => {
    setFormVisible(false);
    setTimeout(() => {
      setAuthMode(mode);
      setFormVisible(true);
      setTimeout(() => emailRef.current?.focus(), 50);
    }, 200);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
        else toast({ title: "Welcome back! 🎉", description: "Signed in successfully." });
      } else {
        const { error } = await signUpWithEmail(email, password, name);
        if (error) toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        else toast({ title: "Check your email 📬", description: "We've sent a verification link." });
      }
    } finally { setLoading(false); }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) { toast({ title: "Google sign-in failed", description: error.message, variant: "destructive" }); setGoogleLoading(false); }
    } catch { toast({ title: "Google sign-in failed", description: "Something went wrong.", variant: "destructive" }); setGoogleLoading(false); }
    setTimeout(() => setGoogleLoading(false), 10000);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      else toast({ title: "Reset link sent! 📬", description: "Check your email." });
    } finally { setLoading(false); }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_32px_rgba(99,102,241,0.5)] animate-pulse">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const headings: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: "Welcome back", subtitle: "Sign in to your trading dashboard" },
    signup: { title: "Create account", subtitle: "Start tracking your trades for free" },
    forgot: { title: "Reset password", subtitle: "Enter your email to receive a reset link" },
  };

  return (
    <div className="dark min-h-screen bg-[#030303] text-white selection:bg-primary/30 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-8px) rotate(0.5deg); }
          66% { transform: translateY(-4px) rotate(-0.5deg); }
        }
        @keyframes shimmer-text {
          0% { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #818cf8, #c084fc, #818cf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-text 3s linear infinite;
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.2); }
          50% { box-shadow: 0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(99,102,241,0.1); }
        }
        @keyframes slide-up-fade {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes btn-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>

      {/* Global background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[5%] w-[45vw] h-[45vw] rounded-full bg-primary/15 blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] left-[0%] w-[40vw] h-[40vw] rounded-full bg-purple-600/15 blur-[120px] animate-[pulse_10s_ease-in-out_infinite_3s]" />
        <div className="absolute top-[40%] left-[30%] w-[20vw] h-[20vw] rounded-full bg-indigo-500/10 blur-[80px] animate-[pulse_6s_ease-in-out_infinite_1s]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay" />
      </div>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1fr,480px] xl:grid-cols-[1fr,520px]">
        {/* Left panel */}
        <LeftPanel />

        {/* Right — form */}
        <div className={cn(
          "flex flex-col justify-center px-6 py-12 lg:px-10 lg:border-l lg:border-white/[0.05] transition-all duration-700",
          mounted ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}>
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-10">
            <button onClick={() => navigate("/landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_16px_rgba(99,102,241,0.4)]">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">TradeBook</span>
            </button>
          </div>

          <div className="w-full max-w-[400px] mx-auto">
            {/* Form with transition */}
            <div className={cn(
              "transition-all duration-200",
              formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            )}>
              {/* Back button */}
              {authMode === "forgot" && (
                <button onClick={() => switchMode("login")}
                  className="flex items-center gap-1.5 text-sm text-white/35 hover:text-white transition-colors mb-8 group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  Back to sign in
                </button>
              )}

              {/* Heading */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{headings[authMode].title}</h1>
                  {authMode === "signup" && (
                    <Sparkles className="w-5 h-5 text-primary animate-[spin_4s_linear_infinite]" />
                  )}
                </div>
                <p className="text-white/35 text-sm">{headings[authMode].subtitle}</p>
              </div>

              {/* Google */}
              {authMode !== "forgot" && (
                <>
                  <button
                    onClick={handleGoogleAuth}
                    disabled={loading || googleLoading}
                    className="w-full h-11 flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 active:scale-[0.99] group mb-5"
                  >
                    {googleLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Connecting…</span></>
                    ) : (
                      <><GoogleIcon /><span>Continue with Google</span></>
                    )}
                  </button>

                  <div className="relative my-5 flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/8" />
                    <span className="text-[11px] text-white/20 uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-white/8" />
                  </div>
                </>
              )}

              {/* Forgot Form */}
              {authMode === "forgot" ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <GlassInput id="reset-email" label="Email address" type="email" placeholder="you@example.com"
                    value={email} onChange={setEmail} onBlur={() => setEmailTouched(true)} error={emailError} required inputRef={emailRef} />
                  <SubmitButton loading={loading} label="Send Reset Link" />
                </form>
              ) : (
                /* Login / Signup */
                <form onSubmit={handleEmailAuth} className="space-y-4" key={authMode}>
                  {authMode === "signup" && (
                    <GlassInput id="name" label="Full Name" placeholder="Your name" value={name} onChange={setName} />
                  )}
                  <GlassInput id="email" label="Email address" type="email" placeholder="you@example.com"
                    value={email} onChange={setEmail} onBlur={() => setEmailTouched(true)} error={emailError} required inputRef={emailRef} />

                  {/* Password field */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="text-xs font-medium text-white/40 uppercase tracking-wider">Password</label>
                      {authMode === "login" && (
                        <button type="button" onClick={() => switchMode("forgot")}
                          className="text-xs text-primary/60 hover:text-primary transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <PasswordInput value={password} onChange={setPassword} show={showPassword} onToggle={() => setShowPassword(!showPassword)} />

                    {/* Strength meter */}
                    {authMode === "signup" && password.length > 0 && (
                      <div className="mt-3 space-y-2 animate-[fade-in_0.3s_ease-out]">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500",
                              i <= pwStrength.level ? pwStrength.color : "bg-white/8")} />
                          ))}
                        </div>
                        <p className="text-[11px] text-white/30">{pwStrength.label}</p>
                        <div className="grid grid-cols-2 gap-1">
                          {pwCriteria.map(c => (
                            <div key={c.label} className="flex items-center gap-1.5 text-[11px] transition-colors duration-300">
                              {c.met
                                ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0 animate-[scale-in_0.2s_ease-out]" />
                                : <X className="w-3 h-3 text-white/15 flex-shrink-0" />}
                              <span className={cn("transition-colors duration-300", c.met ? "text-emerald-400" : "text-white/25")}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remember me */}
                  {authMode === "login" && (
                    <div className="flex items-center gap-2.5">
                      <button type="button" role="checkbox" aria-checked={rememberMe}
                        onClick={() => setRememberMe(!rememberMe)}
                        className={cn("w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 flex-shrink-0",
                          rememberMe ? "bg-primary border-primary shadow-[0_0_8px_rgba(99,102,241,0.4)]" : "border-white/20 bg-white/5 hover:border-white/30")}>
                        {rememberMe && <Check className="w-2.5 h-2.5 text-white" />}
                      </button>
                      <span onClick={() => setRememberMe(!rememberMe)}
                        className="text-sm text-white/35 hover:text-white/55 cursor-pointer select-none transition-colors">
                        Keep me signed in
                      </span>
                    </div>
                  )}

                  <SubmitButton loading={loading} label={authMode === "login" ? "Sign In" : "Create Account"} />

                  <p className="text-sm text-center text-white/25 pt-0.5">
                    {authMode === "login" ? (
                      <>Don't have an account?{" "}
                        <button type="button" onClick={() => switchMode("signup")}
                          className="text-primary/80 hover:text-primary font-medium transition-colors">Sign up free</button>
                      </>
                    ) : (
                      <>Already have an account?{" "}
                        <button type="button" onClick={() => switchMode("login")}
                          className="text-primary/80 hover:text-primary font-medium transition-colors">Sign in</button>
                      </>
                    )}
                  </p>
                </form>
              )}

              {/* Legal */}
              <p className="text-[11px] text-white/15 text-center mt-8 leading-relaxed">
                By continuing, you agree to our{" "}
                <a href="/terms" className="text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">Terms</a>
                {" "}and{" "}
                <a href="/privacy" className="text-white/30 hover:text-white/60 transition-colors underline underline-offset-2">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Extracted sub-components ─────────────────────── */
function PasswordInput({ value, onChange, show, onToggle }: { value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={cn("relative rounded-xl transition-all duration-300", focused && "drop-shadow-[0_0_12px_rgba(99,102,241,0.25)]")}>
      <input
        id="password"
        type={show ? "text" : "password"}
        placeholder="••••••••"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required
        minLength={8}
        className={cn(
          "w-full h-11 px-4 pr-11 rounded-xl bg-white/[0.04] border text-white text-sm",
          "placeholder:text-white/15 transition-all duration-300 outline-none",
          focused ? "border-primary/50 bg-primary/5" : "border-white/8 hover:border-white/15"
        )}
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className={cn(
        "relative w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold",
        "transition-all duration-200 overflow-hidden",
        "bg-[length:200%_auto]",
        "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100",
        "hover:scale-[1.01] active:scale-[0.99]",
        !loading && "shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)]"
      )}
      style={{
        background: loading
          ? "linear-gradient(135deg, #4f46e5, #7c3aed)"
          : "linear-gradient(135deg, #4f46e5, #7c3aed, #4f46e5)",
        animation: !loading ? "btn-shimmer 3s linear infinite" : undefined,
        backgroundSize: "200% auto",
      }}
    >
      {/* Shimmer overlay */}
      {!loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[shimmer_2.5s_ease-in-out_infinite]" />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <>{label}<ArrowRight className="w-4 h-4" /></>}
      </span>
    </button>
  );
}
