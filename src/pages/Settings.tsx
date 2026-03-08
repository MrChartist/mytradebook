import { User, Moon, Shield, Link, Tag, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import TagManagementSettings from "@/components/settings/TagManagementSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Moon },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "tags", label: "Tags", icon: Tag },
];

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = settingsTabs.some(t => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "profile";

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
        <TabsList className="w-full flex overflow-x-auto no-scrollbar justify-start gap-1.5 h-auto p-1 bg-muted/40 border border-border/50 rounded-xl mb-6">
          {settingsTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground data-[state=active]:font-medium"
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">{tab.label}</span>
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
