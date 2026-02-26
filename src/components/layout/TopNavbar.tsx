import { useState, useEffect, useRef, useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    TrendingUp, Search, Settings, LogOut, Keyboard,
    Menu, ChevronDown, X,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MobileDrawer } from "./MobileDrawer";
import { useAuth } from "@/contexts/AuthContext";
import { mainNavItems } from "@/lib/navConfig";

interface TopNavbarProps {
    onSearchClick?: () => void;
    onShortcutsClick?: () => void;
}

const allNavItems = [
    ...mainNavItems,
    null, // divider
    { icon: Settings, label: "Settings", path: "/settings" },
];

/* ── Nav pill link ────────────────────────────────── */
function NavPill({ item }: { item: NonNullable<typeof allNavItems[0]> }) {
    const location = useLocation();
    if (!item) return null;
    const isActive = location.pathname === item.path ||
        (item.path !== "/" && location.pathname.startsWith(item.path));
    const exactActive = item.path === "/" ? location.pathname === "/" : isActive;

    return (
        <NavLink
            to={item.path}
            end={item.path === "/"}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium transition-all duration-150 whitespace-nowrap",
                exactActive
                    ? "bg-primary/15 text-primary"
                    : "text-foreground/50 hover:text-foreground hover:bg-foreground/8"
            )}
        >
            <item.icon className={cn("w-3.5 h-3.5 flex-shrink-0", exactActive && "text-primary")} />
            <span>{item.label}</span>
        </NavLink>
    );
}

/* ── Avatar dropdown ──────────────────────────────── */
function AvatarMenu({ onSettingsClick, onLogout, name, email }: {
    onSettingsClick: () => void; onLogout: () => void;
    name: string | null; email: string | null;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener("mousedown", h);
        return () => document.removeEventListener("mousedown", h);
    }, []);

    const initial = name?.charAt(0).toUpperCase() || "U";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded-full hover:bg-foreground/8 transition-all duration-150 group"
            >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_8px_rgba(99,102,241,0.35)] flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">{initial}</span>
                </div>
                <ChevronDown className={cn("w-3 h-3 text-foreground/40 transition-transform duration-200", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl border border-border bg-card/95 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden z-50 animate-[scale-in_0.15s_ease-out] origin-top-right">
                    <div className="px-4 py-3 border-b border-border/50">
                        <p className="text-[13px] font-semibold truncate">{name || "User"}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{email}</p>
                    </div>
                    <div className="p-1.5">
                        <button onClick={() => { setOpen(false); onSettingsClick(); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                            <Settings className="w-3.5 h-3.5" /> Settings
                        </button>
                        <button onClick={() => { setOpen(false); onLogout(); }}
                            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-all">
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Main export ──────────────────────────────────── */
export function TopNavbar({ onSearchClick, onShortcutsClick }: TopNavbarProps) {
    const navigate = useNavigate();
    const { signOut, profile } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 12);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const location = useLocation();
    const currentPageLabel = useMemo(() => {
        const item = mainNavItems.find(i =>
            i.path === "/" ? location.pathname === "/" : location.pathname.startsWith(i.path)
        );
        return item?.label || "";
    }, [location.pathname]);

    const handleLogout = async () => { await signOut(); navigate("/login"); };

    return (
        <>
            {/* Island wrapper — positions the pill at top center */}
            <div className="fixed top-3 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">

                {/* ── Desktop Island (hidden — sidebar handles desktop nav) ── */}
                <nav className={cn(
                    "hidden items-center gap-1 transition-all duration-300 rounded-full border px-1.5 py-1.5 pointer-events-auto",
                    scrolled
                        ? "bg-background/85 backdrop-blur-2xl border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_0_0_1px_rgba(255,255,255,0.04)]"
                        : "bg-background/60 backdrop-blur-xl border-border/50 shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                )}>

                    {/* Logo */}
                    <button onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-foreground/8 transition-all duration-150 group flex-shrink-0">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.4)] group-hover:scale-105 transition-transform">
                            <TrendingUp className="w-3 h-3 text-white" />
                        </div>
                        <span className="font-bold text-[13px]">TradeBook</span>
                    </button>

                    {/* Divider */}
                    <div className="w-px h-4 bg-border/60 mx-0.5 flex-shrink-0" />

                    {/* Nav links */}
                    <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
                        {mainNavItems.map(item => <NavPill key={item.path} item={item} />)}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-4 bg-border/60 mx-0.5 flex-shrink-0" />

                    {/* Right controls */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        {/* Search */}
                        <button onClick={onSearchClick}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-medium text-foreground/45 hover:text-foreground hover:bg-foreground/8 transition-all duration-150">
                            <Search className="w-3.5 h-3.5" />
                            <span className="hidden xl:block">Search</span>
                            <kbd className="hidden xl:flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted border border-border text-muted-foreground ml-0.5">⌘K</kbd>
                        </button>

                        {/* Theme toggle */}
                        <div className="px-1">
                            <ThemeToggle />
                        </div>

                        {/* Keyboard shortcuts */}
                        <button onClick={onShortcutsClick} title="Keyboard Shortcuts (?)"
                            className="relative flex items-center justify-center w-8 h-8 rounded-full text-foreground/45 hover:text-foreground hover:bg-foreground/8 transition-all duration-150 group">
                            <Keyboard className="w-3.5 h-3.5" />
                            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">?</span>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-4 bg-border/60 mx-0.5" />

                        {/* Avatar */}
                        <AvatarMenu
                            onSettingsClick={() => navigate("/settings")}
                            onLogout={handleLogout}
                            name={profile?.name ?? null}
                            email={profile?.email ?? null}
                        />
                    </div>
                </nav>

                {/* ── Mobile Island ── */}
                <div className="lg:hidden w-full max-w-md pointer-events-auto">
                    <div className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-2.5 transition-all duration-300",
                        scrolled
                            ? "bg-background/90 backdrop-blur-2xl border-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                            : "bg-background/70 backdrop-blur-xl border-border/50"
                    )}>
                        <button onClick={() => navigate("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-[0_0_8px_rgba(99,102,241,0.35)]">
                                <TrendingUp className="w-3 h-3 text-white" />
                            </div>
                            {currentPageLabel ? (
                                <span className="font-bold text-[14px]">{currentPageLabel}</span>
                            ) : (
                                <span className="font-bold text-[14px]">TradeBook</span>
                            )}
                        </button>
                        <div className="flex items-center gap-1">
                            <button onClick={onSearchClick} className="h-8 w-8 flex items-center justify-center rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/8 transition-all">
                                <Search className="w-4 h-4" />
                            </button>
                            <ThemeToggle />
                            <button onClick={() => setMobileOpen(true)} className="h-8 w-8 flex items-center justify-center rounded-full text-foreground/50 hover:text-foreground hover:bg-foreground/8 transition-all">
                                <Menu className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileDrawer open={mobileOpen} onOpenChange={setMobileOpen} />
        </>
    );
}
