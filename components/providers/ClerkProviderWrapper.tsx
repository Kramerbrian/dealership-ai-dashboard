'use client';

import { ClerkProvider as Clerk } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  // Get publishable key - Next.js makes NEXT_PUBLIC_ vars available on client
  // In Next.js, NEXT_PUBLIC_ vars are available at build time and runtime
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Skip Clerk if no key (for public landing page without auth)
  if (!publishableKey || publishableKey.trim() === '') {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ClerkProviderWrapper] No publishable key found, skipping ClerkProvider');
    }
    return <>{children}</>;
  }

  // Get domain for SSO configuration
  const domain = typeof window !== 'undefined' ? window.location.hostname : '';
  const isCustomDomain = domain === 'dealershipai.com' || domain.includes('dealershipai.com');

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
