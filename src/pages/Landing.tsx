import { lazy, Suspense, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/contexts/AuthContext";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { LandingNavbar } from "@/components/landing/LandingNavbar";

// Eagerly loaded — above the fold
import { HeroSection } from "@/components/landing/HeroSection";
import {
  GradientDivider,
} from "@/components/landing/LandingShared";

// Lazy-loaded — below the fold
const FeaturesSection = lazy(() => import("@/components/landing/FeaturesSection").then(m => ({ default: m.FeaturesSection })));

const PricingSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.TestimonialsSection })));
const IndianMarketsSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.IndianMarketsSection })));
const FAQSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FAQSection })));
const FinalCTASection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FinalCTASection })));
const FooterSection = lazy(() => import("@/components/landing/BelowFoldSections").then(m => ({ default: m.FooterSection })));

function SectionFallback() {
  return <div className="py-24 flex items-center justify-center"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();


  useEffect(() => {
    if (!loading && user) navigate("/dashboard");
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans landing-page">
      <SEOHead
        title="Trading Journal for Indian Markets — NSE, MCX, F&O"
        description="Track, analyze, and improve your trades with TradeBook. Real-time alerts, broker integration, and segment-based analytics built for Equity, F&O, and Commodity traders in India."
        path="/"
        jsonLd={{
          "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "TradeBook",
          "applicationCategory": "FinanceApplication", "operatingSystem": "Web",
          "description": "Trading journal and analytics platform for Indian markets — NSE, BSE, MCX.",
          "url": "https://tradebook.mrchartist.com",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "1200", "bestRating": "5" }
        }}
      />

      <LandingNavbar activePage="home" />

      {/* Hero */}
      <HeroSection />

      {/* Below-fold sections with breathing room */}
      <div className="space-y-0">
        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <FeaturesSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <HowItWorksSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <PricingSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <TestimonialsSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <IndianMarketsSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <FAQSection />
        </Suspense>

        <GradientDivider />

        <Suspense fallback={<SectionFallback />}>
          <FinalCTASection />
        </Suspense>

        <Suspense fallback={<SectionFallback />}>
          <FooterSection />
        </Suspense>
      </div>

      <StickyCTA />
    </div>
  );
}
