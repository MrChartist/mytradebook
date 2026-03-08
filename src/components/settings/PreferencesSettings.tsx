import { useState, useEffect } from "react";
import { Save, Loader2, Download, Moon, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface NotificationPreferences {
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  dnd_enabled: boolean;
  dnd_until: string | null;
  digest_enabled: boolean;
  importance_threshold: string;
}

const defaultNotifPrefs: NotificationPreferences = {
  quiet_hours_enabled: false,
  quiet_hours_start: "15:30",
  quiet_hours_end: "09:15",
  dnd_enabled: false,
  dnd_until: null,
  digest_enabled: false,
  importance_threshold: "normal",
};

export default function PreferencesSettings() {
  const { settings, isLoading, updateSettings } = useUserSettings();
  const [formData, setFormData] = useState({
    default_sl_percent: 2,
    alert_frequency_minutes: 5,
    auto_sync_portfolio: true,
    theme: "dark",
    timezone: "Asia/Kolkata",
  });
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences>(defaultNotifPrefs);

  useEffect(() => {
    if (settings) {
      setFormData({
        default_sl_percent: settings.default_sl_percent ?? 2,
        alert_frequency_minutes: settings.alert_frequency_minutes ?? 5,
        auto_sync_portfolio: settings.auto_sync_portfolio ?? true,
        theme: settings.theme ?? "dark",
        timezone: settings.timezone ?? "Asia/Kolkata",
      });
      // Parse notification preferences
      const prefs = (settings as any).notification_preferences;
      if (prefs && typeof prefs === "object") {
        setNotifPrefs({ ...defaultNotifPrefs, ...prefs });
      }
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      ...formData,
      notification_preferences: notifPrefs,
    } as any);
  };

  const handleDndToggle = (enabled: boolean) => {
    if (enabled) {
      // Set DND for 1 hour by default
      const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      setNotifPrefs({ ...notifPrefs, dnd_enabled: true, dnd_until: until });
    } else {
      setNotifPrefs({ ...notifPrefs, dnd_enabled: false, dnd_until: null });
    }
  };

  if (isLoading) {
    return (
      <div className="premium-card-hover p-5 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* App Preferences */}
      <div className="premium-card-hover p-5">
        <h2 className="text-[15px] font-semibold mb-4">App Preferences</h2>
        <div className="space-y-1">
          {/* Default SL % */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium">Default SL %</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Default stop-loss percentage for new trades
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={formData.default_sl_percent}
                onChange={(e) =>
                  setFormData({ ...formData, default_sl_percent: parseFloat(e.target.value) || 2 })
                }
                className="w-16 h-8 bg-muted/20 border-border/20 text-right text-[13px] font-mono"
                min={0.5}
                max={10}
                step={0.5}
              />
              <span className="text-[11px] text-muted-foreground/40">%</span>
            </div>
          </div>

          {/* Alert Check Frequency */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium">Alert Check Frequency</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                How often to evaluate price alerts
              </p>
            </div>
            <select
              value={formData.alert_frequency_minutes.toString()}
              onChange={(e) =>
                setFormData({ ...formData, alert_frequency_minutes: parseInt(e.target.value) })
              }
              className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="1">1 min</option>
              <option value="5">5 min</option>
              <option value="15">15 min</option>
            </select>
          </div>

          {/* Auto-sync Dhan Portfolio */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium">Auto-sync Dhan Portfolio</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Automatically sync positions from Dhan
              </p>
            </div>
            <Switch
              checked={formData.auto_sync_portfolio}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, auto_sync_portfolio: checked })
              }
            />
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium">Theme</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Choose your preferred color scheme
              </p>
            </div>
            <select
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          {/* Timezone */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[13px] font-medium">Timezone</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Your local timezone for timestamps
              </p>
            </div>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="Asia/Kolkata">IST</option>
              <option value="America/New_York">EST</option>
              <option value="Europe/London">GMT</option>
              <option value="Asia/Singapore">SGT</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notification Preferences - Phase 7 */}
      <div className="premium-card-hover p-5">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-[15px] font-semibold">Notification Preferences</h2>
        </div>
        <div className="space-y-1">
          {/* Do Not Disturb */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium flex items-center gap-2">
                <BellOff className="w-3.5 h-3.5" />
                Do Not Disturb
              </p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Pause all notifications for 1 hour
              </p>
            </div>
            <Switch
              checked={notifPrefs.dnd_enabled}
              onCheckedChange={handleDndToggle}
            />
          </div>

          {/* Quiet Hours */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium flex items-center gap-2">
                <Moon className="w-3.5 h-3.5" />
                Quiet Hours
              </p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                No notifications outside market hours
              </p>
            </div>
            <Switch
              checked={notifPrefs.quiet_hours_enabled}
              onCheckedChange={(checked) =>
                setNotifPrefs({ ...notifPrefs, quiet_hours_enabled: checked })
              }
            />
          </div>

          {notifPrefs.quiet_hours_enabled && (
            <div className="flex items-center justify-between py-3 pl-6 border-b border-border/10">
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={notifPrefs.quiet_hours_start}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, quiet_hours_start: e.target.value })
                  }
                  className="w-24 h-8 text-[12px]"
                />
                <span className="text-[11px] text-muted-foreground">to</span>
                <Input
                  type="time"
                  value={notifPrefs.quiet_hours_end}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, quiet_hours_end: e.target.value })
                  }
                  className="w-24 h-8 text-[12px]"
                />
              </div>
            </div>
          )}

          {/* Digest Mode */}
          <div className="flex items-center justify-between py-3.5 border-b border-border/10">
            <div>
              <p className="text-[13px] font-medium">Digest Mode</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Batch similar alerts into a single digest
              </p>
            </div>
            <Switch
              checked={notifPrefs.digest_enabled}
              onCheckedChange={(checked) =>
                setNotifPrefs({ ...notifPrefs, digest_enabled: checked })
              }
            />
          </div>

          {/* Importance Threshold */}
          <div className="flex items-center justify-between py-3.5">
            <div>
              <p className="text-[13px] font-medium">Importance Threshold</p>
              <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                Only notify for important events
              </p>
            </div>
            <select
              value={notifPrefs.importance_threshold}
              onChange={(e) =>
                setNotifPrefs({ ...notifPrefs, importance_threshold: e.target.value })
              }
              className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="all">All</option>
              <option value="normal">Normal & Critical</option>
              <option value="critical">Critical Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data & Export */}
      <div className="premium-card-hover p-5">
        <h2 className="text-[15px] font-semibold mb-4">Data & Export</h2>
        <div className="flex items-center justify-between py-3.5">
          <div>
            <p className="text-[13px] font-medium">Full Data Backup</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Export trades, journal, alerts, and settings as JSON
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] rounded-lg border-border/20"
            onClick={async () => {
              try {
                toast.loading("Generating backup...", { id: "backup" });
                const { data, error } = await supabase.functions.invoke("export-data");
                if (error) throw error;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `tradebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Backup downloaded!", { id: "backup" });
              } catch (err) {
                console.error(err);
                toast.error("Backup failed", { id: "backup" });
              }
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <Button
          className="bg-gradient-primary h-9 text-[13px] rounded-lg"
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
  const { settings, isLoading, updateSettings } = useUserSettings();
  const [formData, setFormData] = useState({
    default_sl_percent: 2,
    alert_frequency_minutes: 5,
    auto_sync_portfolio: true,
    theme: "dark",
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        default_sl_percent: settings.default_sl_percent ?? 2,
        alert_frequency_minutes: settings.alert_frequency_minutes ?? 5,
        auto_sync_portfolio: settings.auto_sync_portfolio ?? true,
        theme: settings.theme ?? "dark",
        timezone: settings.timezone ?? "Asia/Kolkata",
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="premium-card-hover p-5 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
      </div>
    );
  }

  return (
    <div className="premium-card-hover p-5">
      <h2 className="text-[15px] font-semibold mb-4">App Preferences</h2>
      <div className="space-y-1">
        {/* Default SL % */}
        <div className="flex items-center justify-between py-3.5 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Default SL %</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Default stop-loss percentage for new trades
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              value={formData.default_sl_percent}
              onChange={(e) =>
                setFormData({ ...formData, default_sl_percent: parseFloat(e.target.value) || 2 })
              }
              className="w-16 h-8 bg-muted/20 border-border/20 text-right text-[13px] font-mono"
              min={0.5}
              max={10}
              step={0.5}
            />
            <span className="text-[11px] text-muted-foreground/40">%</span>
          </div>
        </div>

        {/* Alert Check Frequency */}
        <div className="flex items-center justify-between py-3.5 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Alert Check Frequency</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              How often to evaluate price alerts
            </p>
          </div>
          <select
            value={formData.alert_frequency_minutes.toString()}
            onChange={(e) =>
              setFormData({ ...formData, alert_frequency_minutes: parseInt(e.target.value) })
            }
            className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="1">1 min</option>
            <option value="5">5 min</option>
            <option value="15">15 min</option>
          </select>
        </div>

        {/* Auto-sync Dhan Portfolio */}
        <div className="flex items-center justify-between py-3.5 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Auto-sync Dhan Portfolio</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Automatically sync positions from Dhan
            </p>
          </div>
          <Switch
            checked={formData.auto_sync_portfolio}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, auto_sync_portfolio: checked })
            }
          />
        </div>

        {/* Theme */}
        <div className="flex items-center justify-between py-3.5 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Theme</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Choose your preferred color scheme
            </p>
          </div>
          <select
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="auto">Auto</option>
          </select>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between py-3.5 border-b border-border/10">
          <div>
            <p className="text-[13px] font-medium">Timezone</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Your local timezone for timestamps
            </p>
          </div>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="h-8 rounded-lg border border-border/20 bg-muted/20 px-2.5 text-[13px] ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="Asia/Kolkata">IST</option>
            <option value="America/New_York">EST</option>
            <option value="Europe/London">GMT</option>
            <option value="Asia/Singapore">SGT</option>
          </select>
        </div>

        {/* Data Backup */}
        <div className="flex items-center justify-between py-3.5">
          <div>
            <p className="text-[13px] font-medium">Full Data Backup</p>
            <p className="text-[11px] text-muted-foreground/50 mt-0.5">
              Export trades, journal, alerts, and settings as JSON
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] rounded-lg border-border/20"
            onClick={async () => {
              try {
                toast.loading("Generating backup...", { id: "backup" });
                const { data, error } = await supabase.functions.invoke("export-data");
                if (error) throw error;
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `tradebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success("Backup downloaded!", { id: "backup" });
              } catch (err) {
                console.error(err);
                toast.error("Backup failed", { id: "backup" });
              }
            }}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
        </div>

        <div className="pt-3.5">
          <Button
            className="bg-gradient-primary h-9 text-[13px] rounded-lg"
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
