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
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
        >
          <div className="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
            <div
              className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-full border border-border/30 bg-card/95 backdrop-blur-xl shadow-md"
            >
              <p className="text-[13px] font-medium text-foreground hidden sm:block">
                Start Free — No Credit Card
              </p>
              <p className="text-[13px] font-medium text-foreground sm:hidden">
                Start Free
              </p>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-4 h-8 text-[13px] font-semibold gap-1.5 shrink-0"
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
