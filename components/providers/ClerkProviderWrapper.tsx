'use client';

import { ClerkProvider as Clerk } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  // Get publishable key - Next.js makes NEXT_PUBLIC_ vars available on client
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Get domain to check if we're on the dashboard subdomain
  const domain = typeof window !== 'undefined' ? window.location.hostname : '';

  // Clerk should be enabled on:
  // 1. dash.dealershipai.com (production dashboard)
  // 2. Vercel preview URLs (for testing)
  // 3. localhost (for development)
  const isDashboardDomain = 
    domain === 'dash.dealershipai.com' ||
    domain.includes('vercel.app') ||
    domain === 'localhost' ||
    domain.startsWith('localhost:');

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[ClerkProviderWrapper] Domain:', domain);
    console.log('[ClerkProviderWrapper] Is dashboard domain:', isDashboardDomain);
    console.log('[ClerkProviderWrapper] publishableKey exists:', !!publishableKey);
  }

  // Skip Clerk if:
  // 1. No publishable key
  // 2. Not on dashboard domain (e.g., on main dealershipai.com landing page)
  if (!publishableKey || publishableKey.trim() === '' || !isDashboardDomain) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ClerkProviderWrapper] Skipping ClerkProvider - not on dashboard domain or no key');
    }
    return <>{children}</>;
  }

  // Log that we're rendering ClerkProvider
  if (process.env.NODE_ENV === 'development') {
    console.log('[ClerkProviderWrapper] Rendering ClerkProvider with key on dashboard domain');
  }

  // Use custom domain for SSO if on production dashboard domain
  // Only set domain prop for production dashboard (not Vercel previews or localhost)
  const isCustomDomain = domain === 'dash.dealershipai.com';

  return (
    <Clerk
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      domain={isCustomDomain ? domain : undefined}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white',
          card: 'bg-white/80 backdrop-blur-xl shadow-2xl border border-gray-200',
          headerTitle: 'text-gray-900',
          headerSubtitle: 'text-gray-600',
          socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
          socialButtonsBlockButtonText: 'text-gray-700',
          formFieldInput: 'bg-white border-gray-300 rounded-lg px-4 py-3',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    >
      {children}
    </Clerk>
  );
}
