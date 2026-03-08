import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, BookOpen, Zap, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandLogoInline } from "@/components/ui/brand-logo";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  activePage?: "home" | "docs";
  isInsideApp?: boolean;
  extraRight?: React.ReactNode;
}

const NAV_LINKS = [
  { label: "Features", href: "/#features", page: "home", icon: Zap },
  { label: "Pricing", href: "/#pricing", page: "home", icon: Tag },
  { label: "Docs", href: "/docs", page: "docs", icon: BookOpen },
];

export function LandingNavbar({ activePage = "home", isInsideApp = false, extraRight }: LandingNavbarProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      if (activePage !== "home") {
        navigate("/" + href);
      } else {
        const id = href.replace("/#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        scrolled
           ? "bg-background/85 dark:bg-background/92 backdrop-blur-2xl border-b border-border/20 shadow-[0_1px_4px_0_rgba(0,0,0,0.03),0_0_0_1px_hsl(var(--border)/0.1)]"
           : "bg-transparent backdrop-blur-none border-b border-transparent"
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-5 sm:px-6 lg:px-10 h-[3.5rem]">
        {/* Logo */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-200"
          >
            <BrandLogoInline size="md" />
          </button>
          {activePage === "docs" && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground ml-1.5">
              <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              <button
                onClick={() => navigate("/")}
                className="hover:text-foreground transition-colors duration-200"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
              <span className="text-foreground font-medium">Docs</span>
            </div>
          )}
        </div>

        {/* Desktop links — clean, generous spacing */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((item) => {
            const isActive = item.page === activePage || (activePage === "home" && item.href.startsWith("/#"));
            const isCurrent = item.page === activePage;
            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-[var(--radius-sm)] text-[13px] font-medium transition-all duration-200",
                  isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
                {isCurrent && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right side — balanced */}
        <div className="flex items-center gap-2">
          {extraRight}
          <ThemeToggle />
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors duration-200"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {isInsideApp ? (
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-8 text-[13px] font-semibold"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground text-[13px] h-8 px-3.5"
              >
                Sign In
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/login?mode=signup")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-8 text-[13px] font-semibold gap-1.5"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border/20 bg-background/95 backdrop-blur-2xl"
          >
            <div className="px-4 py-3 space-y-0.5">
              {NAV_LINKS.map((item) => {
                const isActive = item.page === activePage;
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-sm)] text-[14px] font-medium transition-colors duration-200",
                      isActive
                        ? "bg-primary/6 text-primary"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              {!isInsideApp && (
                <div className="pt-2.5 mt-1.5 border-t border-border/15">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-center text-[14px]"
                    onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                  >
                    Sign In
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
