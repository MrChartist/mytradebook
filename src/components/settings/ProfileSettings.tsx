import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold mb-6">Profile Information</h2>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
              {getInitials()}
            </div>
            <div>
              <p className="font-medium text-foreground">{formData.name || "No name set"}</p>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
            </div>
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
      </div>
    </div>
  );
}
