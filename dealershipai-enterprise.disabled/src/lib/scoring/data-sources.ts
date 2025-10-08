/**
 * Data Sources Configuration for DealershipAI
 * 
 * Real API integrations for SEO, AEO, and GEO data collection
 */

export const SEO_DATA_SOURCES = {
  google_search_console: {
    api: 'https://searchconsole.googleapis.com/v1',
    cost: 'free',
    rate_limit: '1,200/minute',
    data: ['rankings', 'impressions', 'clicks', 'indexed_pages']
  },
  google_my_business: {
    api: 'https://mybusiness.googleapis.com/v4',
    cost: 'free',
    rate_limit: '1,500/day',
    data: ['map_pack_appearances', 'local_actions', 'photo_views']
  },
  ahrefs: {
    api: 'https://api.ahrefs.com/v3',
    cost: '$99/month (500 requests/day)',
    data: ['domain_rating', 'backlinks', 'referring_domains']
  },
  semrush: {
    api: 'https://api.semrush.com',
    cost: '$119/month (10,000 units/day)',
    data: ['organic_keywords', 'traffic_analytics', 'competitor_data']
  }
};

export const AEO_DATA_SOURCES = {
  openai_api: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-turbo-preview',
    cost_per_1k_tokens: 0.01,
    avg_cost_per_query: 0.0015
  },
  anthropic_api: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-sonnet-4-20250514',
    cost_per_1k_tokens: 0.015,
    avg_cost_per_query: 0.0020
  },
  perplexity_api: {
    endpoint: 'https://api.perplexity.ai/chat/completions',
    model: 'sonar-medium-online',
    cost_per_query: 0.0010
  },
  google_gemini: {
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-1.5-pro',
    cost_per_1k_chars: 0.00025,
    avg_cost_per_query: 0.0008
  }
};

export const GEO_DATA_SOURCES = {
  google_sge: {
    method: 'bright_data_api',
    api: 'https://api.brightdata.com/datasets/v3/trigger',
    cost_per_query: 0.08,
    data: ['sge_presence', 'ai_overview_content', 'citations']
  },
  google_search_console: {
    api: 'https://searchconsole.googleapis.com/v1',
    cost: 'free',
    data: ['featured_snippets', 'impressions', 'clicks', 'zero_click_rate']
  },
  knowledge_graph_api: {
    api: 'https://kgsearch.googleapis.com/v1/entities:search',
    cost: '$1.50 per 1000 queries',
    monthly_cost: '$0.05 per dealer'
  },
  schema_validation: {
    service: 'self-hosted',
    tools: ['schema.org validator', 'Google Rich Results Test'],
    cost: 'compute only'
  }
};

export const AEO_QUERY_STRATEGY = {
  prompts_per_market: 40,
  platforms: ['chatgpt-4', 'claude-sonnet-4', 'perplexity', 'gemini-pro'],
  queries_per_scan: 160, // 40 prompts × 4 platforms
  
  // Scan frequency by tier
  tier1_frequency: '14 days',  // Bi-weekly
  tier2_frequency: '7 days',   // Weekly
  tier3_frequency: '1 day',    // Daily
  
  // Cost per scan
  cost_per_query: {
    chatgpt: 0.0015,   // GPT-4 Turbo
    claude: 0.0020,    // Claude Sonnet 4
    perplexity: 0.0010,
    gemini: 0.0008
  },
  
  // Total cost per scan
  total_per_scan: 160 * 0.00133, // $0.21 per scan
  monthly_cost_tier1: 0.21 * 2,  // $0.42/month
  monthly_cost_tier2: 0.21 * 4,  // $0.84/month
  monthly_cost_tier3: 0.21 * 30  // $6.30/month
};

export const GEO_MONITORING = {
  // High-value queries to monitor daily
  high_value_queries: [
    'best [brand] dealer near me',
    '[brand] [model] for sale near me',
    'most reliable car dealership in [city]',
    'where to buy [popular model] in [city]',
    '[dealer name] reviews',
    'car dealerships open on sunday near me',
    '[brand] service center near me',
    'certified pre-owned [brand] [city]',
    'new [model] price [city]',
    '[dealer name] vs [competitor name]'
  ],
  
  // Bright Data API for SGE scraping
  bright_data_api: {
    endpoint: 'https://api.brightdata.com/datasets/v3',
    product: 'serp_google_search',
    cost_per_request: 0.08,
    daily_queries: 10,
    monthly_cost_per_dealer: 0.08 * 10 * 30 // $24/month
  },
  
  // Batch optimization
  geographic_pooling: true, // Share queries across dealers in same market
  actual_cost_per_dealer: 24 / 12, // $2/dealer/month (12 dealers per market)
  
  // Alternative: Manual SGE checks for Tier 1
  tier1_strategy: 'weekly_manual_spot_check', // Free
  tier2_strategy: 'weekly_automated', // $2/month
  tier3_strategy: 'daily_automated' // $2/month
};

export const NLP_SERVICES = {
  sentiment_analysis: {
    service: 'HuggingFace Transformers',
    model: 'distilbert-base-uncased-finetuned-sst-2-english',
    cost: 'self-hosted',
    compute_cost: '$0.0001 per analysis'
  },
  entity_recognition: {
    service: 'spaCy',
    model: 'en_core_web_lg',
    cost: 'self-hosted'
  }
};

export const MARKET_QUERIES = {
  'Naples, FL': [
    'best Honda dealer in Naples Florida',
    'where to buy a reliable used car in Naples',
    'most trustworthy Toyota dealership near Naples',
    'Honda CR-V inventory Naples FL',
    'car dealerships with best service in Naples',
    'where can I trade in my car for best value in Naples',
    'certified pre-owned vehicles Naples Florida',
    'Honda dealer with best prices near me',
    'best car dealership in Naples FL',
    'most reliable used car dealer Naples',
    'Toyota Camry for sale Naples Florida',
    'Honda Accord inventory Naples',
    'car dealerships open on Sunday Naples',
    'best car service center Naples FL',
    'where to buy a car with bad credit Naples',
    'certified pre-owned Honda Naples',
    'new car dealerships Naples Florida',
    'used car lots Naples FL',
    'best car financing Naples',
    'car dealership reviews Naples Florida',
    'Honda Pilot for sale Naples',
    'Toyota Highlander inventory Naples',
    'best car warranty Naples FL',
    'car dealerships with service department Naples',
    'where to get car inspected Naples',
    'best car insurance Naples Florida',
    'car dealerships near me Naples',
    'most honest car dealer Naples FL',
    'best car deals Naples Florida',
    'where to sell my car Naples',
    'car dealerships with financing Naples',
    'best car maintenance Naples FL',
    'where to buy a truck Naples',
    'car dealerships with parts department Naples',
    'best car wash Naples Florida',
    'where to get car detailed Naples',
    'car dealerships with body shop Naples',
    'best car rental Naples FL',
    'where to buy a motorcycle Naples',
    'car dealerships with towing Naples'
  ],
  'default': [
    'best car dealer near me',
    'where to buy a reliable used car',
    'most trustworthy car dealership',
    'car dealerships with best service',
    'where can I trade in my car for best value',
    'certified pre-owned vehicles',
    'car dealer with best prices near me',
    'best car dealership in my area',
    'most reliable used car dealer',
    'car dealerships open on Sunday',
    'best car service center',
    'where to buy a car with bad credit',
    'certified pre-owned cars',
    'new car dealerships',
    'used car lots',
    'best car financing',
    'car dealership reviews',
    'best car warranty',
    'car dealerships with service department',
    'where to get car inspected'
  ]
};

export const DEALER_COSTS = {
  // SEO Visibility
  google_search_console: 0,        // Free API
  google_my_business: 0,           // Free API
  ahrefs_api: 0.40,                // Batch queries, amortized
  semrush_api: 0.35,               // Batch queries, amortized
  
  // AEO Visibility
  chatgpt_queries: 0.42,           // Tier 1: bi-weekly @ $0.21/scan
  claude_queries: 0.42,            // Included in scan
  perplexity_queries: 0,           // Included in scan
  gemini_queries: 0,               // Included in scan
  nlp_processing: 0.05,            // Sentiment + entity recognition
  
  // GEO Visibility
  bright_data_sge: 2.00,           // Geographic pooling reduces cost
  knowledge_graph_api: 0.05,       // Google KG search
  schema_validation: 0,            // Self-hosted
  
  // E-E-A-T Model
  ml_inference: 0.02,              // XGBoost prediction
  feature_extraction: 0.08,        // API calls for features
  
  // Infrastructure
  redis_cache: 0.15,               // Elasticache
  postgresql: 0.20,                // RDS
  compute: 0.25,                   // EC2/Lambda
  monitoring: 0.10,                // Datadog/CloudWatch
  
  // Support (amortized)
  customer_support: 1.50,          // 1 person per 500 dealers
  
  total: 6.00                      // $6.00/dealer/month
};

export const SCALE_ECONOMICS = {
  tier_distribution: {
    tier1: { count: 600, revenue: 149, cost: 6 },
    tier2: { count: 300, revenue: 399, cost: 15 },
    tier3: { count: 100, revenue: 999, cost: 60 }
  },
  
  monthly_revenue: (600 * 149) + (300 * 399) + (100 * 999), // $329,100
  monthly_costs: (600 * 6) + (300 * 15) + (100 * 60),       // $14,100
  monthly_profit: 329100 - 14100,                            // $315,000
  margin: (315000 / 329100 * 100).toFixed(1)                // 95.7%
};

export const ENV_CONFIG = {
  // API Keys
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  
  // SEO APIs
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  AHREFS_API_KEY: process.env.AHREFS_API_KEY,
  SEMRUSH_API_KEY: process.env.SEMRUSH_API_KEY,
  
  // GEO APIs
  BRIGHT_DATA_API_KEY: process.env.BRIGHT_DATA_API_KEY,
  
  // Infrastructure
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  
  // ML Model
  MODEL_PATH: '/models/eeat_predictor_v1.pkl',
  
  // Monitoring
  DATADOG_API_KEY: process.env.DATADOG_API_KEY,
  SENTRY_DSN: process.env.SENTRY_DSN
};
