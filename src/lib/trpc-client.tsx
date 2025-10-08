'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import superjson from 'superjson';

// Import the AppRouter type from your server routers
import type { AppRouter } from '@/server/routers/_app';

/**
 * tRPC React hooks
 * Use this throughout your app to call tRPC procedures
 *
 * Example:
 * const audit = trpc.audit.generate.useMutation();
 * const { data } = trpc.dealership.list.useQuery({ limit: 10 });
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * tRPC Provider Component
 * Wrap your app with this to enable tRPC throughout
 *
 * Usage in app/layout.tsx:
 * <TRPCProvider>
 *   <YourApp />
 * </TRPCProvider>
 */
export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc`,

          // Add custom headers if needed (e.g., for authentication)
          headers() {
            return {
              // Add any custom headers here
              // 'x-custom-header': 'value',
            };
          },

          // Transformer configured on server
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

/**
 * Server-side tRPC caller (for use in Server Components)
 * This function is only available on the server side
 *
 * Usage in Server Components:
 * const caller = await createCaller();
 * const dealerships = await caller.dealership.list({ limit: 10 });
 */
export async function createCaller() {
  // Dynamic import to avoid server-only code in client bundle
  const { appRouter } = await import('@/server/routers/_app');
  const { createTRPCContext } = await import('@/server/trpc-server');

  const ctx = await createTRPCContext();

  return appRouter.createCaller(ctx);
}
