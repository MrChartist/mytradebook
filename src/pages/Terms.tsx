import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ScrollText } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import logo from "@/assets/logo.png";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "description", title: "2. Description of Service" },
  { id: "accounts", title: "3. User Accounts" },
  { id: "billing", title: "4. Subscription & Billing" },
  { id: "disclaimer", title: "5. Disclaimer" },
  { id: "liability", title: "6. Limitation of Liability" },
  { id: "changes", title: "7. Changes to Terms" },
  { id: "contact", title: "8. Contact" },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Terms of Service" path="/terms" description="Terms of Service for TradeBook — trading journal for Indian markets." />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      >
        <div className="flex items-center justify-between px-3 pl-4 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-foreground/[0.03]">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="TradeBook" className="h-8 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-full hover:bg-muted/60 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-6 pt-24 pb-16 flex gap-10">
        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0 sticky top-24 self-start">
          <div className="liquid-glass p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">On this page</p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <div className="liquid-glass p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Terms of Service</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Last updated: March 1, 2026</p>
              </div>
            </div>

            <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
              <section id="acceptance" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p>By accessing or using TradeBook ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
              </section>

              <section id="description" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
                <p>TradeBook is a trading journal and analytics platform designed for Indian market participants. It provides tools for trade logging, performance analysis, alerts, and broker integration. TradeBook does not provide investment advice, tips, or recommendations.</p>
              </section>

              <section id="accounts" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to keep your information up to date.</p>
              </section>

              <section id="billing" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">4. Subscription & Billing</h2>
                <p>Paid plans are billed monthly. You may cancel at any time; access continues until the end of the billing period. Refunds are provided at our discretion within 7 days of purchase.</p>
              </section>

              <section id="disclaimer" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">5. Disclaimer</h2>
                <p>TradeBook is not SEBI registered and does not provide financial advice. All trading decisions are your own. Past performance displayed in the app does not guarantee future results. Use the Service at your own risk.</p>
              </section>

              <section id="liability" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
                <p>TradeBook shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the Service, including but not limited to trading losses.</p>
              </section>

              <section id="changes" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">7. Changes to Terms</h2>
                <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
              </section>

              <section id="contact" className="space-y-3 scroll-mt-28">
                <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
                <p>For questions about these Terms, contact us at support@tradebook.app.</p>
              </section>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy →</Link>
            <Link to="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
