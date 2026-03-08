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
          "flex items-center gap-2.5 px-2.5 py-[7px] rounded-[var(--radius-sm)] transition-all duration-200 group",
          isActive
            ? "bg-primary/8 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
      >
        <item.icon
          className={cn(
            "w-[17px] h-[17px] flex-shrink-0 transition-colors duration-200",
            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
        {!collapsed && (
          <span className="text-[13px]">{item.label}</span>
        )}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>
            <div className="relative">{link}</div>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8} className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.path} className="relative">{link}</div>;
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-xl border-b border-border/30 flex items-center justify-between px-3">
        <img src={logo} alt="TradeBook" className="h-8 object-contain" />
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[var(--radius-sm)] text-muted-foreground" aria-label="Search">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-[var(--radius-sm)] text-muted-foreground" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="w-[18px] h-[18px]" />
          </Button>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col bg-card border-r border-border/40 transition-all duration-300 ease-out",
          collapsed ? "w-[64px]" : "w-[220px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 h-14 border-b border-border/30">
          {collapsed ? (
            <img src={logo} alt="TradeBook" className="h-7 w-7 object-contain flex-shrink-0 mx-auto" />
          ) : (
            <>
              <img src={logo} alt="TradeBook" className="h-8 object-contain" />
              <button
                onClick={() => setCollapsed(true)}
                className="ml-auto w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2.5 space-y-px overflow-y-auto">
          {!collapsed && (
            <div className="px-2.5 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Main
            </div>
          )}
          {mainNavItems.map(renderNavItem)}

          {!collapsed ? (
            <div className="px-2.5 pb-1 pt-4 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Analytics
            </div>
          ) : (
            <div className="my-2 mx-2 border-t border-border/30" />
          )}
          {analyticsNavItems.map(renderNavItem)}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 py-2.5 border-t border-border/30 space-y-px">
          {!collapsed && (
            <div className="flex items-center justify-between px-2.5 py-1 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">Utils</span>
              <div className="flex items-center gap-0.5">
                <NotificationBell />
                <ThemeToggle />
              </div>
            </div>
          )}

          {/* Profile */}
          {!collapsed && profile && (
            <div className="flex items-center gap-2 px-2.5 py-2 mb-1.5 bg-muted/20 rounded-[var(--radius-md)] border border-border/20">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-[11px]">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] font-medium truncate">{profile.name || "User"}</p>
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0",
                    plan === "pro" || plan === "team"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {isTrialing ? `Trial · ${trialDaysLeft}d` : plan}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          )}

          {renderNavItem({ icon: HelpCircle, label: "Docs & FAQs", path: "/docs" })}
          {renderNavItem({ icon: Settings, label: "Settings", path: "/settings" })}

          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-full py-1.5 rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors duration-200"
            >
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-[var(--radius-sm)] text-muted-foreground hover:text-loss hover:bg-loss/8 transition-colors duration-200 w-full"
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span className="text-[13px]">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
