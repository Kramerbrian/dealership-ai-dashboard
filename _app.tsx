import type { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';

/**
 * Custom App wrapper for DealershipAI dashboard.
 * Wraps the Next.js application in ClerkProvider so that
 * authentication state is available via useUser and other Clerk hooks.
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps.clerkInitOptions}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp;