export default function Privacy() {
    return (
        <div className="min-h-screen bg-background px-6 py-20 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
                <p>Last updated: February 2026</p>
                <h2 className="text-lg font-semibold text-foreground">1. Information We Collect</h2>
                <p>We collect your email address, name, and trading data that you voluntarily enter into TradeBook. We also collect usage analytics and browser metadata.</p>
                <h2 className="text-lg font-semibold text-foreground">2. How We Use Your Data</h2>
                <p>Your data is used solely to provide and improve the TradeBook service. We do not sell your personal information to third parties.</p>
                <h2 className="text-lg font-semibold text-foreground">3. Data Storage</h2>
                <p>Your data is stored securely on Supabase infrastructure with encryption at rest and in transit. We use industry-standard security practices.</p>
                <h2 className="text-lg font-semibold text-foreground">4. Third-Party Integrations</h2>
                <p>When you connect broker accounts (e.g., Dhan) or messaging services (e.g., Telegram), data is shared with those services as necessary to provide the integration.</p>
                <h2 className="text-lg font-semibold text-foreground">5. Your Rights</h2>
                <p>You may request deletion of your account and all associated data at any time by contacting us through the Settings page.</p>
                <h2 className="text-lg font-semibold text-foreground">6. Cookies</h2>
                <p>We use essential cookies for authentication. No tracking or advertising cookies are used.</p>
                <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
                <p>For privacy-related inquiries, please reach out through the app's Settings page.</p>
            </div>
            <div className="mt-10">
                <a href="/" className="text-primary hover:underline text-sm">← Back to Home</a>
            </div>
        </div>
    );
}
