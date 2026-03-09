import { User, Moon, Shield, Link, Tag, CreditCard, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSettings from "@/components/settings/ProfileSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import IntegrationsSettings from "@/components/settings/IntegrationsSettings";
import TagManagementSettings from "@/components/settings/TagManagementSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import DataBackupExport from "@/components/settings/DataBackupExport";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/page-header";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "preferences", label: "Preferences", icon: Moon },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link },
  { id: "tags", label: "Tags", icon: Tag },
  { id: "backup", label: "Backup", icon: Database },
];

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = settingsTabs.some(t => t.id === searchParams.get("tab"))
    ? searchParams.get("tab")!
    : "profile";

  return (
    <div className="space-y-4 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <Tabs value={activeTab} onValueChange={(val) => setSearchParams({ tab: val })} className="w-full">
        <div className="overflow-x-auto no-scrollbar -mx-1 px-1">
          <TabsList className="inline-flex w-auto gap-0.5 h-auto p-0.5 bg-muted/40 border border-border/15 rounded-lg mb-5">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-all duration-200",
                  "data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground",
                  "data-[state=inactive]:text-muted-foreground/50 data-[state=inactive]:hover:text-foreground"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

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

        <TabsContent value="backup" className="mt-0">
          <DataBackupExport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
