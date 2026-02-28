import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";

export default function PreferencesSettings() {
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
      <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-6">App Preferences</h2>
      <div className="space-y-6">
        {/* Default SL % */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <Label htmlFor="sl-percent" className="font-medium">Default SL %</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Default stop-loss percentage for new trades
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="sl-percent"
              type="number"
              value={formData.default_sl_percent}
              onChange={(e) =>
                setFormData({ ...formData, default_sl_percent: parseFloat(e.target.value) || 2 })
              }
              className="w-20 bg-card border-border text-right"
              min={0.5}
              max={10}
              step={0.5}
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>

        {/* Alert Check Frequency */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <p className="font-medium">Alert Check Frequency</p>
            <p className="text-sm text-muted-foreground mt-1">
              How often to evaluate price alerts
            </p>
          </div>
          <Select
            value={formData.alert_frequency_minutes.toString()}
            onValueChange={(value) =>
              setFormData({ ...formData, alert_frequency_minutes: parseInt(value) })
            }
          >
            <SelectTrigger className="w-28 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 min</SelectItem>
              <SelectItem value="5">5 min</SelectItem>
              <SelectItem value="15">15 min</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto-sync Dhan Portfolio */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <p className="font-medium">Auto-sync Dhan Portfolio</p>
            <p className="text-sm text-muted-foreground mt-1">
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
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <p className="font-medium">Theme</p>
            <p className="text-sm text-muted-foreground mt-1">
              Choose your preferred color scheme
            </p>
          </div>
          <Select
            value={formData.theme}
            onValueChange={(value) => setFormData({ ...formData, theme: value })}
          >
            <SelectTrigger className="w-28 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
          <div>
            <p className="font-medium">Timezone</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your local timezone for timestamps
            </p>
          </div>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger className="w-40 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
              <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="bg-gradient-primary"
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}
