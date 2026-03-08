import { useState } from "react";
import { useSidebarContext } from "@/contexts/SidebarContext";
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
  Sparkles,
  HelpCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MobileDrawer } from "./MobileDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useSubscription } from "@/hooks/useSubscription";
import { NotificationBell } from "@/components/NotificationBell";
import logo from "@/assets/logo.png";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Sparkles, label: "Studies", path: "/studies" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: TrendingUp, label: "Trades", path: "/trades" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: Eye, label: "Watchlist", path: "/watchlist" },
];

const analyticsNavItems = [
  { icon: AlertTriangle, label: "Mistakes", path: "/mistakes" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: CalendarDays, label: "Calendar", path: "/calendar" },
  { icon: Building2, label: "Fundamentals", path: "/fundamentals" },
];

export function Sidebar() {
  const { collapsed, setCollapsed } = useSidebarContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const { plan, isTrialing, trialDaysLeft } = useSubscription();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const renderNavItem = (item: typeof mainNavItems[0]) => {
    const isActive = location.pathname === item.path;
    const link = (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-[var(--radius-sm)] transition-all duration-200 group",
          isActive
            ? "nav-active-bar liquid-glass-sm !bg-primary/8 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        )}
      >
        <item.icon
          className={cn(
            "w-[18px] h-[18px] flex-shrink-0",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && (
          <span className="text-body-sm">{item.label}</span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-xl border-b border-border/40 flex items-center justify-between px-4" style={{ boxShadow: "var(--shadow-xs)" }}>
        <img src={logo} alt="TradeBook" className="h-8 object-contain drop-shadow-sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell />
          <Button variant="ghost" size="icon" className="rounded-[var(--radius-sm)]">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-[var(--radius-sm)]" onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-card border-r border-border/60 transition-all duration-300 ease-out",
          collapsed ? "w-[68px]" : "w-[230px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-[56px] border-b border-border/40">
          {collapsed ? (
            <img src={logo} alt="TradeBook" className="h-7 w-7 object-contain flex-shrink-0" />
          ) : (
            <img src={logo} alt="TradeBook" className="h-8 object-contain" />
          )}
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto w-7 h-7 rounded-[var(--radius-sm)] border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors duration-200"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto">
          {!collapsed && <div className="sidebar-section-label">Main</div>}
          {mainNavItems.map(renderNavItem)}

          {!collapsed ? (
            <div className="sidebar-section-label mt-5">Analytics</div>
          ) : (
            <div className="my-2.5 mx-2 border-t border-border/40" />
          )}
          {analyticsNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom Section */}
        <div className="px-2.5 py-3 border-t border-border/40 space-y-0.5">
          {/* Theme toggle */}
          {!collapsed && (
            <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
              <span className="text-caption text-muted-foreground font-medium">Theme</span>
              <div className="flex items-center gap-1.5">
                <NotificationBell />
                <ThemeToggle />
              </div>
            </div>
          )}
          {/* Profile */}
          {!collapsed && profile && (
            <div className="flex items-center gap-2.5 px-3 py-2.5 mb-2 bg-muted/30 rounded-[var(--radius-md)] border border-border/30">
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 ring-2 ring-background">
                <span className="text-primary-foreground font-semibold text-xs">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-body-sm font-medium truncate">{profile.name || "User"}</p>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0",
                    plan === "pro" || plan === "team"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isTrialing ? `Trial · ${trialDaysLeft}d` : plan}
                  </span>
                </div>
                <p className="text-caption text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          )}

          <NavLink
            to="/docs"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group",
              location.pathname === "/docs"
                ? "bg-primary/8 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            {!collapsed && <span className="text-[13px]">Docs & FAQs</span>}
          </NavLink>

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
              className="flex items-center justify-center w-full py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-sm transition-all"
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
