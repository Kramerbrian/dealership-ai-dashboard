/**
 * Clerk Multi-Domain Configuration
 * 
 * Configure Clerk for both:
 * - dealershipai.com (main domain)
 * - dash.dealershipai.com (dashboard subdomain)
 */

export const clerkConfig = {
  // Multi-domain configuration
  domains: {
    main: 'dealershipai.com',
    dashboard: 'dash.dealershipai.com',
  },

  // Allowed redirect URLs (must match in Clerk Dashboard)
  allowedRedirectUrls: [
    'https://dealershipai.com',
    'https://dealershipai.com/dashboard',
    'https://dealershipai.com/sign-in',
    'https://dealershipai.com/sign-up',
    'https://dash.dealershipai.com',
    'https://dash.dealershipai.com/dashboard',
    'https://dash.dealershipai.com/sign-in',
    'https://dash.dealershipai.com/sign-up',
    'http://localhost:3000',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/sign-in',
    'http://localhost:3000/sign-up',
  ],

  // Sign-in/Sign-up URLs
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  
  // After authentication redirects
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
  afterSignOutUrl: '/',

  // Session configuration
  session: {
    maxAge: 24 * 60 * 60, // 24 hours
    maxSessions: 5,
  },

  // OAuth providers
  oauthProviders: {
    google: {
      enabled: true,
    },
    github: {
      enabled: true,
    },
  },
};

/**
 * Get the appropriate Clerk domain based on current hostname
 */
export function getClerkDomain(hostname: string): string {
  if (hostname.includes('dash.') || hostname.includes('dashboard.')) {
    return clerkConfig.domains.dashboard;
  }
  return clerkConfig.domains.main;
}

/**
 * Get redirect URL after authentication
 */
export function getAuthRedirectUrl(hostname: string, path?: string): string {
  const baseUrl = hostname.includes('dash.') || hostname.includes('dashboard.')
    ? `https://${clerkConfig.domains.dashboard}`
    : `https://${clerkConfig.domains.main}`;
  
  return path ? `${baseUrl}${path}` : `${baseUrl}/dashboard`;
}

