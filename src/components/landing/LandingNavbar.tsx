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
  /** Extra right-side content (e.g. Docs B&W toggle) */
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
      initial={{ y: -40, opacity: 0, scale: 0.97 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      aria-label="Main navigation"
    >
      <div
        className={cn(
          "flex items-center justify-between px-3 pl-4 h-14 rounded-full border backdrop-blur-xl transition-all duration-500 ease-out",
          scrolled
            ? "bg-card/90 border-border/50 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.12),inset_0_1px_0_0_hsl(0_0%_100%/0.06)]"
            : "bg-transparent border-transparent shadow-none"
        )}
      >
        {/* Logo + breadcrumb */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.03 }}
          >
            <img src={landingLogo} alt="TradeBook" className="h-8 object-contain" />
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
        <div className="hidden md:flex items-center gap-0.5 text-sm">
          {NAV_LINKS.map((item) => {
            const isActive = item.page === activePage;
            return (
              <motion.button
                key={item.label}
                onClick={() => handleNavClick(item.href)}
                className={cn(
                  "relative px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.label}
                {/* Active underline bar */}
                {isActive && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[hsl(var(--tb-accent))]"
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
          {/* Mobile toggle */}
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
              className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 h-8 text-[13px] font-semibold shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)]"
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
                  className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-4 h-8 text-[13px] font-semibold shadow-[0_6px_16px_hsl(var(--tb-accent)/0.35)] gap-1.5"
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
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden mt-2 rounded-2xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-xl p-3 space-y-0.5"
          >
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
                      ? "bg-[hsl(var(--tb-accent)/0.08)] text-foreground border-l-[3px] border-l-[hsl(var(--tb-accent))]"
                      : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
