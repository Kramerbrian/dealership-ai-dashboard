// components/seo/SeoBlocks.ts
import JsonLd from './JsonLd';

export function SoftwareApplicationLD() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'DealershipAI',
        applicationCategory: 'BusinessApplication',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '847'
        }
      }}
    />
  );
}

export function FAQPageLD() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I check AI visibility?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Use DealershipAI\'s free analyzer for instant results.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is AEO?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Optimizing for AI search engines like ChatGPT and Claude.'
            }
          }
        ]
      }}
    />
  );
}

