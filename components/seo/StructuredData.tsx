'use client';

/**
 * Structured Data Component for AI/SEO Discoverability
 * Implements Organization, SoftwareApplication, and FAQPage schemas
 * for better zero-click presence and E-E-A-T signals
 */
export default function StructuredData() {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DealershipAI',
    url: 'https://dealershipai.com',
    logo: 'https://dealershipai.com/logo.png',
    sameAs: [
      'https://www.linkedin.com/company/dealershipai',
      'https://x.com/dealershipai',
    ],
    brand: 'DealershipAI',
  };

  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DealershipAI Cognitive Interface',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '128',
    },
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Clarity?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Clarity is how well you're seen across AI and search surfaces.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is Trust?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Trust is how much the system believes you—data accuracy, EEAT, and consistency.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}
