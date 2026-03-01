import { User, Moon, Shield, Link, Tag, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import TagManagementSettings from "@/components/settings/TagManagementSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import { useSearchParams } from "react-router-dom";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Moon },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "tags", label: "Tags", icon: Tag },
];

export default function Settings() {
  const [searchParams] = useSearchParams();
  const defaultTab = settingsTabs.some(t => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "profile";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="w-full flex flex-wrap justify-start gap-2 h-auto p-1 bg-card border border-border rounded-lg mb-6">
          {settingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="billing" className="mt-0">
          <BillingSettings />
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
