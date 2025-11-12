/**
 * DealershipAI Theatrical Middleware
 * Clerk authentication + brand hue provider
 * Route protection and redirects
 */

import { ClerkProvider } from '@clerk/nextjs';
import { BrandHueProvider } from '@/hooks/useBrandHue';

export default function TheatricalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <BrandHueProvider>
        {children}
      </BrandHueProvider>
    </ClerkProvider>
  );
}

