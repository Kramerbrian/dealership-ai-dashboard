import React from 'react';
import Head from 'next/head';

type OrchestratorSchemaProps = {
  dealerName: string;
  domain: string;
  aiVisibility: number;
  ugcHealth: number;
  zeroClickRate: number;
  revenueRisk: number;
};

export default function OrchestratorSchema({
  dealerName,
  domain,
  aiVisibility,
  ugcHealth,
  zeroClickRate,
  revenueRisk,
}: OrchestratorSchemaProps) {
  const sanitizedDomain = domain?.replace(/^https?:\/\//i, '').replace(/\/$/, '') || 'dealershipai-demo.com';
  const formattedRisk = `$${Math.max(0, Math.round(revenueRisk)).toLocaleString('en-US')}`;

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: dealerName,
    url: `https://${sanitizedDomain}`,
    brand: 'DealershipAI',
    sameAs: [
      `https://${sanitizedDomain}`,
      'https://chat.openai.com/g/dealership-ai',
      `https://www.google.com/maps/search/${encodeURIComponent(dealerName)}`,
    ],
    aiVisibilityIndex: aiVisibility,
    ugcHealthScore: ugcHealth,
    zeroClickInclusionRate: zeroClickRate,
    revenueAtRiskMonthly: formattedRisk,
  } as const;

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DealershipAI Orchestrator Dashboard',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    creator: {
      '@type': 'Organization',
      name: 'DealershipAI',
      url: 'https://www.dealershipai.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '247',
    },
    offers: {
      '@type': 'Offer',
      price: '499.00',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  } as const;

  return (
    <Head>
      <title>{dealerName} – AI Visibility Dashboard | DealershipAI</title>
      <meta
        name="description"
        content={`Track AI visibility, zero-click coverage, and trust metrics for ${dealerName}.`}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
    </Head>
  );
}

