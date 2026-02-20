import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useUserSettings } from "@/hooks/useUserSettings";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CommandPalette } from "@/components/CommandPalette";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  useKeyboardShortcuts({ onSearch: () => setCmdOpen(true) });
  const { settings } = useUserSettings();
  const navigate = useNavigate();

  // Check if Dhan token is expired
  const isDhanConnected = !!settings?.dhan_access_token && !!settings?.dhan_enabled;
  const tokenExpiry = settings?.dhan_token_expiry ? new Date(settings.dhan_token_expiry) : null;
  const isTokenExpired = isDhanConnected && tokenExpiry && tokenExpiry < new Date();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onSearchClick={() => setCmdOpen(true)} />
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
      <main className="lg:ml-[230px] min-h-screen pt-14 lg:pt-0">
        {isTokenExpired && (
          <div
            className="bg-loss/10 border-b border-loss/20 px-4 py-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-loss/15 transition-colors"
            onClick={() => navigate("/settings")}
          >
            <AlertTriangle className="w-4 h-4 text-loss shrink-0" />
            <span className="text-sm text-loss font-medium">
              Dhan token expired — click to update in Settings
            </span>
          </div>
        )}
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
