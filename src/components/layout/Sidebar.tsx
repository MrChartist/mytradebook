import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  BookOpen,
  Eye,
  CalendarDays,
  AlertTriangle,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileDrawer } from "./MobileDrawer";
import { useAuth } from "@/contexts/AuthContext";

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

const bottomNavItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
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
          "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group",
          isActive
            ? "glass-nav-active text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        )}
      >
        <item.icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0 transition-colors",
            isActive ? "text-primary" : "group-hover:text-foreground"
          )}
        />
        {!collapsed && (
          <span className="text-sm animate-fade-in">
            {item.label}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-base">TradeBook</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-[68px]" : "w-60"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 p-4 border-b border-border">
          <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="font-bold text-base leading-tight">TradeBook</h1>
              <p className="text-[11px] text-muted-foreground">Trading Journal</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
          {mainNavItems.map(renderNavItem)}

          {/* Analytics section divider */}
          {!collapsed ? (
            <div className="sidebar-section-label mt-4 mb-1">Analytics</div>
          ) : (
            <div className="my-3 mx-2 border-t border-border" />
          )}
          {analyticsNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom Section */}
        <div className="p-2.5 border-t border-border space-y-0.5">
          {/* Profile */}
          {!collapsed && profile && (
            <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-xs">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{profile.name || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          )}
          
          {bottomNavItems.map(renderNavItem)}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 w-full"
          >
            <ChevronLeft
              className={cn(
                "w-[18px] h-[18px] transition-transform duration-300",
                collapsed && "rotate-180"
              )}
            />
            {!collapsed && <span className="text-sm">Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-loss hover:bg-loss/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
