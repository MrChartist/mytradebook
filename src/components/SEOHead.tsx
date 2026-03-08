import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  ogImage?: string;
  ogType?: string;
  keywords?: string;
  dateModified?: string;
  datePublished?: string;
  author?: string;
}

const SITE_URL = "https://tradebook.mrchartist.com";
const SITE_NAME = "TradeBook";
const DEFAULT_DESCRIPTION =
  "Track, analyze, and improve your trades with TradeBook. Real-time alerts, broker integration, and segment-based analytics built for Equity, F&O, and Commodity traders in India.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_KEYWORDS =
  "trading journal, Indian stock market, NSE, MCX, F&O, trade tracker, options trading, equity trading, trade analytics, Dhan broker, trading log India";

export function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  noIndex = false,
  jsonLd,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  keywords = DEFAULT_KEYWORDS,
  dateModified,
  datePublished,
  author = "TradeBook",
}: SEOHeadProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Trading Journal for Indian Markets`;
  const url = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || "TradeBook — Trading Journal for Indian Markets"} />
      <meta property="og:locale" content="en_IN" />

      {/* Article dates (for blog/docs pages) */}
      {datePublished && <meta property="article:published_time" content={datePublished} />}
      {dateModified && <meta property="article:modified_time" content={dateModified} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title || "TradeBook — Trading Journal for Indian Markets"} />

      {/* Hreflang for Indian English */}
      <link rel="alternate" hrefLang="en-IN" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* JSON-LD structured data */}
      {jsonLd && (
        Array.isArray(jsonLd)
          ? jsonLd.map((schema, i) => (
              <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
            ))
          : <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
