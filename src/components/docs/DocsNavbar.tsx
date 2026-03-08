import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ArrowLeft, ExternalLink, Moon, Sun, Command, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { BrandLogoInline } from "@/components/ui/brand-logo";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const scrollY = window.scrollY + 120;
      for (let i = DOC_NAV_ITEMS.length - 1; i >= 0; i--) {
        const el = document.getElementById(DOC_NAV_ITEMS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveNav(DOC_NAV_ITEMS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on scroll
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const close = () => setMobileMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const triggerSearch = () => {
    if (onSearchOpen) {
      onSearchOpen();
    } else {
      const input = document.querySelector<HTMLInputElement>('.docs-sidebar-search input, [placeholder*="Search"]');
      if (input) { input.focus(); input.scrollIntoView({ behavior: "smooth", block: "center" }); }
    }
  };

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "docs-navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out",
          scrolled
            ? "docs-navbar--scrolled docs-navbar--glow"
            : "docs-navbar--top"
        )}
      >
        <div className="docs-navbar-inner">

          {/* ── Left: Logo + Docs badge ── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-75"
            >
              <BrandLogoInline size="sm" />
            </button>
            <div className="hidden sm:flex items-center">
              <span className="docs-navbar-divider" />
              <span className="docs-navbar-badge">
                <BookOpen className="w-3 h-3" />
                Docs
              </span>
            </div>
          </div>

          {/* ── Center: Doc nav links (desktop/tablet) ── */}
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
                      className="docs-navbar-indicator"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ── Right: Search + utilities ── */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search trigger (desktop) */}
            <button
              onClick={triggerSearch}
              className="docs-navbar-search-btn hidden sm:flex"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[11.5px]">Search</span>
              <kbd className="docs-navbar-kbd">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </button>

            {/* Search icon (mobile) */}
            <button
              onClick={triggerSearch}
              className="docs-navbar-util-icon sm:hidden"
              aria-label="Search docs"
            >
              <Search className="w-4 h-4" />
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
                <span className="hidden xs:inline">Dashboard</span>
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="docs-navbar-util-icon md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile dropdown menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Menu panel */}
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="docs-navbar-mobile-menu"
            >
              {DOC_NAV_ITEMS.map((item) => {
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      "docs-navbar-mobile-link",
                      isActive && "active"
                    )}
                  >
                    {isActive && <span className="docs-navbar-mobile-dot" />}
                    {item.label}
                  </button>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
