import { Sidebar } from "./Sidebar";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Global keyboard shortcuts — modal triggers are handled at page level
  useKeyboardShortcuts({});

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-[230px] min-h-screen pt-14 lg:pt-0">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
