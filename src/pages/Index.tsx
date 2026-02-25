import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./Dashboard";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <MainLayout>
      <Dashboard />
    </MainLayout>
  );
};

export default Index;
