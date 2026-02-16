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
    <div className="space-y-6">
      {/* Password Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Change Password</h2>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
              }
              className="bg-accent border-border"
              placeholder="Enter current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, newPassword: e.target.value })
              }
              className="bg-accent border-border"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
              }
              className="bg-accent border-border"
              placeholder="Confirm new password"
            />
          </div>

          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={changingPassword || !passwordForm.newPassword}
          >
            {changingPassword ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        </div>
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <p className="font-medium">Enable 2FA</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground text-center">
              2FA setup coming soon. You'll be able to scan a QR code with your authenticator app.
            </p>
          </div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-4">Active Sessions</h2>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
            <span className="text-sm text-muted-foreground">Current Session</span>
            <span className="text-sm text-profit font-medium">Active</span>
          </div>
        </div>
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogoutAllDevices}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out All Devices
        </Button>
      </div>
    </div>
  );
}
