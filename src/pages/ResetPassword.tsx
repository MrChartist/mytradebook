import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have a recovery event in the URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery") && !hash.includes("access_token")) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, []);

  const passwordStrength = (p: string) => {
    if (p.length < 6) return { label: "Too short", color: "bg-destructive" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-loss" };
    if (score <= 2) return { label: "Medium", color: "bg-warning" };
    return { label: "Strong", color: "bg-profit" };
  };

  const strength = passwordStrength(password);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        toast({ title: "Reset failed", description: error.message, variant: "destructive" });
      } else {
        setSuccess(true);
        toast({ title: "Password updated!", description: "Redirecting to dashboard..." });
        setTimeout(() => navigate("/", { replace: true }), 2000);
      }
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="surface-card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-profit/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-profit" />
          </div>
          <h2 className="text-2xl font-heading font-bold mb-2 tracking-tight">Password Updated!</h2>
          <p className="text-muted-foreground">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <SEOHead title="Reset Password" path="/reset-password" noIndex />
      <div className="w-full max-w-md">
        <div className="surface-card p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2 tracking-tight">Set New Password</h3>
            <p className="text-muted-foreground text-sm">Enter your new password below.</p>
          </div>

          {error ? (
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => navigate("/login")}>Back to Sign In</Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">New Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    autoComplete="new-password"
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
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={`h-full rounded-full ${strength.color}`} style={{ width: strength.label === "Strong" ? "100%" : strength.label === "Medium" ? "66%" : strength.label === "Weak" ? "33%" : "15%" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                )}
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading || password.length < 6 || password !== confirmPassword}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
