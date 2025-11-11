'use client';

import { useEffect } from 'react';

interface AIGEOSchemaProps {
  dealership?: {
    name: string;
    url: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    phone?: string;
    brands?: string[];
    rating?: number;
    reviewCount?: number;
  };
  mode?: 'landing' | 'dashboard' | 'report';
}

export default function AIGEOSchema({ dealership, mode = 'landing' }: AIGEOSchemaProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Remove existing schema scripts
    const existing = document.querySelectorAll('script[type="application/ld+json"]');
    existing.forEach(el => el.remove());

    if (mode === 'landing') {
      // Software Application Schema
      const appSchema = document.createElement('script');
      appSchema.type = 'application/ld+json';
      appSchema.textContent = JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'DealershipAI',
              applicationCategory: 'BusinessApplication',
              applicationSubCategory: 'Analytics',
              operatingSystem: 'Web Browser',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Free AI visibility analysis'
              },
              description:
                'AI visibility analysis tool for automotive dealerships. Analyzes presence across ChatGPT, Claude, Perplexity, Gemini, and Copilot.',
              featureList: [
                'ChatGPT visibility analysis',
                'Claude AI ranking check',
                'Perplexity search optimization',
                'Gemini presence audit',
                'Microsoft Copilot visibility',
                'Competitive analysis',
                'Revenue impact calculation'
              ],
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.9',
                ratingCount: '847'
              },
              publisher: {
                '@type': 'Organization',
                name: 'DealershipAI',
                url: 'https://dealershipai.com',
                logo: 'https://dealershipai.com/logo.png'
              }
            });
      document.head.appendChild(appSchema);

      // FAQ Schema
      const faqSchema = document.createElement('script');
      faqSchema.type = 'application/ld+json';
      faqSchema.textContent = JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'How do I check my dealership\'s AI search visibility?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "Use DealershipAI's free instant analyzer to check your visibility across ChatGPT, Claude, Perplexity, Gemini, and Copilot. Enter your domain and get results in 10 seconds."
                  }
                },
                {
                  '@type': 'Question',
                  name: 'What is AI search optimization for dealerships?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'AI search optimization (AEO) ensures your dealership appears in AI-powered search results from ChatGPT, Claude, Perplexity, and other AI assistants. It\'s critical for modern car dealership marketing.'
                  }
                },
                {
                  '@type': 'Question',
                  name: 'How much revenue am I losing from poor AI visibility?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Average dealerships lose $43,000/month in potential sales from poor AI search visibility. DealershipAI\'s analysis shows your exact revenue at risk.'
                  }
                }
              ]
            });
      document.head.appendChild(faqSchema);

      // HowTo Schema
      const howToSchema = document.createElement('script');
      howToSchema.type = 'application/ld+json';
      howToSchema.textContent = JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'HowTo',
              name: 'How to Analyze Your Dealership\'s AI Visibility',
              description:
                'Step-by-step guide to checking your automotive dealership\'s visibility on AI search engines',
              step: [
                {
                  '@type': 'HowToStep',
                  position: 1,
                  name: 'Enter Your Domain',
                  text: 'Go to DealershipAI.com and enter your dealership website domain'
                },
                {
                  '@type': 'HowToStep',
                  position: 2,
                  name: 'Get Instant Analysis',
                  text: 'Receive your free AI visibility report in 10 seconds'
                },
                {
                  '@type': 'HowToStep',
                  position: 3,
                  name: 'Review Issues',
                  text: 'See exactly what\'s costing you revenue and how to fix it'
                }
              ]
            });
      document.head.appendChild(howToSchema);
    } else if (mode === 'dashboard' && dealership) {
      // AutoDealer Schema
      const dealerSchema = document.createElement('script');
      dealerSchema.type = 'application/ld+json';
      dealerSchema.textContent = JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'AutoDealer',
              name: dealership.name,
              url: dealership.url,
              ...(dealership.address && {
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: dealership.address.street,
                  addressLocality: dealership.address.city,
                  addressRegion: dealership.address.state,
                  postalCode: dealership.address.zip
                }
              }),
              ...(dealership.phone && { telephone: dealership.phone }),
              ...(dealership.brands && {
                brand: dealership.brands.map((b: string) => ({
                  '@type': 'Brand',
                  name: b
                }))
              }),
              ...(dealership.rating && dealership.reviewCount && {
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: String(dealership.rating),
                  reviewCount: String(dealership.reviewCount)
                }
              })
            });
      document.head.appendChild(dealerSchema);
    }

    return () => {
      // Cleanup on unmount
      const schemas = document.querySelectorAll('script[type="application/ld+json"]');
      schemas.forEach(el => {
        if (el.textContent?.includes('DealershipAI') || el.textContent?.includes(dealership?.name || '')) {
          el.remove();
        }
      });
    };
  }, [mode, dealership]);

  return null;
}

