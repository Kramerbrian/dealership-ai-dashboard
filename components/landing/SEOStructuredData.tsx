'use client';

export function SEOStructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DealershipAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: 'AI-powered visibility analytics and optimization platform for automotive dealerships. Track your dealership across ChatGPT, Gemini, Perplexity, and Google AI Overviews.',
    url: 'https://dealershipai.com',
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        name: 'Free AI Visibility Audit',
        description: 'Get your free AI visibility score in 30 seconds',
        availability: 'https://schema.org/InStock'
      },
      {
        '@type': 'Offer',
        price: '499',
        priceCurrency: 'USD',
        name: 'Pro Plan',
        description: 'Full AI visibility tracking and optimization',
        availability: 'https://schema.org/InStock',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '499',
          priceCurrency: 'USD',
          billingIncrement: 'P1M'
        }
      }
    ],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
      bestRating: '5',
      worstRating: '1'
    },
    provider: {
      '@type': 'Organization',
      name: 'DealershipAI',
      url: 'https://dealershipai.com'
    },
    featureList: [
      'AI Visibility Score Analysis',
      'Multi-Platform AI Search Tracking',
      'Competitive Intelligence',
      'Trust Signal Optimization',
      'Revenue Impact Analysis',
      'Zero-Click Shield',
      'Automated Optimization'
    ]
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is this different from regular SEO tools?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Traditional SEO tracks Google rankings. We track AI assistant visibility where 67% of car shoppers now start their research. Completely different optimization strategies.'
        }
      },
      {
        '@type': 'Question',
        name: 'Do I need to be technical?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not at all. We translate complex metrics into plain English action items. Most users are GMs and digital directors with zero technical background.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long until I see results?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Quick wins (GMB optimization, schema fixes) show impact in 7-14 days. Deeper improvements take 30-60 days. Most dealers see measurable improvements within the first month.'
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
    </>
  );
}

