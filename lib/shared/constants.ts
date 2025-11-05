/**
 * Shared Constants for Landing Page & Dashboard
 * Extracted to reduce repetition and enable easy updates
 */

import { Search, Shield, BarChart3, Zap, Bot, Brain, Target, TrendingUp } from 'lucide-react';

// Platform Logos (for Array.from patterns)
export const PLATFORM_LOGOS = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  name: ['ChatGPT', 'Gemini', 'Perplexity', 'Claude', 'Copilot', 'Grok'][i],
  logo: `/${['chatgpt', 'gemini', 'perplexity', 'claude', 'copilot', 'grok'][i]}-logo.png`,
}));

// Audit Bullets (reusable across landing & dashboard)
export const AUDIT_BULLETS = {
  aeo: [
    'FAQPage & AutoDealer JSON-LD',
    'Citations & sources',
    'Review response velocity',
  ],
  seo: [
    'LCP/INP/CLS',
    'Sitemap + robots.txt',
    'Title/Meta/OG hygiene',
  ],
  geo: [
    'GBP NAP consistency',
    'Service-area entities',
    'Local citations',
  ],
  schema: [
    'Organization schema',
    'LocalBusiness markup',
    'Product & Offer schemas',
  ],
  reviews: [
    'Response rate >90%',
    'Review velocity tracking',
    'Sentiment analysis',
  ],
};

// Metrics Cards Data
export const METRICS_DATA = [
  {
    value: '$314K',
    label: 'avg monthly loss from zero-click blind spots across markets',
    color: 'text-red-600',
  },
  {
    value: '30 days',
    label: 'to ship fixes and show up consistently in AI answers',
    color: 'text-blue-600',
  },
  {
    value: '67%',
    label: 'of car shoppers start research in AI assistants',
    color: 'text-green-600',
  },
];

// Explainer Cards
export const EXPLAINER_CARDS = [
  {
    title: 'AEO (Answer Engine Optimization)',
    description: 'Structure answers AI can cite. Validate FAQ/Entity schema, citations, and review signals used by AI Overviews & assistants.',
    bullets: AUDIT_BULLETS.aeo,
  },
  {
    title: 'SEO (Search Foundations)',
    description: 'Fix vitals, sitemaps, robots, and semantics so crawlers and AIs trust your site.',
    bullets: AUDIT_BULLETS.seo,
  },
  {
    title: 'GEO (Local & Maps)',
    description: 'Complete GBP, NAP consistency, and service-area entities to win local AI answers.',
    bullets: AUDIT_BULLETS.geo,
  },
];

// Features List
export const FEATURES_LIST = [
  {
    icon: Search,
    title: 'Multi-Platform Monitoring',
    desc: 'Track visibility across ChatGPT, Gemini, Perplexity, Google AI Overviews, and Copilot',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Shield,
    title: 'Zero-Click Shield',
    desc: 'Protect your citations when AI answers without linking',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: BarChart3,
    title: 'Competitive Intelligence',
    desc: 'See exactly how you compare to local competitors in real-time',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Zap,
    title: 'Automated Fixes',
    desc: 'One-click optimization for schema, GMB, and citations',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
];

// Pricing Tiers (consolidated)
export const PRICING_TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    priceLabel: 'Free',
    features: [
      '5 free scans/month',
      'Basic AI visibility score',
      'Email support',
      '7-day data retention',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    id: 'enhanced',
    name: 'Enhanced',
    price: 499,
    priceLabel: '$499/mo',
    features: [
      'Unlimited scans',
      'Full AI visibility tracking',
      'Competitive analysis',
      'Auto-fix recommendations',
      'Priority support',
      '90-day data retention',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 999,
    priceLabel: '$999/mo',
    features: [
      'Everything in Enhanced',
      'Multi-location tracking',
      'Custom integrations',
      'Dedicated account manager',
      'White-label reports',
      'Unlimited data retention',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

// FAQ Data
export const FAQ_DATA = [
  {
    q: 'How is this different from regular SEO tools?',
    a: 'Traditional SEO tracks Google rankings. We track AI assistant visibility where 67% of car shoppers now start their research. Completely different optimization strategies.',
  },
  {
    q: 'Do I need to be technical?',
    a: 'Not at all. We translate complex metrics into plain English action items. Most users are GMs and digital directors with zero technical background.',
  },
  {
    q: 'How accurate is the revenue loss calculation?',
    a: 'Conservative. We use industry-standard rates (2.5% conversion, $2,800 profit per vehicle). Real dealers report our estimates are 20-30% lower than actual impact.',
  },
  {
    q: 'How long until I see results?',
    a: 'Quick wins (GMB optimization, schema fixes) show impact in 7-14 days. Deeper improvements take 30-60 days. Most dealers see measurable improvements within the first month.',
  },
  {
    q: 'What platforms do you track?',
    a: 'We monitor ChatGPT, Google Gemini, Perplexity, Google AI Overviews, and Microsoft Copilot to give you complete visibility across all major AI platforms.',
  },
  {
    q: 'Can I track multiple dealership locations?',
    a: 'Yes! Our Pro plan supports unlimited locations. You can track all your dealerships from one dashboard and compare performance across locations.',
  },
  {
    q: "What's included in the free trial?",
    a: 'The free trial includes full access to all Pro features for 14 days. No credit card required. You can analyze your dealership and see full results before committing.',
  },
  {
    q: 'How do you calculate the AI Visibility Score?',
    a: 'Our 5-pillar scoring system evaluates AI Visibility (30%), Zero-Click Shield (20%), UGC Health (25%), Geo Trust (15%), and SGP Integrity (10%) to give you a comprehensive score.',
  },
];

