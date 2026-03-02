import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Bell, BookOpen, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileDrawer } from "./MobileDrawer";

const tabs = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: TrendingUp, label: "Trades", path: "/trades" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("w-5 h-5", isActive && "text-primary")} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
