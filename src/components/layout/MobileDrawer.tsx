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
  Building2,
  FileText,
  Settings,
  LogOut,
  Eye,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BrandLogoInline } from "@/components/ui/brand-logo";

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
          "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] transition-colors duration-200 relative",
          isActive
            ? "bg-primary/8 text-primary font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
        )}
      >
        <item.icon className={cn("w-[17px] h-[17px]", isActive && "text-primary")} />
        <span className="text-[13px]">{item.label}</span>
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-primary" />
        )}
      </NavLink>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[260px] p-0 bg-card border-border/40">
        <SheetHeader className="px-3 h-14 flex items-center border-b border-border/30">
          <div className="flex items-center gap-2">
            <img src={logo} alt="TradeBook" className="h-8 object-contain" />
            <SheetTitle className="sr-only">TradeBook</SheetTitle>
          </div>
        </SheetHeader>

        {/* User Info */}
        {profile && (
          <div className="px-3 py-3 border-b border-border/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-[11px]">
                  {profile.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate">{profile.name || "User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{profile.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2.5 space-y-px">
          {mainNavItems.map(renderNavItem)}

          <div className="px-3 pb-1 pt-3.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
            Analytics
          </div>
          {analyticsNavItems.map(renderNavItem)}

          <div className="mt-2 pt-2 border-t border-border/20 space-y-px">
            <NavLink
              to="/docs"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] transition-colors duration-200",
                location.pathname === "/docs"
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <HelpCircle className="w-[17px] h-[17px]" />
              <span className="text-[13px]">Docs & FAQs</span>
            </NavLink>
            <NavLink
              to="/settings"
              onClick={() => onOpenChange(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] transition-colors duration-200",
                location.pathname === "/settings"
                  ? "bg-primary/8 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <Settings className="w-[17px] h-[17px]" />
              <span className="text-[13px]">Settings</span>
            </NavLink>
          </div>
        </nav>

        {/* Logout */}
        <div className="px-2 py-2.5 border-t border-border/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-muted-foreground hover:text-loss hover:bg-loss/8 transition-colors duration-200 w-full"
          >
            <LogOut className="w-[17px] h-[17px]" />
            <span className="text-[13px]">Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
