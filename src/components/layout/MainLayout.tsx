import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
