import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  BookOpen,
  CalendarDays,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  LogOut,
  Eye,
  HelpCircle,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: TrendingUp, label: "Trades", path: "/trades" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: BookOpen, label: "Studies", path: "/studies" },
  { icon: Eye, label: "Watchlist", path: "/watchlist" },
];

const analyticsNavItems = [
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: AlertTriangle, label: "Mistakes", path: "/mistakes" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Reports", path: "/reports" },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
    onOpenChange(false);
  };

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={() => onOpenChange(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          isActive
            ? "glass-nav-active text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
        <span className="text-sm">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 p-0 bg-card border-border">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img src={logo} alt="TradeBook" className="h-9 object-contain" />
            <SheetTitle className="sr-only">TradeBook</SheetTitle>
          </div>
        </SheetHeader>

        {/* User Info */}
        {profile && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-sm">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{profile.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {mainNavItems.map(renderNavItem)}

          <div className="sidebar-section-label mt-4 mb-1">Analytics</div>
          {analyticsNavItems.map(renderNavItem)}

          <div className="mt-3 pt-3 border-t border-border space-y-0.5">
            <NavLink
              to="/docs"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                location.pathname === "/docs"
                  ? "glass-nav-active text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <HelpCircle className="w-5 h-5" />
              <span className="text-sm">Docs & FAQs</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                location.pathname === "/settings"
                  ? "glass-nav-active text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-loss hover:bg-loss/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
