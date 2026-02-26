import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { KeyboardShortcutsDialog } from "@/components/KeyboardShortcutsDialog";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommandPalette } from "@/components/CommandPalette";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useKeyboardShortcuts({ onSearch: () => setCmdOpen(true) });
  useDocumentTitle();
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  const isDhanConnected = !!settings?.dhan_verified_at && !!settings?.dhan_enabled;
  const tokenExpiry = settings?.dhan_token_expiry ? new Date(settings.dhan_token_expiry) : null;
  const isTokenExpired = isDhanConnected && tokenExpiry && tokenExpiry < new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: Glass Sidebar */}
      <Sidebar
        onSearchClick={() => setCmdOpen(true)}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Mobile: Floating Island Navbar */}
      <TopNavbar
        onSearchClick={() => setCmdOpen(true)}
        onShortcutsClick={() => setShortcutsOpen(true)}
      />

      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      {/* Main content — shifts right on desktop for sidebar */}
      <main
        className="min-h-screen transition-all duration-300 pt-[72px] lg:pt-0"
        style={{ paddingLeft: undefined }}
      >
        <div
          className="transition-all duration-300"
          style={{ marginLeft: undefined }}
        >
          {/* Desktop margin for sidebar */}
          <div className={`hidden lg:block transition-all duration-300 ${sidebarCollapsed ? 'ml-[68px]' : 'ml-[240px]'}`}>
            {isTokenExpired && (
              <div
                className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/15 transition-colors"
                onClick={() => navigate("/settings?tab=integrations")}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Dhan token expired — prices via Yahoo (15min delay) · Click to renew
                </span>
              </div>
            )}
            <div className="p-4 lg:p-6 page-transition">
              <Breadcrumbs />
              {children}
            </div>
          </div>

          {/* Mobile layout (no sidebar margin) */}
          <div className="lg:hidden">
            {isTokenExpired && (
              <div
                className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-500/15 transition-colors"
                onClick={() => navigate("/settings?tab=integrations")}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-600 dark:text-amber-400">
                  Dhan token expired · Click to renew
                </span>
              </div>
            )}
            <div className="p-4 page-transition">
              <Breadcrumbs />
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
