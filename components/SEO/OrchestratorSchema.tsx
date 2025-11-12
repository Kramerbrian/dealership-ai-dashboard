'use client';

import Head from 'next/head';

export default function OrchestratorSchema(props: {
  dealerName: string;
  domain: string;
  aiMentionRate: number;
  reviewTrustScore: number;
  zeroClickCoverage: number;
  revenueAtRisk: number;
}) {
  const org = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    "name": props.dealerName,
    "url": `https://${props.domain}`,
    "brand": "DealershipAI",
    "knowsAbout": ["Search Health", "Zero-Click", "GEO Integrity", "E-E-A-T", "Quality Authority Index", "AI Mention Rate", "Review Trust Score", "Core Web Vitals"],
    "sameAs": [`https://${props.domain}`],
    "identifier": { "@type": "PropertyValue", "name": "AI Mention Rate", "value": props.aiMentionRate },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": (props.reviewTrustScore / 20).toFixed(1), "ratingCount": 100 }
  };

  const sw = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "DealershipAI Orchestrator Dashboard",
    "operatingSystem": "Web",
    "applicationCategory": "BusinessApplication",
    "author": { "@type": "Organization", "name": "DealershipAI" },
    "offers": { "@type": "Offer", "price": "99.00", "priceCurrency": "USD" },
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "247" },
    "featureList": [
      "Quality Authority Index", "E-E-A-T Scoring", "Zero-Click Coverage", "AI Mention Rate",
      "Review Trust Score", "Core Web Vitals", "Digital Trust Revenue Index", "dAI Voice Assistant"
    ]
  };

  return (
    <Head>
      <title>{props.dealerName} • AI Visibility | DealershipAI</title>
      <meta name="description" content={`Track AI Mention Rate, Zero-Click Coverage, Review Trust, QAI and Revenue at Risk for ${props.dealerName}.`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sw) }} />
    </Head>
  );
}

