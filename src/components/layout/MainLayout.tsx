import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { PageBreadcrumbs } from "./PageBreadcrumbs";
import { SidebarProvider, useSidebarContext } from "@/contexts/SidebarContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { AlertTriangle, WifiOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TrialBanner } from "@/components/TrialBanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useOfflineTradeQueue } from "@/hooks/useOfflineTradeQueue";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutInner({ children }: MainLayoutProps) {
  useKeyboardShortcuts({});
  const { settings } = useUserSettings();
  const navigate = useNavigate();
  const { collapsed } = useSidebarContext();
  const { isOnline, queuedCount } = useOfflineTradeQueue();

  useEffect(() => {
    const handler = (e: Event) => {
      const registration = (e as CustomEvent).detail as ServiceWorkerRegistration;
      toast("New version available", {
        description: "Refresh to get the latest updates.",
        action: {
          label: "Refresh",
          onClick: () => {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
            window.location.reload();
          },
        },
        duration: Infinity,
      });
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  const isDhanConnected = !!settings?.dhan_verified_at && !!settings?.dhan_enabled;
  const tokenExpiry = settings?.dhan_token_expiry ? new Date(settings.dhan_token_expiry) : null;
  const isTokenExpired = isDhanConnected && tokenExpiry && tokenExpiry < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn(
        "min-h-screen pt-14 lg:pt-0 transition-[margin] duration-300",
        collapsed ? "lg:ml-[64px]" : "lg:ml-[220px]"
      )}>
        <TrialBanner />
        {!isOnline && (
          <div className="bg-warning/10 border-b border-warning/20 px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 text-warning shrink-0" />
            <span className="text-[13px] text-warning font-medium">
              You're offline{queuedCount > 0 ? ` — ${queuedCount} trade${queuedCount > 1 ? "s" : ""} queued` : ""}
            </span>
          </div>
        )}
        {isTokenExpired && (
          <div
            className="bg-loss/10 border-b border-loss/20 px-4 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-loss/15 transition-colors duration-200"
            onClick={() => navigate("/settings")}
          >
            <AlertTriangle className="w-4 h-4 text-loss shrink-0" />
            <span className="text-[13px] text-loss font-medium">
              Dhan token expired — click to update in Settings
            </span>
          </div>
        )}
        <div className="p-4 lg:p-6 pb-20 lg:pb-6">
          <PageBreadcrumbs />
          {children}
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutInner>{children}</MainLayoutInner>
    </SidebarProvider>
  );
}
