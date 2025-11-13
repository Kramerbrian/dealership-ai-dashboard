/**
 * AI Visibility Calibration - 40 Critical Prompts
 * Geographic pooling system for cost-effective AI visibility monitoring
 */

export interface PromptTemplate {
  id: number
  template: string
  category: 'buyer' | 'seller' | 'service' | 'research'
  weight: number
  description: string
}

export const CALIBRATION_PROMPTS: PromptTemplate[] = [
  // Buyer Intent Prompts (35% weight) - 14 prompts
  {
    id: 1,
    template: "best car dealership in {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "General dealership recommendation query"
  },
  {
    id: 2,
    template: "top rated dealership {CITY} {STATE}",
    category: 'buyer',
    weight: 0.35,
    description: "Top-rated dealership search"
  },
  {
    id: 3,
    template: "most trustworthy car dealer near {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Trust-based dealership search"
  },
  {
    id: 4,
    template: "where to buy a car in {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Purchase location query"
  },
  {
    id: 5,
    template: "best Honda dealer in {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Honda search"
  },
  {
    id: 6,
    template: "Toyota dealership near {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Toyota search"
  },
  {
    id: 7,
    template: "where to buy Hyundai in {CITY} {STATE}",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Hyundai search"
  },
  {
    id: 8,
    template: "Mazda dealer {CITY} reviews",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Mazda with reviews"
  },
  {
    id: 9,
    template: "Ford dealership {CITY} inventory",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Ford with inventory"
  },
  {
    id: 10,
    template: "Chevrolet dealer near me {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Brand-specific Chevrolet local search"
  },
  {
    id: 11,
    template: "buy a used car {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "Used car purchase intent"
  },
  {
    id: 12,
    template: "new car deals {CITY} {STATE}",
    category: 'buyer',
    weight: 0.35,
    description: "New car deals search"
  },
  {
    id: 13,
    template: "certified pre-owned {CITY}",
    category: 'buyer',
    weight: 0.35,
    description: "CPO vehicle search"
  },
  {
    id: 14,
    template: "car financing {CITY} bad credit",
    category: 'buyer',
    weight: 0.35,
    description: "Financing with credit issues"
  },

  // Seller Intent Prompts (25% weight) - 10 prompts
  {
    id: 15,
    template: "trade in my car {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Trade-in service search"
  },
  {
    id: 16,
    template: "sell my car {CITY} {STATE}",
    category: 'seller',
    weight: 0.25,
    description: "Car selling service search"
  },
  {
    id: 17,
    template: "best trade-in value {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Trade-in value comparison"
  },
  {
    id: 18,
    template: "instant cash offer car {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Instant cash offer search"
  },
  {
    id: 19,
    template: "who buys used cars {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Car buying service search"
  },
  {
    id: 20,
    template: "free car appraisal {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Free appraisal service"
  },
  {
    id: 21,
    template: "how much is my car worth {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Car valuation query"
  },
  {
    id: 22,
    template: "car valuation {CITY} {STATE}",
    category: 'seller',
    weight: 0.25,
    description: "Car valuation service"
  },
  {
    id: 23,
    template: "sell car online {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Online car selling"
  },
  {
    id: 24,
    template: "we buy any car {CITY}",
    category: 'seller',
    weight: 0.25,
    description: "Universal car buying service"
  },

  // Service Intent Prompts (20% weight) - 8 prompts
  {
    id: 25,
    template: "car service near me {CITY}",
    category: 'service',
    weight: 0.20,
    description: "General car service search"
  },
  {
    id: 26,
    template: "auto repair {CITY} {STATE}",
    category: 'service',
    weight: 0.20,
    description: "Auto repair service search"
  },
  {
    id: 27,
    template: "oil change {CITY} open now",
    category: 'service',
    weight: 0.20,
    description: "Oil change with availability"
  },
  {
    id: 28,
    template: "tire rotation {CITY} cheap",
    category: 'service',
    weight: 0.20,
    description: "Tire rotation with pricing"
  },
  {
    id: 29,
    template: "Honda service center {CITY}",
    category: 'service',
    weight: 0.20,
    description: "Brand-specific Honda service"
  },
  {
    id: 30,
    template: "Toyota certified mechanic {CITY}",
    category: 'service',
    weight: 0.20,
    description: "Brand-specific Toyota service"
  },
  {
    id: 31,
    template: "Hyundai warranty service {CITY}",
    category: 'service',
    weight: 0.20,
    description: "Brand-specific Hyundai warranty"
  },
  {
    id: 32,
    template: "Ford maintenance {CITY} {STATE}",
    category: 'service',
    weight: 0.20,
    description: "Brand-specific Ford maintenance"
  },

  // Research Intent Prompts (20% weight) - 8 prompts
  {
    id: 33,
    template: "{DEALER_NAME} reviews",
    category: 'research',
    weight: 0.20,
    description: "Specific dealer review search"
  },
  {
    id: 34,
    template: "is {DEALER_NAME} reliable",
    category: 'research',
    weight: 0.20,
    description: "Dealer reliability research"
  },
  {
    id: 35,
    template: "{DEALER_NAME} complaints",
    category: 'research',
    weight: 0.20,
    description: "Dealer complaint research"
  },
  {
    id: 36,
    template: "should I buy from {DEALER_NAME}",
    category: 'research',
    weight: 0.20,
    description: "Purchase decision research"
  },
  {
    id: 37,
    template: "compare car dealers {CITY}",
    category: 'research',
    weight: 0.20,
    description: "Dealer comparison research"
  },
  {
    id: 38,
    template: "best price {CAR_MODEL} {CITY}",
    category: 'research',
    weight: 0.20,
    description: "Price comparison research"
  },
  {
    id: 39,
    template: "{DEALER_1} vs {DEALER_2}",
    category: 'research',
    weight: 0.20,
    description: "Direct dealer comparison"
  },
  {
    id: 40,
    template: "car dealer ratings {CITY} {STATE}",
    category: 'research',
    weight: 0.20,
    description: "Dealer rating research"
  }
]

export const AI_PLATFORMS = [
  'chatgpt',
  'claude', 
  'perplexity',
  'gemini'
] as const

export type AIPlatform = typeof AI_PLATFORMS[number]

export interface CalibrationResult {
  promptId: number
  platform: AIPlatform
  query: string
  city: string
  state: string
  response: string
  dealersFound: string[]
  timestamp: Date
  confidence: number
}

export interface VisibilityScore {
  dealerDomain: string
  buyerIntent: number
  sellerIntent: number
  serviceIntent: number
  researchIntent: number
  overallScore: number
  confidence: number
}

/**
 * Generate query from template with city/state substitution
 */
export function generateQuery(template: string, city: string, state: string, dealerName?: string): string {
  return template
    .replace('{CITY}', city)
    .replace('{STATE}', state)
    .replace('{DEALER_NAME}', dealerName || '')
    .replace('{CAR_MODEL}', 'Honda Civic') // Default model for testing
    .replace('{DEALER_1}', 'Dealer A')
    .replace('{DEALER_2}', 'Dealer B')
}

/**
 * Calculate AI Visibility Score from calibration results
 */
export function calculateVisibilityScore(
  results: CalibrationResult[],
  dealerDomain: string
): VisibilityScore {
  const dealerResults = results.filter(r => 
    r.dealersFound.some(domain => 
      domain.toLowerCase().includes(dealerDomain.toLowerCase())
    )
  )

  const buyerResults = dealerResults.filter(r => 
    CALIBRATION_PROMPTS.find(p => p.id === r.promptId)?.category === 'buyer'
  )
  const sellerResults = dealerResults.filter(r => 
    CALIBRATION_PROMPTS.find(p => p.id === r.promptId)?.category === 'seller'
  )
  const serviceResults = dealerResults.filter(r => 
    CALIBRATION_PROMPTS.find(p => p.id === r.promptId)?.category === 'service'
  )
  const researchResults = dealerResults.filter(r => 
    CALIBRATION_PROMPTS.find(p => p.id === r.promptId)?.category === 'research'
  )

  const buyerIntent = (buyerResults.length / 14) * 100 // 14 buyer prompts
  const sellerIntent = (sellerResults.length / 10) * 100 // 10 seller prompts
  const serviceIntent = (serviceResults.length / 8) * 100 // 8 service prompts
  const researchIntent = (researchResults.length / 8) * 100 // 8 research prompts

  const overallScore = 
    (buyerIntent * 0.35) +
    (sellerIntent * 0.25) +
    (serviceIntent * 0.20) +
    (researchIntent * 0.20)

  const confidence = dealerResults.length > 0 
    ? Math.min(1.0, dealerResults.length / 20) // Higher confidence with more mentions
    : 0.0

  return {
    dealerDomain,
    buyerIntent: Math.round(buyerIntent),
    sellerIntent: Math.round(sellerIntent),
    serviceIntent: Math.round(serviceIntent),
    researchIntent: Math.round(researchIntent),
    overallScore: Math.round(overallScore),
    confidence
  }
}
