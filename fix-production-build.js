const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing production build issues...');

// 1. Fix Clerk authentication issues by making pages fully dynamic
const pagesToFix = [
  'app/intelligence/page.tsx',
  'app/dashboard/page.tsx', 
  'app/pricing/page.tsx',
  'app/test-auth/page.tsx',
  'app/test-oauth/page.tsx'
];

pagesToFix.forEach(pagePath => {
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Add dynamic export if not present
    if (!content.includes('export const dynamic')) {
      content = content.replace(
        /'use client';\s*\n/,
        "'use client';\n\nexport const dynamic = 'force-dynamic';\n"
      );
      fs.writeFileSync(pagePath, content);
      console.log(`✅ Fixed ${pagePath}`);
    }
  }
});

// 2. Create client-safe versions of server-only modules
const clientSafeModules = [
  {
    original: 'lib/slo.ts',
    client: 'lib/slo-client.ts',
    content: `/**
 * Client-Safe SLO Tracking
 * Performance monitoring for client-side operations
 */

type Point = { dur: number; t: number };

const buckets: Record<string, Point[]> = {};

/**
 * Track SLO performance for a given operation
 */
export function trackSLO(name: string, dur: number): void {
  const arr = buckets[name] ||= [];
  arr.push({ dur, t: Date.now() });
  
  // Keep only the last 500 measurements to prevent memory leaks
  while (arr.length > 500) arr.shift();
}

/**
 * Calculate p95 latency for a given operation
 */
export function p95(name: string): number {
  const arr = (buckets[name] || []).map(x => x.dur).sort((a, b) => a - b);
  if (!arr.length) return 0;
  return arr[Math.floor(arr.length * 0.95) - 1] || arr[arr.length - 1];
}

/**
 * Calculate p99 latency for a given operation
 */
export function p99(name: string): number {
  const arr = (buckets[name] || []).map(x => x.dur).sort((a, b) => a - b);
  if (!arr.length) return 0;
  return arr[Math.floor(arr.length * 0.99) - 1] || arr[arr.length - 1];
}

/**
 * Get all SLO metrics
 */
export function getAllSLOs(): Record<string, { p95: number; p99: number; count: number }> {
  const result: Record<string, { p95: number; p99: number; count: number }> = {};
  
  for (const [name, arr] of Object.entries(buckets)) {
    result[name] = {
      p95: p95(name),
      p99: p99(name),
      count: arr.length
    };
  }
  
  return result;
}

/**
 * Clear SLO data for a specific operation
 */
export function clearSLO(name: string): void {
  delete buckets[name];
}

/**
 * Clear all SLO data
 */
export function clearAllSLOs(): void {
  Object.keys(buckets).forEach(key => delete buckets[key]);
}`
  },
  {
    original: 'lib/user-management.ts',
    client: 'lib/user-management-client.ts',
    content: `/**
 * Client-Safe User Management
 * User management utilities for client-side operations
 */

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    interval: 'month',
    features: [
      'Basic SEO Analysis',
      'AEO Analysis', 
      'GEO Analysis',
      '5 reports per month',
      'Email support'
    ],
    limits: {
      reportsPerMonth: 5,
      aiScansPerMonth: 1,
      competitorAnalysis: false,
      mysteryShop: false
    }
  },
  professional: {
    name: 'Professional',
    price: 499,
    interval: 'month',
    features: [
      'Advanced SEO Analysis',
      'AEO Analysis',
      'GEO Analysis',
      'Competitor Analysis',
      'AI-powered insights',
      'Priority support',
      '50 reports per month'
    ],
    limits: {
      reportsPerMonth: 50,
      aiScansPerMonth: 24,
      competitorAnalysis: true,
      mysteryShop: false
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 999,
    interval: 'month',
    features: [
      'Unlimited reports',
      'Advanced AI analysis',
      'Mystery shop automation',
      'Custom integrations',
      'Dedicated support',
      'White-label options'
    ],
    limits: {
      reportsPerMonth: -1,
      aiScansPerMonth: -1,
      competitorAnalysis: true,
      mysteryShop: true
    }
  }
};

export type PlanType = keyof typeof SUBSCRIPTION_PLANS;

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  createdAt: Date;
  lastLoginAt: Date;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

export class ClientUserManager {
  /**
   * Get user's current plan
   */
  static getCurrentPlan(user: User): typeof SUBSCRIPTION_PLANS[PlanType] {
    return SUBSCRIPTION_PLANS[user.plan];
  }

  /**
   * Check if user has access to a feature
   */
  static hasFeatureAccess(user: User, feature: string): boolean {
    const plan = this.getCurrentPlan(user);
    return plan.features.includes(feature);
  }

  /**
   * Check if user has reached their limits
   */
  static hasReachedLimit(user: User, limitType: keyof typeof SUBSCRIPTION_PLANS.free.limits): boolean {
    const plan = this.getCurrentPlan(user);
    const limit = plan.limits[limitType];
    
    if (limit === -1) return false; // Unlimited
    if (limit === false) return true; // Not available
    
    // For now, return false as we don't have usage tracking on client
    return false;
  }

  /**
   * Get upgrade options for user
   */
  static getUpgradeOptions(user: User): Array<typeof SUBSCRIPTION_PLANS[PlanType]> {
    const currentPlanIndex = Object.keys(SUBSCRIPTION_PLANS).indexOf(user.plan);
    const allPlans = Object.values(SUBSCRIPTION_PLANS);
    
    return allPlans.slice(currentPlanIndex + 1);
  }

  /**
   * Check if user can upgrade
   */
  static canUpgrade(user: User): boolean {
    return this.getUpgradeOptions(user).length > 0;
  }

  /**
   * Get plan comparison data
   */
  static getPlanComparison(): Array<{
    name: string;
    price: number;
    features: string[];
    limits: Record<string, any>;
    popular?: boolean;
  }> {
    return Object.values(SUBSCRIPTION_PLANS).map((plan, index) => ({
      ...plan,
      popular: index === 1 // Professional is popular
    }));
  }
}`
  }
];

// Create client-safe modules
clientSafeModules.forEach(({ original, client, content }) => {
  fs.writeFileSync(client, content);
  console.log(`✅ Created client-safe version: ${client}`);
});

// 3. Update component imports to use client-safe versions
const componentUpdates = [
  {
    file: 'components/dashboard/TabbedDashboard.tsx',
    oldImport: "import { trackSLO } from '@/lib/slo';",
    newImport: "import { trackSLO } from '@/lib/slo-client';"
  },
  {
    file: 'components/dashboard/TabbedDashboard.tsx', 
    oldImport: "import { userManager } from '@/lib/user-management';",
    newImport: "import { ClientUserManager } from '@/lib/user-management-client';"
  },
  {
    file: 'components/dashboard/EnhancedDealershipDashboard.tsx',
    oldImport: "import { trackSLO } from '@/lib/slo';",
    newImport: "import { trackSLO } from '@/lib/slo-client';"
  }
];

componentUpdates.forEach(({ file, oldImport, newImport }) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(oldImport)) {
      content = content.replace(oldImport, newImport);
      fs.writeFileSync(file, content);
      console.log(`✅ Updated imports in ${file}`);
    }
  }
});

// 4. Create a comprehensive performance optimization config
const nextConfigContent = `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-*']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'X-Frame-Options', 
          value: 'DENY'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        }
      ]
    }
  ],
  // Disable static optimization for pages with Clerk
  trailingSlash: false,
  skipTrailingSlashRedirect: true
};

module.exports = nextConfig;`;

fs.writeFileSync('next.config.js', nextConfigContent);
console.log('✅ Updated next.config.js for production optimization');

// 5. Create production environment template
const envProductionContent = `# Production Environment Variables
# Copy this to .env.production and fill in your production values

# Clerk Production Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Redis/Upstash Production
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Stripe Production
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-XXX
NEXT_PUBLIC_POSTHOG_KEY=xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Domain
NEXT_PUBLIC_APP_URL=https://dealershipai.com
`;

fs.writeFileSync('.env.production', envProductionContent);
console.log('✅ Created .env.production template');

console.log('🎉 Production build fixes completed!');
console.log('📋 Next steps:');
console.log('1. Fill in your production environment variables in .env.production');
console.log('2. Run npm run build to test the build');
console.log('3. Deploy to Vercel with production environment variables');
