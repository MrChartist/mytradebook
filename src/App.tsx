import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />
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
);

export default App;
