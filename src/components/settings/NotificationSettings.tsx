import { useState } from "react";
import { Bell, BellOff, Mail, Smartphone, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserSettings } from "@/hooks/useUserSettings";
import { toast } from "sonner";

const alertFrequencyOptions = [
    { value: "1", label: "Every minute" },
    { value: "5", label: "Every 5 minutes" },
    { value: "15", label: "Every 15 minutes" },
    { value: "30", label: "Every 30 minutes" },
    { value: "60", label: "Hourly" },
];

export default function NotificationSettings() {
    const { settings, updateSettings } = useUserSettings();

    // Read persisted sound/email prefs from the dashboard_layout jsonb column
    const savedPrefs = (settings?.dashboard_layout as any)?.notification_prefs ?? {};
    const [telegramEnabled, setTelegramEnabled] = useState(settings?.telegram_enabled ?? false);
    const [alertFrequency, setAlertFrequency] = useState(
        String(settings?.alert_frequency_minutes ?? 5)
    );
    const [soundAlerts, setSoundAlerts] = useState<boolean>(savedPrefs.sound_alerts ?? true);
    const [emailDigest, setEmailDigest] = useState<boolean>(savedPrefs.email_digest ?? false);

    const handleSave = async () => {
        // Merge new notification prefs into existing dashboard_layout to avoid overwriting other keys
        const existingLayout = (settings?.dashboard_layout as Record<string, unknown>) ?? {};
        await updateSettings.mutateAsync({
            telegram_enabled: telegramEnabled,
            alert_frequency_minutes: parseInt(alertFrequency),
            dashboard_layout: {
                ...existingLayout,
                notification_prefs: {
                    sound_alerts: soundAlerts,
                    email_digest: emailDigest,
                },
            },
        });
    };


    const isTelegramLinked = !!settings?.telegram_verified_at;

    return (
        <div className="space-y-6">
            <div className="premium-card p-6 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Bell className="w-5 h-5 text-primary" />
                        Notification Preferences
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Control how and when you receive alerts about your trades.
                    </p>
                </div>

                <div className="space-y-5 divide-y divide-border">
                    {/* Alert Frequency */}
                    <div className="flex items-center justify-between pt-5 first:pt-0">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Alert Check Frequency</Label>
                            <p className="text-xs text-muted-foreground">How often the system checks your price alerts</p>
                        </div>
                        <Select value={alertFrequency} onValueChange={setAlertFrequency}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {alertFrequencyOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Telegram Notifications */}
                    <div className="flex items-center justify-between pt-5">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Smartphone className="w-4 h-4" />
                                Telegram Notifications
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                {isTelegramLinked
                                    ? "Send trade alerts to your Telegram"
                                    : "Connect Telegram in Integrations tab first"}
                            </p>
                        </div>
                        <Switch
                            checked={telegramEnabled}
                            onCheckedChange={setTelegramEnabled}
                            disabled={!isTelegramLinked}
                        />
                    </div>

                    {/* Sound Alerts */}
                    <div className="flex items-center justify-between pt-5">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Volume2 className="w-4 h-4" />
                                Sound Alerts
                            </Label>
                            <p className="text-xs text-muted-foreground">Play a sound when a price alert triggers</p>
                        </div>
                        <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                    </div>

                    {/* Email Notifications */}
                    <div className="flex items-center justify-between pt-5">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email Digest
                            </Label>
                            <p className="text-xs text-muted-foreground">Receive daily summary of your trading activity</p>
                        </div>
                        <Switch checked={emailDigest} onCheckedChange={setEmailDigest} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={updateSettings.isPending}>
                    Save Notification Preferences
                </Button>
            </div>
        </div>
    );
}
