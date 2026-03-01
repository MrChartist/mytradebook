export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-sm dark:prose-invert space-y-6 text-muted-foreground">
          <p className="text-sm">Last updated: March 1, 2026</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
            <p>We collect information you provide directly: name, email address, phone number, and trading data you choose to log. We also collect usage data such as page views and feature usage to improve the Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To generate your trading analytics and reports</li>
              <li>To send notifications you have opted into (Telegram, email)</li>
              <li>To process payments and manage subscriptions</li>
              <li>To improve the Service based on usage patterns</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">3. Data Security</h2>
            <p>Your data is encrypted in transit and at rest. Broker API tokens are stored securely and never shared with third parties. We use row-level security to ensure users can only access their own data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
            <p>We do not sell, rent, or share your personal data or trading data with any third parties. Your trading journal is private by default.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">5. Broker Integration</h2>
            <p>When you connect a broker (e.g., Dhan), we store your API credentials securely to fetch live prices and sync orders. You can disconnect at any time, which removes stored credentials.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
            <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">7. Data Retention</h2>
            <p>Your data is retained as long as your account is active. Upon account deletion, all personal data and trading records are permanently removed within 30 days.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">8. Your Rights</h2>
            <p>You can export, modify, or delete your data at any time from the Settings page. For data deletion requests, contact support@tradebook.app.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">9. Contact</h2>
            <p>For privacy-related questions, contact us at support@tradebook.app.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
