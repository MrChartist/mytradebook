import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
    trades: "Trades",
    alerts: "Alerts",
    studies: "Studies",
    watchlist: "Watchlist",
    journal: "Journal",
    calendar: "Calendar",
    mistakes: "Mistakes",
    analytics: "Analytics",
    reports: "Reports",
    settings: "Settings",
};

export function Breadcrumbs({ className }: { className?: string }) {
    const { pathname } = useLocation();

    if (pathname === "/") return null;

    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center gap-1.5 text-xs text-muted-foreground mb-4", className)}
        >
            <Link
                to="/"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
            </Link>
            {segments.map((seg, i) => {
                const path = "/" + segments.slice(0, i + 1).join("/");
                const label = routeLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
                const isLast = i === segments.length - 1;

                return (
                    <span key={path} className="flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                        {isLast ? (
                            <span className="text-foreground font-medium">{label}</span>
                        ) : (
                            <Link to={path} className="hover:text-foreground transition-colors">
                                {label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
}
