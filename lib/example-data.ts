/**
 * 📊 DEALERSHIPAI EXAMPLE DATA
 * Complete mock data structure for development and testing
 * 
 * This file provides realistic sample data for:
 * - Trust Score and pillar metrics
 * - Mystery Shop insights
 * - User tier configurations
 * - OCI calculations
 */

export const EXAMPLE_DASHBOARD_DATA = {
  dealership: {
    name: "Terry Reid Hyundai",
    url: "https://www.terryreidhyundai.com",
    location: "Naples, FL"
  },
  
  userTier: {
    level: 'pro' as const, // Change to 'free' or 'enterprise' for testing
    sessionsUsed: 28,
    sessionsLimit: 50,
    features: [
      'Full Trust Score breakdown',
      'All pillar deep-dives',
      'AI recommendations',
      'Custom dashboard views',
      'Export reports',
      'Dynamic AI Easter eggs',
      '7-day trend analysis',
      'Email alerts'
    ]
  },

  trustScore: {
    score: 73,
    delta: 4.2,
    trend: [65, 67, 68, 70, 71, 72, 73], // Last 7 days
    components: {
      qai: 68,
      eeat: 81
    },
    lastRefreshed: new Date()
  },

  pillars: {
    seo: {
      score: 78,
      delta: 2.1,
      trend: [73, 74, 75, 76, 77, 77, 78],
      components: [
        {
          name: 'Core Web Vitals',
          value: 82,
          weight: 0.4,
          status: 'good' as const
        },
        {
          name: 'Crawl Index',
          value: 71,
          weight: 0.3,
          status: 'warning' as const
        },
        {
          name: 'Content Quality',
          value: 79,
          weight: 0.3,
          status: 'good' as const
        }
      ]
    },
    aeo: {
      score: 65,
      delta: -1.3,
      trend: [68, 67, 66, 66, 65, 65, 65],
      components: [
        {
          name: 'PAA Share',
          value: 58,
          weight: 0.35,
          status: 'warning' as const
        },
        {
          name: 'FAQ Schema',
          value: 71,
          weight: 0.35,
          status: 'warning' as const
        },
        {
          name: 'Local Citations',
          value: 67,
          weight: 0.3,
          status: 'warning' as const
        }
      ]
    },
    geo: {
      score: 69,
      delta: 5.8,
      trend: [58, 61, 63, 65, 66, 68, 69],
      components: [
        {
          name: 'Citation Frequency',
          value: 72,
          weight: 0.5,
          status: 'warning' as const
        },
        {
          name: 'Source Authority',
          value: 68,
          weight: 0.3,
          status: 'warning' as const
        },
        {
          name: 'Hallucination Risk',
          value: 64,
          weight: 0.2,
          status: 'warning' as const
        }
      ]
    },
    qai: {
      score: 81,
      delta: 3.4,
      trend: [75, 77, 78, 79, 80, 80, 81],
      components: [
        {
          name: 'VDP Quality',
          value: 85,
          weight: 0.4,
          status: 'good' as const
        },
        {
          name: 'Data Integrity',
          value: 78,
          weight: 0.3,
          status: 'good' as const
        },
        {
          name: 'Response Time',
          value: 80,
          weight: 0.3,
          status: 'good' as const
        }
      ]
    }
  },

  oci: {
    value: 38750,
    issues: [
      {
        title: 'Missing schema markup on VDPs',
        impact: 15500,
        effort: 'low' as const,
        canAutomate: true
      },
      {
        title: 'Poor review response rate (32%)',
        impact: 12250,
        effort: 'medium' as const,
        canAutomate: false
      },
      {
        title: 'Slow mobile page load (4.2s)',
        impact: 11000,
        effort: 'medium' as const,
        canAutomate: true
      }
    ]
  },

  mysteryShop: {
    competitors: [
      { name: 'Naples Honda', price: 28500, responseTime: 18 },
      { name: 'Germain Honda', price: 29200, responseTime: 22 },
      { name: 'Coconut Point Hyundai', price: 27800, responseTime: 15 }
    ],
    pricing: { current: 26800 },
    avgResponseTime: 12,
    dailyVolume: [45, 52, 38, 61, 47, 55, 49],
    conversionHistory: [0.68, 0.72, 0.65, 0.71, 0.69],
    hourlyData: [
      2, 1, 0, 0, 1, 3, 8, 15, 22, 18, 16, 20, 
      24, 19, 17, 23, 18, 12, 8, 6, 4, 3, 2, 1
    ],
    responseQuality: {
      excellent: 45,
      good: 32,
      fair: 18,
      poor: 5
    },
    weeklyPattern: [8, 42, 45, 48, 44, 39, 12] // Sun-Sat
  }
};

/**
 * Example data for different user tiers
 */
export const EXAMPLE_TIER_DATA = {
  free: {
    ...EXAMPLE_DASHBOARD_DATA,
    userTier: {
      level: 'free' as const,
      sessionsUsed: 3,
      sessionsLimit: 0,
      features: [
        'View-only Trust Score',
        'Blurred pillar details',
        'Teaser insights',
        '3 analyses then paywall'
      ]
    },
    // Hide Mystery Shop data for free tier
    mysteryShop: undefined
  },

  pro: EXAMPLE_DASHBOARD_DATA,

  enterprise: {
    ...EXAMPLE_DASHBOARD_DATA,
    userTier: {
      level: 'enterprise' as const,
      sessionsUsed: 147,
      sessionsLimit: 200,
      features: [
        'Everything in Pro',
        'One-click optimization automation',
        'Mystery Shop integration',
        'API access + webhooks',
        'White-label reports',
        'Dedicated success manager',
        'Multi-location dashboard',
        'Custom integrations'
      ]
    }
  }
};

/**
 * Example competitive market data
 */
export const EXAMPLE_MARKET_DATA = {
  marketName: "Naples, FL",
  dealerCount: 18,
  rankings: [
    { rank: 1, name: "Germain Honda", trustScore: 89, delta: 1.2 },
    { rank: 2, name: "Naples Mazda", trustScore: 84, delta: -0.5 },
    { rank: 3, name: "Terry Reid Hyundai", trustScore: 73, delta: 4.2 },
    { rank: 4, name: "Coconut Point Hyundai", trustScore: 71, delta: 2.1 },
    { rank: 5, name: "Naples Honda", trustScore: 68, delta: -1.3 }
  ],
  avgTrustScore: 72,
  topQuickWin: "Schema markup implementation",
  mostImprovedThisWeek: "Terry Reid Hyundai (+4.2)"
};

/**
 * Example API response structure
 */
export const EXAMPLE_API_RESPONSE = {
  success: true,
  data: EXAMPLE_DASHBOARD_DATA,
  timestamp: new Date().toISOString(),
  meta: {
    version: "1.0.0",
    cached: false,
    generatedIn: "248ms"
  }
};

/**
 * Example agent query responses
 */
export const EXAMPLE_AGENT_QUERIES = [
  {
    query: "What are my top 3 quick wins?",
    response: "Based on your current scores, here are your top 3 quick wins:\n\n1. **Add schema markup to VDPs** (Impact: $15,500/mo, Effort: Low)\n   - Your VDPs are missing critical schema.org markup\n   - This affects both SEO and AI visibility\n   - Can be automated via our one-click fix\n\n2. **Improve review response rate** (Impact: $12,250/mo, Effort: Medium)\n   - Currently responding to only 32% of reviews\n   - Industry best practice is 80%+\n   - We can set up automated response templates\n\n3. **Optimize mobile page speed** (Impact: $11,000/mo, Effort: Medium)\n   - Mobile load time is 4.2s (target: <2.5s)\n   - Compress images and lazy-load content\n   - Can improve your SEO score by 8-12 points"
  },
  {
    query: "How am I doing vs competitors?",
    response: "You're ranked #3 in the Naples market with a Trust Score of 73/100.\n\n**Your position:**\n- Above market average (72/100)\n- 16 points behind #1 (Germain Honda at 89)\n- Your recent gain of +4.2 points is the strongest in market this week\n\n**Key advantages:**\n- Response time: 12min (market avg: 18min)\n- Price positioning: 6% below competitors\n- QAI score: 81/100 (top quartile)\n\n**Opportunity:**\nYour AEO score (65) is your weakest pillar. If you match Germain's AEO performance (82), you could jump to #2 in the market."
  },
  {
    query: "What is my biggest risk?",
    response: "Your biggest risk is **$38,750/month in revenue leakage** due to AI visibility gaps.\n\n**Primary risk factors:**\n\n1. **Poor GEO visibility** (69/100)\n   - ChatGPT, Claude, and Perplexity aren't consistently citing you\n   - Competitors with GEO scores 80+ are capturing 15-20% more AI-influenced leads\n   - Risk: $15,500/month in missed opportunities\n\n2. **Missing schema markup**\n   - 68% of your VDPs lack proper structured data\n   - AI engines rely heavily on schema for recommendations\n   - Risk: $15,500/month\n\n3. **Review response gaps**\n   - Only 32% response rate signals poor customer care to AI\n   - This negatively impacts E-E-A-T scoring\n   - Risk: $7,750/month\n\nFixing these three issues could recover **$23,250/month** (60% of total risk)."
  }
];

/**
 * Example Easter egg triggers
 */
export const EXAMPLE_EASTER_EGGS = [
  {
    trigger: "trustScore === 88",
    message: "Great Scott! 88 means the flux capacitor is... wait, wrong dashboard.",
    duration: 6
  },
  {
    trigger: "trustScore === 42",
    message: "The answer to life, the universe, and Trust Scores.",
    duration: 6
  },
  {
    trigger: "trustScore === 100",
    message: "Event Horizon reached. You've entered the singularity.",
    duration: 6,
    badgeUnlocked: "Event Horizon"
  },
  {
    trigger: "time === '23:59'",
    message: "Still checking scores at midnight? Dedication or insomnia. Either way, respect.",
    duration: 6
  },
  {
    trigger: "query.includes('TARS')",
    message: "TARS online. Humor setting: 75%. Honesty: 90%. How can I assist?",
    duration: "session"
  }
];

/**
 * Example Mystery Shop insights
 */
export const EXAMPLE_MYSTERY_SHOP_INSIGHTS = [
  {
    type: 'opportunity' as const,
    title: 'Price Advantage Detected',
    description: "You're 6.2% below competitors. Potential $1,668 advantage per unit.",
    confidence: 0.89,
    action: 'Highlight competitive pricing in marketing'
  },
  {
    type: 'opportunity' as const,
    title: 'Speed Advantage',
    description: "Your 12min response time is 33% faster than competitors (18min avg).",
    confidence: 0.94,
    action: 'Emphasize quick response time as differentiator'
  },
  {
    type: 'prediction' as const,
    title: 'Next Week Volume Forecast',
    description: "Based on current trend, expecting 58 inquiries next week (+9 vs this week).",
    confidence: 0.76,
    action: 'Prepare for increased demand'
  },
  {
    type: 'opportunity' as const,
    title: 'Peak Hour Optimization',
    description: "Hour 12:00 shows 67% higher activity. Staffing optimization could improve response times.",
    confidence: 0.85,
    action: 'Consider additional coverage during 12:00-13:00'
  },
  {
    type: 'opportunity' as const,
    title: 'Quick Win: Response Quality',
    description: "5% poor responses detected. Template optimization could improve 3 responses immediately.",
    confidence: 0.92,
    action: 'Implement response templates and training'
  }
];

/**
 * Geographic pooling example
 * Shows how dealers in same market share query results with synthetic variance
 */
export const EXAMPLE_GEO_POOLING = {
  marketKey: "naples-fl",
  dealers: [
    {
      name: "Terry Reid Hyundai",
      url: "https://www.terryreidhyundai.com",
      baseScore: 73,
      variance: +0.0 // Reference dealer
    },
    {
      name: "Coconut Point Hyundai",
      url: "https://www.coconutpointhyundai.com",
      baseScore: 73,
      variance: -2.1 // Same base, synthetic adjustment
    },
    {
      name: "Naples Hyundai",
      url: "https://www.napleshyundai.com",
      baseScore: 73,
      variance: +1.8 // Same base, synthetic adjustment
    }
  ],
  cacheKey: "geo-pool:naples-fl:hyundai",
  ttl: 86400, // 24 hours
  lastRealQuery: "2025-10-29T08:00:00Z",
  note: "Real AI query cost: $0.15. Shared across 3 dealers. Per-dealer cost: $0.05"
};

/**
 * Helper function to generate realistic test data
 */
export function generateTestDealershipData(overrides?: Partial<typeof EXAMPLE_DASHBOARD_DATA>) {
  return {
    ...EXAMPLE_DASHBOARD_DATA,
    ...overrides,
    trustScore: {
      ...EXAMPLE_DASHBOARD_DATA.trustScore,
      score: Math.floor(Math.random() * 40) + 60, // 60-100
      delta: Math.random() * 10 - 5, // -5 to +5
      lastRefreshed: new Date()
    }
  };
}

/**
 * Export all examples
 */
export default {
  EXAMPLE_DASHBOARD_DATA,
  EXAMPLE_TIER_DATA,
  EXAMPLE_MARKET_DATA,
  EXAMPLE_API_RESPONSE,
  EXAMPLE_AGENT_QUERIES,
  EXAMPLE_EASTER_EGGS,
  EXAMPLE_MYSTERY_SHOP_INSIGHTS,
  EXAMPLE_GEO_POOLING,
  generateTestDealershipData
};

