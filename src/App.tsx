import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp } from "lucide-react";

import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Studies from "./pages/Studies";
import Alerts from "./pages/Alerts";
import Trades from "./pages/Trades";
import Journal from "./pages/Journal";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import DhanCallback from "./pages/DhanCallback";
import Watchlist from "./pages/Watchlist";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

import { TRADES_STALE_TIME_MS, MAX_RETRY_ATTEMPTS, RETRY_BASE_DELAY_MS, RETRY_MAX_DELAY_MS } from "@/lib/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TRADES_STALE_TIME_MS,
      retry: MAX_RETRY_ATTEMPTS,
      retryDelay: (attemptIndex) =>
        Math.min(RETRY_BASE_DELAY_MS * 2 ** attemptIndex, RETRY_MAX_DELAY_MS),
      refetchOnWindowFocus: false,
    },
  },
});

const RootRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.35)] animate-pulse-slow">
            <TrendingUp className="w-7 h-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight">TradeBook</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Loading your workspace…</p>
          </div>
          <div className="flex gap-1 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
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
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/" element={<RootRoute />} />
              {[
                { path: "/studies", element: <Studies /> },
                { path: "/alerts", element: <Alerts /> },
                { path: "/trades", element: <Trades /> },
                { path: "/journal", element: <Journal /> },
                { path: "/reports", element: <Reports /> },
                { path: "/settings", element: <Settings /> },

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
              {/* Redirects: old analytics routes → Reports hub tabs */}
              <Route path="/analytics" element={<Navigate to="/reports?tab=analytics" replace />} />
              <Route path="/calendar" element={<Navigate to="/reports?tab=calendar" replace />} />
              <Route path="/mistakes" element={<Navigate to="/reports?tab=mistakes" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
