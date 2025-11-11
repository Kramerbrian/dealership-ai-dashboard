// 200-prompt golden set for benchmarking
export interface GoldenPrompt {
  id: string;
  category: string;
  subcategory: string;
  prompt: string;
  expectedResponse: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: string;
  keywords: string[];
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
}

export const GOLDEN_PROMPTS: GoldenPrompt[] = [
  // Automotive Research (50 prompts)
  {
    id: 'auto_research_001',
    category: 'automotive_research',
    subcategory: 'vehicle_comparison',
    prompt: 'What are the differences between a 2023 Honda Civic and a 2023 Toyota Corolla?',
    expectedResponse: 'Detailed comparison of features, pricing, reliability, and performance',
    difficulty: 'easy',
    context: 'Consumer researching compact cars',
    keywords: ['honda civic', 'toyota corolla', 'comparison', '2023'],
    intent: 'informational'
  },
  {
    id: 'auto_research_002',
    category: 'automotive_research',
    subcategory: 'reliability',
    prompt: 'Which car brands are most reliable in 2024?',
    expectedResponse: 'Brand reliability rankings with data sources',
    difficulty: 'medium',
    context: 'Consumer prioritizing reliability',
    keywords: ['car brands', 'reliable', '2024', 'reliability'],
    intent: 'informational'
  },
  {
    id: 'auto_research_003',
    category: 'automotive_research',
    subcategory: 'fuel_economy',
    prompt: 'What are the most fuel-efficient SUVs under $40,000?',
    expectedResponse: 'List of fuel-efficient SUVs with MPG ratings and pricing',
    difficulty: 'medium',
    context: 'Budget-conscious SUV shopper',
    keywords: ['fuel efficient', 'suv', 'under 40000', 'mpg'],
    intent: 'informational'
  },
  {
    id: 'auto_research_004',
    category: 'automotive_research',
    subcategory: 'safety',
    prompt: 'Which cars have the best safety ratings for families?',
    expectedResponse: 'Family-friendly vehicles with top safety ratings',
    difficulty: 'easy',
    context: 'Family car shopping',
    keywords: ['safety ratings', 'family cars', 'safe vehicles'],
    intent: 'informational'
  },
  {
    id: 'auto_research_005',
    category: 'automotive_research',
    subcategory: 'electric_vehicles',
    prompt: 'How long does it take to charge an electric car?',
    expectedResponse: 'Charging times for different EV types and charging methods',
    difficulty: 'medium',
    context: 'EV consideration',
    keywords: ['electric car', 'charging time', 'ev charging'],
    intent: 'informational'
  },

  // Dealership Search (50 prompts)
  {
    id: 'dealer_search_001',
    category: 'dealership_search',
    subcategory: 'location_based',
    prompt: 'Find Honda dealers near me in Miami',
    expectedResponse: 'List of Honda dealerships in Miami area',
    difficulty: 'easy',
    context: 'Local dealership search',
    keywords: ['honda dealers', 'miami', 'near me'],
    intent: 'navigational'
  },
  {
    id: 'dealer_search_002',
    category: 'dealership_search',
    subcategory: 'inventory_search',
    prompt: 'Do you have any 2023 Ford F-150 trucks in stock?',
    expectedResponse: 'Current inventory of 2023 Ford F-150 trucks',
    difficulty: 'medium',
    context: 'Specific vehicle inquiry',
    keywords: ['2023 ford f150', 'in stock', 'inventory'],
    intent: 'transactional'
  },
  {
    id: 'dealer_search_003',
    category: 'dealership_search',
    subcategory: 'service_inquiry',
    prompt: 'What are your service hours for oil changes?',
    expectedResponse: 'Service department hours and oil change information',
    difficulty: 'easy',
    context: 'Service scheduling',
    keywords: ['service hours', 'oil change', 'service department'],
    intent: 'informational'
  },
  {
    id: 'dealer_search_004',
    category: 'dealership_search',
    subcategory: 'financing',
    prompt: 'What financing options do you offer for first-time buyers?',
    expectedResponse: 'Financing programs for first-time car buyers',
    difficulty: 'medium',
    context: 'Financing inquiry',
    keywords: ['financing options', 'first time buyers', 'auto loans'],
    intent: 'commercial'
  },
  {
    id: 'dealer_search_005',
    category: 'dealership_search',
    subcategory: 'trade_in',
    prompt: 'How much is my 2019 Toyota Camry worth for trade-in?',
    expectedResponse: 'Trade-in value estimate for 2019 Toyota Camry',
    difficulty: 'medium',
    context: 'Trade-in valuation',
    keywords: ['trade in value', '2019 toyota camry', 'car value'],
    intent: 'commercial'
  },

  // Service and Maintenance (30 prompts)
  {
    id: 'service_001',
    category: 'service_maintenance',
    subcategory: 'routine_maintenance',
    prompt: 'When should I change my car\'s oil?',
    expectedResponse: 'Oil change intervals and recommendations',
    difficulty: 'easy',
    context: 'Vehicle maintenance',
    keywords: ['oil change', 'when to change oil', 'maintenance'],
    intent: 'informational'
  },
  {
    id: 'service_002',
    category: 'service_maintenance',
    subcategory: 'troubleshooting',
    prompt: 'My car is making a strange noise when I brake',
    expectedResponse: 'Common brake noise causes and solutions',
    difficulty: 'medium',
    context: 'Vehicle problem diagnosis',
    keywords: ['brake noise', 'car noise', 'brake problems'],
    intent: 'informational'
  },
  {
    id: 'service_003',
    category: 'service_maintenance',
    subcategory: 'repair_cost',
    prompt: 'How much does it cost to replace a car battery?',
    expectedResponse: 'Car battery replacement cost estimates',
    difficulty: 'easy',
    context: 'Repair cost inquiry',
    keywords: ['car battery', 'replacement cost', 'battery price'],
    intent: 'informational'
  },

  // Pricing and Deals (30 prompts)
  {
    id: 'pricing_001',
    category: 'pricing_deals',
    subcategory: 'msrp_inquiry',
    prompt: 'What is the MSRP of a 2024 BMW X5?',
    expectedResponse: '2024 BMW X5 MSRP and pricing information',
    difficulty: 'easy',
    context: 'Vehicle pricing research',
    keywords: ['2024 bmw x5', 'msrp', 'price'],
    intent: 'informational'
  },
  {
    id: 'pricing_002',
    category: 'pricing_deals',
    subcategory: 'incentives',
    prompt: 'Are there any current incentives on new cars?',
    expectedResponse: 'Current manufacturer incentives and rebates',
    difficulty: 'medium',
    context: 'Deal shopping',
    keywords: ['car incentives', 'rebates', 'deals'],
    intent: 'commercial'
  },
  {
    id: 'pricing_003',
    category: 'pricing_deals',
    subcategory: 'negotiation',
    prompt: 'How much can I negotiate off the sticker price?',
    expectedResponse: 'Car buying negotiation tips and typical discounts',
    difficulty: 'hard',
    context: 'Price negotiation',
    keywords: ['negotiate price', 'sticker price', 'car buying'],
    intent: 'informational'
  },

  // Reviews and Reputation (20 prompts)
  {
    id: 'reviews_001',
    category: 'reviews_reputation',
    subcategory: 'dealer_reviews',
    prompt: 'What do customers say about ABC Motors?',
    expectedResponse: 'Customer reviews and ratings for ABC Motors',
    difficulty: 'easy',
    context: 'Dealership reputation check',
    keywords: ['abc motors', 'customer reviews', 'dealer reviews'],
    intent: 'informational'
  },
  {
    id: 'reviews_002',
    category: 'reviews_reputation',
    subcategory: 'vehicle_reviews',
    prompt: 'Is the 2024 Tesla Model Y worth buying?',
    expectedResponse: '2024 Tesla Model Y reviews and buying advice',
    difficulty: 'medium',
    context: 'Vehicle evaluation',
    keywords: ['2024 tesla model y', 'worth buying', 'reviews'],
    intent: 'informational'
  },

  // Insurance and Legal (10 prompts)
  {
    id: 'insurance_001',
    category: 'insurance_legal',
    subcategory: 'insurance_cost',
    prompt: 'How much does car insurance cost for a new driver?',
    expectedResponse: 'Car insurance cost estimates for new drivers',
    difficulty: 'medium',
    context: 'Insurance planning',
    keywords: ['car insurance', 'new driver', 'insurance cost'],
    intent: 'informational'
  },
  {
    id: 'insurance_002',
    category: 'insurance_legal',
    subcategory: 'registration',
    prompt: 'What documents do I need to register a car?',
    expectedResponse: 'Vehicle registration requirements and documents',
    difficulty: 'easy',
    context: 'Registration process',
    keywords: ['car registration', 'documents needed', 'register vehicle'],
    intent: 'informational'
  },

  // Add more prompts to reach 200...
  // (Continuing with similar structure for remaining prompts)
];

// Prompt categories for analysis
export const PROMPT_CATEGORIES = [
  'automotive_research',
  'dealership_search', 
  'service_maintenance',
  'pricing_deals',
  'reviews_reputation',
  'insurance_legal'
];

// Intent types
export const INTENT_TYPES = [
  'informational',
  'navigational', 
  'transactional',
  'commercial'
];

// Difficulty levels
export const DIFFICULTY_LEVELS = [
  'easy',
  'medium',
  'hard'
];

// Get prompts by category
export function getPromptsByCategory(category: string): GoldenPrompt[] {
  return GOLDEN_PROMPTS.filter(prompt => prompt.category === category);
}

// Get prompts by intent
export function getPromptsByIntent(intent: string): GoldenPrompt[] {
  return GOLDEN_PROMPTS.filter(prompt => prompt.intent === intent);
}

// Get prompts by difficulty
export function getPromptsByDifficulty(difficulty: string): GoldenPrompt[] {
  return GOLDEN_PROMPTS.filter(prompt => prompt.difficulty === difficulty);
}

// Get random prompt sample
export function getRandomPromptSample(size: number): GoldenPrompt[] {
  const shuffled = [...GOLDEN_PROMPTS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, size);
}

// Search prompts by keywords
export function searchPromptsByKeywords(keywords: string[]): GoldenPrompt[] {
  return GOLDEN_PROMPTS.filter(prompt => 
    keywords.some(keyword => 
      prompt.keywords.some(promptKeyword => 
        promptKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  );
}

// Get prompt statistics
export function getPromptStatistics() {
  const stats = {
    total: GOLDEN_PROMPTS.length,
    byCategory: {} as { [key: string]: number },
    byIntent: {} as { [key: string]: number },
    byDifficulty: {} as { [key: string]: number }
  };

  GOLDEN_PROMPTS.forEach(prompt => {
    stats.byCategory[prompt.category] = (stats.byCategory[prompt.category] || 0) + 1;
    stats.byIntent[prompt.intent] = (stats.byIntent[prompt.intent] || 0) + 1;
    stats.byDifficulty[prompt.difficulty] = (stats.byDifficulty[prompt.difficulty] || 0) + 1;
  });

  return stats;
}
