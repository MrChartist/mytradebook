import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { BrandLogoInline } from "@/components/ui/brand-logo";

const sections = [
  { id: "collect", title: "1. Information We Collect" },
  { id: "use", title: "2. How We Use Your Information" },
  { id: "security", title: "3. Data Security" },
  { id: "sharing", title: "4. Data Sharing" },
  { id: "broker", title: "5. Broker Integration" },
  { id: "cookies", title: "6. Cookies" },
  { id: "retention", title: "7. Data Retention" },
  { id: "rights", title: "8. Your Rights" },
  { id: "contact", title: "9. Contact" },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Privacy Policy" path="/privacy" description="Privacy Policy for TradeBook — how we handle your data." />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-3xl px-4"
      >
        <div className="flex items-center justify-between px-3 pl-4 py-2 rounded-full border border-border/40 bg-card/80 backdrop-blur-xl shadow-lg shadow-foreground/[0.03]">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogoInline size="sm" />
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
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
                <p className="text-xs text-muted-foreground mt-0.5">Last updated: March 1, 2026</p>
              </div>
            </div>

            <div className="space-y-8 text-sm text-muted-foreground leading-relaxed">
              <section id="collect" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
                <p>We collect information you provide directly: name, email address, phone number, and trading data you choose to log. We also collect usage data such as page views and feature usage to improve the Service.</p>
              </section>

              <section id="use" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
                <ul className="list-disc list-inside space-y-1">
                  <li>To provide and maintain the Service</li>
                  <li>To generate your trading analytics and reports</li>
                  <li>To send notifications you have opted into (Telegram, email)</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To improve the Service based on usage patterns</li>
                </ul>
              </section>

              <section id="security" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">3. Data Security</h2>
                <p>Your data is encrypted in transit and at rest. Broker API tokens are stored securely and never shared with third parties. We use row-level security to ensure users can only access their own data.</p>
              </section>

              <section id="sharing" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
                <p>We do not sell, rent, or share your personal data or trading data with any third parties. Your trading journal is private by default.</p>
              </section>

              <section id="broker" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">5. Broker Integration</h2>
                <p>When you connect a broker (e.g., Dhan), we store your API credentials securely to fetch live prices and sync orders. You can disconnect at any time, which removes stored credentials.</p>
              </section>

              <section id="cookies" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
                <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>
              </section>

              <section id="retention" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">7. Data Retention</h2>
                <p>Your data is retained as long as your account is active. Upon account deletion, all personal data and trading records are permanently removed within 30 days.</p>
              </section>

              <section id="rights" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">8. Your Rights</h2>
                <p>You can export, modify, or delete your data at any time from the Settings page. For data deletion requests, contact support@tradebook.app.</p>
              </section>

              <section id="contact" className="space-y-3 scroll-mt-28 pl-4 border-l-2 border-primary/20 hover:border-primary/40 transition-colors">
                <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
                <p>For privacy-related questions, contact us at support@tradebook.app.</p>
              </section>
            </div>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-between mt-8 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service →</Link>
            <Link to="/" className="hover:text-foreground transition-colors">← Back to Home</Link>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
