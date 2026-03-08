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
        <div className="flex items-center justify-around h-[58px]">
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
                <tab.icon className={cn("w-5 h-5 transition-transform", isActive && "text-primary scale-110")} />
                <span className="text-[11px] font-medium">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -bottom-0 w-10 h-[3px] rounded-full bg-primary shadow-[0_0_6px_hsl(var(--tb-accent)/0.3)]"
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
