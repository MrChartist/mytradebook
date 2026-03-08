import { lazy, Suspense } from "react";
import { MotionConfig, AnimatePresence, motion } from "framer-motion";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CommandPalette } from "@/components/CommandPalette";
import { AnalyticsSkeleton, CalendarSkeleton, WatchlistSkeleton, StudiesSkeleton } from "@/components/skeletons/PageSkeletons";

// Eagerly loaded (critical path)
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import AuthCallback from "./pages/AuthCallback";

// Lazy loaded pages
const Index = lazy(() => import("./pages/Index"));
const Docs = lazy(() => import("./pages/Docs"));
const Studies = lazy(() => import("./pages/Studies"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Trades = lazy(() => import("./pages/Trades"));
const Journal = lazy(() => import("./pages/Journal"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Calendar = lazy(() => import("./pages/Calendar"));
const Mistakes = lazy(() => import("./pages/Mistakes"));
const Analytics = lazy(() => import("./pages/Analytics"));
const DhanCallback = lazy(() => import("./pages/DhanCallback"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Fundamentals = lazy(() => import("./pages/Fundamentals"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeInOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dhan-callback" element={<DhanCallback />} />
          <Route path="/trader/:userId" element={<PublicProfile />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          {[
            { path: "/studies", element: <Studies />, skeleton: <StudiesSkeleton /> },
            { path: "/alerts", element: <Alerts /> },
            { path: "/trades", element: <Trades /> },
            { path: "/journal", element: <Journal /> },
            { path: "/reports", element: <Reports /> },
            { path: "/settings", element: <Settings /> },
            { path: "/calendar", element: <Calendar />, skeleton: <CalendarSkeleton /> },
            { path: "/mistakes", element: <Mistakes /> },
            { path: "/analytics", element: <Analytics />, skeleton: <AnalyticsSkeleton /> },
            { path: "/watchlist", element: <Watchlist />, skeleton: <WatchlistSkeleton /> },
            { path: "/fundamentals", element: <Fundamentals /> },
          ].map(({ path, element, skeleton }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Suspense fallback={skeleton || <PageLoader />}>
                      {element}
                    </Suspense>
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <MotionConfig reducedMotion="user">
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <a href="#main-content" className="skip-to-content">
              Skip to content
            </a>
            <AuthProvider>
              <CommandPalette />
              <Suspense fallback={<PageLoader />}>
                <main id="main-content">
                  <AnimatedRoutes />
                </main>
              </Suspense>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
    </MotionConfig>
  </ErrorBoundary>
);

export default App;
