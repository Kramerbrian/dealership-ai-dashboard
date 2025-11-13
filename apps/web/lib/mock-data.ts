/**
 * Mock data generators for development and testing
 */

export interface MockDealerData {
  id: string
  name: string
  location: string
  tier: 'free' | 'growth' | 'pro' | 'enterprise'
  metrics: {
    qai: number
    aiv: number
    ati: number
    vli: number
  }
  lastUpdated: string
}

export interface MockChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: string
  metadata?: {
    action?: string
    confidence?: number
  }
}

export interface MockKPI {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  target?: number
}

/**
 * Generate mock dealer data
 */
export function generateMockDealerData(): MockDealerData {
  return {
    id: 'dealer-001',
    name: 'Premier Auto Group',
    location: 'San Francisco, CA',
    tier: 'pro',
    metrics: {
      qai: Math.floor(Math.random() * 20) + 75,
      aiv: Math.floor(Math.random() * 20) + 70,
      ati: Math.floor(Math.random() * 20) + 80,
      vli: Math.floor(Math.random() * 20) + 85
    },
    lastUpdated: new Date().toISOString()
  }
}

/**
 * Generate mock chat messages
 */
export function generateMockChatMessages(): MockChatMessage[] {
  return [
    {
      id: '1',
      type: 'user',
      content: 'What are my top AI visibility opportunities?',
      timestamp: new Date(Date.now() - 300000).toISOString()
    },
    {
      id: '2',
      type: 'assistant',
      content: 'Based on your current metrics, here are your top 3 AI visibility opportunities:\n\n1. **Schema Markup Enhancement** - Adding FAQ and HowTo schemas could boost your AIV by 8-12 points\n2. **Content Freshness** - Updating your service pages could improve ATI by 6-9 points\n3. **Review Response Rate** - Increasing from 67% to 90% could add 4-7 points to your overall score',
      timestamp: new Date(Date.now() - 250000).toISOString(),
      metadata: {
        action: 'opportunity_analysis',
        confidence: 0.92
      }
    },
    {
      id: '3',
      type: 'user',
      content: 'Show me the impact of improving my schema markup',
      timestamp: new Date(Date.now() - 120000).toISOString()
    },
    {
      id: '4',
      type: 'assistant',
      content: 'Improving your schema markup could have significant impact:\n\n**Estimated Revenue Impact:** $12,400 - $18,600 monthly\n**Lead Generation:** +23-34 additional leads per month\n**Implementation Effort:** 2-3 days\n**ROI Timeline:** 3-4 weeks\n\nWould you like me to generate a detailed implementation plan?',
      timestamp: new Date(Date.now() - 60000).toISOString(),
      metadata: {
        action: 'impact_analysis',
        confidence: 0.88
      }
    }
  ]
}

/**
 * Generate mock KPIs
 */
export function generateMockKPIs(): MockKPI[] {
  return [
    {
      id: 'qai',
      name: 'Quality Assurance Index',
      value: 87,
      unit: 'score',
      trend: 'up',
      change: 3.2,
      target: 90
    },
    {
      id: 'aiv',
      name: 'AI Visibility Index',
      value: 78,
      unit: 'score',
      trend: 'up',
      change: 5.1,
      target: 85
    },
    {
      id: 'ati',
      name: 'Algorithmic Trust Index',
      value: 82,
      unit: 'score',
      trend: 'stable',
      change: 0.8,
      target: 88
    },
    {
      id: 'vli',
      name: 'Vehicle Listing Integrity',
      value: 91,
      unit: 'score',
      trend: 'up',
      change: 2.4,
      target: 95
    },
    {
      id: 'leads',
      name: 'Monthly Leads',
      value: 1247,
      unit: 'count',
      trend: 'up',
      change: 12.3,
      target: 1500
    },
    {
      id: 'conversion',
      name: 'Lead Conversion',
      value: 11.8,
      unit: '%',
      trend: 'up',
      change: 1.2,
      target: 15
    }
  ]
}

/**
 * Generate mock alert data
 */
export function generateMockAlerts() {
  return [
    {
      id: '1',
      type: 'warning',
      title: 'Schema Markup Incomplete',
      message: '15 VDPs missing required schema markup',
      severity: 'medium',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      action: 'fix_schema'
    },
    {
      id: '2',
      type: 'error',
      title: 'Price Discrepancy Detected',
      message: '3 vehicles have pricing mismatches between site and feeds',
      severity: 'high',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      action: 'review_pricing'
    },
    {
      id: '3',
      type: 'info',
      title: 'AI Visibility Improved',
      message: 'Your AIV score increased by 5.1 points this week',
      severity: 'low',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      action: 'view_details'
    }
  ]
}

/**
 * Canned responses for chat
 */
export const CANNED_RESPONSES = {
  'ai visibility': 'Your AI Visibility Index is currently at 78/100. Top opportunities include schema markup enhancement (+8-12 points) and content freshness improvements (+6-9 points).',
  'marketing trends': 'Current marketing trends show a 23% increase in organic traffic and 15% improvement in direct traffic. Paid search dependency has decreased by 8%.',
  'mystery shopper': 'Mystery shopper results show 87% response rate with average response time of 2.3 hours. Areas for improvement include follow-up consistency.',
  'qai score': 'Your Quality Assurance Index is 87/100. Technical SEO and content quality are your strongest areas, while page speed could use optimization.',
  'vco analysis': 'Vehicle Content Optimization shows 91% integrity score. 3 vehicles flagged for pricing discrepancies that need immediate attention.',
  'piqr metrics': 'PIQR (Product Information Quality Rating) is at 89/100. Schema completeness and data freshness are driving strong performance.'
}

/**
 * Quick actions for chat
 */
export const QUICK_ACTIONS = [
  { name: 'Symmetry Mode', action: 'symmetry' },
  { name: 'Time Dilation', action: 'time_dilation' },
  { name: 'Quantum Leap', action: 'quantum_leap' },
  { name: 'Reality Check', action: 'reality_check' }
]

/**
 * Find matching response for user input
 */
export function findMatchingResponse(input: string): string {
  const lowerInput = input.toLowerCase()
  
  for (const [key, response] of Object.entries(CANNED_RESPONSES)) {
    if (lowerInput.includes(key)) {
      return response
    }
  }
  
  return getRandomResponse()
}

/**
 * Get random witty response
 */
export function getRandomResponse(): string {
  const responses = [
    "Ah, a fellow seeker of automotive enlightenment! Let me consult the digital oracle...",
    "Excellent question! The algorithm gods are whispering in my ear...",
    "Hold on to your steering wheel, because this data is about to blow your mind!",
    "Time to channel my inner Ryan Reynolds meets Dave Chappelle...",
    "The AI overlords have spoken, and they have some interesting insights for you!"
  ]
  
  return responses[Math.floor(Math.random() * responses.length)]
}

/**
 * Generate mock data functions
 */
export function generateQAIData() {
  return {
    score: Math.floor(Math.random() * 20) + 75,
    trend: Math.random() > 0.5 ? 'up' : 'down',
    change: Math.floor(Math.random() * 10) + 1
  }
}

export function generateVCOData() {
  return {
    integrity: Math.floor(Math.random() * 20) + 80,
    completeness: Math.floor(Math.random() * 20) + 75,
    accuracy: Math.floor(Math.random() * 20) + 85
  }
}

export function generatePIQRData() {
  const totalVehicles = Math.floor(Math.random() * 50) + 100;
  const withPhotos = Math.floor(totalVehicles * (0.7 + Math.random() * 0.2));
  const withDescription = Math.floor(totalVehicles * (0.8 + Math.random() * 0.15));
  
  return {
    score: Math.floor(Math.random() * 20) + 80,
    schema: Math.floor(Math.random() * 20) + 75,
    freshness: Math.floor(Math.random() * 20) + 85,
    inventory: {
      totalVehicles,
      withPhotos,
      withDescription
    }
  }
}

export function generateMarketingTrends() {
  return {
    organic: Math.floor(Math.random() * 30) + 10,
    paid: Math.floor(Math.random() * 20) - 10,
    direct: Math.floor(Math.random() * 25) + 5
  }
}

export function generateMysteryShopperResults() {
  return {
    responseRate: Math.floor(Math.random() * 20) + 75,
    avgResponseTime: Math.floor(Math.random() * 5) + 1,
    satisfaction: Math.floor(Math.random() * 20) + 80
  }
}