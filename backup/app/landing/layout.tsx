import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Visibility Audit | DealershipAI - Get Your Score in 60 Seconds',
  description: 'Discover how your dealership ranks in AI search engines like ChatGPT, Perplexity, and Google SGE. Free instant audit shows your AI Visibility Score, trust signals, and top recommendations.',
  keywords: [
    'AI visibility audit',
    'dealership AI analysis',
    'free SEO audit',
    'AI search optimization',
    'ChatGPT dealership ranking',
    'Perplexity AI search',
    'Google SGE dealership',
    'automotive AI marketing',
    'dealership visibility score',
  ],
  openGraph: {
    title: 'Get Your Free AI Visibility Score - DealershipAI',
    description: 'See how your dealership performs in AI search engines. Free 60-second audit reveals your AI Visibility Score and actionable improvements.',
    url: 'https://dealershipai.com/landing',
    siteName: 'DealershipAI',
    type: 'website',
    images: [
      {
        url: '/og-landing.jpg',
        width: 1200,
        height: 630,
        alt: 'Free AI Visibility Audit for Dealerships - DealershipAI'
      }
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Visibility Audit for Your Dealership',
    description: 'Discover your AI search ranking in 60 seconds. Free audit + actionable insights.',
    images: ['/twitter-landing.jpg'],
    creator: '@dealershipai',
  },
  alternates: {
    canonical: 'https://dealershipai.com/landing'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'DealershipAI',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            description: 'AI-powered visibility analytics and optimization platform for automotive dealerships',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              description: 'Free AI Visibility Audit',
              availability: 'https://schema.org/InStock',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '127',
              bestRating: '5',
              worstRating: '1',
            },
            provider: {
              '@type': 'Organization',
              name: 'DealershipAI',
              url: 'https://dealershipai.com',
            },
            featureList: [
              'AI Visibility Score Analysis',
              'Multi-Platform AI Search Tracking',
              'Competitive Intelligence',
              'Trust Signal Optimization',
              'Revenue Impact Analysis',
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
