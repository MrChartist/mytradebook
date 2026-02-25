import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Studies from "./pages/Studies";
import Alerts from "./pages/Alerts";
import Trades from "./pages/Trades";
import Journal from "./pages/Journal";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import Calendar from "./pages/Calendar";
import Mistakes from "./pages/Mistakes";
import Analytics from "./pages/Analytics";
import DhanCallback from "./pages/DhanCallback";
import Watchlist from "./pages/Watchlist";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return user ? <Index /> : <Landing />;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/" element={<RootRoute />} />
              {[
                { path: "/studies", element: <Studies /> },
                { path: "/alerts", element: <Alerts /> },
                { path: "/trades", element: <Trades /> },
                { path: "/journal", element: <Journal /> },
                { path: "/reports", element: <Reports /> },
                { path: "/settings", element: <Settings /> },

                { path: "/calendar", element: <Calendar /> },
                { path: "/mistakes", element: <Mistakes /> },
                { path: "/analytics", element: <Analytics /> },
                { path: "/watchlist", element: <Watchlist /> },
                { path: "/dhan-callback", element: <DhanCallback /> },
              ].map(({ path, element }) => (
                <Route
                  key={path}
                  path={path}
                  element={
                    <ProtectedRoute>
                      <MainLayout>{element}</MainLayout>
                    </ProtectedRoute>
                  }
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
