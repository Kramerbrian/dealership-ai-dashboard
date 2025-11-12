/**
 * SEO Structured Data Generators
 *
 * Generates JSON-LD blocks for various schema types to improve
 * AI visibility and search engine understanding.
 */

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://dealershipai.com';

/**
 * SoftwareApplication Schema
 * Helps AI understand what DealershipAI does
 */
export function softwareApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DealershipAI',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free tier with limited scans; paid tiers from $499/mo',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    description:
      'AI visibility intelligence platform for automotive dealerships. Get real-time Trust Scores, schema audits, and zero-click monitoring across ChatGPT, Claude, Perplexity, and Gemini.',
    featureList: [
      'AI Trust Score Analysis',
      'Schema Coverage Auditing',
      'Zero-Click Visibility Monitoring',
      'Real-time AI Platform Testing',
      'Automated SEO Recommendations',
      'Multi-Agent AI Orchestration',
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    url: SITE_URL,
  };
}

/**
 * FAQ Schema
 * Common questions about DealershipAI
 */
export function faqSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is DealershipAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'DealershipAI is a cognitive operations platform that gives automotive dealerships an embedded AI Chief Strategy Officer. It continuously audits your dealership\'s visibility across AI platforms like ChatGPT, Claude, Perplexity, and Gemini, providing actionable insights to improve your AI presence.',
        },
      },
      {
        '@type': 'Question',
        name: 'How does the Trust Score work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The Trust Score analyzes factors that AI platforms use to evaluate credibility: schema markup quality, content freshness, entity recognition, review sentiment, and zero-click visibility. It provides a single metric (0-100) showing how trusted your dealership appears to AI.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which AI platforms does DealershipAI monitor?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We monitor ChatGPT (OpenAI), Claude (Anthropic), Perplexity AI, and Google Gemini. Our platform tests how these AI systems perceive and represent your dealership in real-time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need technical knowledge to use DealershipAI?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. DealershipAI provides one-click, fix-ready insights. Each issue includes implementation instructions that your web team can execute immediately. No PDFs, no homework.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is schema coverage?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Schema coverage measures the percentage of your website pages that include structured data (JSON-LD). AI platforms use this data to understand your business. Higher coverage means better AI comprehension and visibility.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often does DealershipAI scan my website?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Free tier: On-demand scans. Tier 2 ($499/mo): Weekly automated scans. Tier 3 ($999/mo): Daily scans with real-time alerts. All tiers include immediate on-demand scans.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is zero-click visibility?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Zero-click visibility measures how often AI platforms answer questions about your dealership directly, without requiring users to visit your website. Higher zero-click rates indicate stronger AI presence.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I cancel my subscription anytime?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. All DealershipAI subscriptions are month-to-month with no long-term contracts. Cancel anytime through your account settings.',
        },
      },
    ],
  };
}

/**
 * HowTo Schema
 * Step-by-step guide for using the free analyzer
 */
export function howToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Check Your Dealership\'s AI Visibility',
    description:
      'Step-by-step guide to analyzing how AI platforms like ChatGPT, Claude, and Perplexity view your automotive dealership.',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Enter Your Website URL',
        text: 'Visit DealershipAI.com and enter your dealership\'s website URL in the free analyzer tool.',
        url: `${SITE_URL}#analyzer`,
        image: `${SITE_URL}/screenshots/step1-enter-url.png`,
      },
      {
        '@type': 'HowToStep',
        name: 'Run Free Scan',
        text: 'Click "Run Free Scan" to analyze your Trust Score, schema coverage, and zero-click visibility across AI platforms.',
        url: `${SITE_URL}#analyzer`,
        image: `${SITE_URL}/screenshots/step2-run-scan.png`,
      },
      {
        '@type': 'HowToStep',
        name: 'Review Results',
        text: 'View your preview results showing Trust Score, schema percentage, and zero-click rate. See immediate insights about your AI presence.',
        url: `${SITE_URL}#analyzer`,
        image: `${SITE_URL}/screenshots/step3-results.png`,
      },
      {
        '@type': 'HowToStep',
        name: 'Sign In for Full Report',
        text: 'Create a free account to access your complete AI visibility report with fix-ready recommendations.',
        url: `${SITE_URL}/sign-in`,
        image: `${SITE_URL}/screenshots/step4-full-report.png`,
      },
    ],
    totalTime: 'PT2M',
  };
}

/**
 * Organization Schema
 * Defines DealershipAI as an organization
 */
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DealershipAI',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Cognitive Ops Platform for automotive dealerships. AI Chief Strategy Officer that continuously audits, predicts, fixes, and explains visibility decisions.',
    sameAs: [
      'https://twitter.com/dealershipai',
      'https://linkedin.com/company/dealershipai',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      email: 'support@dealershipai.com',
      areaServed: 'US',
      availableLanguage: 'English',
    },
  };
}

/**
 * WebSite Schema with SearchAction
 * Enables search box in SERPs
 */
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: SITE_URL,
    name: 'DealershipAI',
    description: 'AI Visibility Intelligence for Automotive Dealerships',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * BreadcrumbList Schema
 * For navigation breadcrumbs
 */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Product Schema for Pricing Tiers
 */
export function pricingProductSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'DealershipAI Free Tier',
      description: 'Free AI visibility scans with preview results',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'DealershipAI Pro',
      description: 'Weekly automated scans with full reports and recommendations',
      offers: {
        '@type': 'Offer',
        price: '499',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '499',
          priceCurrency: 'USD',
          unitCode: 'MON',
        },
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'DealershipAI Enterprise',
      description: 'Daily scans, real-time alerts, and multi-agent orchestration',
      offers: {
        '@type': 'Offer',
        price: '999',
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: '999',
          priceCurrency: 'USD',
          unitCode: 'MON',
        },
        availability: 'https://schema.org/InStock',
      },
    },
  ];
}
