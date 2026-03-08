import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Search, ArrowLeft, ExternalLink, Moon, Sun, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import landingLogo from "@/assets/logo.png";

interface DocsNavbarProps {
  isInsideApp?: boolean;
  onSearchOpen?: () => void;
}

const DOC_NAV_ITEMS = [
  { label: "Guides", id: "getting-started" },
  { label: "Features", id: "dashboard" },
  { label: "Integrations", id: "integrations" },
  { label: "FAQ", id: "faq" },
  { label: "Changelog", id: "changelog" },
];

export function DocsNavbar({ isInsideApp = false, onSearchOpen }: DocsNavbarProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [activeNav, setActiveNav] = useState("getting-started");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "docs-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
        scrolled
          ? "docs-navbar--scrolled"
          : "docs-navbar--top"
      )}
    >
      <div className="max-w-[1360px] mx-auto flex items-center h-[3.25rem] px-5 sm:px-6 lg:px-10 gap-6">
        
        {/* ── Left: Logo + Docs badge ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-75"
          >
            <img src={landingLogo} alt="TradeBook" className="h-[26px] object-contain" />
          </button>
          <div className="hidden sm:flex items-center">
            <span 
              className="w-px h-4 mx-2 opacity-20"
              style={{ background: 'hsl(var(--docs-text-muted))' }}
            />
            <span className="docs-navbar-badge">
              <BookOpen className="w-3 h-3" />
              Docs
            </span>
          </div>
        </div>

        {/* ── Center: Doc nav links ── */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {DOC_NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn("docs-navbar-link", isActive && "active")}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="docs-nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[1.5px] rounded-full"
                    style={{ background: 'hsl(var(--docs-accent))' }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Right: Search + utilities ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search trigger */}
          <button
            onClick={onSearchOpen}
            className="docs-navbar-util-btn hidden sm:flex items-center gap-2 px-2.5 h-[30px] rounded-md"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[11.5px]">Search</span>
            <kbd className="docs-navbar-kbd">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>

          {/* Mobile search */}
          <button
            onClick={onSearchOpen}
            className="docs-navbar-util-icon sm:hidden"
            aria-label="Search docs"
          >
            <Search className="w-3.5 h-3.5" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="docs-navbar-util-icon"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Context action */}
          {isInsideApp ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="docs-navbar-cta"
            >
              <ArrowLeft className="w-3 h-3" />
              Dashboard
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="docs-navbar-cta"
            >
              Sign In
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
