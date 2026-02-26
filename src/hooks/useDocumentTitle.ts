import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles: Record<string, string> = {
    "/": "Dashboard",
    "/trades": "Trades",
    "/alerts": "Alerts",
    "/studies": "Studies",
    "/watchlist": "Watchlist",
    "/journal": "Journal",
    "/calendar": "Calendar",
    "/mistakes": "Mistakes",
    "/analytics": "Analytics",
    "/reports": "Reports",
    "/settings": "Settings",
    "/login": "Sign In",
    "/landing": "Welcome",
    "/terms": "Terms of Service",
    "/privacy": "Privacy Policy",
    "/reset-password": "Reset Password",
};

/**
 * Updates document.title based on current route.
 * Usage: call useDocumentTitle() in your layout component.
 */
export function useDocumentTitle() {
    const { pathname } = useLocation();

    useEffect(() => {
        const title = routeTitles[pathname] || "TradeBook";
        document.title = `${title} — TradeBook`;
    }, [pathname]);
}
