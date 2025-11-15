// @ts-nocheck
'use client';

import { ClerkProvider as Clerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

type ClerkProviderWrapperProps = {
  children: React.ReactNode;
  initialHost?: string | null;
};

export function ClerkProviderWrapper({ children, initialHost }: ClerkProviderWrapperProps) {
  // Get publishable key - Next.js makes NEXT_PUBLIC_ vars available on client
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Get domain to check if we're on the dashboard subdomain
  // During SSR we get host from props; hydrate with window once available
  const [resolvedHost, setResolvedHost] = useState(initialHost || '');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResolvedHost(window.location.hostname);
    }
  }, []);

  const hasKey = !!(publishableKey && publishableKey.trim() !== '');

  if (process.env.NODE_ENV === 'development') {
    console.log('[ClerkProviderWrapper] Domain:', resolvedHost);
    console.log('[ClerkProviderWrapper] publishableKey exists:', hasKey);
  }

  if (!hasKey) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ClerkProviderWrapper] Skipping ClerkProvider - no key configured');
    }
    return <>{children}</>;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[ClerkProviderWrapper] Rendering ClerkProvider');
  }

  // CRITICAL FIX: Do NOT set domain prop - it causes Clerk to use wrong custom domain
  // Setting domain=dash.dealershipai.com makes Clerk try clerk.dash.dealershipai.com
  // The actual custom Clerk domain is clerk.dealershipai.com (set via CLERK_FRONTEND_API)
  // Let Clerk use default behavior - it will use CLERK_FRONTEND_API env var automatically

  return (
    <Clerk
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/onboarding"
      signUpFallbackRedirectUrl="/onboarding"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      // DO NOT set domain prop - causes CSP errors and "browser not secure" errors
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

