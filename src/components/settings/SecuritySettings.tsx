import { useState } from "react";
import { Key, Loader2, ShieldCheck, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SecuritySettings() {
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("Logged out from all devices");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to log out from all devices");
    }
  };

  return (
    <div className="space-y-4">
      {/* Password Section */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-primary/8">
            <Key className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-[15px] font-semibold">Change Password</h2>
        </div>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="current-password" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="bg-muted/20 border-border/20 h-9 text-[13px] focus:border-primary/30"
              placeholder="Enter current password"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="new-password" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="bg-muted/20 border-border/20 h-9 text-[13px] focus:border-primary/30"
                placeholder="Min 8 characters"
              />
              {passwordForm.newPassword.length > 0 && passwordForm.newPassword.length < 8 && (
                <p className="text-[10px] text-warning">Must be at least 8 characters</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-password" className="text-[11px] text-muted-foreground/60 font-medium uppercase tracking-wider">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                }
                className={cn(
                  "bg-muted/20 border-border/20 h-9 text-[13px] focus:border-primary/30",
                  passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword && "border-destructive focus-visible:ring-destructive"
                )}
                placeholder="Confirm new password"
              />
              {passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-[10px] text-destructive">Passwords don't match</p>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.newPassword || passwordForm.newPassword.length < 8 || passwordForm.newPassword !== passwordForm.confirmPassword}
            className="h-8 text-[11px] rounded-lg border-border/20"
          >
            {changingPassword ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Key className="w-3.5 h-3.5 mr-1.5" />
            )}
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="icon-badge-sm bg-primary/8">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-[15px] font-semibold">Two-Factor Authentication</h2>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Enable 2FA</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>
        {twoFactorEnabled && (
          <div className="mt-3 p-3 rounded-lg bg-muted/20 border border-border/10">
            <p className="text-[12px] text-muted-foreground/50 text-center">
              2FA setup coming soon. You'll be able to scan a QR code with your authenticator app.
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="premium-card-hover p-5">
        <h2 className="text-[15px] font-semibold mb-3">Active Sessions</h2>
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/10 mb-3.5">
          <span className="text-[12px] text-muted-foreground/50">Current Session</span>
          <span className="text-[11px] text-profit font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-profit" />
            Active
          </span>
        </div>
        <Button
          variant="destructive"
          className="w-full h-9 text-[13px] rounded-lg"
          onClick={handleLogoutAllDevices}
        >
          <LogOut className="w-3.5 h-3.5 mr-1.5" />
          Log Out All Devices
        </Button>
      </div>
    </div>
  );
}
