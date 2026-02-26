import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  TrendingUp,
  Settings,
  ChevronLeft,
  LogOut,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { mainNavItems } from "@/lib/navConfig";

interface SidebarProps {
  onSearchClick?: () => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ onSearchClick, collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const setCollapsed = (val: boolean) => {
    onCollapsedChange ? onCollapsedChange(val) : setInternalCollapsed(val);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex fixed left-0 top-0 z-40 h-screen flex-col glass-sidebar transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo + Collapse */}
      <div className="flex items-center gap-3 px-4 h-[64px] border-b border-border/40">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 logo-shimmer shadow-[0_0_16px_rgba(99,102,241,0.3)]">
            <TrendingUp className="w-[18px] h-[18px] text-white relative z-10" />
          </div>
          {!collapsed && (
            <span className="font-bold text-[15px] tracking-tight animate-fade-in">
              TradeBook
            </span>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto w-7 h-7 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-1">
          <button
            onClick={onSearchClick}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-muted/40 border border-border/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all text-[12px]"
          >
            <Search className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Search…</span>
            <kbd className="ml-auto text-[10px] font-mono bg-background/60 border border-border/50 rounded px-1.5 py-0.5">⌘K</kbd>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="px-3 pt-3 pb-1 flex justify-center">
          <button
            onClick={onSearchClick}
            className="w-9 h-9 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto no-scrollbar">
        {!collapsed && <div className="sidebar-section-label">Navigation</div>}

        {mainNavItems.map((item) => {
          const isActive = item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group relative",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
              <item.icon
                className={cn(
                  "w-[18px] h-[18px] flex-shrink-0 transition-transform duration-150",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5"
                )}
              />
              {!collapsed && (
                <span className="text-[13px]">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-3 border-t border-border/40 space-y-1">
        {/* Theme toggle */}
        {!collapsed && (
          <div className="flex items-center justify-between px-3 py-1.5 mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Theme</span>
            <ThemeToggle />
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center py-1">
            <ThemeToggle />
          </div>
        )}

        {/* Profile Card */}
        {!collapsed && profile && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-1.5 bg-muted/30 border border-border/30 rounded-xl transition-all duration-200 hover:bg-muted/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.25)]">
              <span className="text-white font-semibold text-xs">
                {profile.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium truncate">{profile.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{profile.email}</p>
            </div>
          </div>
        )}

        {/* Settings */}
        <NavLink
          to="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group relative",
            location.pathname === "/settings"
              ? "bg-primary/10 text-primary font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {location.pathname === "/settings" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
          )}
          <Settings className={cn("w-[18px] h-[18px] transition-transform duration-150", location.pathname !== "/settings" && "group-hover:translate-x-0.5")} />
          {!collapsed && <span className="text-[13px]">Settings</span>}
        </NavLink>

        {/* Expand button (collapsed) */}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-full py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <ChevronLeft className="w-[18px] h-[18px] rotate-180" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-loss hover:bg-loss/8 transition-all duration-150 w-full"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span className="text-[13px]">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
