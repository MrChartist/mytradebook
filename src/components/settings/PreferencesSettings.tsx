import { useState, useEffect } from "react";
import { Save, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
