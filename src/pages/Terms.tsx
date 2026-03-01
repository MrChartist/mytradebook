export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: March 1, 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>By accessing or using TradeBook ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
            <p>TradeBook is a trading journal and analytics platform designed for Indian market participants. It provides tools for trade logging, performance analysis, alerts, and broker integration. TradeBook does not provide investment advice, tips, or recommendations.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information during registration and to keep your information up to date.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Subscription & Billing</h2>
            <p>Paid plans are billed monthly. You may cancel at any time; access continues until the end of the billing period. Refunds are provided at our discretion within 7 days of purchase.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Disclaimer</h2>
            <p>TradeBook is not SEBI registered and does not provide financial advice. All trading decisions are your own. Past performance displayed in the app does not guarantee future results. Use the Service at your own risk.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Limitation of Liability</h2>
            <p>TradeBook shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of the Service, including but not limited to trading losses.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Contact</h2>
            <p>For questions about these Terms, contact us at support@tradebook.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
