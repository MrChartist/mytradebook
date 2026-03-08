import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Bell, BookOpen, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion } from "framer-motion";
import { MobileDrawer } from "./MobileDrawer";

const tabs = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Bell, label: "Alerts", path: "/alerts" },
  { icon: TrendingUp, label: "Trades", path: "/trades" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeTab = tabs.find((t) => location.pathname === t.path);

  return (
    <>
      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border/40 safe-area-bottom">
        <div className="flex items-center justify-around h-[56px]">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <NavLink
                key={tab.path}
                to={tab.path}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("w-5 h-5 transition-all duration-200", isActive && "text-primary")} />
                <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-0 w-8 h-[2.5px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
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
