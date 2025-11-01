'use client';

import { ClerkProvider as Clerk } from '@clerk/nextjs';

export function ClerkProviderWrapper({ children }: { children: React.ReactNode }) {
  const publishableKey = typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    : process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Skip Clerk if no key (for public landing page)
  if (!publishableKey) {
    return <>{children}</>;
  }

  return (
    <Clerk
      publishableKey={publishableKey}
      signInFallbackRedirectUrl="/dash"
      signUpFallbackRedirectUrl="/dash"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
    >
      {children}
    </Clerk>
  );
}
