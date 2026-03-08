import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StickyCTA() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const pastHero = scrollY > 600;
      const nearFooter = scrollY + winHeight > docHeight - 400;
      setVisible(pastHero && !nearFooter);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="max-w-lg mx-auto px-4 pb-4 pointer-events-auto">
            <div
              className="flex items-center justify-between gap-3 px-5 py-3 rounded-full border border-border/40 bg-card/95 backdrop-blur-xl shadow-lg"
              style={{ boxShadow: "0 -4px 20px -6px rgba(0,0,0,0.1), inset 0 1px 0 0 hsl(0 0% 100% / 0.06)" }}
            >
              <p className="text-sm font-medium text-foreground hidden sm:block">
                Start Free — No Credit Card
              </p>
              <p className="text-sm font-medium text-foreground sm:hidden">
                Start Free
              </p>
              <Button
                size="sm"
                className="bg-[hsl(var(--tb-accent))] hover:bg-[hsl(var(--tb-accent-hover))] text-white rounded-full px-5 h-9 text-sm font-semibold shadow-[0_4px_12px_hsl(var(--tb-accent)/0.3)] gap-1.5 shrink-0"
                onClick={() => navigate("/login?mode=signup")}
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
