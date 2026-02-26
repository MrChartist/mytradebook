import {
    LayoutDashboard,
    TrendingUp,
    Bell,
    BookOpen,
    FileText,
    Eye,
} from "lucide-react";

export interface NavItem {
    icon: typeof LayoutDashboard;
    label: string;
    path: string;
}

export const mainNavItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: TrendingUp, label: "Trades", path: "/trades" },
    { icon: Bell, label: "Alerts", path: "/alerts" },
    { icon: BookOpen, label: "Studies", path: "/studies" },
    { icon: Eye, label: "Watchlist", path: "/watchlist" },
    { icon: FileText, label: "Reports", path: "/reports" },
];

