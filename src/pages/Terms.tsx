export default function Terms() {
    return (
        <div className="min-h-screen bg-background px-6 py-20 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose prose-sm dark:prose-invert text-muted-foreground space-y-4">
                <p>Last updated: February 2026</p>
                <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p>By accessing and using TradeBook ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
                <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
                <p>TradeBook is a trading journal and analytics platform designed for retail traders in the Indian markets. The Service provides tools for trade logging, portfolio analytics, alerts, and integrations with brokers.</p>
                <h2 className="text-lg font-semibold text-foreground">3. User Accounts</h2>
                <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
                <h2 className="text-lg font-semibold text-foreground">4. Disclaimer</h2>
                <p>TradeBook is not a financial advisor. All trading decisions are your own responsibility. Past performance data shown is not indicative of future results.</p>
                <h2 className="text-lg font-semibold text-foreground">5. Limitation of Liability</h2>
                <p>TradeBook shall not be liable for any trading losses, data inaccuracies, or service interruptions.</p>
                <h2 className="text-lg font-semibold text-foreground">6. Changes to Terms</h2>
                <p>We reserve the right to update these terms at any time. Continued use of the Service constitutes acceptance of updated terms.</p>
            </div>
            <div className="mt-10">
                <a href="/" className="text-primary hover:underline text-sm">← Back to Home</a>
            </div>
        </div>
    );
}
