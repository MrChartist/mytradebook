import { User, Bell, Link, Moon, Shield, Tag } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/page-header";
import ProfileSettings from "@/components/settings/ProfileSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import TagManagementSettings from "@/components/settings/TagManagementSettings";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "preferences", label: "Preferences", icon: Moon },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "tags", label: "Tags", icon: Tag },
];

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Tabs Layout */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="pill-tabs w-full flex flex-wrap justify-start gap-1.5 h-auto p-1.5 bg-muted/50 border border-border rounded-xl mb-6">
          {settingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="preferences" className="mt-0">
          <PreferencesSettings />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="integrations" className="mt-0">
          <IntegrationsSettings />
        </TabsContent>

        <TabsContent value="tags" className="mt-0">
          <TagManagementSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
