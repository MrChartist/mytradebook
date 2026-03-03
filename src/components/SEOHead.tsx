import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown>;
  ogImage?: string;
}

const SITE_URL = "https://mytradebook.lovable.app";
const SITE_NAME = "TradeBook";
const DEFAULT_DESCRIPTION =
  "Track, analyze, and improve your trades with TradeBook. Real-time alerts, broker integration, and segment-based analytics built for Equity, F&O, and Commodity traders in India.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noIndex = false,
  jsonLd,
  ogImage = DEFAULT_OG_IMAGE,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Trading Journal for Indian Markets`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
