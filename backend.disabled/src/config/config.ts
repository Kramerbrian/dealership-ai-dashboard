import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  
  // Authentication
  auth: {
    clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
  },
  
  // Stripe configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceId: process.env.STRIPE_PRICE_ID || '',
  },
  
  // AI Services
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  },
  
  // External APIs
  google: {
    analyticsApiKey: process.env.GOOGLE_ANALYTICS_API_KEY || '',
    pagespeedApiKey: process.env.PAGESPEED_API_KEY || '',
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    analyticsPropertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID || '',
    businessAccountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID || '',
    businessLocationId: process.env.GOOGLE_BUSINESS_LOCATION_ID || '',
  },
  
  // SEO Tools
  seo: {
    semrushApiKey: process.env.SEMRUSH_API_KEY || '',
    ahrefsApiKey: process.env.AHREFS_API_KEY || '',
    mozAccessId: process.env.MOZ_ACCESS_ID || '',
    mozSecretKey: process.env.MOZ_SECRET_KEY || '',
  },
  
  // Review Platforms
  reviews: {
    yelpApiKey: process.env.YELP_API_KEY || '',
    yelpBusinessId: process.env.YELP_BUSINESS_ID || '',
  },
  
  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  
  // Feature flags
  features: {
    enableWebsockets: process.env.ENABLE_WEBSOCKETS === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS === 'true',
    enableMonthlyScans: process.env.ENABLE_MONTHLY_SCANS === 'true',
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableConsole: process.env.ENABLE_CONSOLE_LOGGING !== 'false',
  },
} as const;

// Validation
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'CLERK_SECRET_KEY',
  'STRIPE_SECRET_KEY',
  'OPENAI_API_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && config.nodeEnv === 'production') {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
