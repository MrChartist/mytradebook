import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X, BookOpen, Zap, Tag, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import landingLogo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LandingNavbarProps {
  activePage?: "home" | "docs";
  isInsideApp?: boolean;
  extraRight?: React.ReactNode;
}

const NAV_LINKS = [
  { label: "Features", href: "/#features", page: "home", icon: Zap },
  { label: "Pricing", href: "/#pricing", page: "home", icon: Tag },
  { label: "FAQ", href: "/#faq", page: "home", icon: HelpCircle },
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
           ? "bg-background/80 dark:bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-[0_1px_8px_-3px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_8px_-3px_rgba(0,0,0,0.3)]"
           : "bg-transparent backdrop-blur-none border-b border-transparent"
      )}
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.03 }}
          >
            <img src={landingLogo} alt="TradeBook" className="h-9 object-contain" />
          </motion.button>
          {activePage === "docs" && (
            <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <button
                onClick={() => navigate("/")}
                className="hover:text-foreground transition-colors font-medium"
              >
                Home
              </button>
              <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
              <span className="text-foreground font-semibold">Docs</span>
            </div>
          )}
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          {NAV_LINKS.map((item) => {
            const isActive = item.page === activePage;
            return (
              <motion.button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-foreground"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {extraRight}
          <ThemeToggle />
          <button
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          {isInsideApp ? (
            <Button
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-4 h-8 text-[13px] font-semibold"
            >
              Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground text-[13px] h-8 px-3 rounded-full"
              >
                Sign In
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Button
                  size="sm"
                  onClick={() => navigate("/login?mode=signup")}
                  className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-4 h-8 text-[13px] font-semibold gap-1.5"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
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
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-foreground/5 text-foreground border-l-[3px] border-l-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              {!isInsideApp && (
                <div className="pt-2 border-t border-border/30 mt-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-center rounded-xl text-sm"
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
