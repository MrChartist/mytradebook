import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  ChevronLeft,
  LogOut,
  Menu,
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./MobileDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = location.pathname === item.path;
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group",
          isActive
            ? "bg-primary/8 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <item.icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && (
          <span className="text-[13px]">{item.label}</span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-[15px]">TradeBook</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[230px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-[60px] border-b border-border">
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-[18px] h-[18px] text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-[15px] leading-tight">TradeBook</h1>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {!collapsed && <div className="sidebar-section-label">Main</div>}
          {mainNavItems.map(renderNavItem)}

          {!collapsed ? (
            <div className="sidebar-section-label mt-5">Analytics</div>
          ) : (
            <div className="my-3 mx-2 border-t border-border" />
          )}
          {analyticsNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom Section */}
        <div className="px-3 py-3 border-t border-border space-y-0.5">
          {/* Theme toggle */}
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-1">
              <span className="text-[11px] text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          )}
          {/* Profile */}
          {!collapsed && profile && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-muted/50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-semibold text-xs">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{profile.name || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          )}

          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group",
              location.pathname === "/settings"
                ? "bg-primary/8 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Settings className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-[13px]">Settings</span>}
          </NavLink>

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-full py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-[18px] h-[18px] rotate-180" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-loss hover:bg-loss/8 transition-all duration-150 w-full"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-[13px]">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
