import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Download, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CapitalManagementCard from "@/components/settings/CapitalManagementCard";
import { usePublicProfile } from "@/hooks/usePublicProfile";

export default function ProfileSettings() {
  const { profile, user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || user?.email || "",
        phone: profile.phone || "",
      });
    }
  }, [profile, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!formData.name) return "U";
    return formData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
            {getInitials()}
          </div>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-accent border-border"
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Input
                id="email"
                value={formData.email}
                readOnly
                className="bg-accent border-border pr-24"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-profit text-xs font-medium">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-accent border-border"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              value="Client"
              readOnly
              disabled
              className="bg-accent border-border"
            />
          </div>
        </div>

        <Button
          className="bg-gradient-primary"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Update Profile
        </Button>
      </div>

      {/* Capital Management */}
      <CapitalManagementCard />

      {/* Public Profile */}
      <PublicProfileCard />

      {/* Data Export */}
      <DataExportCard />
    </div>
  );
}

function PublicProfileCard() {
  const { publicProfile, upsertProfile } = usePublicProfile();
  const [isPublic, setIsPublic] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [disclaimer, setDisclaimer] = useState("");
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (publicProfile) {
      setIsPublic(publicProfile.is_public);
      setDisplayName(publicProfile.display_name || "");
      setBio(publicProfile.bio || "");
      setDisclaimer(publicProfile.disclaimer || "");
    }
  }, [publicProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await upsertProfile.mutateAsync({ is_public: isPublic, display_name: displayName, bio, disclaimer });
      toast.success("Public profile updated");
    } catch {
      toast.error("Failed to update public profile");
    } finally {
      setSaving(false);
    }
  };

  const profileUrl = user ? `${window.location.origin}/trader/${user.id}` : "";

  return (
    <div className="mt-6 pt-6 border-t border-border space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Public Profile
          </h2>
          <p className="text-sm text-muted-foreground">Allow others to see your trader stats</p>
        </div>
        <Switch checked={isPublic} onCheckedChange={setIsPublic} />
      </div>
      {isPublic && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Display Name</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your trader name" className="bg-accent border-border" />
          </div>
          <div className="space-y-1.5">
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A brief description..." className="bg-accent border-border" rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Disclaimer</Label>
            <Textarea value={disclaimer} onChange={(e) => setDisclaimer(e.target.value)} placeholder="Not SEBI registered..." className="bg-accent border-border" rows={2} />
          </div>
          <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 border border-border truncate">
            Profile URL: {profileUrl}
          </div>
        </div>
      )}
      <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
        Save Public Profile
      </Button>
    </div>
  );
}

function DataExportCard() {
  const [exporting, setExporting] = useState(false);
  const { session } = useAuth();

  const handleExport = async () => {
    if (!session?.access_token) {
      toast.error("Please log in to export data");
      return;
    }
    setExporting(true);
    try {
      const res = await supabase.functions.invoke("export-data");
      if (res.error) throw res.error;

      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tradebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Backup downloaded successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-border">
      <h2 className="text-lg font-semibold mb-2">Data Export</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Download a complete backup of all your data — trades, journal entries, alerts, studies, watchlists, templates, and settings — as a JSON file.
      </p>
      <Button variant="outline" onClick={handleExport} disabled={exporting}>
        {exporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {exporting ? "Exporting…" : "Download Full Backup"}
      </Button>
    </div>
  );
}